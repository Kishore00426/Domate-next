import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { getUserFromToken } from "@/lib/auth";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths } from 'date-fns';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "admin") {
            return NextResponse.json({ success: false, error: "Access denied. Admins only." }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'total';
        const dateRange = searchParams.get('dateRange') || 'thisMonth';
        const customStart = searchParams.get('startDate');
        const customEnd = searchParams.get('endDate');

        let startDate = startOfMonth(new Date());
        let endDate = endOfMonth(new Date());

        switch (dateRange) {
            case 'today':
                startDate = startOfDay(new Date());
                endDate = endOfDay(new Date());
                break;
            case 'thisWeek':
                startDate = startOfWeek(new Date());
                endDate = endOfWeek(new Date());
                break;
            case 'thisMonth':
                startDate = startOfMonth(new Date());
                endDate = endOfMonth(new Date());
                break;
            case 'lastMonth':
                const lastMonth = subMonths(new Date(), 1);
                startDate = startOfMonth(lastMonth);
                endDate = endOfMonth(lastMonth);
                break;
            case 'thisYear':
                startDate = startOfYear(new Date());
                endDate = endOfYear(new Date());
                break;
            case 'custom':
                if (customStart && customEnd) {
                    startDate = startOfDay(new Date(customStart));
                    endDate = endOfDay(new URL(customEnd).toString() === customEnd ? new Date(customEnd) : new Date(customEnd)); // Fixing potential date parsing
                    // Re-parsing to be sure
                    startDate = startOfDay(new Date(customStart));
                    endDate = endOfDay(new Date(customEnd));
                }
                break;
        }

        const matchStage: any = {
            createdAt: { $gte: startDate, $lte: endDate }
        };

        if (['total', 'revenue', 'bookings', 'provider', 'commission'].includes(type)) {
            // For booking-based reports
            const bookingsFilter = { ...matchStage };
            if (type === 'revenue' || type === 'commission') {
                bookingsFilter.status = 'completed';
            }

            const stats = await Booking.aggregate([
                { $match: bookingsFilter },
                {
                    $group: {
                        _id: null,
                        totalBookings: { $sum: 1 },
                        totalCommission: { $sum: "$commission" },
                        totalRevenue: { $sum: "$invoice.totalAmount" },
                        completedBookings: {
                            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                        }
                    }
                }
            ]);

            const chartData = await Booking.aggregate([
                { $match: bookingsFilter },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        bookings: { $sum: 1 },
                        revenue: { $sum: "$invoice.totalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return NextResponse.json({
                success: true,
                data: {
                    summary: {
                        totalBookings: stats[0]?.totalBookings || 0,
                        totalCommission: stats[0]?.totalCommission || 0,
                        totalRevenue: stats[0]?.totalRevenue || 0,
                        completedBookings: stats[0]?.completedBookings || 0
                    },
                    chartData
                }
            });
        }

        if (type === 'users') {
            const userStats = await User.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return NextResponse.json({
                success: true,
                data: {
                    summary: {
                        totalUsers: userStats.reduce((acc, curr) => acc + curr.count, 0)
                    },
                    chartData: userStats
                }
            });
        }

        return NextResponse.json({ success: false, error: "Invalid report type" }, { status: 400 });

    } catch (err: any) {
        console.error("Report generation error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
