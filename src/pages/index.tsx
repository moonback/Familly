import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Rediriger vers le tableau de bord parent si l'utilisateur est connecté
        navigate('/home');
      } else {
        // Rediriger vers la page d'authentification si non connecté
        navigate('/auth');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Chargement...</p>
      </div>
    );
  }

  return null; // La redirection se fait via useEffect
}
