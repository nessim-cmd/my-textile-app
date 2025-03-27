// app/api/user-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clerkUserId = searchParams.get("clerkUserId");

  if (!clerkUserId) {
    return NextResponse.json({ error: "clerkUserId is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ role: user.role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}