import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function getUserFromToken(req) {
    const header = req.headers.get("authorization");
    if (!header || !header.startsWith("Bearer ")) {
        return null;
    }

    const token = header.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await dbConnect();
        const user = await User.findById(decoded.id).populate("role");
        return user;
    } catch (err) {
        return null;
    }
}
