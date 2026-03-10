import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subcategory from "@/models/Subcategory";
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
            const categoryId = formData.get("categoryId");
            if (categoryId) {
                body.category = categoryId;
            }
        } else {
            body = await req.json();
            if (body.categoryId) {
                body.category = body.categoryId;
            }
        }

        const subcategory = await Subcategory.findByIdAndUpdate(id, body, { new: true });
        if (!subcategory) {
            return NextResponse.json({ success: false, error: "Subcategory not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: subcategory });
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
        const subcategory = await Subcategory.findByIdAndDelete(id);
        if (!subcategory) {
            return NextResponse.json({ success: false, error: "Subcategory not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Subcategory deleted successfully" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
