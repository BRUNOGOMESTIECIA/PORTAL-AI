"use client";

import { useState, useEffect } from "react";
import { TicketIcon, CheckCircleIcon, ExclamationCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function IntegrationsSettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [clientId, setClientId] = useState("");
  const [deskId, setDeskId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  useEffect(() => {
    fetch("http://localhost:8002/api/v1/integrations/tiflux", {
      headers: {
        "X-Tenant-Slug": "acme"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.configured) {
          setApiKey(data.api_key || "");
          setClientId(data.client_id || "");
          setDeskId(data.desk_id || "");
        }
      })
      .catch((err) => console.error("Erro ao buscar integrações:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("http://localhost:8002/api/v1/integrations/tiflux", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Slug": "acme"
        },
        body: JSON.stringify({
          api_key: apiKey,
          client_id: clientId,
          desk_id: deskId
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Integração validada e ativa com sucesso!" });
      } else {
        setMessage({ type: "error", text: data.detail || "Falha ao salvar configurações." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro de conexão ao tentar salvar." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Integrações de ITSM</h1>
        <p className="text-gray-500 mt-1">Configure o fluxo de transbordo da Inteligência Artificial para a equipe humana.</p>
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <TicketIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Tiflux Desk</h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Ativo
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              O Tiflux é a plataforma oficial onde os tickets serão criados caso a IA não consiga resolver o problema do usuário através da Base de Conhecimento.
            </p>
          </div>
        </div>
        
        <div className="p-8">
          {message && (
            <div className={`p-4 mb-8 rounded-xl flex items-start gap-3 ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
              {message.type === "success" ? (
                <CheckCircleIcon className="w-5 h-5 mt-0.5 text-green-600 shrink-0" />
              ) : (
                <ExclamationCircleIcon className="w-5 h-5 mt-0.5 text-red-600 shrink-0" />
              )}
              <p className="font-medium">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
                  API Key (Bearer Token)
                </label>
                <input
                  type="password"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2 font-medium">Você pode gerar seu token de integração nas Configurações do ambiente Tiflux.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Client ID (Cliente Padrão)
                  </label>
                  <input
                    type="text"
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Ex: 154"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Desk ID (Mesa de Atendimento)
                  </label>
                  <input
                    type="text"
                    required
                    value={deskId}
                    onChange={(e) => setDeskId(e.target.value)}
                    placeholder="Ex: 82"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Validando...
                  </>
                ) : (
                  "Salvar e Validar"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
