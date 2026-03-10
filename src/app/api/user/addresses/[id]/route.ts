import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Address from "@/models/Address";
import { getUserFromToken } from "@/lib/auth";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const deletedAddress = await Address.findOneAndDelete({ _id: id, user: user._id });

        if (!deletedAddress) {
            return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Address deleted successfully" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const updates = await req.json();

        // If setting as default, unset others
        if (updates.isDefault) {
            await Address.updateMany({ user: user._id }, { isDefault: false });
        }

        const updatedAddress = await Address.findOneAndUpdate(
            { _id: id, user: user._id },
            updates,
            { new: true }
        );

        if (!updatedAddress) {
            return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, address: updatedAddress });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
