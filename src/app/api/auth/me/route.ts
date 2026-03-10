import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const header = req.headers.get("authorization");
        if (!header || !header.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 });
        }

        const token = header.split(" ")[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        } catch (err: any) {
            return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
        }

        const user = await User.findById(decoded.id).populate("role");
        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                contactNumber: user.contactNumber,
                role: (user as any).role?.name || null
            }
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
