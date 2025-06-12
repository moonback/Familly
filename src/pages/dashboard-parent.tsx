import { useAuth } from '@/context/auth-context';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon } from 'lucide-react';

export default function DashboardParent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <p>Chargement du tableau de bord parent...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection gérée par useEffect
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Tableau de bord Parent</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <CardHeader>
            <CardTitle className="text-xl">Gérer les Enfants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Ajoutez, modifiez ou supprimez les profils de vos enfants.</p>
            <Button className="w-full" onClick={() => navigate('/dashboard/parent/children')}>
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Gérer les Enfants
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <CardHeader>
            <CardTitle className="text-xl">Gérer les Tâches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Définissez les tâches quotidiennes et leurs points de récompense.</p>
            <Button className="w-full" onClick={() => navigate('/dashboard/parent/tasks')}>
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Gérer les Tâches
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <CardHeader>
            <CardTitle className="text-xl">Gérer les Règles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Établissez les règles de comportement et les pénalités de points.</p>
            <Button className="w-full" onClick={() => navigate('/dashboard/parent/rules')}>
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Gérer les Règles
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <CardHeader>
            <CardTitle className="text-xl">Gérer les Récompenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Créez des récompenses que vos enfants pourront échanger avec leurs points.</p>
            <Button className="w-full" onClick={() => navigate('/dashboard/parent/rewards')}>
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Gérer les Récompenses
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
