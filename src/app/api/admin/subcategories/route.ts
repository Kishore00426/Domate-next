import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subcategory from "@/models/Subcategory";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "admin") {
            return NextResponse.json({ success: false, error: "Access denied. Admins only." }, { status: 403 });
        }

        const subcategories = await Subcategory.find({}).populate("category");
        return NextResponse.json({ success: true, data: subcategories });
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

        const contentType = req.headers.get("content-type") || "";
        let body: any = {};

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            body.name = formData.get("name");
            body.description = formData.get("description");
            body.categoryId = formData.get("categoryId"); // Note: models use 'category' field usually
            if (body.categoryId) {
                body.category = body.categoryId;
            }
        } else {
            body = await req.json();
            if (body.categoryId) {
                body.category = body.categoryId;
            }
        }

        if (!body.name) {
            return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
        }

        const subcategory = await Subcategory.create(body);
        return NextResponse.json({ success: true, data: subcategory });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
