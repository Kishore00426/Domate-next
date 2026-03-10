import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "admin") {
            return NextResponse.json({ success: false, error: "Access denied. Admins only." }, { status: 403 });
        }

        const users = await User.find({}).populate("role");
        return NextResponse.json({ success: true, data: users });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
