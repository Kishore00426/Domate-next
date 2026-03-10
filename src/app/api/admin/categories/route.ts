import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "admin") {
            return NextResponse.json({ success: false, error: "Access denied. Admins only." }, { status: 403 });
        }

        const categories = await Category.find({}).populate("subcategories");
        return NextResponse.json({ success: true, data: categories });
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
            // For now, we'll store a placeholder or handle image later if needed.
            // In a real app, we'd upload the file to Cloudinary/S3 here.
            body.imageUrl = "";
        } else {
            body = await req.json();
        }

        if (!body.name) {
            return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
        }

        const category = await Category.create(body);
        return NextResponse.json({ success: true, data: category });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
