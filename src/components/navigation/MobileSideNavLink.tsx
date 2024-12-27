'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SideNavLinkProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function MobileSideNavLink({ href, icon, children }: SideNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        xs:hidden flex items-center justify-start gap-4 px-3 py-3 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-black text-white shadow-md' 
          : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
        }
      `}
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <span className="font-medium text-sm truncate">
        {children}
      </span>
    </Link>
  );
}

export { MobileSideNavLink };
