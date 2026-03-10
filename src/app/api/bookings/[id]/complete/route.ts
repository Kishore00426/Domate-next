import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: any }) {
    try {
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "service_provider") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { servicePrice, serviceCharge } = await req.json();

        const booking = await Booking.findOne({ _id: id, serviceProvider: user._id });
        if (!booking) {
            return NextResponse.json({ success: false, error: "Booking not found or access denied" }, { status: 404 });
        }

        booking.status = "work_completed";
        const price = Number(servicePrice);
        const charge = Number(serviceCharge);
        const gst = (price + charge) * 0.18;
        const total = price + charge + gst;

        booking.invoice = {
            servicePrice: price,
            serviceCharge: charge,
            gst: parseFloat(gst.toFixed(2)),
            totalAmount: parseFloat(total.toFixed(2))
        };

        const serviceDoc = await Service.findById(booking.service);
        if (serviceDoc && serviceDoc.commissionRate > 0) {
            booking.commission = parseFloat(((price * serviceDoc.commissionRate) / 100).toFixed(2));
        } else {
            booking.commission = 0;
        }

        await booking.save();
        await booking.populate("user", "username email");
        await booking.populate("service", "title");

        return NextResponse.json({ success: true, booking });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
