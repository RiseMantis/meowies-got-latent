'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, MessageCircleHeart, UserRound, Map } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();

const AgentIcon = ({ className }: { className?: string }) => (
  <img src="/w.png" alt="Ask AI" className={`object-contain ${className}`} style={{borderRadius: "10px"}}/>
);

  const navItems = [
    {
      label: 'Map',
      href: '/wac',
      icon: Map,
    },
    {
      label: 'Register',
      href: '/wac/register-store',
      icon: PlusCircle,
    },
    {
      label: 'Ask Meow',
      href: '#', // Placeholder for chatbot route
      icon: AgentIcon,
    },
    {
      label: 'Profile',
      href: '/wac/profile',
      icon: UserRound,
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90vw] max-w-[400px] z-[2500]">
      <div className="flex items-center justify-between px-6 py-3 bg-white/85 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(100,116,139,0.15)] rounded-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center p-2 rounded-xl transition-transform active:scale-90"
            >
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-[#a5b4fc]/20 rounded-2xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon 
                className={`w-6 h-6 mb-1 z-10 transition-colors ${
                  isActive ? 'text-[#818cf8]' : 'text-slate-400'
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span 
                className={`text-[10px] font-semibold z-10 transition-colors ${
                  isActive ? 'text-[#818cf8]' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
