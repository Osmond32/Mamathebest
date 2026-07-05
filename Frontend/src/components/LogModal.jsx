import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LogModal({ isOpen, onClose, type, bambinoId, onSave }) {
  if (!isOpen) return null;

  const { t, language } = useLanguage();

  // Stato comune
  const [note, setNote] = useState('');
  const [dataOra, setDataOra] = useState(() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  });

  // Stato per Latte
  const [latteMl, setLatteMl] = useState(120);
  const [tipoLatte, setTipoLatte] = useState(language === 'it' ? 'Latte artificiale' : 'Lait artificiel');

  // Stato per Pappa Solida
  const [tipoCibo, setTipoCibo] = useState('');

  // Stato per Peso
  const [pesoKg, setPesoKg] = useState('');

  // Stato per Evacuazione
  const [tipoEvacuazione, setTipoEvacuazione] = useState('cacca');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sincronizza tipo latte di default quando cambia lingua
  useEffect(() => {
    setTipoLatte(language === 'it' ? 'Latte artificiale' : 'Lait artificiel');
  }, [language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formattedDate = dataOra.replace('T', ' ') + ':00';

      if (type === 'latte') {
        await onSave({
          bambino_id: bambinoId,
          latte_ml: Number(latteMl),
          tipo_cibo: tipoLatte,
          note,
          data_ora: formattedDate
        });
      } else if (type === 'pappa') {
        if (!tipoCibo.trim()) {
          throw new Error(t('solid_type_err'));
        }
        await onSave({
          bambino_id: bambinoId,
          latte_ml: 0,
          tipo_cibo: tipoCibo,
          note,
          data_ora: formattedDate
        });
      } else if (type === 'peso') {
        if (!pesoKg || Number(pesoKg) <= 0) {
          throw new Error(t('weight_val_err'));
        }
        await onSave({
          bambino_id: bambinoId,
          peso_kg: Number(pesoKg),
          data_pesata: formattedDate
        });
      } else if (type === 'evacuazione') {
        await onSave({
          bambino_id: bambinoId,
          tipo: tipoEvacuazione,
          note,
          data_ora: formattedDate
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || "Qualcosa è andato storto / Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'latte': return t('feed_title');
      case 'pappa': return t('solid_title');
      case 'peso': return t('weight_title');
      case 'evacuazione': return t('diaper_title');
      default: return t('add_activity');
    }
  };

  const pappaSuggestions = language === 'it' 
    ? ['Mela', 'Pera', 'Crema riso', 'Semolino', 'Pastina'] 
    : ['Pomme', 'Poire', 'Crème de riz', 'Semoule', 'Petites pâtes'];

  const milkTypes = language === 'it' 
    ? ['Latte artificiale', 'Latte materno'] 
    : ['Lait artificiel', 'Lait maternel'];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center z-50 p-0 sm:p-4">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 transition-all transform duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
          <h3 className="text-xl font-semibold text-slate-800 font-display">{getTitle()}</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
            aria-label={t('close')}
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campi specifici per tipo */}
          {type === 'latte' && (
            <>
              <div>
                <label htmlFor="latte_ml_slider" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  {t('milk_amount')}: {latteMl} ml
                </label>
                <div className="flex items-center space-x-4">
                  <input 
                    id="latte_ml_slider"
                    type="range" 
                    min="10" 
                    max="350" 
                    step="10"
                    value={latteMl} 
                    onChange={(e) => setLatteMl(e.target.value)}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <input 
                    id="latte_ml_number"
                    type="number"
                    value={latteMl}
                    onChange={(e) => setLatteMl(Math.max(0, Number(e.target.value)))}
                    className="w-20 text-center py-1 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium"
                    aria-label={t('milk_amount')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  {t('milk_type')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {milkTypes.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setTipoLatte(l)}
                      className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                        tipoLatte === l 
                          ? 'border-primary-500 bg-primary-50 text-primary-600' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {type === 'pappa' && (
            <div>
              <label htmlFor="tipo_cibo_input" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                {t('what_ate')}
              </label>
              <input
                id="tipo_cibo_input"
                type="text"
                placeholder={language === 'it' ? "Es. Brodo vegetale" : "Ex. Purée de carottes"}
                value={tipoCibo}
                onChange={(e) => setTipoCibo(e.target.value)}
                className="w-full py-2.5 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm placeholder:text-slate-500"
                required
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {pappaSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTipoCibo(s)}
                    className="text-xs py-1 px-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {type === 'peso' && (
            <div>
              <label htmlFor="peso_kg_input" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                {t('body_weight')}
              </label>
              <input
                id="peso_kg_input"
                type="number"
                step="0.01"
                min="0"
                placeholder="Es. 6.45"
                value={pesoKg}
                onChange={(e) => setPesoKg(e.target.value)}
                className="w-full py-2.5 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm font-semibold placeholder:font-normal placeholder:text-slate-500"
                required
              />
            </div>
          )}

          {type === 'evacuazione' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                {t('diaper_type')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cacca', label: t('cacca_opt') },
                  { id: 'pipi', label: t('pipi_opt') },
                  { id: 'entrambe', label: t('entrambe_opt') }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTipoEvacuazione(opt.id)}
                    className={`py-2.5 px-1.5 rounded-xl border text-xs font-bold transition-all ${
                      tipoEvacuazione === opt.id 
                        ? 'border-primary-500 bg-primary-50 text-primary-600' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Campo Data/Ora comune */}
          <div>
            <label htmlFor="data_ora_input" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center">
              <Calendar size={14} className="mr-1.5 text-slate-600" />
              {t('activity_date')}
            </label>
            <input
              id="data_ora_input"
              type="datetime-local"
              value={dataOra}
              onChange={(e) => setDataOra(e.target.value)}
              className="w-full py-2.5 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm text-slate-700"
              required
            />
          </div>

          {/* Note comune */}
          <div>
            <label htmlFor="note_input" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              {t('notes')}
            </label>
            <textarea
              id="note_input"
              placeholder={language === 'it' ? "Es. mangiato con appetito" : "Ex. mangé avec appétit"}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="3"
              className="w-full py-2.5 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm placeholder:text-slate-500 resize-none"
            />
          </div>

          {/* Bottone di Invio */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-rose-500 hover:from-primary-600 hover:to-rose-600 text-white font-semibold rounded-xl text-sm shadow-md shadow-primary-500/10 hover:shadow-lg hover:shadow-primary-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? t('saving_activity') : t('save_activity')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
