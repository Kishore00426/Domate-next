import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { getUserFromToken } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: any }) {
    try {
        const user = await getUserFromToken(req) as any;
        const { id } = await params;
        const { status, message } = await req.json();

        const booking = await Booking.findById(id);
        if (!booking) {
            return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
        }

        // Authorization logic
        if (user.role?.name === "service_provider") {
            if (booking.serviceProvider.toString() !== user._id.toString()) {
                return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
            }
        } else if (user.role?.name === "user") {
            if (booking.user.toString() !== user._id.toString()) {
                return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
            }
            if (status !== "cancelled") {
                return NextResponse.json({ success: false, error: "Users can only cancel bookings" }, { status: 400 });
            }
        } else {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        booking.status = status;
        if (message) booking.message = message;
        await booking.save();

        await booking.populate("user", "username email");
        await booking.populate("service", "title");

        return NextResponse.json({ success: true, booking });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
