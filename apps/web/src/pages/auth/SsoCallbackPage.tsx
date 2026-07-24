import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { LoadingScreen } from '../../components/shared/LoadingScreen';

export default function SsoCallbackPage({ provider }: { provider: 'google' | 'microsoft' }) {
  const { refetchUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    refetchUser().then(() => navigate('/dashboard')).catch(() => navigate('/cliente'));
  }, []);

  return <LoadingScreen />;
}
