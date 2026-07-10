import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Baby, 
  ChevronDown, 
  Calendar, 
  Weight, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Droplet,
  Utensils,
  Soup,
  Scale,
  Settings
} from 'lucide-react';
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

const DiaperIcon = ({ className = '', size = 20, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 shrink-0 ${className}`} {...props}>
    <path d="M3 5h18v4c0 3-2 6-5 8.5L12 20l-4-7.5C5 11 3 8 3 5z"/>
    <path d="M3 8h18"/>
    <path d="M6 5v3"/>
    <path d="M18 5v3"/>
  </svg>
);

const GrowthChart = React.lazy(() => import('../components/GrowthChart'));

export default function Dashboard({ 
  bambini = [], 
  selectedBambinoId, 
  setSelectedBambinoId, 
  stats, 
  isLoading, 
  error, 
  dataRiferimento, 
  setDataRiferimento,
  onNavigateToProfile,
  onOpenLogModal
}) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const selectedBambino = bambini.find(b => b.id_bambini === Number(selectedBambinoId));
  const locale = language === 'it' ? 'it-IT' : 'fr-FR';

  // Modifica data di riferimento (avanti/indietro)
  const adjustDate = (days) => {
    const parts = dataRiferimento.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDataRiferimento(`${year}-${month}-${day}`);
  };

  if (bambini.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-slide-up">
        <div className="p-4 bg-primary-50 text-primary-500 rounded-full mb-4">
          <Baby size={48} className="stroke-[1.5px]" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{t('no_baby_registered')}</h3>
        <p className="text-slate-500 text-sm max-w-xs mb-6">
          {t('no_baby_desc')}
        </p>
        <button
          onClick={onNavigateToProfile}
          className="py-3 px-6 bg-gradient-to-r from-primary-500 to-rose-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-primary-500/10 hover:shadow-lg transition-all duration-300"
        >
          {t('add_baby_btn')}
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="text-red-500 mb-2 font-bold">Error</div>
        <p className="text-slate-500 text-sm mb-4">{error.message || 'Verifica la connessione al server.'}</p>
      </div>
    );
  }

  // Prepara i dati del grafico per Recharts
  const chartData = stats?.crescita_peso?.storico_pesate
    ? [...stats.crescita_peso.storico_pesate].reverse().map(p => ({
        data: new Date(p.data_pesata).toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
        peso: p.peso_kg
      }))
    : [];

  const formattedDate = new Date(dataRiferimento).toLocaleDateString(locale, { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 pb-28 animate-slide-up">
      {/* Date Navigator */}
      <div className="bg-white border border-slate-100/80 rounded-3xl p-4 shadow-sm flex items-center justify-between">
        <button 
          onClick={() => adjustDate(-1)}
          aria-label={language === 'it' ? "Giorno precedente" : "Jour précédent"}
          className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-600 hover:text-slate-800 transition-all duration-300"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-0.5">{t('select_day')}</span>
          <span className="text-sm font-bold text-slate-700 capitalize">{formattedDate}</span>
        </div>
        <button 
          onClick={() => adjustDate(1)}
          aria-label={language === 'it' ? "Giorno successivo" : "Jour suivant"}
          className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-600 hover:text-slate-800 transition-all duration-300"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {/* Summary Pills Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Latte nelle ultime 24 ore */}
            <div className="bg-gradient-to-br from-blue-50/75 to-white border border-blue-100/50 rounded-3xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
              <div className="absolute right-2 top-2 bg-blue-100 text-blue-600 p-1.5 rounded-xl">
                <BiberonIcon size={16} />
              </div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide block mb-1">{t('milk_24h')}</span>
              <span className="text-2xl font-extrabold text-blue-800">{stats?.alimentazione_24h?.totale_latte_ml || 0}</span>
              <span className="text-xs text-blue-700 font-bold ml-1">ml</span>
            </div>

            {/* Latte giorno selezionato */}
            <button 
              onClick={() => navigate('/diario', { state: { date: dataRiferimento, filter: 'latte' } })}
              className="text-left w-full bg-gradient-to-br from-indigo-50/75 to-white border border-indigo-100/50 rounded-3xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden cursor-pointer focus:outline-none"
            >
              <div className="absolute right-2 top-2 bg-indigo-100 text-indigo-600 p-1.5 rounded-xl">
                <BiberonIcon size={16} />
              </div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide block mb-1">{t('milk_day')}</span>
              <span className="text-2xl font-extrabold text-indigo-800">{stats?.alimentazione_giorno?.totale_latte_ml || 0}</span>
              <span className="text-xs text-indigo-700 font-bold ml-1">ml</span>
            </button>

            {/* Poppate e Pappe Giorno */}
            <div className="bg-gradient-to-br from-emerald-50/75 to-white border border-emerald-100/50 rounded-3xl p-3 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide block mb-1">{t('meals_today')}</span>
              <div className="flex justify-between items-center mt-2">
                <button 
                  onClick={() => navigate('/diario', { state: { date: dataRiferimento, filter: 'latte' } })}
                  className="text-center bg-white hover:bg-slate-50 border border-emerald-100/50 py-1 px-2 rounded-2xl shadow-sm flex-1 mr-1.5 cursor-pointer transition-all active:scale-95 focus:outline-none"
                >
                  <span className="text-[10px] text-slate-600 block font-bold">{t('feedings')}</span>
                  <span className="text-base font-extrabold text-emerald-800">{stats?.alimentazione_giorno?.numero_poppate || 0}</span>
                </button>
                <button 
                  onClick={() => navigate('/diario', { state: { date: dataRiferimento, filter: 'pappa' } })}
                  className="text-center bg-white hover:bg-slate-50 border border-emerald-100/50 py-1 px-2 rounded-2xl shadow-sm flex-1 cursor-pointer transition-all active:scale-95 focus:outline-none"
                >
                  <span className="text-[10px] text-slate-600 block font-bold">{t('solids')}</span>
                  <span className="text-base font-extrabold text-emerald-800">{stats?.alimentazione_giorno?.numero_pappe_solide || 0}</span>
                </button>
              </div>
            </div>

            {/* Peso e Variazione Settimanale */}
            <button 
              onClick={() => onOpenLogModal('peso')}
              className="text-left bg-gradient-to-br from-amber-50/75 to-white border border-amber-100/50 rounded-3xl p-3 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden cursor-pointer focus:outline-none"
            >
              <div className="absolute right-2 top-2 bg-amber-100 text-amber-600 p-1.5 rounded-xl">
                <Scale size={16} />
              </div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wide block mb-1">{t('last_weight')}</span>
              <span className="text-2xl font-extrabold text-amber-800">{stats?.crescita_peso?.peso_attuale_kg || '--'}</span>
              <span className="text-xs text-amber-700 font-bold ml-1">{stats?.crescita_peso?.peso_attuale_kg ? 'kg' : ''}</span>
              <span className={`block text-[10px] font-bold mt-1 ${
                stats?.crescita_peso?.differenza_mensile_kg > 0 
                  ? 'text-emerald-600' 
                  : stats?.crescita_peso?.differenza_mensile_kg < 0 
                  ? 'text-rose-600' 
                  : 'text-slate-600'
              }`}>
                {stats?.crescita_peso?.differenza_mensile_kg !== null && stats?.crescita_peso?.differenza_mensile_kg !== undefined
                  ? `${stats.crescita_peso.differenza_mensile_kg >= 0 ? '+' : ''}${stats.crescita_peso.differenza_mensile_kg * 1000}g ${t('compared_to_last_month')}`
                  : t('no_prev_weight')}
              </span>
            </button>

            {/* Evacuazioni / Pannolini di oggi */}
            <button 
              onClick={() => navigate('/diario', { state: { date: dataRiferimento, filter: 'evacuazione' } })}
              className="text-left bg-gradient-to-br from-purple-50/75 to-white border border-purple-100/50 rounded-3xl p-3 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden cursor-pointer focus:outline-none"
            >
              <div className="absolute right-2 top-2 bg-purple-100 text-purple-600 p-1.5 rounded-xl">
                <DiaperIcon size={16} />
              </div>
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wide block mb-1">{t('diapers_today')}</span>
              <span className="text-2xl font-extrabold text-purple-800">{stats?.evacuazioni_giorno?.totale || 0}</span>
              <span className="text-xs text-purple-700 font-bold ml-1">{language === 'it' ? 'cambi' : 'changes'}</span>
            </button>

            {/* Impostazioni Card */}
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200/60 rounded-3xl p-3 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center space-x-1.5 mb-2">
                <Settings size={15} className="text-slate-600 animate-spin-slow shrink-0" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">{language === 'it' ? 'Impostazioni' : 'Paramètres'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1.5 items-center justify-items-center flex-1 w-full">
                {/* Diario */}
                <button 
                  onClick={() => navigate('/diario')}
                  aria-label={t('diario')}
                  className="flex flex-col items-center justify-center w-full py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-2xl transition-all duration-200 active:scale-95 shadow-sm cursor-pointer focus:outline-none"
                >
                  <Calendar size={18} className="mb-1" />
                  <span className="text-[10px] font-bold">{t('diario')}</span>
                </button>
                {/* Profilo / Impostazioni */}
                <button 
                  onClick={() => navigate('/profilo')}
                  aria-label={t('profilo')}
                  className="flex flex-col items-center justify-center w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-2xl transition-all duration-200 active:scale-95 shadow-sm cursor-pointer focus:outline-none"
                >
                  <Settings size={18} className="mb-1" />
                  <span className="text-[10px] font-bold">{t('profilo')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Line Chart: Weight Curve */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="mb-4">
              <h4 className="text-sm font-bold text-slate-700 font-display flex items-center">
                <Scale size={16} className="mr-1.5 text-primary-500" />
                {t('growth_curve')}
              </h4>
              <span className="text-xs text-slate-600">{t('growth_history')}</span>
            </div>

            {chartData.length > 0 ? (
              <React.Suspense fallback={
                <div className="h-64 w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              }>
                <GrowthChart chartData={chartData} />
              </React.Suspense>
            ) : (
              <div className="h-48 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                <div>
                  <Weight size={28} className="mx-auto text-slate-400 mb-2 stroke-[1.5px]" />
                  <span className="text-xs text-slate-600 font-medium block">{t('no_weight_data')}</span>
                  <span className="text-[10px] text-slate-600 block mt-0.5">{t('add_first_weight')}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
