import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Role from "@/models/Role";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { username, email, password, role, mobile } = await req.json();

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const roleDoc = await Role.findOne({ name: role || "user" });
        if (!roleDoc) {
            return NextResponse.json({ success: false, error: "Role not found" }, { status: 400 });
        }

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: roleDoc._id,
            contactNumber: mobile,
        });

        return NextResponse.json({
            success: true,
            message: `Registered successfully as ${roleDoc.name}`,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                contactNumber: user.contactNumber,
                role: roleDoc.name
            }
        }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
