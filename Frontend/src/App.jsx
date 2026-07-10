import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn, useAuth } from '@clerk/clerk-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { setupInterceptors } from './services/api';
import { getBambini, createBambino, deleteBambino } from './services/bambiniService';
import { getStatistiche } from './services/statisticheService';
import { getAlimentazione, createAlimentazione, deleteAlimentazione } from './services/alimentazioneService';
import { getPesate, createPesata, deletePesata } from './services/pesateService';
import { getEvacuazioni, createEvacuazione, deleteEvacuazione } from './services/evacuazioniService';

import BottomNav from './components/BottomNav';
import logo from './assets/logo.png';
import Dashboard from './pages/Dashboard';
import Diario from './pages/Diario';
import Profilo from './pages/Profilo';
import LogModal from './components/LogModal';
import { Baby, Heart, ChevronDown } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

function AppContent() {
  const { getToken } = useAuth();
  setupInterceptors(getToken);
  
  const queryClient = useQueryClient();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  // Stati dell'app
  const [selectedBambinoId, setSelectedBambinoId] = useState(null);
  const [dataRiferimento, setDataRiferimento] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Stato per il LogModal
  const [logModalType, setLogModalType] = useState(null); // 'latte', 'pappa', 'peso' o null

  // 1. Query: Recupera tutti i bambini
  const { 
    data: bambini = [], 
    isLoading: isLoadingBambini,
    error: errorBambini
  } = useQuery({
    queryKey: ['bambini'],
    queryFn: getBambini
  });

  // Aggiorna selectedBambinoId se non impostato o se il bambino selezionato viene eliminato
  useEffect(() => {
    if (bambini.length > 0) {
      if (!selectedBambinoId || !bambini.some(b => b.id_bambini === Number(selectedBambinoId))) {
        setSelectedBambinoId(bambini[0].id_bambini);
      }
    } else {
      setSelectedBambinoId(null);
    }
  }, [bambini, selectedBambinoId]);

  // 2. Query: Recupera statistiche del bambino selezionato
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: errorStats
  } = useQuery({
    queryKey: ['stats', selectedBambinoId, dataRiferimento],
    queryFn: () => getStatistiche(selectedBambinoId, dataRiferimento),
    enabled: !!selectedBambinoId,
  });

  // 3. Query: Recupera alimentazioni del bambino selezionato per il diario
  const {
    data: alimentazioni = [],
    isLoading: isLoadingAlimentazioni
  } = useQuery({
    queryKey: ['alimentazioni', selectedBambinoId],
    queryFn: () => getAlimentazione(selectedBambinoId),
    enabled: !!selectedBambinoId,
  });

  // 4. Query: Recupera pesate del bambino selezionato per il diario
  const {
    data: pesate = [],
    isLoading: isLoadingPesate
  } = useQuery({
    queryKey: ['pesate', selectedBambinoId],
    queryFn: () => getPesate(selectedBambinoId),
    enabled: !!selectedBambinoId,
  });

  // 5. Query: Recupera evacuazioni del bambino selezionato per il diario
  const {
    data: evacuazioni = [],
    isLoading: isLoadingEvacuazioni
  } = useQuery({
    queryKey: ['evacuazioni', selectedBambinoId],
    queryFn: () => getEvacuazioni(selectedBambinoId),
    enabled: !!selectedBambinoId,
  });

  // --- MUTATIONS ---

  // A. Crea bambino
  const createBambinoMutation = useMutation({
    mutationFn: createBambino,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bambini'] });
      // Seleziona automaticamente il bambino creato
      if (data.id_bambini) {
        setSelectedBambinoId(data.id_bambini);
        navigate('/dashboard');
      }
    }
  });

  // B. Elimina bambino
  const deleteBambinoMutation = useMutation({
    mutationFn: deleteBambino,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bambini'] });
    }
  });

  // C. Salva Pasto/Pesata/Evacuazione
  const saveLogMutation = useMutation({
    mutationFn: (data) => {
      if (logModalType === 'peso') {
        return createPesata(data);
      } else if (logModalType === 'evacuazione') {
        return createEvacuazione(data);
      } else {
        return createAlimentazione(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats', selectedBambinoId] });
      queryClient.invalidateQueries({ queryKey: ['alimentazioni', selectedBambinoId] });
      queryClient.invalidateQueries({ queryKey: ['pesate', selectedBambinoId] });
      queryClient.invalidateQueries({ queryKey: ['evacuazioni', selectedBambinoId] });
    }
  });

  // D. Elimina Alimentazione
  const deleteAlimentazioneMutation = useMutation({
    mutationFn: deleteAlimentazione,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats', selectedBambinoId] });
      queryClient.invalidateQueries({ queryKey: ['alimentazioni', selectedBambinoId] });
    }
  });

  // E. Elimina Pesata
  const deletePesataMutation = useMutation({
    mutationFn: deletePesata,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats', selectedBambinoId] });
      queryClient.invalidateQueries({ queryKey: ['pesate', selectedBambinoId] });
    }
  });

  // F. Elimina Evacuazione
  const deleteEvacuazioneMutation = useMutation({
    mutationFn: deleteEvacuazione,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats', selectedBambinoId] });
      queryClient.invalidateQueries({ queryKey: ['evacuazioni', selectedBambinoId] });
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto border-x border-slate-100 relative shadow-2xl">
      {/* Top Header */}
      <header className="bg-primary-50/90 backdrop-blur-md border-b border-primary-100/50 px-4 py-3 sticky top-0 z-30 flex items-center justify-between gap-2">
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="Mamathebest logo" className="w-12 h-12 rounded-xl object-cover shadow-sm border border-primary-100" />
          <h1 className="text-sm font-black text-slate-800 tracking-tight font-display uppercase hidden xs:block !my-0">Mamathebest</h1>
        </div>

        {/* Baby Selector in Header */}
        {selectedBambinoId && bambini.length > 0 && (
          <div className="flex items-center space-x-1.5 bg-white border border-primary-100/60 px-3 py-2 rounded-xl shadow-sm">
            <Baby size={18} className="text-primary-500 shrink-0" />
            <div className="relative inline-flex items-center">
              <select
                value={selectedBambinoId || ''}
                onChange={(e) => setSelectedBambinoId(e.target.value)}
                aria-label={t('active_baby')}
                className="appearance-none pr-5 bg-transparent font-bold text-slate-800 focus:outline-none text-sm cursor-pointer [&>option]:text-slate-800 [&>option]:bg-white"
              >
                {bambini.map(b => (
                  <option key={b.id_bambini} value={b.id_bambini}>{b.nome}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-0 text-slate-500 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Language Switcher */}
        <div className="flex bg-primary-100/50 p-0.5 rounded-xl border border-primary-200/30">
          <button 
            onClick={() => setLanguage('it')}
            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
              language === 'it' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-primary-500'
            }`}
          >
            IT
          </button>
          <button 
            onClick={() => setLanguage('fr')}
            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
              language === 'fr' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-primary-500'
            }`}
          >
            FR
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 pt-6 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                bambini={bambini}
                selectedBambinoId={selectedBambinoId}
                setSelectedBambinoId={setSelectedBambinoId}
                stats={stats}
                isLoading={isLoadingStats}
                error={errorStats}
                dataRiferimento={dataRiferimento}
                setDataRiferimento={setDataRiferimento}
                onNavigateToProfile={() => navigate('/profilo')}
                onOpenLogModal={(type) => setLogModalType(type)}
              />
            } 
          />
          <Route 
            path="/diario" 
            element={
              <Diario 
                alimentazioni={alimentazioni}
                pesate={pesate}
                evacuazioni={evacuazioni}
                isLoading={isLoadingAlimentazioni || isLoadingPesate || isLoadingEvacuazioni}
                onDeleteAlimentazione={deleteAlimentazioneMutation.mutateAsync}
                onDeletePesata={deletePesataMutation.mutateAsync}
                onDeleteEvacuazione={deleteEvacuazioneMutation.mutateAsync}
              />
            } 
          />
          <Route 
            path="/profilo" 
            element={
              <Profilo 
                bambini={bambini}
                onCreateBambino={createBambinoMutation.mutateAsync}
                onDeleteBambino={deleteBambinoMutation.mutateAsync}
                alimentazioni={alimentazioni}
                pesate={pesate}
                stats={stats}
                selectedBambinoId={selectedBambinoId}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>



      {/* Bottom Navigation */}
      <BottomNav onOpenLogModal={setLogModalType} />

      {/* Action modal picker */}
      <LogModal 
        isOpen={logModalType !== null}
        onClose={() => setLogModalType(null)}
        type={logModalType}
        bambinoId={selectedBambinoId}
        onSave={saveLogMutation.mutateAsync}
      />
    </div>
  );
}

export default function App() {
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <Router>
      <SignedIn>
        <AppContent />
      </SignedIn>
      
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-primary-100 via-white to-rose-100 flex flex-col justify-center items-center px-6 relative">
          
          {/* Language Switcher for Sign-out Page */}
          <div className="absolute top-6 right-6 flex bg-white/70 backdrop-blur-sm p-0.5 rounded-xl border border-slate-200/50 shadow-sm">
            <button 
              onClick={() => setLanguage('it')}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                language === 'it' ? 'bg-white text-primary-500 shadow-sm' : 'text-slate-500'
              }`}
            >
              IT
            </button>
            <button 
              onClick={() => setLanguage('fr')}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                language === 'fr' ? 'bg-white text-primary-500 shadow-sm' : 'text-slate-500'
              }`}
            >
              FR
            </button>
          </div>

          <div className="text-center max-w-sm mb-8">
            <div className="inline-flex p-1.5 bg-white rounded-3xl shadow-xl shadow-primary-500/10 mb-5 border border-primary-50">
              <img src={logo} alt="Mamathebest logo" className="w-20 h-20 rounded-2xl object-cover animate-bounce" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight font-display !mb-2 !my-0">{t('welcome')}</h1>
            <p className="text-slate-500 text-sm font-medium">
              {t('app_subtitle')}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/50 w-full max-w-sm flex justify-center items-center">
            <SignIn 
              appearance={{
                elements: {
                  card: 'shadow-none bg-transparent',
                  headerTitle: 'text-slate-800 font-bold font-display',
                  headerSubtitle: 'text-slate-500 font-medium',
                  socialButtonsBlockButton: 'border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl',
                  formButtonPrimary: 'bg-primary-500 hover:bg-primary-600 text-white rounded-xl',
                  formFieldInput: 'border-slate-200 rounded-xl',
                  footerActionLink: 'text-primary-500 hover:text-primary-600'
                }
              }}
            />
          </div>
        </div>
      </SignedOut>
    </Router>
  );
}
