import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { getUserFromToken } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: any }) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "admin") {
            return NextResponse.json({ success: false, error: "Access denied. Admins only." }, { status: 403 });
        }

        const id = (await params).id;
        const contentType = req.headers.get("content-type") || "";
        let body: any = {};

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            body.name = formData.get("name");
            body.description = formData.get("description");
            // Handle image later if needed
        } else {
            body = await req.json();
        }

        const category = await Category.findByIdAndUpdate(id, body, { new: true });
        if (!category) {
            return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: category });
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
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Category deleted successfully" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
