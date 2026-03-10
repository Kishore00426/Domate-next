import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Address from "@/models/Address";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const address = await Address.findOne({ user: user._id });

        return NextResponse.json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                contactNumber: user.contactNumber,
                role: (user as any).role ? (user as any).role.name : null,
                address: address
                    ? {
                        street: address.street,
                        city: address.city,
                        state: address.state,
                        postalCode: address.postalCode,
                        country: address.country,
                        phone: address.phone,
                    }
                    : null,
            },
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await User.findByIdAndDelete(user._id);
        await Address.deleteOne({ user: user._id });

        return NextResponse.json({ success: true, message: "User and address deleted successfully" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
