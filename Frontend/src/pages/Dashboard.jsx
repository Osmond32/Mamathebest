import React, { useState } from 'react';
import { 
  Baby, 
  ChevronDown, 
  Calendar, 
  Weight, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
  onNavigateToProfile
}) {
  const { t, language } = useLanguage();
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
      {/* Header / Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-primary-500/10 to-rose-500/10 text-primary-500 rounded-2xl border border-primary-50/50 shadow-sm">
            <Baby size={24} className="stroke-[2px]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">{t('active_baby')}</span>
            <div className="relative inline-flex items-center bg-slate-100/80 hover:bg-slate-100 px-3 py-1 rounded-xl border border-slate-200/50 transition-all duration-300">
              <select
                value={selectedBambinoId || ''}
                onChange={(e) => setSelectedBambinoId(e.target.value)}
                aria-label={t('active_baby')}
                className="appearance-none pr-6 bg-transparent font-bold text-slate-800 focus:outline-none text-sm cursor-pointer"
              >
                {bambini.map(b => (
                  <option key={b.id_bambini} value={b.id_bambini}>{b.nome}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 text-slate-600 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

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
                <Sparkles size={16} />
              </div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide block mb-1">{t('milk_24h')}</span>
              <span className="text-2xl font-extrabold text-blue-800">{stats?.alimentazione_24h?.totale_latte_ml || 0}</span>
              <span className="text-xs text-blue-700 font-bold ml-1">ml</span>
            </div>

            {/* Latte giorno selezionato */}
            <div className="bg-gradient-to-br from-indigo-50/75 to-white border border-indigo-100/50 rounded-3xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
              <div className="absolute right-2 top-2 bg-indigo-100 text-indigo-600 p-1.5 rounded-xl">
                <Activity size={16} />
              </div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide block mb-1">{t('milk_day')}</span>
              <span className="text-2xl font-extrabold text-indigo-800">{stats?.alimentazione_giorno?.totale_latte_ml || 0}</span>
              <span className="text-xs text-indigo-700 font-bold ml-1">ml</span>
            </div>

            {/* Poppate e Pappe Giorno */}
            <div className="bg-gradient-to-br from-emerald-50/75 to-white border border-emerald-100/50 rounded-3xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide block mb-1">{t('meals_today')}</span>
              <div className="flex justify-between items-center mt-2">
                <div className="text-center bg-white border border-emerald-100/50 py-1.5 px-3 rounded-2xl shadow-sm flex-1 mr-2">
                  <span className="text-[10px] text-slate-600 block font-bold">{t('feedings')}</span>
                  <span className="text-base font-extrabold text-emerald-800">{stats?.alimentazione_giorno?.numero_poppate || 0}</span>
                </div>
                <div className="text-center bg-white border border-emerald-100/50 py-1.5 px-3 rounded-2xl shadow-sm flex-1">
                  <span className="text-[10px] text-slate-600 block font-bold">{t('solids')}</span>
                  <span className="text-base font-extrabold text-emerald-800">{stats?.alimentazione_giorno?.numero_pappe_solide || 0}</span>
                </div>
              </div>
            </div>

            {/* Peso e Variazione Settimanale */}
            <div className="bg-gradient-to-br from-amber-50/75 to-white border border-amber-100/50 rounded-3xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
              <div className="absolute right-2 top-2 bg-amber-100 text-amber-600 p-1.5 rounded-xl">
                <Weight size={16} />
              </div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wide block mb-1">{t('last_weight')}</span>
              <span className="text-2xl font-extrabold text-amber-800">{stats?.crescita_peso?.peso_attuale_kg || '--'}</span>
              <span className="text-xs text-amber-700 font-bold ml-1">{stats?.crescita_peso?.peso_attuale_kg ? 'kg' : ''}</span>
              <span className={`block text-[10px] font-bold mt-1.5 ${
                stats?.crescita_peso?.differenza_settimanale_kg > 0 
                  ? 'text-emerald-600' 
                  : stats?.crescita_peso?.differenza_settimanale_kg < 0 
                  ? 'text-rose-600' 
                  : 'text-slate-600'
              }`}>
                {stats?.crescita_peso?.differenza_settimanale_kg !== null && stats?.crescita_peso?.differenza_settimanale_kg !== undefined
                  ? `${stats.crescita_peso.differenza_settimanale_kg >= 0 ? '+' : ''}${stats.crescita_peso.differenza_settimanale_kg * 1000}g ${t('compared_to_last_week')}`
                  : t('no_prev_weight')}
              </span>
            </div>
          </div>

          {/* Line Chart: Weight Curve */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="mb-4">
              <h4 className="text-sm font-bold text-slate-700 font-display flex items-center">
                <Weight size={16} className="mr-1.5 text-primary-500" />
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
