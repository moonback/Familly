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

interface Rule {
  id: string;
  label: string;
  points_penalty: number;
  user_id: string;
}

export default function RulesManagement() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [newRule, setNewRule] = useState({ label: '', points_penalty: 0 });
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRules();
    }
  }, [user]);

  const fetchRules = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des règles:', error);
      toast.error('Impossible de charger les règles. Veuillez réessayer.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateRule = async () => {
    if (!newRule.label || newRule.points_penalty <= 0) {
      toast.error('Veuillez remplir tous les champs correctement.');
      return;
    }

    try {
      const { error } = await supabase
        .from('rules')
        .insert({
          label: newRule.label,
          points_penalty: newRule.points_penalty,
          user_id: user?.id
        });

      if (error) throw error;

      toast.success('Règle créée avec succès');
      setNewRule({ label: '', points_penalty: 0 });
      fetchRules();
    } catch (error) {
      console.error('Erreur lors de la création de la règle:', error);
      toast.error('Impossible de créer la règle. Veuillez réessayer.');
    }
  };

  const handleUpdateRule = async () => {
    if (!editingRule || !editingRule.label || editingRule.points_penalty <= 0) {
      toast.error('Veuillez remplir tous les champs correctement.');
      return;
    }

    try {
      const { error } = await supabase
        .from('rules')
        .update({
          label: editingRule.label,
          points_penalty: editingRule.points_penalty
        })
        .eq('id', editingRule.id);

      if (error) throw error;

      toast.success('Règle mise à jour avec succès');
      setEditingRule(null);
      fetchRules();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la règle:', error);
      toast.error('Impossible de mettre à jour la règle. Veuillez réessayer.');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast.success('Règle supprimée avec succès');
      fetchRules();
    } catch (error) {
      console.error('Erreur lors de la suppression de la règle:', error);
      toast.error('Impossible de supprimer la règle. Veuillez réessayer.');
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
        <h1 className="text-4xl font-bold">Gestion des Règles</h1>
        <Button onClick={() => navigate('/dashboard/parent')}>
          Retour au tableau de bord
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ajouter une nouvelle règle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="label">Description de la règle</Label>
              <Input
                id="label"
                value={newRule.label}
                onChange={(e) => setNewRule({ ...newRule, label: e.target.value })}
                placeholder="Ex: Ne pas faire ses devoirs"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="points_penalty">Points de pénalité</Label>
              <Input
                id="points_penalty"
                type="number"
                min="1"
                value={newRule.points_penalty}
                onChange={(e) => setNewRule({ ...newRule, points_penalty: parseInt(e.target.value) || 0 })}
                placeholder="Ex: 10"
              />
            </div>
            <Button onClick={handleCreateRule}>
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Ajouter la règle
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="p-6">
              {editingRule?.id === rule.id ? (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`edit-label-${rule.id}`}>Description de la règle</Label>
                    <Input
                      id={`edit-label-${rule.id}`}
                      value={editingRule.label}
                      onChange={(e) => setEditingRule({ ...editingRule, label: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`edit-points-${rule.id}`}>Points de pénalité</Label>
                    <Input
                      id={`edit-points-${rule.id}`}
                      type="number"
                      min="1"
                      value={editingRule.points_penalty}
                      onChange={(e) => setEditingRule({ ...editingRule, points_penalty: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateRule}>Enregistrer</Button>
                    <Button variant="outline" onClick={() => setEditingRule(null)}>Annuler</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{rule.label}</h3>
                    <p className="text-muted-foreground">Pénalité: {rule.points_penalty} points</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setEditingRule(rule)}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteRule(rule.id)}>
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