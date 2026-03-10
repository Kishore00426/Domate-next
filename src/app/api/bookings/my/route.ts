import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import ServiceProvider from "@/models/ServiceProvider";
import "@/models/Service";
import "@/models/Category";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const bookings = await Booking.find({ user: user._id })
            .populate("serviceProvider", "username email contactNumber")
            .populate({
                path: "service",
                select: "title price category",
                populate: { path: "category", select: "name" }
            });

        const bookingsWithPhone = await Promise.all(bookings.map(async (b) => {
            const bookingObj = b.toObject();
            if (bookingObj.serviceProvider) {
                const provider = await ServiceProvider.findOne({ user: bookingObj.serviceProvider._id });
                bookingObj.serviceProvider.phone = provider?.phone || null;
                bookingObj.serviceProvider.consultFee = provider?.consultFee || 0;
            }
            return bookingObj;
        }));

        return NextResponse.json({ success: true, bookings: bookingsWithPhone });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
