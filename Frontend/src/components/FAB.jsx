import React, { useState } from 'react';
import { Plus, Baby, Calendar, HelpCircle, Utensils, Weight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function FAB({ onSelectAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const actions = [
    { id: 'latte', label: t('feed_label'), icon: Baby, color: 'bg-blue-500 shadow-blue-500/20 text-white hover:bg-blue-600' },
    { id: 'pappa', label: t('solid_label'), icon: Utensils, color: 'bg-emerald-500 shadow-emerald-500/20 text-white hover:bg-emerald-600' },
    { id: 'peso', label: t('weight_label'), icon: Weight, color: 'bg-amber-500 shadow-amber-500/20 text-white hover:bg-amber-600' },
  ];

  const handleAction = (id) => {
    onSelectAction(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Background overlay for action list */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity"
        />
      )}

      {/* Action items container */}
      <div className="fixed bottom-20 right-6 flex flex-col items-end space-y-3 z-50 max-w-md mx-auto">
        {isOpen && (
          <div className="flex flex-col items-end space-y-3 animate-slide-up mb-2">
            {actions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <div key={action.id} className="flex items-center space-x-3">
                  <span className="bg-white border border-slate-100 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-700 shadow-sm">
                    {action.label}
                  </span>
                  <button
                    onClick={() => handleAction(action.id)}
                    aria-label={action.label}
                    className={`p-3.5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${action.color}`}
                  >
                    <Icon size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Main Floating Action Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Chiudi menu attività" : "Apri menu attività"}
          className={`p-4 rounded-full bg-gradient-to-r from-primary-500 to-rose-500 hover:from-primary-600 hover:to-rose-600 text-white shadow-xl shadow-primary-500/25 transition-transform duration-300 transform ${
            isOpen ? 'rotate-45 scale-105' : 'hover:scale-105'
          }`}
        >
          <Plus size={26} className="stroke-[2.5px]" />
        </button>
      </div>
    </>
  );
}
