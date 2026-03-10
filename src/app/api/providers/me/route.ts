import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";
import User from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "service_provider") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Find or create provider profile for this user
        let provider = await ServiceProvider.findOne({ user: user._id })
            .populate("services")
            .populate("user", "username email contactNumber profilePicture");

        if (!provider) {
            provider = await ServiceProvider.create({
                user: user._id,
                approvalStatus: "pending",
                services: []
            });
            // Populate after creation
            provider = await ServiceProvider.findById(provider._id)
                .populate("services")
                .populate("user", "username email contactNumber profilePicture");
        }

        return NextResponse.json({ success: true, provider });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
