import { motion } from 'framer-motion';
import { Cloud } from 'lucide-react';
import type { NavigateFn } from './shared';

export default function Footer({ onNavigate }: { onNavigate: NavigateFn }) {
  return (
    <footer className="border-t border-white/5 bg-slate-950/80">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-400">
        <div className="flex items-center gap-3 text-white">
          <motion.div whileHover={{ scale: 1.05 }} className="h-8 w-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
            <Cloud className="h-5 w-5 text-orange-300" />
          </motion.div>
          <span>AWS Cloud Club · PUP San Juan</span>
        </div>
        <div className="flex gap-4 text-slate-300">
          <button type="button" onClick={() => onNavigate('events')} className="hover:text-orange-200">Events</button>
          <button type="button" onClick={() => onNavigate('members')} className="hover:text-orange-200">Team</button>
          <button type="button" onClick={() => onNavigate('contact')} className="hover:text-orange-200">Contact</button>
        </div>
      </div>
    </footer>
  );
}
