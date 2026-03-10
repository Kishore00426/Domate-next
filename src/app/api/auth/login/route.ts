import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Role from "@/models/Role";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        const user = await User.findOne({ email }).populate({ path: "role", model: Role });
        if (!user) {
            return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 400 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 400 });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "1h" });

        // Detect role name safely
        let roleName = null;
        if (user.role && typeof user.role === 'object' && 'name' in user.role) {
            roleName = (user.role as any).name;
        } else if (user.role) {
            // If it's not populated for some reason, we might just have the ID
            roleName = null;
        }

        return NextResponse.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                contactNumber: user.contactNumber,
                role: { name: roleName }
            }
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
