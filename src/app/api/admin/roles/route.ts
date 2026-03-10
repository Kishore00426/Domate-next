import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Role from "@/models/Role";
import Privilege from "@/models/Privilege";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "admin") {
            return NextResponse.json({ success: false, error: "Access denied. Admins only." }, { status: 403 });
        }

        const roles = await Role.find({}).populate("privileges");
        const privileges = await Privilege.find({});

        return NextResponse.json({
            success: true,
            data: { roles, privileges }
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "admin") {
            return NextResponse.json({ success: false, error: "Access denied. Admins only." }, { status: 403 });
        }

        const body = await req.json();
        // Handle creating either a role or a privilege based on 'type' field in body
        if (body.type === 'role') {
            const role = await Role.create({ name: body.name, privileges: body.privileges });
            return NextResponse.json({ success: true, data: role });
        } else {
            const privilege = await Privilege.create({ name: body.name, description: body.description });
            return NextResponse.json({ success: true, data: privilege });
        }
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
