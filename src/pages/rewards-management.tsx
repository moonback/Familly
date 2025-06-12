import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircleIcon, Trash2Icon, PencilIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Reward {
  id: string;
  label: string;
  cost: number;
  user_id: string;
}

export default function RewardsManagement() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [newReward, setNewReward] = useState({ label: '', cost: 0 });
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRewards();
    }
  }, [user]);

  const fetchRewards = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des récompenses:', error);
      toast.error('Impossible de charger les récompenses. Veuillez réessayer.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateReward = async () => {
    if (!newReward.label || newReward.cost <= 0) {
      toast.error('Veuillez remplir tous les champs correctement.');
      return;
    }

    try {
      const { error } = await supabase
        .from('rewards')
        .insert({
          label: newReward.label,
          cost: newReward.cost,
          user_id: user?.id
        });

      if (error) throw error;

      toast.success('Récompense créée avec succès');
      setNewReward({ label: '', cost: 0 });
      fetchRewards();
    } catch (error) {
      console.error('Erreur lors de la création de la récompense:', error);
      toast.error('Impossible de créer la récompense. Veuillez réessayer.');
    }
  };

  const handleUpdateReward = async () => {
    if (!editingReward || !editingReward.label || editingReward.cost <= 0) {
      toast.error('Veuillez remplir tous les champs correctement.');
      return;
    }

    try {
      const { error } = await supabase
        .from('rewards')
        .update({
          label: editingReward.label,
          cost: editingReward.cost
        })
        .eq('id', editingReward.id);

      if (error) throw error;

      toast.success('Récompense mise à jour avec succès');
      setEditingReward(null);
      fetchRewards();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la récompense:', error);
      toast.error('Impossible de mettre à jour la récompense. Veuillez réessayer.');
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', rewardId);

      if (error) throw error;

      toast.success('Récompense supprimée avec succès');
      fetchRewards();
    } catch (error) {
      console.error('Erreur lors de la suppression de la récompense:', error);
      toast.error('Impossible de supprimer la récompense. Veuillez réessayer.');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Gestion des Récompenses</h1>
        <Button onClick={() => navigate('/dashboard/parent')}>
          Retour au tableau de bord
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ajouter une nouvelle récompense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="label">Description de la récompense</Label>
              <Input
                id="label"
                value={newReward.label}
                onChange={(e) => setNewReward({ ...newReward, label: e.target.value })}
                placeholder="Ex: 1h de temps d'écran"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cost">Coût en points</Label>
              <Input
                id="cost"
                type="number"
                min="1"
                value={newReward.cost}
                onChange={(e) => setNewReward({ ...newReward, cost: parseInt(e.target.value) || 0 })}
                placeholder="Ex: 50"
              />
            </div>
            <Button onClick={handleCreateReward}>
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Ajouter la récompense
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {rewards.map((reward) => (
          <Card key={reward.id}>
            <CardContent className="p-6">
              {editingReward?.id === reward.id ? (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`edit-label-${reward.id}`}>Description de la récompense</Label>
                    <Input
                      id={`edit-label-${reward.id}`}
                      value={editingReward.label}
                      onChange={(e) => setEditingReward({ ...editingReward, label: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`edit-cost-${reward.id}`}>Coût en points</Label>
                    <Input
                      id={`edit-cost-${reward.id}`}
                      type="number"
                      min="1"
                      value={editingReward.cost}
                      onChange={(e) => setEditingReward({ ...editingReward, cost: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateReward}>Enregistrer</Button>
                    <Button variant="outline" onClick={() => setEditingReward(null)}>Annuler</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{reward.label}</h3>
                    <p className="text-muted-foreground">Coût: {reward.cost} points</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setEditingReward(reward)}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteReward(reward.id)}>
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 