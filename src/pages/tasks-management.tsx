import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircleIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

interface Task {
  id: string;
  user_id: string;
  label: string;
  points_reward: number;
  is_daily: boolean;
  created_at: string;
}

export default function TasksManagement() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    points_reward: '',
    is_daily: true,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de charger la liste des tâches",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskData = {
        ...formData,
        points_reward: parseInt(formData.points_reward),
        user_id: user?.id,
      };

      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editingTask.id);

        if (error) throw error;
        toast({
          title: 'Succès',
          description: "La tâche a été mise à jour avec succès",
        });
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([taskData]);

        if (error) throw error;
        toast({
          title: 'Succès',
          description: "La tâche a été ajoutée avec succès",
        });
      }

      setIsDialogOpen(false);
      setEditingTask(null);
      setFormData({ label: '', points_reward: '', is_daily: true });
      fetchTasks();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      label: task.label,
      points_reward: task.points_reward.toString(),
      is_daily: task.is_daily,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (error) throw error;
        toast({
          title: 'Succès',
          description: "La tâche a été supprimée avec succès",
        });
        fetchTasks();
      } catch (error) {
        toast({
          title: 'Erreur',
          description: "Impossible de supprimer la tâche",
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
        <h1 className="text-4xl font-bold">Gestion des Tâches</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Ajouter une Tâche
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Modifier une Tâche' : 'Ajouter une Tâche'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="label">Description de la tâche</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="points_reward">Points de récompense</Label>
                <Input
                  id="points_reward"
                  type="number"
                  value={formData.points_reward}
                  onChange={(e) => setFormData({ ...formData, points_reward: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_daily"
                  checked={formData.is_daily}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_daily: checked as boolean })}
                />
                <Label htmlFor="is_daily">Tâche quotidienne</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingTask ? 'Modifier' : 'Ajouter'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{task.label}</span>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-primary font-semibold">+{task.points_reward} points</p>
              <p className="text-sm text-muted-foreground">
                {task.is_daily ? 'Tâche quotidienne' : 'Tâche ponctuelle'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 