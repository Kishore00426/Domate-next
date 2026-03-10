import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";
import { getUserFromToken } from "@/lib/auth";

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "service_provider") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        // Update provider details
        const provider = await ServiceProvider.findOneAndUpdate(
            { user: user._id },
            {
                $set: {
                    experience: data.experience,
                    nativePlace: data.nativePlace,
                    currentPlace: data.currentPlace,
                    emergencyContact: data.emergencyContact,
                    consultFee: data.consultFee
                }
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, provider });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
