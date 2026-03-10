import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "service_provider") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { type, url } = await req.json(); // Simulating upload result

        const updateField = type === 'id' ? 'idProofs' : (type === 'cert' ? 'certificates' : 'addressProofs');

        const provider = await ServiceProvider.findOneAndUpdate(
            { user: user._id },
            { $push: { [updateField]: url } },
            { new: true }
        );

        return NextResponse.json({ success: true, provider });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req) as any;
        if (!user || user.role?.name !== "service_provider") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { type, url } = await req.json();
        const updateField = type === 'id' ? 'idProofs' : (type === 'cert' ? 'certificates' : 'addressProofs');

        const provider = await ServiceProvider.findOneAndUpdate(
            { user: user._id },
            { $pull: { [updateField]: url } },
            { new: true }
        );

        return NextResponse.json({ success: true, provider });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
