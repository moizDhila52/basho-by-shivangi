import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function AddressPage() {
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { addresses: true },
  });

  return (
    <div>
      <h2 className="text-2xl font-serif text-[#442D1C] mb-6">
        Saved Addresses
      </h2>

      {/* Address Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {user.addresses.map((addr) => (
          <div key={addr.id} className="p-4 border border-[#EDD8B4] rounded-lg">
            <p className="font-bold">{addr.street}</p>
            <p>
              {addr.city}, {addr.state} - {addr.pincode}
            </p>
            {addr.isDefault && (
              <span className="text-xs bg-[#442D1C] text-white px-2 py-1 rounded mt-2 inline-block">
                Default
              </span>
            )}
          </div>
        ))}

        {/* Add New Button Placeholder */}
        <button className="flex items-center justify-center p-4 border border-dashed border-[#EDD8B4] rounded-lg text-[#8E5022] hover:bg-[#FDFBF7]">
          + Add New Address
        </button>
      </div>
    </div>
  );
}
