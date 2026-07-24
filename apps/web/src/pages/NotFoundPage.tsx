import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-6xl font-bold text-slate-200">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-800">Página não encontrada</h1>
      <p className="mt-2 text-sm text-slate-500">O endereço acessado não existe.</p>
      <div className="mt-8 flex gap-4">
        <Link to="/cliente" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Portal do cliente
        </Link>
        <Link to="/operacional/login" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
          Portal operacional
        </Link>
      </div>
    </div>
  );
}
