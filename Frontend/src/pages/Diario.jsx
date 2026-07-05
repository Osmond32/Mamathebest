import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Baby, Utensils, Weight, Trash2, Calendar, ChevronLeft, ChevronRight, Droplet, Soup, Scale } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BiberonIcon = ({ className = '', size = 20, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 shrink-0 ${className}`} {...props}>
    {/* Tettarella */}
    <path d="M11.5 4.5v-2c0-.6.4-1 .9-1s.9.4.9 1v2" />
    {/* Ghiera/Cupola */}
    <path d="M10 7.5c0-1.8 1-3 2-3s2 1.2 2 3" />
    {/* Ghiera a vite */}
    <rect x="8.5" y="7.5" width="7" height="1.5" rx="0.5" />
    {/* Corpo ergonomico */}
    <path d="M9 9c0 2.5 1 4.5 1 6c0 1.5-1 3.5-1 6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2c0-2.5-1-4.5-1-6c0-1.5 1-3.5 1-6Z" />
    {/* Tacche millilitri */}
    <line x1="11.5" y1="12" x2="13" y2="12" />
    <line x1="11.5" y1="15" x2="12.5" y2="15" />
    <line x1="11.5" y1="18" x2="13" y2="18" />
  </svg>
);

const DiaperIcon = ({ size = 20, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 5h18v4c0 3-2 6-5 8.5L12 20l-4-7.5C5 11 3 8 3 5z"/>
    <path d="M3 8h18"/>
    <path d="M6 5v3"/>
    <path d="M18 5v3"/>
  </svg>
);

export default function Diario({ 
  alimentazioni = [], 
  pesate = [], 
  evacuazioni = [],
  isLoading, 
  onDeleteAlimentazione, 
  onDeletePesata,
  onDeleteEvacuazione
}) {
  const { t, language } = useLanguage();
  const location = useLocation();
  const locale = language === 'it' ? 'it-IT' : 'fr-FR';

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Stati per il filtraggio temporale e tipologia
  const [filterType, setFilterType] = useState('tutti'); // 'tutti', 'latte', 'pappa', 'peso', 'evacuazione'
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [filterByDate, setFilterByDate] = useState(true);

  // Gestione dei parametri di navigazione iniziali o aggiornamenti di stato navigazione
  useEffect(() => {
    if (location.state) {
      if (location.state.date) {
        setSelectedDate(location.state.date);
        setFilterByDate(true);
      }
      if (location.state.filter) {
        setFilterType(location.state.filter);
      }
    }
  }, [location.state]);

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
    })),
    ...evacuazioni.map(e => ({
      id: e.id_evacuazioni,
      type: 'evacuazione',
      date: new Date(e.data_ora),
      title: t('diaper_label'),
      value: e.tipo === 'cacca' ? t('poo') : e.tipo === 'pipi' ? t('pee') : t('both'),
      subtitle: '',
      note: e.note
    }))
  ].sort((a, b) => b.date - a.date);

  // Filtra i dati per tipo e per data (se abilitato)
  const filteredItems = items.filter(item => {
    // 1. Filtro tipo
    const matchesType = filterType === 'tutti' || item.type === filterType;
    if (!matchesType) return false;

    // 2. Filtro data
    if (filterByDate) {
      const year = item.date.getFullYear();
      const month = String(item.date.getMonth() + 1).padStart(2, '0');
      const day = String(item.date.getDate()).padStart(2, '0');
      const itemDateStr = `${year}-${month}-${day}`;
      return itemDateStr === selectedDate;
    }

    return true;
  });

  const adjustDate = (days) => {
    const parts = selectedDate.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
    setFilterByDate(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(t('confirm_delete'))) return;
    
    try {
      if (item.type === 'peso') {
        await onDeletePesata(item.id);
      } else if (item.type === 'evacuazione') {
        await onDeleteEvacuazione(item.id);
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
        return <div className="p-2.5 bg-blue-50 text-blue-500 rounded-full"><BiberonIcon size={20} /></div>;
      case 'pappa':
        return <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-full"><Soup size={20} /></div>;
      case 'peso':
        return <div className="p-2.5 bg-amber-50 text-amber-500 rounded-full"><Scale size={20} /></div>;
      case 'evacuazione':
        return <div className="p-2.5 bg-purple-50 text-purple-500 rounded-full"><DiaperIcon size={20} /></div>;
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

      {/* Date Filter Segmented Toggle */}
      <div className="flex bg-slate-100 p-0.5 rounded-2xl border border-slate-200/50">
        <button 
          onClick={() => setFilterByDate(true)}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all ${
            filterByDate ? 'bg-white text-primary-500 shadow-sm border border-slate-200/30' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('filter_by_day')}
        </button>
        <button 
          onClick={() => setFilterByDate(false)}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all ${
            !filterByDate ? 'bg-white text-primary-500 shadow-sm border border-slate-200/30' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('show_all')}
        </button>
      </div>

      {/* Date Navigator (visible only if filterByDate is active) */}
      {filterByDate && (
        <div className="bg-white border border-slate-100/80 rounded-3xl p-4 shadow-sm flex items-center justify-between animate-fade-in">
          <button 
            onClick={() => adjustDate(-1)}
            aria-label={language === 'it' ? "Giorno precedente" : "Jour précédent"}
            className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-600 hover:text-slate-800 transition-all duration-300"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="relative text-center cursor-pointer min-w-[140px] hover:bg-slate-50/50 p-1.5 rounded-2xl transition-all">
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-0.5">{t('select_day')}</span>
            <div className="flex items-center justify-center space-x-1.5 text-sm font-bold text-slate-700 capitalize">
              <Calendar size={14} className="text-primary-500" />
              <span>
                {new Date(selectedDate).toLocaleDateString(locale, { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                  setFilterByDate(true);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          <button 
            onClick={() => adjustDate(1)}
            aria-label={language === 'it' ? "Giorno successivo" : "Jour suivant"}
            className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-600 hover:text-slate-800 transition-all duration-300"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1">
        {[
          { id: 'tutti', label: t('filter_all') },
          { id: 'latte', label: t('filter_milk') },
          { id: 'pappa', label: t('filter_solids') },
          { id: 'peso', label: t('filter_weight') },
          { id: 'evacuazione', label: t('filter_diaper') }
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
