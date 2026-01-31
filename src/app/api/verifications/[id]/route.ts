import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.practiceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const verification = await prisma.verification.findFirst({
      where: { id, practiceId: session.user.practiceId },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...verification,
      benefits: verification.benefits ? JSON.parse(verification.benefits) : null,
    });
  } catch (error) {
    console.error("Error fetching verification:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.practiceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify the record belongs to this practice
    const existing = await prisma.verification.findFirst({
      where: { id, practiceId: session.user.practiceId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 }
      );
    }

    const verification = await prisma.verification.update({
      where: { id },
      data: {
        ...body,
        benefits: body.benefits ? JSON.stringify(body.benefits) : undefined,
      },
    });

    return NextResponse.json({
      ...verification,
      benefits: verification.benefits ? JSON.parse(verification.benefits) : null,
    });
  } catch (error) {
    console.error("Error updating verification:", error);
    return NextResponse.json(
      { error: "Failed to update verification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.practiceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the record belongs to this practice
    const existing = await prisma.verification.findFirst({
      where: { id, practiceId: session.user.practiceId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 }
      );
    }

    await prisma.verification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting verification:", error);
    return NextResponse.json(
      { error: "Failed to delete verification" },
      { status: 500 }
    );
  }
}
