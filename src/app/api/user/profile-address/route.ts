import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Address from "@/models/Address";
import { getUserFromToken } from "@/lib/auth";

export async function PUT(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { username, email, street, city, state, postalCode, country, phone } = await req.json();

        const updateData: any = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (phone) updateData.contactNumber = phone;

        let updatedUser = await User.findByIdAndUpdate(user._id, updateData, {
            new: true,
        }).populate("role");

        if (!updatedUser) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        let updatedAddress = await Address.findOne({ user: user._id });
        if (street || city || state || postalCode || country || phone) {
            if (updatedAddress) {
                Object.assign(updatedAddress, { street, city, state, postalCode, country, phone });
                await updatedAddress.save();
            } else {
                updatedAddress = await Address.create({
                    user: user._id,
                    street,
                    city,
                    state,
                    postalCode,
                    country,
                    phone,
                });
            }
        }

        return NextResponse.json({
            success: true,
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                contactNumber: updatedUser.contactNumber,
                role: (updatedUser as any).role ? (updatedUser as any).role.name : null,
                address: updatedAddress
                    ? {
                        street: updatedAddress.street,
                        city: updatedAddress.city,
                        state: updatedAddress.state,
                        postalCode: updatedAddress.postalCode,
                        country: updatedAddress.country,
                        phone: updatedAddress.phone,
                    }
                    : null,
            },
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
