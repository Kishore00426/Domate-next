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

        const { services } = await req.json();

        // Update provider services list
        const provider = await ServiceProvider.findOneAndUpdate(
            { user: user._id },
            { $set: { services } },
            { new: true, upsert: true }
        ).populate("services");

        return NextResponse.json({ success: true, provider });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
