import { AuthForm } from '@/components/auth/auth-form';
import { useAuth } from '@/context/auth-context';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard/parent');
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <AuthForm />
    </div>
  );
}
