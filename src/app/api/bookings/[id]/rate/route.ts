import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: any }) {
    try {
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "user") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { rating, comment } = await req.json();

        const booking = await Booking.findOne({ _id: id, user: user._id });
        if (!booking) {
            return NextResponse.json({ success: false, error: "Booking not found or access denied" }, { status: 404 });
        }

        booking.review = {
            rating: Number(rating),
            comment: comment || "",
            createdAt: new Date()
        };
        await booking.save();

        return NextResponse.json({ success: true, booking });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
