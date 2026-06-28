import React, { useState } from 'react';
import { Baby, Utensils, Weight, Trash2, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Diario({ 
  alimentazioni = [], 
  pesate = [], 
  isLoading, 
  onDeleteAlimentazione, 
  onDeletePesata 
}) {
  const { t, language } = useLanguage();
  const [filterType, setFilterType] = useState('tutti'); // 'tutti', 'latte', 'pappa', 'peso'
  const locale = language === 'it' ? 'it-IT' : 'fr-FR';

  // Combina e ordina i dati in ordine cronologico decrescente
  const items = [
    ...alimentazioni.map(a => ({
      id: a.id_alimentazione,
      type: a.latte_ml > 0 ? 'latte' : 'pappa',
      date: new Date(a.data_ora),
      title: a.latte_ml > 0 ? t('feed_title') : t('solid_title'),
      value: a.latte_ml > 0 ? `${a.latte_ml} ml` : a.tipo_cibo,
      subtitle: a.latte_ml > 0 ? a.tipo_cibo : '',
      note: a.note
    })),
    ...pesate.map(p => ({
      id: p.id_pesate,
      type: 'peso',
      date: new Date(p.data_pesata),
      title: t('weight_title'),
      value: `${p.peso_kg} kg`,
      subtitle: '',
      note: ''
    }))
  ].sort((a, b) => b.date - a.date);

  const filteredItems = items.filter(item => {
    if (filterType === 'tutti') return true;
    return item.type === filterType;
  });

  const handleDelete = async (item) => {
    if (!window.confirm(t('confirm_delete'))) return;
    
    try {
      if (item.type === 'peso') {
        await onDeletePesata(item.id);
      } else {
        await onDeleteAlimentazione(item.id);
      }
    } catch (err) {
      alert("Errore / Error: " + err.message);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'latte':
        return <div className="p-2.5 bg-blue-50 text-blue-500 rounded-full"><Baby size={20} /></div>;
      case 'pappa':
        return <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-full"><Utensils size={20} /></div>;
      case 'peso':
        return <div className="p-2.5 bg-amber-50 text-amber-500 rounded-full"><Weight size={20} /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-slide-up">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-display">{t('diario_title')}</h2>
        <span className="text-xs text-slate-600">{t('diario_subtitle')}</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1">
        {[
          { id: 'tutti', label: t('filter_all') },
          { id: 'latte', label: t('filter_milk') },
          { id: 'pappa', label: t('filter_solids') },
          { id: 'peso', label: t('filter_weight') }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              filterType === tab.id
                ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/10'
                : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="relative border-l border-slate-100 ml-4 pl-6 space-y-6">
          {filteredItems.map((item, idx) => (
            <div key={`${item.type}-${item.id}`} className="relative flex items-start justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              {/* Dot on the timeline */}
              <div className="absolute -left-[35px] top-6 w-4 h-4 bg-white border-2 border-primary-500 rounded-full z-10" />

              <div className="flex items-start space-x-4">
                {getIcon(item.type)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-800">{item.title}</span>
                    <span className="text-[10px] text-slate-600 font-semibold">
                      {item.date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-600 block mt-0.5">{item.value}</span>
                  {item.subtitle && <span className="text-xs text-slate-600 block font-medium">{item.subtitle}</span>}
                  
                  {/* Note */}
                  {item.note && (
                    <p className="text-xs italic text-slate-600 mt-2 bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                      "{item.note}"
                    </p>
                  )}
                  
                  {/* Date section headers if day changes */}
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-600 block mt-2 flex items-center">
                    <Calendar size={10} className="mr-1" />
                    {item.date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleDelete(item)}
                className="p-2.5 hover:bg-rose-50 text-slate-600 hover:text-rose-500 rounded-xl transition-all duration-300"
                aria-label={`${t('delete_btn')} ${item.title}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <Calendar size={32} className="text-slate-400 mb-2 stroke-[1.5px]" />
          <span className="text-sm text-slate-700 font-bold block">{t('no_activity')}</span>
          <span className="text-xs text-slate-600 max-w-xs mt-1 block">
            {t('no_activity_desc')}
          </span>
        </div>
      )}
    </div>
  );
}
