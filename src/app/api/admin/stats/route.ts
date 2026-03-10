import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Service from "@/models/Service";
import Booking from "@/models/Booking";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        console.log("Stats API: Fetching user from token...");
        const user = await getUserFromToken(req) as any;
        console.log("Stats API: User found:", user ? user.username : "none", "Role:", user?.role?.name);

        if (!user || user.role?.name !== "admin") {
            return NextResponse.json({ success: false, error: "Access denied. Admins only." }, { status: 403 });
        }

        console.log("Stats API: Connecting to DB...");
        await dbConnect();

        const totalUsers = await User.countDocuments();
        const activeProviders = await User.countDocuments({ providerStatus: "approved" });
        const pendingVerifications = await User.countDocuments({ providerStatus: "pending" });
        const totalServices = await Service.countDocuments();
        const totalBookings = await Booking.countDocuments();

        // 📈 Weekly Activity (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activityRaw = await User.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    users: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Map to standard format { name: 'Mon', users: 400 }
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyActivity = activityRaw.map(item => ({
            name: days[new Date(item._id).getDay()],
            users: item.users
        }));

        // 📊 Top Services (by Booking count)
        const topServicesRaw = await Booking.aggregate([
            { $group: { _id: "$service", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: "services", localField: "_id", foreignField: "_id", as: "serviceInfo" } },
            { $unwind: "$serviceInfo" },
            { $lookup: { from: "categories", localField: "serviceInfo.category", foreignField: "_id", as: "categoryInfo" } },
            { $unwind: "$categoryInfo" },
            { $project: { name: "$categoryInfo.name", count: 1 } }
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                activeProviders,
                pendingVerifications,
                totalServices,
                totalBookings,
                totalRevenue: 0,
                weeklyActivity: weeklyActivity.length > 0 ? weeklyActivity : [
                    { name: 'Mon', users: 0 },
                    { name: 'Tue', users: 0 },
                    { name: 'Wed', users: 0 },
                    { name: 'Thu', users: 0 },
                    { name: 'Fri', users: 0 },
                    { name: 'Sat', users: 0 },
                    { name: 'Sun', users: 0 },
                ],
                topServices: topServicesRaw.length > 0 ? topServicesRaw : [
                    { name: 'N/A', count: 0 }
                ]
            }
        });
    } catch (err: any) {
        console.error("Stats API Error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
