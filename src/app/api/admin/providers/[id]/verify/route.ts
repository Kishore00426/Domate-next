import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: any }) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "admin") {
            return NextResponse.json({ success: false, error: "Access denied. Admins only." }, { status: 403 });
        }

        const id = (await params).id;
        const { action } = await req.json(); // "approve" or "reject"

        if (!["approve", "reject"].includes(action)) {
            return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
        }

        const status = action === "approve" ? "approved" : "rejected";
        const provider = await User.findByIdAndUpdate(id, { providerStatus: status }, { new: true });

        if (!provider) {
            return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: `Provider ${action}ed successfully` });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
