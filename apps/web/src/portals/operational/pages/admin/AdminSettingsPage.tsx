import React, { useState } from 'react';
import { 
  Building2, Clock, BarChart, Link as LinkIcon, 
  Bell, LayoutGrid, Palette, Save, ChevronRight, 
  Check, X, Image as ImageIcon, CheckSquare, Users,
  Calendar, Plus, Trash2, Download, Loader2, Info, MessageSquareText, Volume2, VolumeX, BellRing, Play, ShieldAlert
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { SuccessModal } from '../../../../components/shared/SuccessModal';
import { toast } from 'sonner';
import { MOCK_CLIENTS, MOCK_MACROS } from '../../../../mocks/data';
import { getSoundSettings, saveSoundSettings, playAlertSound, AlertTone } from '../../../../lib/sound-effects';
import { useNotifications } from '../../../../hooks/use-notifications';
import { SecurityAuditLogsWidget } from '../../components/SecurityAuditLogsWidget';
import { AntiBruteForcePanelWidget } from '../../components/AntiBruteForcePanelWidget';
import { HttpSecurityHeadersWidget } from '../../components/HttpSecurityHeadersWidget';
import { SessionCookiePolicyWidget } from '../../components/SessionCookiePolicyWidget';
import { FrameAncestorsPolicyWidget } from '../../components/FrameAncestorsPolicyWidget';
import { LgpdUserAnonymizationWidget } from '../../components/LgpdUserAnonymizationWidget';
import { SessionTimeoutSettingsWidget } from '../../components/SessionTimeoutSettingsWidget';

type SettingsTab = 'identity' | 'business_hours' | 'holidays' | 'sso' | 'notifications' | 'modules' | 'macros' | 'security_audit';

const SETTINGS_TABS: { id: SettingsTab; title: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'identity', title: 'Identidade', desc: 'Perfil, marca e cores', icon: <Building2 className="w-5 h-5" /> },
  { id: 'business_hours', title: 'Horário de Atendimento', desc: 'Dias e horários úteis', icon: <Clock className="w-5 h-5" /> },
  { id: 'holidays', title: 'Feriados', desc: 'Dias sem atendimento', icon: <Calendar className="w-5 h-5" /> },
  { id: 'sso', title: 'Integrações SSO', desc: 'Google, Microsoft Entra ID', icon: <LinkIcon className="w-5 h-5" /> },
  { id: 'notifications', title: 'Notificações', desc: 'Alertas por e-mail e sistema', icon: <Bell className="w-5 h-5" /> },
  { id: 'modules', title: 'Módulos do Sistema', desc: 'Habilitar funcionalidades', icon: <LayoutGrid className="w-5 h-5" /> },
  { id: 'macros', title: 'Respostas Rápidas', desc: 'Mensagens pré-prontas do chat', icon: <MessageSquareText className="w-5 h-5" /> },
  { id: 'security_audit', title: 'Auditoria & Invasões', desc: 'Log de acessos bloqueados (ISO 27001)', icon: <ShieldAlert className="w-5 h-5 text-red-500" /> },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('identity');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const { permission, requestPermission, sendNotification } = useNotifications();
  const [soundForm, setSoundForm] = useState(() => getSoundSettings());

  const handleSoundChange = (updates: Partial<typeof soundForm>) => {
    const updated = saveSoundSettings(updates);
    setSoundForm(updated);
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('O arquivo de áudio deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const updated = saveSoundSettings({
        tone: 'custom',
        customAudioUrl: dataUrl,
        customFileName: file.name
      });
      setSoundForm(updated);
      toast.success(`Som personalizado "${file.name}" carregado com sucesso!`);
      playAlertSound('custom', updated.volume);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomAudio = () => {
    const updated = saveSoundSettings({
      tone: 'chime',
      customAudioUrl: undefined,
      customFileName: undefined
    });
    setSoundForm(updated);
    toast.info('Som personalizado removido. Restaurado tom padrão.');
  };

  const handleTestSound = (tone?: AlertTone) => {
    playAlertSound(tone || soundForm.tone, soundForm.volume);
    toast.success(`Testando som de alerta (${tone || soundForm.tone})`);
  };

  const handleTestNotification = () => {
    if (permission !== 'granted') {
      requestPermission();
    } else {
      sendNotification({
        title: 'Notificação de Teste ITSM',
        body: 'Os alertas visuais de área de trabalho estão funcionando perfeitamente!'
      });
      handleTestSound();
    }
  };

  // MOCK STATE FOR DEMO PURPOSES
  const [profileForm, setProfileForm] = useState({
    companyName: 'Acme Corp',
    supportEmail: 'support@acme.com',
    supportPhone: '+1 234 567 8900'
  });

  const [customizationForm, setCustomizationForm] = useState(() => {
    const clockSaved = localStorage.getItem('portal_show_top_clock');
    const sunTzuSaved = localStorage.getItem('portal_sun_tzu_mode');
    return {
      primaryColor: '#2563eb',
      defaultTheme: 'system',
      logoUrl: '',
      minimizedLogoUrl: '',
      showTopClock: clockSaved !== null ? JSON.parse(clockSaved) : true,
      sunTzuMode: sunTzuSaved !== null ? JSON.parse(sunTzuSaved) : false
    };
  });

  const [businessHours, setBusinessHours] = useState({
    timezone: 'America/Sao_Paulo',
    schedule: [
      { day: 'Segunda-feira', active: true, start: '09:00', end: '18:00' },
      { day: 'Terça-feira', active: true, start: '09:00', end: '18:00' },
      { day: 'Quarta-feira', active: true, start: '09:00', end: '18:00' },
      { day: 'Quinta-feira', active: true, start: '09:00', end: '18:00' },
      { day: 'Sexta-feira', active: true, start: '09:00', end: '18:00' },
      { day: 'Sábado', active: false, start: '09:00', end: '13:00' },
      { day: 'Domingo', active: false, start: '00:00', end: '00:00' },
    ]
  });

  const [modules, setModules] = useState({
    tickets: true,
    chat: true,
    kb: true,
    catalog: false,
    reports: true
  });

  const [holidays, setHolidays] = useState<{id: string; date: string; name: string; chatOffline: boolean; isManual?: boolean}[]>([
    { id: '1', date: '2026-01-01', name: 'Confraternização Universal', chatOffline: true },
    { id: '2', date: '2026-04-21', name: 'Tiradentes', chatOffline: true },
    { id: '3', date: '2026-05-01', name: 'Dia do Trabalho', chatOffline: true },
    { id: '4', date: '2026-09-07', name: 'Independência do Brasil', chatOffline: true },
  ]);

  const [newHoliday, setNewHoliday] = useState({ day: '01', month: '01', name: '', chatOffline: true });
  const [isImportingHolidays, setIsImportingHolidays] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<string | null>(null);

  const [macros, setMacros] = useState<{command: string; text: string}[]>(() => {
    const saved = localStorage.getItem('portal_macros');
    return saved ? JSON.parse(saved) : MOCK_MACROS;
  });
  const [newMacro, setNewMacro] = useState({ command: '', text: '' });

  const addHoliday = () => {
    if (!newHoliday.name) return;
    
    const holidayData = { 
      id: Date.now().toString(),
      date: `2000-${newHoliday.month}-${newHoliday.day}`, // store with a dummy leap year to support Feb 29
      name: newHoliday.name,
      chatOffline: newHoliday.chatOffline,
      isManual: true 
    };

    setHolidays([...holidays, holidayData].sort((a, b) => a.date.localeCompare(b.date)));
    setNewHoliday({ day: '01', month: '01', name: '', chatOffline: true });
  };

  const importHolidays = async () => {
    setIsImportingHolidays(true);
    try {
      const year = new Date().getFullYear();
      const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
      if (!res.ok) throw new Error('Falha ao buscar feriados');
      const data: { date: string; name: string; type: string }[] = await res.json();
      
      const imported = data.map(h => {
        const monthDay = h.date.substring(5);
        return {
          id: h.date, // Use original date as ID
          date: `2000-${monthDay}`, // Store with dummy year
          name: h.name,
          chatOffline: true,
          isManual: false
        };
      });

      setHolidays(prev => {
        const merged = [...prev];
        imported.forEach(imp => {
          // Check by MM-DD to avoid duplicates
          if (!merged.find(m => m.date.substring(5) === imp.date.substring(5))) {
            merged.push(imp);
          }
        });
        return merged.sort((a, b) => a.date.localeCompare(b.date));
      });
      toast.success(`Feriados nacionais de ${year} importados!`);
    } catch (err) {
      toast.error('Erro ao importar feriados da BrasilAPI.');
    } finally {
      setIsImportingHolidays(false);
    }
  };

  const confirmRemoveHoliday = () => {
    if (holidayToDelete) {
      setHolidays(holidays.filter(h => h.id !== holidayToDelete));
      setHolidayToDelete(null);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('portal_show_top_clock', JSON.stringify(customizationForm.showTopClock));
    localStorage.setItem('portal_sun_tzu_mode', JSON.stringify(customizationForm.sunTzuMode));
    localStorage.setItem('portal_macros', JSON.stringify(macros));
    window.dispatchEvent(new Event('storage'));
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccessModalOpen(true);
    }, 800);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomizationForm({...customizationForm, logoUrl: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMinimizedLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomizationForm({...customizationForm, minimizedLogoUrl: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'identity':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Identidade</h2>
              <p className="text-sm text-slate-500">Configure as informações comerciais e a identidade visual da sua operação.</p>
            </div>

            {/* Seção: Perfil da Empresa */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Perfil da Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nome da Empresa</label>
                  <input 
                    type="text" 
                    value={profileForm.companyName}
                    onChange={e => setProfileForm({...profileForm, companyName: e.target.value})}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">E-mail de Suporte (Remetente)</label>
                  <input 
                    type="email" 
                    value={profileForm.supportEmail}
                    onChange={e => setProfileForm({...profileForm, supportEmail: e.target.value})}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Telefone / WhatsApp</label>
                  <input 
                    type="text" 
                    value={profileForm.supportPhone}
                    onChange={e => setProfileForm({...profileForm, supportPhone: e.target.value})}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-6" />

            {/* Seção: Identidade Visual */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Identidade Visual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Logo Completa (Horizontal)</label>
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 cursor-pointer transition-colors">
                          {customizationForm.logoUrl ? (
                            <img src={customizationForm.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                          ) : (
                            <>
                              <ImageIcon className="w-6 h-6 mb-1" />
                              <span className="text-[10px] font-medium uppercase">Upload</span>
                            </>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Usada quando a barra lateral está aberta. PNG transparente, máx 2MB.</p>
                          <div className="flex gap-3 items-center">
                            <label className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                              Escolher arquivo
                              <input 
                                type="file" 
                                accept="image/png, image/jpeg, image/svg+xml" 
                                className="hidden" 
                                onChange={handleLogoUpload} 
                              />
                            </label>
                            {customizationForm.logoUrl && (
                              <button 
                                onClick={() => setCustomizationForm({...customizationForm, logoUrl: ''})}
                                className="text-sm font-medium text-red-500 hover:text-red-600"
                              >
                                Remover
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Logo do Painel Minimizado (Ícone)</label>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 cursor-pointer transition-colors">
                          {customizationForm.minimizedLogoUrl ? (
                            <img src={customizationForm.minimizedLogoUrl} alt="Min Logo" className="w-8 h-8 object-contain" />
                          ) : (
                            <ImageIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Proporção 1:1. Recomendado: 128x128px.</p>
                          <div className="flex gap-3 items-center">
                            <label className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                              Escolher arquivo
                              <input 
                                type="file" 
                                accept="image/png, image/jpeg, image/svg+xml" 
                                className="hidden" 
                                onChange={handleMinimizedLogoUpload} 
                              />
                            </label>
                            {customizationForm.minimizedLogoUrl && (
                              <button 
                                onClick={() => setCustomizationForm({...customizationForm, minimizedLogoUrl: ''})}
                                className="text-sm font-medium text-red-500 hover:text-red-600"
                              >
                                Remover
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cor Principal (Acentos e Botões)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={customizationForm.primaryColor}
                        onChange={e => setCustomizationForm({...customizationForm, primaryColor: e.target.value})}
                        className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                      />
                      <input 
                        type="text" 
                        value={customizationForm.primaryColor}
                        onChange={e => setCustomizationForm({...customizationForm, primaryColor: e.target.value})}
                        className="w-28 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-blue-500 uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tema Padrão</label>
                    <select 
                      value={customizationForm.defaultTheme}
                      onChange={e => setCustomizationForm({...customizationForm, defaultTheme: e.target.value})}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="system">Sistema (Automático)</option>
                      <option value="light">Claro</option>
                      <option value="dark">Escuro</option>
                    </select>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={customizationForm.showTopClock}
                        onChange={e => setCustomizationForm({...customizationForm, showTopClock: e.target.checked})}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Exibir relógio no topo do painel</span>
                    </label>
                  </div>

                  <div className="space-y-2 pt-4">
                    <button
                      onClick={() => setCustomizationForm({...customizationForm, sunTzuMode: !customizationForm.sunTzuMode})}
                      className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all border ${
                        customizationForm.sunTzuMode 
                          ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 shadow-[0_0_15px_rgba(251,191,36,0.2)]' 
                          : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      Sun Tzu - {customizationForm.sunTzuMode ? 'MODO ATIVADO' : 'MODO OFF'}
                    </button>
                  </div>
                </div>
                
                {/* Preview Box */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center gap-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preview de Login</span>
                  <div className="w-full max-w-[240px] bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 p-4 space-y-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto overflow-hidden">
                      {customizationForm.logoUrl ? (
                        <img src={customizationForm.logoUrl} alt="Preview Logo" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 w-full rounded border border-slate-200 dark:border-slate-700" />
                      <div className="h-8 w-full rounded border border-slate-200 dark:border-slate-700" />
                    </div>
                    <div 
                      className="h-8 w-full rounded text-white flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: customizationForm.primaryColor }}
                    >
                      Acessar Portal
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'business_hours':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Horário de Atendimento</h2>
            
            <div className="space-y-1 max-w-sm">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Fuso Horário (Timezone)</label>
              <select 
                value={businessHours.timezone}
                onChange={e => setBusinessHours({...businessHours, timezone: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-blue-500"
              >
                <option value="America/Sao_Paulo">America/Sao_Paulo (BRT)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>

            <div className="mt-6 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="px-4 py-3">Dia da Semana</th>
                    <th className="px-4 py-3 text-center">Ativo</th>
                    <th className="px-4 py-3">Início</th>
                    <th className="px-4 py-3">Fim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {businessHours.schedule.map((day, idx) => (
                    <tr key={day.day} className="bg-white dark:bg-slate-900">
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{day.day}</td>
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={day.active}
                          onChange={e => {
                            const newSched = [...businessHours.schedule];
                            newSched[idx].active = e.target.checked;
                            setBusinessHours({...businessHours, schedule: newSched});
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="time" 
                          value={day.start}
                          disabled={!day.active}
                          onChange={e => {
                            const newSched = [...businessHours.schedule];
                            newSched[idx].start = e.target.value;
                            setBusinessHours({...businessHours, schedule: newSched});
                          }}
                          className="h-8 px-2 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 disabled:opacity-50 outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="time" 
                          value={day.end}
                          disabled={!day.active}
                          onChange={e => {
                            const newSched = [...businessHours.schedule];
                            newSched[idx].end = e.target.value;
                            setBusinessHours({...businessHours, schedule: newSched});
                          }}
                          className="h-8 px-2 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 disabled:opacity-50 outline-none focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'holidays':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Feriados e Exceções</h2>
              <p className="text-sm text-slate-500">Configure os dias em que não haverá atendimento. Essas datas pausam o relógio de SLA.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Adicionar Feriado</h3>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <div className="w-full sm:w-auto space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Data</label>
                  <div className="flex gap-2">
                    <select 
                      value={newHoliday.day}
                      onChange={e => setNewHoliday({...newHoliday, day: e.target.value})}
                      className="w-16 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-blue-500"
                    >
                      {Array.from({length: 31}, (_, i) => String(i + 1).padStart(2, '0')).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <select 
                      value={newHoliday.month}
                      onChange={e => setNewHoliday({...newHoliday, month: e.target.value})}
                      className="w-24 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="01">Jan</option>
                      <option value="02">Fev</option>
                      <option value="03">Mar</option>
                      <option value="04">Abr</option>
                      <option value="05">Mai</option>
                      <option value="06">Jun</option>
                      <option value="07">Jul</option>
                      <option value="08">Ago</option>
                      <option value="09">Set</option>
                      <option value="10">Out</option>
                      <option value="11">Nov</option>
                      <option value="12">Dez</option>
                    </select>
                  </div>
                </div>
                <div className="flex-1 w-full space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Nome / Descrição</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Confraternização Universal"
                    value={newHoliday.name}
                    onChange={e => setNewHoliday({...newHoliday, name: e.target.value})}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div className="w-full sm:w-auto space-y-1 mt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={newHoliday.chatOffline}
                      onChange={e => setNewHoliday({...newHoliday, chatOffline: e.target.checked})}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    Pausar atendimento (Chat Offline)
                  </label>
                </div>

              </div>
              
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={addHoliday}
                  disabled={!newHoliday.name}
                  className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Feriado
                </button>
                <button 
                  onClick={importHolidays}
                  disabled={isImportingHolidays}
                  className="h-9 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isImportingHolidays ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Importar Nacionais (BrasilAPI)
                </button>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Feriado</th>
                    <th className="px-4 py-3">Ações Automáticas</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {holidays.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500 bg-white dark:bg-slate-900">
                        Nenhum feriado cadastrado.
                      </td>
                    </tr>
                  ) : (
                    holidays.map(holiday => {
                      // Append a dummy year if missing, or just use the date
                      const dateObj = new Date(holiday.date + 'T12:00:00');
                      // Format only day and month
                      const formattedDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(dateObj);
                      
                      return (
                        <tr key={holiday.id} className="bg-white dark:bg-slate-900 group">
                          <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 w-32">
                            {formattedDate} <span className="text-xs font-normal text-slate-400">(Anual)</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            {holiday.name}
                            {holiday.isManual && (
                              <div title="Feriado inserido manualmente" className="cursor-help flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full w-5 h-5">
                                <Info className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "px-2 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1",
                              holiday.chatOffline ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            )}>
                              {holiday.chatOffline ? 'Chat Offline / Sem expediente' : 'Expediente normal'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={() => setHolidayToDelete(holiday.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                              title="Remover feriado"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'sso':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Integrações SSO (Single Sign-On)</h2>
            <p className="text-sm text-slate-500">Configure autenticação via provedores externos para a equipe ou clientes.</p>

            <div className="space-y-4 mt-6">
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Google Workspace</h3>
                      <p className="text-xs text-slate-500">Autenticação com contas Google</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <input type="text" placeholder="Client ID" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:border-blue-500" defaultValue="123456789-abc.apps.googleusercontent.com" />
                  <input type="password" placeholder="Client Secret" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:border-blue-500" defaultValue="secret_key_mock" />
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" className="w-5 h-5">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                        <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Microsoft Entra ID</h3>
                      <p className="text-xs text-slate-500">Autenticação com contas Office 365</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 opacity-50 pointer-events-none">
                  <input type="text" placeholder="Tenant ID" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:border-blue-500" />
                  <input type="text" placeholder="Client ID" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:border-blue-500" />
                  <input type="password" placeholder="Client Secret" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Som & Notificações de Atendimento</h2>
              <p className="text-sm text-slate-500">Configure os alertas sonoros e notificações em tempo real para os operadores no chat.</p>
            </div>

            {/* Painel de Controle de Som */}
            <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    {soundForm.enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Alertas Sonoros de Atendimento</h3>
                    <p className="text-xs text-slate-500">Emitir tom de áudio quando novos clientes entrarem na fila ou enviarem mensagens</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={soundForm.enabled}
                    onChange={(e) => handleSoundChange({ enabled: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {soundForm.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tom de Alerta
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={soundForm.tone}
                        onChange={(e) => handleSoundChange({ tone: e.target.value as AlertTone })}
                        className="flex-1 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs outline-none focus:border-blue-500 font-medium"
                      >
                        <option value="chime">Chime ITSM (Duas notas - Padrão)</option>
                        <option value="bell">Campainha de Balcão (Bell)</option>
                        <option value="pop">Pop Curto (Mensagens)</option>
                        <option value="pulse">Pulse Duplo (Alerta Urgente)</option>
                        {soundForm.customAudioUrl && (
                          <option value="custom">🎵 Som Personalizado ({soundForm.customFileName || 'Arquivo Próprio'})</option>
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleTestSound()}
                        className="h-10 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
                        title="Ouvir amostra"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Testar
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Volume do Áudio
                      </label>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{soundForm.volume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={soundForm.volume}
                      onChange={(e) => handleSoundChange({ volume: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                    />
                  </div>

                  {/* Seção para Upload de Áudio Próprio */}
                  <div className="sm:col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Som Próprio Personalizado (.mp3, .wav, .ogg)</p>
                      <p className="text-[11px] text-slate-400">Envie seu próprio efeito sonoro para ser tocado quando um cliente entrar na fila.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {soundForm.customFileName && (
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl text-xs font-medium border border-blue-200 dark:border-blue-800">
                          <span className="truncate max-w-[150px]">🎵 {soundForm.customFileName}</span>
                          <button
                            type="button"
                            onClick={handleRemoveCustomAudio}
                            className="text-red-500 hover:text-red-700 font-bold"
                            title="Remover som personalizado"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <label className="h-9 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>{soundForm.customFileName ? 'Trocar Áudio' : 'Adicionar Som Próprio'}</span>
                        <input
                          type="file"
                          accept="audio/mp3,audio/wav,audio/ogg,audio/m4a"
                          className="hidden"
                          onChange={handleCustomAudioUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Painel de Notificações Desktop */}
            <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Notificações Nativas da Área de Trabalho</h3>
                    <p className="text-xs text-slate-500">Exibir balões de alerta do sistema operacional quando a aba estiver minimizada</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    permission === 'granted' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                  }`}>
                    {permission === 'granted' ? 'Ativo' : permission === 'denied' ? 'Bloqueado' : 'Pendente'}
                  </span>
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="h-9 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    {permission === 'granted' ? 'Enviar Notificação de Teste' : 'Solicitar Permissão'}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Eventos de Notificação por E-mail</h3>
              <div className="space-y-3">
                {[
                  { title: 'Novo Ticket', desc: 'Avisar agentes quando um ticket for aberto', active: true },
                  { title: 'Atualização no Ticket', desc: 'Avisar o cliente e agentes quando houver um comentário', active: true },
                  { title: 'Ticket Resolvido', desc: 'Enviar e-mail para o cliente após resolução', active: true },
                  { title: 'Alerta de SLA', desc: 'Avisar gerente se SLA estiver prestes a estourar (1 hora)', active: false },
                  { title: 'Alerta de Inatividade', desc: 'Lembrar cliente de responder após 3 dias', active: false },
                ].map((notif, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{notif.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={notif.active} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'modules':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Módulos do Sistema</h2>
            <p className="text-sm text-slate-500">Ative ou desative módulos inteiros do sistema. Módulos desativados ficarão ocultos para toda a empresa.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[
                { id: 'tickets', title: 'Chamados', icon: <CheckSquare className="w-5 h-5" />, desc: 'Gestão de tickets' },
                { id: 'chat', title: 'Chat / Mensagens', icon: <Bell className="w-5 h-5" />, desc: 'Atendimento ao vivo' },
                { id: 'kb', title: 'Base de Conhecimento', icon: <LayoutGrid className="w-5 h-5" />, desc: 'Artigos e FAQs' },
                { id: 'catalog', title: 'Catálogo de Serviços', icon: <LinkIcon className="w-5 h-5" />, desc: 'Lista de serviços ofertados' },
                { id: 'reports', title: 'Relatórios', icon: <BarChart className="w-5 h-5" />, desc: 'Métricas e dashboards' },
              ].map((mod) => (
                <div key={mod.id} className={cn(
                  "p-4 border rounded-xl flex items-start gap-4 transition-all cursor-pointer",
                  modules[mod.id as keyof typeof modules] 
                    ? "border-blue-500 bg-blue-50/30 dark:bg-blue-900/20" 
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
                )}
                onClick={() => setModules({...modules, [mod.id]: !modules[mod.id as keyof typeof modules]})}
                >
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center mt-0.5 transition-colors",
                    modules[mod.id as keyof typeof modules] ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"
                  )}>
                    {modules[mod.id as keyof typeof modules] && <Check className="w-3 h-3" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{mod.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{mod.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'macros':
        return (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Respostas Rápidas (Macros)</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Configure mensagens pré-prontas para acelerar o atendimento via chat. Para usar, digite o atalho durante o atendimento.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-100">Adicionar Nova Resposta</h3>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="w-full md:w-48">
                  <input
                    value={newMacro.command}
                    onChange={e => setNewMacro({...newMacro, command: e.target.value.startsWith('/') || e.target.value === '' ? e.target.value : '/' + e.target.value})}
                    placeholder="Atalho (ex: /ola)"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    value={newMacro.text}
                    onChange={e => setNewMacro({...newMacro, text: e.target.value})}
                    placeholder="Texto completo da resposta..."
                    className="flex-1 h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                  <button 
                    onClick={() => {
                      if (newMacro.command && newMacro.text) {
                        const updated = [...macros, newMacro];
                        setMacros(updated);
                        setNewMacro({ command: '', text: '' });
                        localStorage.setItem('portal_macros', JSON.stringify(updated));
                        window.dispatchEvent(new Event('storage'));
                      }
                    }}
                    disabled={!newMacro.command || !newMacro.text}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap gap-2 shrink-0 h-10"
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-48">Atalho</th>
                    <th className="px-4 py-3 font-semibold">Mensagem Completa</th>
                    <th className="px-4 py-3 w-16 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {macros.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">{m.command}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-lg">{m.text}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => {
                            const updated = macros.filter((_, i) => i !== idx);
                            setMacros(updated);
                            localStorage.setItem('portal_macros', JSON.stringify(updated));
                            window.dispatchEvent(new Event('storage'));
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                          title="Remover resposta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {macros.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                        Nenhuma resposta rápida cadastrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'security_audit':
        return (
          <div className="space-y-6">
            <SessionTimeoutSettingsWidget />
            <LgpdUserAnonymizationWidget />
            <FrameAncestorsPolicyWidget />
            <SessionCookiePolicyWidget />
            <HttpSecurityHeadersWidget />
            <AntiBruteForcePanelWidget />
            <SecurityAuditLogsWidget />
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Configurações Gerais</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gerencie os parâmetros globais da plataforma</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-70"
        >
          {isSaving ? <span className="animate-spin text-lg leading-none">⚙</span> : <Save className="h-4 w-4" />}
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start flex-1 min-h-0">
        {/* SIDEBAR TABS */}
        <div className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-2">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors mb-1",
                activeTab === tab.id 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <span className={cn(
                "p-1.5 rounded-md",
                activeTab === tab.id ? "bg-blue-100 dark:bg-blue-900/40" : "bg-slate-100 dark:bg-slate-800"
              )}>
                {tab.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{tab.title}</p>
                {/* <p className="text-[10px] truncate opacity-70 mt-0.5">{tab.desc}</p> */}
              </div>
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Sucesso!"
        message="As configurações foram salvas com sucesso."
      />

      {/* Confirmação de Exclusão de Feriado */}
      {holidayToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Excluir Feriado?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tem certeza que deseja remover este feriado? O atendimento funcionará normalmente nesta data e o SLA não será pausado.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setHolidayToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmRemoveHoliday}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
