import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Ensure you import your prisma instance correctly
import { startOfDay, subDays, startOfYear } from 'date-fns';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30days';
    const paymentType = searchParams.get('paymentType') || 'all';

    // 1. DATE FILTER LOGIC
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '7days':
        startDate = startOfDay(subDays(now, 7));
        break;
      case '90days':
        startDate = startOfDay(subDays(now, 90));
        break;
      case 'year':
        startDate = startOfYear(now);
        break;
      default: // 30days
        startDate = startOfDay(subDays(now, 30));
    }

    // 2. DEFINE VALID STATUSES (Strict Revenue Logic)
    // Only count money that is securely in the system/approved
    const validOrderStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
    const validCustomStatuses = ['APPROVED', 'IN_PROGRESS', 'COMPLETED'];
    // For workshops, 'PAID' in WorkshopRegistration is the source of truth.

    // 3. FETCH DATA BASED ON FILTERS
    const shouldFetchOrders = paymentType === 'all' || paymentType === 'orders';
    const shouldFetchCustom = paymentType === 'all' || paymentType === 'custom';
    const shouldFetchWorkshops = paymentType === 'all' || paymentType === 'workshops';

    const [
      fetchedOrders, 
      fetchedCustom, 
      fetchedWorkshops, 
      productsCount, 
      pendingOrdersCount, 
      activeWorkshopsCount,
      categories
    ] = await Promise.all([
      // A. Store Orders (Strictly Confirmed+)
      shouldFetchOrders ? prisma.order.findMany({
        where: { 
          createdAt: { gte: startDate }, 
          status: { in: validOrderStatuses } 
        },
        include: { User: { select: { id: true, name: true, email: true, image: true, isSubscribed: true } } },
        orderBy: { createdAt: 'desc' }
      }) : [],

      // B. Custom Orders (Strictly Approved+)
      shouldFetchCustom ? prisma.customOrder.findMany({
        where: { 
          createdAt: { gte: startDate }, 
          status: { in: validCustomStatuses } 
        },
        include: { User: { select: { id: true, name: true, email: true, image: true, isSubscribed: true } } },
        orderBy: { createdAt: 'desc' }
      }) : [],

      // C. Workshops (Strictly Paid)
      shouldFetchWorkshops ? prisma.workshopRegistration.findMany({
        where: { 
          createdAt: { gte: startDate }, 
          paymentStatus: 'PAID' 
        },
        include: { 
          User: { select: { id: true, name: true, email: true, image: true, isSubscribed: true } },
          WorkshopSession: { include: { Workshop: { select: { title: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      }) : [],

      // Global Counters (Active state snapshots)
      prisma.product.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.workshop.count({ where: { status: 'ACTIVE' } }),
      
      // Categories (Only relevant if looking at store data)
      shouldFetchOrders ? prisma.category.findMany({ include: { Product: true } }) : []
    ]);

    // 4. NORMALIZE & MERGE DATA
    // We create a unified "Transaction" object for the UI
    const allTransactions = [
      ...fetchedOrders.map(o => ({
        id: o.id,
        type: 'order',
        displayType: 'Store Order',
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
        user: o.User,
        name: o.customerName || o.User?.name || 'Guest',
        email: o.customerEmail || o.User?.email,
        itemCount: 1 // simplified
      })),
      ...fetchedCustom.map(co => ({
        id: co.id,
        type: 'custom',
        displayType: 'Custom Request',
        // Use actualPrice if set (finalized), otherwise fallback to 0 for revenue calc safety
        total: co.actualPrice || 0, 
        status: co.status,
        createdAt: co.createdAt,
        user: co.User,
        name: co.contactName || co.User?.name || 'Guest',
        email: co.contactEmail || co.User?.email,
        itemCount: 1
      })),
      ...fetchedWorkshops.map(wr => ({
        id: wr.id,
        type: 'workshop',
        displayType: wr.WorkshopSession?.Workshop?.title || 'Workshop',
        total: wr.amountPaid,
        status: 'CONFIRMED', // UI mapping
        createdAt: wr.createdAt,
        user: wr.User,
        name: wr.customerName || wr.User?.name || 'Guest',
        email: wr.customerEmail || wr.User?.email,
        itemCount: 1
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 5. CALCULATE TOTALS
    const totalRevenue = allTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
    // Count unique users involved in these transactions
    const uniqueCustomers = new Set(allTransactions.map(t => t.user?.id || t.email).filter(Boolean)).size;
    const avgOrderValue = allTransactions.length > 0 ? totalRevenue / allTransactions.length : 0;

    // 6. CHART DATA GENERATION
    const daysMap = new Map();
    let currentDay = new Date(startDate);
    const endDay = new Date();
    
    // Initialize map with 0s to prevent gaps in chart
    while (currentDay <= endDay) {
        const key = currentDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        daysMap.set(key, { date: key, revenue: 0, orders: 0 });
        currentDay.setDate(currentDay.getDate() + 1);
    }

    // Fill map
    allTransactions.forEach(t => {
        const key = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (daysMap.has(key)) {
            const day = daysMap.get(key);
            day.revenue += (t.total || 0);
            day.orders += 1;
        }
    });

    // 7. PIE CHART DATA (Inventory)
    const categoryData = categories.map(cat => ({
      category: cat.name,
      value: cat.Product.length,
      color: getCategoryColor(cat.name)
    })).filter(c => c.value > 0);

    // 8. STATUS DISTRIBUTION
    const statusCounts = allTransactions.reduce((acc, t) => {
      const status = t.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const orderStatusData = Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count,
        color: getStatusColorHex(status)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 9. DAILY SNAPSHOT
    const todayStr = new Date().toDateString();
    const todayTransactions = allTransactions.filter(t => new Date(t.createdAt).toDateString() === todayStr);
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + (t.total || 0), 0);

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders: allTransactions.length,
        totalCustomers: uniqueCustomers,
        totalProducts: productsCount,
        avgOrderValue,
        pendingOrders: pendingOrdersCount,
        activeWorkshops: activeWorkshopsCount,
      },
      revenueData: Array.from(daysMap.values()),
      orderStatusData,
      recentOrders: allTransactions.slice(0, 10), // Return last 10 transactions
      categoryData,
      dailyStats: {
        todayRevenue,
        todayOrders: todayTransactions.length
      }
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

// --- API HELPERS ---
function getStatusColorHex(status) {
  switch (status?.toUpperCase()) {
    case 'DELIVERED': return '#10B981'; // Emerald
    case 'COMPLETED': return '#10B981';
    case 'CONFIRMED': return '#3B82F6'; // Blue
    case 'APPROVED': return '#8B5CF6'; // Violet
    case 'PROCESSING': return '#F59E0B'; // Amber
    case 'IN_PROGRESS': return '#6366F1'; // Indigo
    case 'SHIPPED': return '#F97316'; // Orange
    case 'PENDING': return '#FBBF24'; // Yellow
    default: return '#9CA3AF'; // Gray
  }
}

function getCategoryColor(category) {
  const colors = ['#442D1C', '#652810', '#8E5022', '#C85428', '#EDD8B4'];
  const index = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}