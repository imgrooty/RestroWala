import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() },
      }),
      prisma.session.deleteMany({ where: { userId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to stop all sessions", error);
    return NextResponse.json({ error: "Failed to stop all sessions" }, { status: 500 });
  }
}
