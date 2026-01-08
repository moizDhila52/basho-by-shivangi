// app/api/corporate/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit"))
      : 50;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page"))
      : 1;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
    };

    if (status) where.status = status;

    const [inquiries, total] = await Promise.all([
      prisma.corporateInquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.corporateInquiry.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: inquiries,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching corporate inquiries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (
      !body.companyName ||
      !body.contactName ||
      !body.email ||
      !body.message
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const inquiry = await prisma.corporateInquiry.create({
      data: {
        companyName: body.companyName,
        contactName: body.contactName,
        email: body.email,
        phone: body.phone,
        companySize: body.companySize,
        interest: body.interest || [],
        message: body.message,
      },
    });

    return NextResponse.json({
      success: true,
      data: inquiry,
      message: "Inquiry submitted successfully",
    });
  } catch (error) {
    console.error("Error creating corporate inquiry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
