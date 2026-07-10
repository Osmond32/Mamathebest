import React from 'react';
import { Soup, Scale } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BiberonIcon = ({ className = '', size = 22, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`w-[22px] h-[22px] shrink-0 ${className}`} {...props}>
    <path d="M11.5 4.5v-2c0-.6.4-1 .9-1s.9.4.9 1v2" />
    <path d="M10 7.5c0-1.8 1-3 2-3s2 1.2 2 3" />
    <rect x="8.5" y="7.5" width="7" height="1.5" rx="0.5" />
    <path d="M9 9c0 2.5 1 4.5 1 6c0 1.5-1 3.5-1 6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2c0-2.5-1-4.5-1-6c0-1.5 1-3.5 1-6Z" />
    <line x1="11.5" y1="12" x2="13" y2="12" />
    <line x1="11.5" y1="15" x2="12.5" y2="15" />
    <line x1="11.5" y1="18" x2="13" y2="18" />
  </svg>
);

const DiaperIcon = ({ className = '', size = 22, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`w-[22px] h-[22px] shrink-0 ${className}`} {...props}>
    <path d="M3 5h18v4c0 3-2 6-5 8.5L12 20l-4-7.5C5 11 3 8 3 5z"/>
    <path d="M3 8h18"/>
    <path d="M6 5v3"/>
    <path d="M18 5v3"/>
  </svg>
);

export default function BottomNav({ onOpenLogModal }) {
  const { t } = useLanguage();

  const actions = [
    { id: 'latte', label: t('feed_label'), icon: BiberonIcon, colorClass: 'text-blue-400 hover:text-blue-300' },
    { id: 'pappa', label: t('solid_label'), icon: Soup, colorClass: 'text-emerald-400 hover:text-emerald-300' },
    { id: 'evacuazione', label: t('diaper_label'), icon: DiaperIcon, colorClass: 'text-purple-400 hover:text-purple-300' },
    { id: 'peso', label: t('weight_label'), icon: Scale, colorClass: 'text-amber-400 hover:text-amber-300' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800/80 shadow-2xl px-4 py-2.5 z-40 max-w-md mx-auto rounded-t-3xl">
      <div className="flex justify-around items-center">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onOpenLogModal && onOpenLogModal(act.id)}
              aria-label={act.label}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 active:scale-90 focus:outline-none ${act.colorClass}`}
            >
              <Icon className="mb-1 transition-transform stroke-[2.5px]" />
              <span className="text-[10px] tracking-wide font-bold">{act.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
