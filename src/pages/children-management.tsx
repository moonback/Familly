import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Child } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircleIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ChildrenManagement() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    avatar_url: '',
    custom_color: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchChildren();
    }
  }, [user]);

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de charger la liste des enfants",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const childData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        user_id: user?.id,
        points: 0,
      };

      if (editingChild) {
        const { error } = await supabase
          .from('children')
          .update(childData)
          .eq('id', editingChild.id);

        if (error) throw error;
        toast({
          title: 'Succès',
          description: "L'enfant a été mis à jour avec succès",
        });
      } else {
        const { error } = await supabase
          .from('children')
          .insert([childData]);

        if (error) throw error;
        toast({
          title: 'Succès',
          description: "L'enfant a été ajouté avec succès",
        });
      }

      setIsDialogOpen(false);
      setEditingChild(null);
      setFormData({ name: '', age: '', avatar_url: '', custom_color: '' });
      fetchChildren();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (child: Child) => {
    setEditingChild(child);
    setFormData({
      name: child.name,
      age: child.age?.toString() || '',
      avatar_url: child.avatar_url || '',
      custom_color: child.custom_color || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (childId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enfant ?')) {
      try {
        const { error } = await supabase
          .from('children')
          .delete()
          .eq('id', childId);

        if (error) throw error;
        toast({
          title: 'Succès',
          description: "L'enfant a été supprimé avec succès",
        });
        fetchChildren();
      } catch (error) {
        toast({
          title: 'Erreur',
          description: "Impossible de supprimer l'enfant",
          variant: 'destructive',
        });
      }
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Gestion des Enfants</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Ajouter un Enfant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingChild ? 'Modifier un Enfant' : 'Ajouter un Enfant'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">Âge</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="avatar_url">URL de l'avatar</Label>
                <Input
                  id="avatar_url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="custom_color">Couleur personnalisée</Label>
                <Input
                  id="custom_color"
                  value={formData.custom_color}
                  onChange={(e) => setFormData({ ...formData, custom_color: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingChild ? 'Modifier' : 'Ajouter'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => (
          <Card key={child.id} className={`${child.custom_color || 'bg-card'}`}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{child.name}</span>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(child)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(child.id)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Âge: {child.age || 'Non spécifié'}</p>
              <p>Points: {child.points}</p>
              {child.avatar_url && (
                <img
                  src={child.avatar_url}
                  alt={child.name}
                  className="w-20 h-20 rounded-full mt-4 mx-auto"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 