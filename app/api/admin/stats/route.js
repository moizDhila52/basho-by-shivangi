import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

export async function GET() {
  try {
    const todayStart = startOfDay(new Date());

    // Run minimal, fast queries for the sidebar counters
    const [pendingOrders, todaysOrdersData, lowStockItems] = await Promise.all([
      // 1. Pending Orders (For Red Badge)
      prisma.order.count({
        where: { status: "PENDING" }
      }),
      
      // 2. Today's Revenue & Count (For Dashboard Cards)
      prisma.order.findMany({
        where: { createdAt: { gte: todayStart } },
        select: { total: true }
      }),
      
      // 3. Low Stock Items (For Alerts)
      prisma.product.count({
        where: { stock: { lte: 5 } } 
      })
    ]);

    const todaysOrders = todaysOrdersData.length;
    const totalRevenue = todaysOrdersData.reduce((sum, o) => sum + (o.total || 0), 0);

    // This structure matches exactly what AdminContext expects
    return NextResponse.json({
      pendingOrders,
      todaysOrders,
      totalRevenue,
      lowStockItems,
      activeVisitors: 0 // Placeholder
    });

  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Stats failed" }, { status: 500 });
  }
}