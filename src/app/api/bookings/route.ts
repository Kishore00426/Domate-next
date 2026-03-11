import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import ServiceProvider from "@/models/ServiceProvider";
import Service from "@/models/Service";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromToken(req) as any;
        console.log("Token extraction result:", user ? `Found User: ${user._id}, Role: ${user.role?.name || user.role}` : "Null user returned from token");
        if (!user || user.role?.name !== "user") {
            const roleTrace = user ? { roleName: user.role?.name, rawRole: user.role } : null;
            return NextResponse.json({ success: false, error: "Unauthorized", trace: roleTrace }, { status: 401 });
        }

        const { providerId, serviceId, scheduledDate, notes } = await req.json();

        const spDoc = await ServiceProvider.findById(providerId).populate("user");
        if (!spDoc || spDoc.approvalStatus !== "approved") {
            return NextResponse.json({ success: false, error: "Provider not approved or not found" }, { status: 400 });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
        }

        const booking = await Booking.create({
            user: user._id,
            serviceProvider: spDoc.user._id,
            service: serviceId,
            scheduledDate,
            notes
        });

        return NextResponse.json({ success: true, booking });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
