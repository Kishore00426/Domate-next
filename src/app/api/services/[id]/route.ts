import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";

export async function GET(req: NextRequest, { params }: { params: any }) {
    try {
        await dbConnect();
        const { id } = await params;
        const service = await Service.findById(id)
            .populate("category", "name")
            .populate("subcategory", "name");

        if (!service) {
            return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, service });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
