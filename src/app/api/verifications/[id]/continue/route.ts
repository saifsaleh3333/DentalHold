import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { triggerVapiCall } from "@/lib/vapi";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.practiceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Parse optional overrides from request body
    let overrides: { phoneNumber?: string } = {};
    try {
      const body = await request.json();
      if (body.phoneNumber) overrides.phoneNumber = body.phoneNumber;
    } catch {
      // No body or invalid JSON — that's fine, use original data
    }

    // Fetch existing verification
    const existing = await prisma.verification.findFirst({
      where: { id, practiceId: session.user.practiceId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 }
      );
    }

    if (existing.status === "in_progress") {
      return NextResponse.json(
        { error: "Verification is already in progress" },
        { status: 400 }
      );
    }

    const phoneNumber = overrides.phoneNumber || existing.phoneNumber;
    if (!phoneNumber) {
      return NextResponse.json(
        { error: "No phone number provided" },
        { status: 400 }
      );
    }

    // Parse existing benefits - if none exist, use restart instead
    let existingBenefits: Record<string, unknown> = {};
    if (existing.benefits) {
      try {
        existingBenefits = JSON.parse(existing.benefits as string);
      } catch {
        // If benefits can't be parsed, still allow continuation with empty benefits
      }
    }

    if (!existing.benefits || Object.keys(existingBenefits).length === 0) {
      return NextResponse.json(
        { error: "No existing benefits data found. Use Restart Verification instead." },
        { status: 400 }
      );
    }

    // Fetch practice info for Vapi call
    const practice = await prisma.practice.findUnique({
      where: { id: session.user.practiceId },
    });

    if (!practice) {
      return NextResponse.json({ error: "Practice not found" }, { status: 404 });
    }

    // Set existing record back to in_progress (reuse, don't create new)
    await prisma.verification.update({
      where: { id: existing.id },
      data: { status: "in_progress", phoneNumber },
    });

    // Trigger Vapi call with existing benefits for continuation
    try {
      const vapiCall = await triggerVapiCall({
        phoneNumber,
        practice,
        patient: {
          patientName: existing.patientName,
          patientDOB: existing.patientDOB,
          patientAddress: existing.patientAddress || undefined,
          memberId: existing.memberId,
          groupNumber: existing.groupNumber || undefined,
          patientSSN: existing.patientSSN || undefined,
        },
        subscriber: null,
        practiceId: session.user.practiceId,
        verificationId: existing.id,
        isContinuation: true,
        existingBenefits,
      });

      await prisma.verification.update({
        where: { id: existing.id },
        data: { callId: vapiCall.id },
      });

      return NextResponse.json({ verificationId: existing.id });
    } catch (vapiError) {
      // Revert status on failure
      await prisma.verification.update({
        where: { id: existing.id },
        data: { status: existing.status },
      });

      console.error("Vapi call trigger failed on continuation:", vapiError);
      return NextResponse.json(
        { error: "Failed to start continuation call. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error continuing verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
