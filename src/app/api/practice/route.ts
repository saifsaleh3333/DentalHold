import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.practiceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const practice = await prisma.practice.findUnique({
      where: { id: session.user.practiceId },
    });

    if (!practice) {
      return NextResponse.json({ error: "Practice not found" }, { status: 404 });
    }

    return NextResponse.json(practice);
  } catch (error) {
    console.error("Error fetching practice:", error);
    return NextResponse.json(
      { error: "Failed to fetch practice" },
      { status: 500 }
    );
  }
}

const ALLOWED_FIELDS = [
  "name",
  "address",
  "city",
  "state",
  "zip",
  "phone",
  "fax",
  "npiPractice",
  "npiIndividual",
  "taxId",
] as const;

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.practiceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Whitelist fields
    const data: Record<string, string> = {};
    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        data[field] = body[field];
      }
    }

    const practice = await prisma.practice.update({
      where: { id: session.user.practiceId },
      data,
    });

    return NextResponse.json(practice);
  } catch (error) {
    console.error("Error updating practice:", error);
    return NextResponse.json(
      { error: "Failed to update practice" },
      { status: 500 }
    );
  }
}
