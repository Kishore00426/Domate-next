import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";

export async function GET(req: NextRequest, { params }: { params: any }) {
    try {
        await dbConnect();
        const { id } = await params;

        // Find providers who offer the specific service ID and their profile is approved
        const providers = await ServiceProvider.find({
            services: id,
            approvalStatus: "approved"
        }).populate("user", "username email");

        return NextResponse.json({ success: true, providers });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
