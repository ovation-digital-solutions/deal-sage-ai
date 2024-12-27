'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SideNavLinkProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  collapsed?: boolean;
}

function DesktopSideNavLink({ href, icon, children, collapsed }: SideNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        hidden xs:flex items-center justify-center sm:justify-start gap-3 
        ${collapsed ? 'w-10 h-10' : 'px-3 sm:px-4 py-2.5 sm:py-3'} 
        rounded-lg transition-all duration-200 group relative
        ${isActive 
          ? 'bg-black text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
        }
      `}
    >
      <div className={`
        flex-shrink-0
        ${collapsed ? 'flex items-center justify-center w-full h-full' : ''}
      `}>
        {icon}
      </div>
      {!collapsed && (
        <span className="font-medium text-sm truncate">
          {children}
        </span>
      )}
      {collapsed && (
        <div className="
          absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm
          rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 whitespace-nowrap z-10 shadow-lg
          border border-gray-700
        ">
          {children}
        </div>
      )}
    </Link>
  );
}

export { DesktopSideNavLink };
