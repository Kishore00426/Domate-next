import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import "@/models/Service"; // Register Service model
import "@/models/Category"; // Register Category model
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const bookings = await Booking.find({ user: user._id, status: 'completed' })
            .populate({
                path: 'service',
                populate: { path: 'category' }
            });

        const spendingMap: any = {};
        const categoryMap: any = {};

        bookings.forEach(booking => {
            if (!booking.service) return;

            const serviceName = booking.service.title || 'Unknown Service';
            const categoryName = booking.service.category?.title || 'Other';
            const amount = booking.invoice?.totalAmount || 0;

            spendingMap[serviceName] = (spendingMap[serviceName] || 0) + amount;
            categoryMap[categoryName] = (categoryMap[categoryName] || 0) + 1;
        });

        const spendingData = Object.keys(spendingMap).map(key => ({
            name: key,
            value: spendingMap[key]
        }));

        const categoryData = Object.keys(categoryMap).map(key => ({
            name: key,
            value: categoryMap[key]
        }));

        return NextResponse.json({
            success: true,
            stats: {
                spending: spendingData,
                categories: categoryData
            }
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
