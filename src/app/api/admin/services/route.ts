import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "admin") {
            return NextResponse.json({ success: false, error: "Access denied. Admins only." }, { status: 403 });
        }

        const services = await Service.find({})
            .populate("category")
            .populate("subcategory");

        return NextResponse.json({ success: true, data: services });
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

        // Basic validation
        if (!body.title || !body.price) {
            return NextResponse.json({ success: false, error: "Title and Price are required" }, { status: 400 });
        }

        const service = await Service.create(body);
        return NextResponse.json({ success: true, data: service });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
