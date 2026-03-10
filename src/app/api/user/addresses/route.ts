import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Address from "@/models/Address";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
        const addresses = await Address.find({ user: user._id });
        return NextResponse.json({ success: true, addresses });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { label, street, city, state, postalCode, country, isDefault } = await req.json();

        // If this is set as default, unset others for this user
        if (isDefault) {
            await Address.updateMany({ user: user._id }, { isDefault: false });
        }

        const newAddress = await Address.create({
            user: user._id,
            label,
            street,
            city,
            state,
            postalCode,
            country,
            isDefault: isDefault || false
        });

        return NextResponse.json({ success: true, address: newAddress });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
