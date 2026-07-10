import React, { useState } from 'react';
import { 
  Baby, 
  Trash2, 
  Download, 
  Plus, 
  LogOut, 
  FileText, 
  ChevronRight,
  Database,
  Calendar,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Profilo({
  bambini = [],
  onCreateBambino,
  onDeleteBambino,
  alimentazioni = [],
  pesate = [],
  stats,
  selectedBambinoId
}) {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const locale = language === 'it' ? 'it-IT' : 'fr-FR';
  
  // Stati per la creazione di un bambino
  const [nome, setNome] = useState('');
  const [dataNascita, setDataNascita] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedBambino = bambini.find(b => b.id_bambini === Number(selectedBambinoId));

  const handleAddBambino = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !dataNascita) {
      setError(t('missing_fields_err'));
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onCreateBambino({ nome, data_di_nascita: dataNascita });
      setNome('');
      setDataNascita('');
      setShowAddForm(false);
    } catch (err) {
      setError(err.message || 'Errore / Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBambino = async (id, nomeBambino) => {
    const confirmationMsg = t('delete_baby_confirm').replace('{nome}', nomeBambino);
    if (!window.confirm(confirmationMsg)) {
      return;
    }
    try {
      await onDeleteBambino(id);
    } catch (err) {
      alert("Errore / Error: " + err.message);
    }
  };

  // 1. ESPORTAZIONE PDF REPORT PEDIATRA
  const handleExportPDF = async () => {
    if (!selectedBambino) {
      alert(t('add_baby_unlock_export'));
      return;
    }

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const primaryColor = '#d75d6d'; // Mamathebest primary rose
    const darkTextColor = '#1e293b'; // slate-800
    const lightTextColor = '#64748b'; // slate-500

    // Header
    doc.setFillColor(253, 244, 245); // light pink background
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(215, 93, 109);
    doc.text('MAMATHEBEST', 20, 20);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(lightTextColor);
    doc.text(`${t('pdf_generated_at')}${new Date().toLocaleDateString(locale)}`, 140, 20);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(darkTextColor);
    doc.text(`${t('pdf_report_title')}${selectedBambino.nome.toUpperCase()}`, 20, 32);

    // Profilo Bambino
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${t('birthdate')}: ${new Date(selectedBambino.data_di_nascita).toLocaleDateString(locale)}`, 20, 55);
    doc.text(`${t('last_weight')}: ${stats?.crescita_peso?.peso_attuale_kg ? `${stats.crescita_peso.peso_attuale_kg} kg` : 'N.D.'}`, 20, 62);
    doc.text(`${t('compared_to_last_week')}: ${stats?.crescita_peso?.differenza_settimanale_kg ? `${stats.crescita_peso.differenza_settimanale_kg * 1000} g` : 'N.D.'}`, 20, 69);
    doc.text(`${t('milk_24h')}: ${stats?.alimentazione_24h?.totale_latte_ml || 0} ml`, 20, 76);

    // Linea divisoria
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 85, 190, 85);

    // Tabella Pesate
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text(t('pdf_weight_history_title'), 20, 95);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkTextColor);
    doc.text(t('pdf_date_header'), 25, 105);
    doc.text(t('pdf_weight_header'), 80, 105);
    doc.line(20, 108, 120, 108);

    doc.setFont('Helvetica', 'normal');
    let yOffset = 115;
    const pesateList = pesate.slice(0, 8); // Esporta le ultime 8 pesate
    
    if (pesateList.length > 0) {
      pesateList.forEach(p => {
        const dateStr = new Date(p.data_pesata).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
        doc.text(dateStr, 25, yOffset);
        doc.text(`${Number(p.peso_kg).toFixed(2)} kg`, 80, yOffset);
        yOffset += 8;
      });
    } else {
      doc.setFont('Helvetica', 'italic');
      doc.text(t('pdf_no_weight'), 25, yOffset);
      yOffset += 8;
    }

    // Tabella Alimentazione
    yOffset += 10;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text(t('pdf_last_meals_title'), 20, yOffset);
    yOffset += 10;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkTextColor);
    doc.text(t('pdf_date_time_header'), 25, yOffset);
    doc.text(t('pdf_meal_detail_header'), 80, yOffset);
    doc.text(t('pdf_notes_header'), 130, yOffset);
    doc.line(20, yOffset + 3, 190, yOffset + 3);
    yOffset += 10;

    doc.setFont('Helvetica', 'normal');
    const alimentazioniList = alimentazioni.slice(0, 10); // Esporta le ultime 10 alimentazioni
    
    if (alimentazioniList.length > 0) {
      alimentazioniList.forEach(a => {
        if (yOffset > 270) {
          doc.addPage();
          yOffset = 20;
        }
        const dateStr = new Date(a.data_ora).toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        
        // Seleziona la traduzione per la poppata
        let pastoStr = '';
        if (a.latte_ml > 0) {
          pastoStr = `${a.latte_ml}ml (${a.tipo_cibo === 'Latte artificiale' ? t('milk_type') + ' Art.' : a.tipo_cibo})`;
        } else {
          pastoStr = a.tipo_cibo;
        }

        doc.text(dateStr, 25, yOffset);
        doc.text(pastoStr.slice(0, 20), 80, yOffset);
        doc.text((a.note || '').slice(0, 25), 130, yOffset);
        yOffset += 8;
      });
    } else {
      doc.setFont('Helvetica', 'italic');
      doc.text(t('pdf_no_meals'), 25, yOffset);
    }

    // Salva il file
    doc.save(`Mamathebest_Report_${selectedBambino.nome}.pdf`);
  };

  // 2. ESPORTAZIONE BACKUP CSV
  const handleExportCSV = () => {
    if (!selectedBambino) {
      alert(t('add_baby_unlock_export'));
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tipo,Data Registrazione,Valore (ml/kg),Dettaglio,Note\n";

    // Aggiungi pesate
    pesate.forEach(p => {
      csvContent += `Pesata,${p.data_pesata},${p.peso_kg},,\n`;
    });

    // Aggiungi alimentazione
    alimentazioni.forEach(a => {
      const pastoVal = a.latte_ml > 0 ? a.latte_ml : "";
      const pastoDet = a.latte_ml > 0 ? a.tipo_cibo : a.tipo_cibo;
      csvContent += `Alimentazione,${a.data_ora},${pastoVal},"${pastoDet}","${a.note || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Mamathebest_Backup_${selectedBambino.nome}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-28 animate-slide-up">
      {/* Title with Back Button */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200/60 rounded-xl text-slate-600 hover:text-slate-800 transition-all duration-200 active:scale-95 shadow-sm focus:outline-none"
            aria-label="Torna alla Dashboard"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-display !my-0">{t('profile_title')}</h2>
            <span className="text-xs text-slate-600 block">{t('profile_subtitle')}</span>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="p-2 border border-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition-all flex items-center text-xs font-semibold"
        >
          <LogOut size={15} className="mr-1.5" />
          {t('sign_out')}
        </button>
      </div>

      {/* Sezione Bambini */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-700 font-display flex items-center">
            <Baby size={16} className="mr-1.5 text-primary-500" />
            {t('your_babies')} ({bambini.length})
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1.5 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-xl transition-colors flex items-center text-xs font-bold"
          >
            <Plus size={14} className="mr-1" />
            {t('add_btn')}
          </button>
        </div>

        {/* Add Child Form */}
        {showAddForm && (
          <form onSubmit={handleAddBambino} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 animate-slide-up">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('new_baby_profile')}</h4>
            
            {error && (
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center">
                <AlertCircle size={14} className="mr-1.5" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="nome_bambino" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t('baby_name')}</label>
              <input
                id="nome_bambino"
                type="text"
                placeholder="Es. Leonardo, Sofia"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <label htmlFor="data_nascita_bambino" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t('birthdate')}</label>
              <input
                id="data_nascita_bambino"
                type="date"
                value={dataNascita}
                onChange={(e) => setDataNascita(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm text-slate-700"
                required
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 bg-gradient-to-r from-primary-500 to-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                {isSubmitting ? t('saving') : t('save')}
              </button>
            </div>
          </form>
        )}

        {/* Children List */}
        <div className="space-y-3">
          {bambini.map((b) => (
            <div 
              key={b.id_bambini}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                selectedBambinoId === b.id_bambini 
                  ? 'border-primary-200 bg-primary-50/30' 
                  : 'border-slate-50 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-xl border border-slate-100 text-primary-500">
                  <Baby size={18} />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block leading-tight">{b.nome}</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
                    {t('birth')}: {new Date(b.data_di_nascita).toLocaleDateString(locale)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => handleDeleteBambino(b.id_bambini, b.nome)}
                className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                aria-label={`${t('delete_btn')} ${b.nome}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          {bambini.length === 0 && !showAddForm && (
            <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Baby size={20} className="mx-auto text-slate-500 mb-1" />
              <span className="text-xs text-slate-600 font-medium block">{t('no_baby_registered')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sezione Esportazione Dati */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-700 font-display flex items-center">
            <Download size={16} className="mr-1.5 text-primary-500" />
            {t('save_export')}
          </h3>
          <span className="text-[11px] text-slate-600 block mt-0.5">{t('export_desc')}</span>
        </div>

        {selectedBambino ? (
          <div className="grid grid-cols-1 gap-3">
            {/* Esporta PDF */}
            <button
              onClick={handleExportPDF}
              className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all text-left w-full text-slate-700"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-red-100 text-red-500 rounded-xl">
                  <FileText size={18} />
                </div>
                <div>
                  <span className="text-sm font-bold block leading-tight">{t('export_pdf_title')}</span>
                  <span className="text-[10px] text-slate-600 font-medium block mt-0.5">{t('export_pdf_desc')}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
            </button>

            {/* Esporta CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all text-left w-full text-slate-700"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-500 rounded-xl">
                  <Database size={18} />
                </div>
                <div>
                  <span className="text-sm font-bold block leading-tight">{t('export_csv_title')}</span>
                  <span className="text-[10px] text-slate-600 font-medium block mt-0.5">{t('export_csv_desc')}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-center">
            <span className="text-xs text-slate-600 font-medium">{t('add_baby_unlock_export')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
