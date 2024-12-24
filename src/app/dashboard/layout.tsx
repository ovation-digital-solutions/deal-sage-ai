'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { IconHome, IconSearch, IconCompare, IconStar } from '@/components/Icons';

function SideNavLink({ href, icon, children }: { 
  href: string; 
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${isActive 
          ? 'bg-black text-white' 
          : 'text-gray-600 hover:bg-gray-100'
        }
      `}
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Side Navigation */}
      <aside className="w-64 border-r border-gray-200 p-4 space-y-2">
        <SideNavLink href="/dashboard" icon={<IconHome className="w-5 h-5" />}>
          Overview
        </SideNavLink>
        <SideNavLink href="/dashboard/browse" icon={<IconSearch className="w-5 h-5" />}>
          Browse Properties
        </SideNavLink>
        <SideNavLink href="/dashboard/compare" icon={<IconCompare className="w-5 h-5" />}>
          Save & Compare
        </SideNavLink>
        <SideNavLink href="/dashboard/favorites" icon={<IconStar className="w-5 h-5" />}>
          Favorites
        </SideNavLink>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
