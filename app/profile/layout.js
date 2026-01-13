import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileSidebar from '@/components/ProfileSidebar';

export default async function ProfileLayout({ children }) {
  const session = await getSession();
  if (!session) redirect('/login');

  // Fetch the full user object to get the latest image
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, image: true }
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-12">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Pass user data to the Client Component Sidebar */}
        <ProfileSidebar user={user} />

        {/* Main Content Area */}
        <main className="lg:col-span-9">
          {children}
        </main>
      </div>
    </div>
  );
}