import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import { getUserFromToken } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: any }) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "admin") {
            return NextResponse.json({ success: false, error: "Access denied. Admins only." }, { status: 403 });
        }

        const id = (await params).id;
        const body = await req.json();

        const service = await Service.findByIdAndUpdate(id, body, { new: true });
        if (!service) {
            return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: service });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: any }) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "admin") {
            return NextResponse.json({ success: false, error: "Access denied. Admins only." }, { status: 403 });
        }

        const id = (await params).id;
        const service = await Service.findByIdAndDelete(id);
        if (!service) {
            return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Service deleted successfully" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
