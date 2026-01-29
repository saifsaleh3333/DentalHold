import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const verifications = await prisma.verification.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Parse benefits JSON for each verification
    const parsed = verifications.map((v) => ({
      ...v,
      benefits: v.benefits ? JSON.parse(v.benefits) : null,
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error fetching verifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch verifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const verification = await prisma.verification.create({
      data: {
        status: body.status || "in_progress",
        patientName: body.patientName,
        patientDOB: body.patientDOB,
        memberId: body.memberId,
        insuranceCarrier: body.insuranceCarrier,
        callDuration: body.callDuration,
        recordingUrl: body.recordingUrl,
        transcript: body.transcript,
        benefits: body.benefits ? JSON.stringify(body.benefits) : null,
        referenceNumber: body.referenceNumber,
        repName: body.repName,
      },
    });

    return NextResponse.json(verification, { status: 201 });
  } catch (error) {
    console.error("Error creating verification:", error);
    return NextResponse.json(
      { error: "Failed to create verification" },
      { status: 500 }
    );
  }
}
