import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const verification = await prisma.verification.findUnique({
      where: { id },
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
    const { id } = await params;
    const body = await request.json();

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
    const { id } = await params;

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
