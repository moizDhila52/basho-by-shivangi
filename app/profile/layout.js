import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileSidebar from '@/components/ProfileSidebar';
import MobileNav from '@/components/profile/MobileNav';

export default async function ProfileLayout({ children }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, image: true },
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-24 lg:pb-12">
      {' '}
      {/* Added pb-24 for mobile bar space */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
        <div className="hidden lg:block lg:col-span-3">
          <ProfileSidebar user={user} />
        </div>

        {/* MAIN CONTENT */}
        <main className="lg:col-span-9">{children}</main>

        {/* MOBILE BOTTOM NAV (Hidden on Desktop) */}
        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
