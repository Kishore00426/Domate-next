import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "admin") {
            return NextResponse.json({ success: false, error: "Access denied. Admins only." }, { status: 403 });
        }

        const bookings = await Booking.find({})
            .populate("user", "username email")
            .populate("serviceProvider", "username email")
            .populate({
                path: "service",
                select: "title price category",
                populate: { path: "category", select: "name" }
            });

        return NextResponse.json({ success: true, data: bookings });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
