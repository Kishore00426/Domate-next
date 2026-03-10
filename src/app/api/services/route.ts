import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import Category from "@/models/Category";
import Subcategory from "@/models/Subcategory";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const categoryName = searchParams.get("category");
        const categoryId = searchParams.get("categoryId");
        const subcategoryName = searchParams.get("subcategory");

        let query: any = {};

        if (categoryId) {
            query.category = categoryId;
        } else if (categoryName) {
            const catObj = await Category.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, "i") } });
            if (catObj) {
                query.category = catObj._id;
            } else {
                return NextResponse.json({ success: true, services: [] });
            }
        }

        if (subcategoryName) {
            const subObj = await Subcategory.findOne({ name: { $regex: new RegExp(`^${subcategoryName}$`, "i") } });
            if (subObj) {
                query.subcategory = subObj._id;
            } else {
                return NextResponse.json({ success: true, services: [] });
            }
        }

        const services = await Service.find(query)
            .populate("category", "name")
            .populate("subcategory", "name");

        return NextResponse.json({ success: true, services });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
