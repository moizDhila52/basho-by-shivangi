import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm"; // We will create this client component below

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch full user details + recent orders
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-serif text-[#442D1C] mb-8">
        Hello, {user.name}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Col: Edit Details */}
        <div>
          <h2 className="text-xl font-serif mb-4 border-b border-[#EDD8B4] pb-2">
            Personal Details
          </h2>
          <ProfileForm user={user} />
        </div>

        {/* Right Col: Platform Activity */}
        <div>
          <h2 className="text-xl font-serif mb-4 border-b border-[#EDD8B4] pb-2">
            Recent Activity
          </h2>

          {user.orders.length === 0 ? (
            <div className="bg-[#FDFBF7] p-6 rounded-lg border border-dashed border-[#EDD8B4] text-center">
              <p className="text-[#8E5022]">No orders yet.</p>
              <a
                href="/products"
                className="text-[#442D1C] underline font-bold mt-2 inline-block"
              >
                Start Browsing
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {user.orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-4 border border-[#EDD8B4] rounded-lg shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-[#442D1C]">
                      Order #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-sm text-[#8E5022]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#442D1C]">₹{order.total}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "DELIVERED"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
