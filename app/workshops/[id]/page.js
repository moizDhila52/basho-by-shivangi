import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import WorkshopDetailClient from "@/components/workshops/WorkshopDetailClient";

export const dynamic = "force-dynamic";

export default async function WorkshopDetailPage({ params }) {
  const { id } = await params;

  const workshop = await prisma.workshop.findUnique({
    where: { id },
    include: {
      WorkshopSession: {
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!workshop) return notFound();

  // Pass data to the Client Component
  return <WorkshopDetailClient workshop={workshop} />;
}
