import React from 'react';
import { Home, Calendar, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNav() {
  const { t } = useLanguage();
  const location = useLocation();

  const tabs = [
    { id: 'dashboard', path: '/dashboard', label: t('dashboard'), icon: Home },
    { id: 'diario', path: '/diario', label: t('diario'), icon: Calendar },
    { id: 'profilo', path: '/profilo', label: t('profilo'), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800/80 shadow-2xl px-6 py-2.5 z-40 max-w-md mx-auto rounded-t-3xl">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          // Si considera attivo se il percorso coincide esattamente o se siamo nella home "/" e il tab è la dashboard
          const isActive = location.pathname === tab.path || (tab.id === 'dashboard' && location.pathname === '/');
          return (
            <Link
              key={tab.id}
              to={tab.path}
              aria-label={tab.label}
              className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-primary-400 scale-105 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={22} className={`mb-1 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              <span className="text-[11px] tracking-wide font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
