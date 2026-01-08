// app/profile/address/page.js
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import AddressManager from '@/components/profile/AddressManager';

export default async function AddressPage() {
  const session = await getSession();
  
  // Fetch data on the server
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { Address: true }, // Ensure this matches your Prisma schema (Address vs addresses)
  });

  return (
    <div>
      <h2 className="text-2xl font-serif text-[#442D1C] mb-6">
        Saved Addresses
      </h2>

      {/* Pass the server data to the interactive client component */}
      <AddressManager initialAddresses={user.Address || []} />
    </div>
  );
}