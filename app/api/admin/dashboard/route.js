import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  subDays,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
} from "date-fns";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30days";

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case "7days":
        startDate = subDays(now, 7);
        break;
      case "30days":
        startDate = subDays(now, 30);
        break;
      case "90days":
        startDate = subDays(now, 90);
        break;
      case "year":
        startDate = subDays(now, 365);
        break;
      default:
        startDate = subDays(now, 30);
    }

    // Fetch data in parallel
    const [orders, products, customers, workshops, orderItems, categories] =
      await Promise.all([
        // Orders in date range
        prisma.order.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: now,
            },
          },
          include: {
            OrderItem: {
              include: {
                Product: {
                  include: {
                    Category: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),

        // All products
        prisma.product.findMany({
          include: {
            Category: true,
          },
        }),

        // All customers
        prisma.user.findMany({
          where: {
            role: "CUSTOMER",
          },
        }),

        // Active workshops
        prisma.workshop.findMany({
          where: {
            status: "ACTIVE",
          },
        }),

        // Recent order items for sales calculation
        prisma.orderItem.findMany({
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          include: {
            Product: true,
          },
        }),

        // Categories
        prisma.category.findMany(),
      ]);

    // Calculate summary stats
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const totalProducts = products.length;
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    const activeWorkshops = workshops.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate conversion rate (simplified)
    const customersWithOrders = new Set(
      orders.map((o) => o.userId).filter(Boolean)
    );
    const conversionRate =
      totalCustomers > 0
        ? ((customersWithOrders.size / totalCustomers) * 100).toFixed(1)
        : 0;

    // Calculate revenue trend data
    const revenueData = calculateRevenueTrend(orders, startDate, now);

    // Calculate order status distribution
    const orderStatusData = calculateOrderStatus(orders);

    // Calculate category distribution
    const categoryData = calculateCategoryDistribution(products);

    // Calculate top products
    const topProducts = calculateTopProducts(products, orderItems);

    // Calculate daily stats
    const dailyStats = calculateDailyStats(orders);

    // Prepare response
    const responseData = {
      summary: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        avgOrderValue,
        conversionRate: parseFloat(conversionRate),
        pendingOrders,
        activeWorkshops,
        revenueChange: calculateChange(orders, "revenue", timeRange),
        ordersChange: calculateChange(orders, "count", timeRange),
        customersChange: 15.3, // Would need historical customer data
      },
      revenueData,
      orderStatusData,
      topProducts: topProducts.slice(0, 5),
      recentOrders: orders.slice(0, 5).map((order) => ({
        ...order,
        OrderItem: order.OrderItem || [],
      })),
      categoryData,
      dailyStats,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateRevenueTrend(orders, startDate, endDate) {
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return days.map((date) => {
    const dayOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === date.toDateString();
    });

    const revenue = dayOrders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );
    const orderCount = dayOrders.length;

    return {
      date: format(date, "MMM dd"),
      fullDate: date,
      revenue,
      orders: orderCount,
      avgOrder: orderCount > 0 ? revenue / orderCount : 0,
    };
  });
}

function calculateOrderStatus(orders) {
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    color: getStatusColor(status),
  }));
}

function calculateCategoryDistribution(products) {
  const categoryCounts = products.reduce((acc, product) => {
    const category = product.Category?.name || "Uncategorized";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Bashō color palette for categories
  const colors = ["#442D1C", "#652810", "#8E5022", "#C85428", "#EDD8B4"];

  return Object.entries(categoryCounts).map(([category, count], index) => ({
    category,
    count,
    value: count,
    color: colors[index % colors.length],
  }));
}

function calculateTopProducts(products, orderItems) {
  const productSales = {};

  orderItems.forEach((item) => {
    productSales[item.productId] =
      (productSales[item.productId] || 0) + item.quantity;
  });

  return products
    .map((product) => ({
      ...product,
      sales: productSales[product.id] || 0,
      revenue: (productSales[product.id] || 0) * product.price,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);
}

function calculateDailyStats(orders) {
  const today = startOfDay(new Date());
  const yesterday = startOfDay(subDays(new Date(), 1));

  const todayOrders = orders.filter((order) => {
    const orderDate = startOfDay(new Date(order.createdAt));
    return orderDate.getTime() === today.getTime();
  });

  const yesterdayOrders = orders.filter((order) => {
    const orderDate = startOfDay(new Date(order.createdAt));
    return orderDate.getTime() === yesterday.getTime();
  });

  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );
  const yesterdayRevenue = yesterdayOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  return {
    todayRevenue,
    yesterdayRevenue,
    todayOrders: todayOrders.length,
    yesterdayOrders: yesterdayOrders.length,
    revenueChange:
      yesterdayRevenue > 0
        ? (
            ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) *
            100
          ).toFixed(1)
        : 0,
  };
}

function calculateChange(orders, metric, timeRange) {
  // This would compare with previous period
  // For simplicity, returning fixed values
  switch (metric) {
    case "revenue":
      return 12.5;
    case "count":
      return 8.2;
    default:
      return 0;
  }
}

function getStatusColor(status) {
  switch (status) {
    case "DELIVERED":
      return "#10B981";
    case "PROCESSING":
      return "#8E5022";
    case "SHIPPED":
      return "#C85428";
    case "PENDING":
      return "#F59E0B";
    case "CANCELLED":
      return "#EF4444";
    default:
      return "#442D1C";
  }
}
