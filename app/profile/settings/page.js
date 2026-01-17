// app/profile/settings/page.js
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/profile/ProfileForm';

export const metadata = {
  title: 'Account Settings | Bashō',
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 flex flex-col items-center">
      {/* Increased max-width to 4xl for a wider look */}
      <div className="w-full max-w-4xl space-y-8">
        {/* Centered Header Text */}
        <div className="text-center">
          <h1 className="text-3xl font-serif text-[#442D1C] mb-2">
            Account Settings
          </h1>
          <p className="text-stone-500 text-sm">
            Manage your personal information and profile picture.
          </p>
        </div>

        <ProfileForm user={user} />
      </div>
    </div>
  );
}
