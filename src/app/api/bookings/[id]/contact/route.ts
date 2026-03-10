import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: any }) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const booking = await Booking.findById(id).populate("serviceProvider", "username email contactNumber");

        if (!booking) {
            return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
        }

        // Only the user who made the booking or the provider can see the details
        if (booking.user.toString() !== user._id.toString() && booking.serviceProvider._id.toString() !== user._id.toString()) {
            return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
        }

        const provider = booking.serviceProvider;

        return NextResponse.json({
            success: true,
            contact: {
                username: provider.username,
                email: provider.email,
                phone: provider.contactNumber || "Not provided"
            }
        });
    } catch (err: any) {
        console.error("Error fetching provider contact:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
