// app/api/testimonials/[id]/route.js
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function PUT(request, props) {
  const params = await props.params; // <--- AWAIT THIS
  try {
    const id = params.id;
    const body = await request.json();

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(request, props) {
  const params = await props.params; // <--- AWAIT THIS
  try {
    const id = params.id;
    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}