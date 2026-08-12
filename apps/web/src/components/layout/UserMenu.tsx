import React from 'react';
import { LogOut, Settings, User, Sun, Moon, Palette, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/use-mock-auth';
import { useTheme } from '../theme-provider';

export function UserMenu() {
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ avatarUrl: reader.result as string });
        setOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-border bg-card shadow-lg">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <div className="p-1">
              <Link
                to="/admin/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Settings className="h-4 w-4" /> Configurações
              </Link>
              <div className="my-1 border-t border-border" />

              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <User className="h-4 w-4" /> Alterar Foto
              </button>
              
              {user.avatarUrl && (
                <button
                  onClick={() => {
                    updateUser({ avatarUrl: undefined });
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-amber-600 hover:bg-amber-600/10 transition-colors"
                >
                  <X className="h-4 w-4" /> Remover Foto
                </button>
              )}
              
              <div className="my-1 border-t border-border" />
              
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
