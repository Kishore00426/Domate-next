import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Address from "@/models/Address";
import "@/models/Service";
import "@/models/Category";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "service_provider") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const bookings = await Booking.find({ serviceProvider: user._id })
            .populate("user", "username email contactNumber")
            .populate({
                path: "service",
                select: "title price category",
                populate: { path: "category", select: "name" }
            });

        const bookingsWithPhone = await Promise.all(bookings.map(async (b) => {
            const bookingObj = b.toObject();
            if (bookingObj.user) {
                const address = await Address.findOne({ user: bookingObj.user._id });
                bookingObj.user.phone = address?.phone || null;
            }
            return bookingObj;
        }));

        return NextResponse.json({ success: true, bookings: bookingsWithPhone });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
