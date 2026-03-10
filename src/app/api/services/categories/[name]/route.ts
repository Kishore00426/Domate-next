import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import "@/models/Subcategory"; // Ensure Subcategory model is registered

export async function GET(req: NextRequest, { params }: { params: any }) {
    try {
        await dbConnect();
        const { name } = await params;
        const category = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })
            .populate("subcategories");

        if (!category) {
            return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, category });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
