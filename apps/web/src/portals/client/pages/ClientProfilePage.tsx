import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Building2, Phone, Shield, Bell, LogOut,
  Check, Pencil, X, Monitor,
  Briefcase, MapPin, Lock, Camera
} from 'lucide-react';
import { useAuth } from '../../../hooks/use-mock-auth';
import { MockClient } from '../../../mocks/data';
import { toast } from 'sonner';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" className="h-4 w-4 shrink-0" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

// ─── Avatar placeholder ───────────────────────────────────────────────────────
function AvatarPlaceholder({ name, size = 'lg' }: { name: string; size?: 'sm' | 'lg' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const cls = size === 'lg'
    ? 'w-20 h-20 text-2xl'
    : 'w-10 h-10 text-sm';
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold shrink-0 relative group overflow-hidden cursor-pointer shadow-sm`}>
      {initials}
      {size === 'lg' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Camera className="h-6 w-6 text-white" />
        </div>
      )}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
        <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Notification toggle row ──────────────────────────────────────────────────
function NotifRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
        role="switch"
        aria-checked={checked}
      >
        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white dark:bg-slate-800 shadow transition-transform ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ClientProfilePage() {
  const { user, logout } = useAuth();
  const client = user as MockClient;

  // Editable fields (mock only)
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(client?.name ?? '');
  const [phone, setPhone] = useState('(11) 98765-4321');

  // Read-only fields from integration
  const cargo = 'Analista de TI';
  const filial = 'Filial São Paulo';
  const [draft, setDraft] = useState({ name, phone });

  // Notification prefs (mock)
  const [notifs, setNotifs] = useState({
    ticketUpdates: true,
    newComments: true,
    slaAlerts: false,
    newsletter: false,
  });

  function startEdit() {
    setDraft({ name, phone });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function saveEdit() {
    setName(draft.name.trim() || name);
    setPhone(draft.phone.trim() || phone);
    setEditing(false);
    toast.success('Perfil atualizado com sucesso!', { duration: 3000 });
  }

  function toggleNotif(key: keyof typeof notifs) {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">Meu Perfil</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">Gerencie suas informações e preferências</p>
      </div>

      {/* ── Identity card ──────────────────────────────────────────────────── */}
      <Section title="Informações pessoais" icon={User}>
        <div className="flex items-start gap-5">
          <AvatarPlaceholder name={name} size="lg" />

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">Nome completo</label>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">Telefone</label>
                  <input
                    value={draft.phone}
                    onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveEdit}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Salvar
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{name}</h3>
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md"
                  >
                    <Pencil className="h-3 w-3" />
                    Editar
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
                    <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>{client?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>{client?.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
                    <Phone className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>{phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>{cargo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>{filial}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* ── Connected accounts ─────────────────────────────────────────────── */}
      {client?.ssoProvider !== 'local' && (
        <Section title="Conta corporativa" icon={Shield}>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
            Sua conta é gerenciada pelo provedor de identidade da empresa.
          </p>
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              {client?.ssoProvider === 'google' ? <GoogleIcon /> : <MicrosoftIcon />}
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {client?.ssoProvider === 'google' ? 'Google Workspace' : 'Microsoft 365'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{client?.email}</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <Check className="h-3 w-3" />
              Conectado
            </span>
          </div>
        </Section>
      )}

      {/* ── Notification preferences ───────────────────────────────────────── */}
      <Section title="Notificações por e-mail" icon={Bell}>
        <div>
          <NotifRow
            label="Atualizações de ticket"
            desc="Quando seu ticket mudar de status ou for atribuído"
            checked={notifs.ticketUpdates}
            onChange={() => toggleNotif('ticketUpdates')}
          />
          <NotifRow
            label="Novos comentários"
            desc="Quando a equipe responder seu ticket"
            checked={notifs.newComments}
            onChange={() => toggleNotif('newComments')}
          />

          <NotifRow
            label="Comunicados e novidades"
            desc="Informes sobre o portal e melhorias"
            checked={notifs.newsletter}
            onChange={() => toggleNotif('newsletter')}
          />
        </div>
      </Section>

      {/* ── Session ────────────────────────────────────────────────────────── */}
      <Section title="Sessão" icon={Monitor}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Encerrar sessão</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Você será redirecionado para a tela de login.</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-100 rounded-xl transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </Section>

      {/* Back link */}
      <div className="text-center">
        <Link to="/portal" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 transition-colors">
          ← Voltar ao início
        </Link>
      </div>
    </div>
  );
}
