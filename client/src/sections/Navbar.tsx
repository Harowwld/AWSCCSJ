import { motion } from 'framer-motion';
import { Cloud, ArrowRight } from 'lucide-react';
import type { NavigateFn } from './shared';

export default function Navbar({ onNavigate, activeId }: { onNavigate: NavigateFn; activeId?: string }) {
  const links = [
    { label: 'About', id: 'about' },
    { label: 'Highlights', id: 'highlights' },
    { label: 'Events', id: 'events' },
    { label: 'Announcements', id: 'announcements' },
    { label: 'Members', id: 'members' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <header className="sticky top-0 inset-x-0 z-40 w-full backdrop-blur bg-slate-950/70 border-b border-white/5 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.6)]">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Cloud className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <p className="text-xs text-orange-200 uppercase tracking-[0.24em]">AWS Cloud Club</p>
            <p className="text-lg font-semibold text-white">PUP San Juan</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-200">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`hover:text-white transition-colors relative ${activeId === link.id ? 'text-white' : 'text-slate-200'}`}
              type="button"
            >
              {link.label}
              {activeId === link.id && (
                <span className="absolute left-0 right-0 -bottom-2 mx-auto h-0.5 w-7 rounded-full bg-orange-400" />
              )}
            </button>
          ))}
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('contact')}
            type="button"
            className="ml-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-slate-950 font-semibold shadow-lg shadow-orange-500/25"
          >
            Join the club <ArrowRight className="h-4 w-4" />
          </motion.button>
        </nav>
      </div>
    </header>
  );
}
