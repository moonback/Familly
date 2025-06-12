import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { GiftIcon, TrophyIcon, ListChecksIcon, AlertTriangleIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Child {
  id: string;
  name: string;
  age: number;
  points: number;
  avatar_url: string;
  custom_color?: string;
  user_id: string;
}

interface Task {
  id: string;
  label: string;
  points_reward: number;
  is_daily: boolean;
  is_completed: boolean;
  due_date: string;
}

interface Rule {
  id: string;
  label: string;
  points_penalty: number;
}

interface Reward {
  id: string;
  label: string;
  cost: number;
}

interface ChildTask {
  task_id: string;
  is_completed: boolean;
  due_date: string;
  tasks: {
    id: string;
    label: string;
    points_reward: number;
    is_daily: boolean;
  };
}

interface ChildRuleViolation {
  id: string;
  rule_id: string;
  violated_at: string;
}

interface ChildRewardClaim {
  id: string;
  reward_id: string;
  claimed_at: string;
}

export default function DashboardChild() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchChildrenData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      fetchChildDetails(selectedChild.id);
    }
  }, [selectedChild]);

  const fetchChildrenData = async () => {
    try {
      setLoadingData(true);
      
      // Récupérer les données des enfants
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user?.id);

      if (childrenError) throw childrenError;
      
      if (!childrenData || childrenData.length === 0) {
        toast.error('Aucun enfant trouvé pour cet utilisateur.');
        return;
      }

      setChildren(childrenData);
      setSelectedChild(childrenData[0]);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Impossible de charger les données. Veuillez réessayer.');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchChildDetails = async (childId: string) => {
    try {
      // Récupérer les tâches de l'enfant avec leur statut
      const { data: tasksData, error: tasksError } = await supabase
        .from('child_tasks')
        .select(`
          task_id,
          is_completed,
          due_date,
          tasks (
            id,
            label,
            points_reward,
            is_daily
          )
        `)
        .eq('child_id', childId)
        .eq('due_date', new Date().toISOString().split('T')[0]);

      if (tasksError) throw tasksError;

      // Transformer les données pour correspondre à notre interface
      const formattedTasks = (tasksData || []).map((task: unknown) => {
        const t = task as ChildTask;
        return {
          id: t.tasks.id,
          label: t.tasks.label,
          points_reward: t.tasks.points_reward,
          is_daily: t.tasks.is_daily,
          is_completed: t.is_completed,
          due_date: t.due_date
        };
      });

      setTasks(formattedTasks);

      // Récupérer les règles
      const { data: rulesData, error: rulesError } = await supabase
        .from('rules')
        .select('*')
        .eq('user_id', user?.id);

      if (rulesError) throw rulesError;
      setRules(rulesData || []);

      // Récupérer les récompenses disponibles
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user?.id);

      if (rewardsError) throw rewardsError;
      setRewards(rewardsData || []);

    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      toast.error('Impossible de charger les détails. Veuillez réessayer.');
    }
  };

  const handleChildChange = (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (child) {
      setSelectedChild(child);
    }
  };

  const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
    if (!selectedChild) return;

    try {
      const { error } = await supabase
        .from('child_tasks')
        .update({ 
          is_completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('child_id', selectedChild.id)
        .eq('task_id', taskId)
        .eq('due_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      // Mettre à jour l'état local
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, is_completed: !currentStatus } : task
      ));

      // Si la tâche est marquée comme terminée, mettre à jour les points
      if (!currentStatus) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          const { error: updateError } = await supabase
            .from('children')
            .update({ points: selectedChild.points + task.points_reward })
            .eq('id', selectedChild.id);

          if (updateError) throw updateError;

          setSelectedChild(prev => prev ? {
            ...prev,
            points: prev.points + task.points_reward
          } : null);

          // Mettre à jour la liste des enfants
          setChildren(prev => prev.map(child => 
            child.id === selectedChild.id 
              ? { ...child, points: child.points + task.points_reward }
              : child
          ));
        }
      }

      toast.success('Tâche mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      toast.error('Impossible de mettre à jour la tâche. Veuillez réessayer.');
    }
  };

  const handleRuleViolation = async (ruleId: string) => {
    if (!selectedChild) return;

    try {
      // Enregistrer la violation de règle
      const { error: violationError } = await supabase
        .from('child_rules_violations')
        .insert({
          child_id: selectedChild.id,
          rule_id: ruleId,
          violated_at: new Date().toISOString()
        });

      if (violationError) throw violationError;

      // Trouver la règle violée
      const rule = rules.find(r => r.id === ruleId);
      if (rule) {
        // Mettre à jour les points de l'enfant
        const { error: updateError } = await supabase
          .from('children')
          .update({ points: Math.max(0, selectedChild.points - rule.points_penalty) })
          .eq('id', selectedChild.id);

        if (updateError) throw updateError;

        // Mettre à jour l'état local
        setSelectedChild(prev => prev ? {
          ...prev,
          points: Math.max(0, prev.points - rule.points_penalty)
        } : null);

        // Mettre à jour la liste des enfants
        setChildren(prev => prev.map(child => 
          child.id === selectedChild.id 
            ? { ...child, points: Math.max(0, child.points - rule.points_penalty) }
            : child
        ));

        toast.error(`Règle violée : ${rule.label} (-${rule.points_penalty} points)`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la violation:', error);
      toast.error('Impossible d\'enregistrer la violation. Veuillez réessayer.');
    }
  };

  const handleRewardClaim = async (reward: Reward) => {
    if (!selectedChild) return;
    
    try {
      if (selectedChild.points < reward.cost) {
        toast.error('Vous n\'avez pas assez de points pour cette récompense.');
        return;
      }

      // Enregistrer la réclamation de récompense
      const { error: claimError } = await supabase
        .from('child_rewards_claimed')
        .insert({
          child_id: selectedChild.id,
          reward_id: reward.id,
          claimed_at: new Date().toISOString()
        });

      if (claimError) throw claimError;

      // Mettre à jour les points de l'enfant
      const { error: updateError } = await supabase
        .from('children')
        .update({ points: selectedChild.points - reward.cost })
        .eq('id', selectedChild.id);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setSelectedChild(prev => prev ? {
        ...prev,
        points: prev.points - reward.cost
      } : null);

      // Mettre à jour la liste des enfants
      setChildren(prev => prev.map(child => 
        child.id === selectedChild.id 
          ? { ...child, points: child.points - reward.cost }
          : child
      ));

      toast.success(`Félicitations ! Vous avez obtenu : ${reward.label}`);
    } catch (error) {
      console.error('Erreur lors de l\'échange de récompense:', error);
      toast.error('Impossible d\'échanger la récompense. Veuillez réessayer.');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <p>Chargement du tableau de bord enfant...</p>
      </div>
    );
  }

  if (!user || !selectedChild) {
    return null;
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center">Mon Tableau de Bord</h1>
        {children.length > 1 && (
          <Select
            value={selectedChild.id}
            onValueChange={handleChildChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sélectionner un enfant" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profil de l'enfant */}
        <Card className={`lg:col-span-1 p-6 flex flex-col items-center ${selectedChild.custom_color || 'bg-blue-100 text-blue-800'}`}>
          <Avatar className="h-24 w-24 mb-4 border-4 border-white shadow-lg">
            <AvatarImage src={selectedChild.avatar_url} alt={selectedChild.name} />
            <AvatarFallback>{selectedChild.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-extrabold mb-2">{selectedChild.name}</CardTitle>
          <p className="text-lg mb-4">Âge: {selectedChild.age} ans</p>
          <div className="flex items-center text-2xl font-semibold">
            <TrophyIcon className="h-6 w-6 mr-2 text-yellow-500" />
            Points: {selectedChild.points}
          </div>
        </Card>

        {/* Tâches du jour */}
        <Card className="lg:col-span-2 p-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <ListChecksIcon className="mr-2 h-6 w-6" /> Mes Tâches du Jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Progression des tâches ({completedTasks}/{totalTasks})</p>
              <Progress value={progressPercentage} className="w-full" />
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-md bg-card">
                  <Checkbox 
                    id={`task-${task.id}`} 
                    checked={task.is_completed}
                    onCheckedChange={() => handleTaskToggle(task.id, task.is_completed)}
                  />
                  <Label htmlFor={`task-${task.id}`} className="flex-1 text-lg font-medium">
                    {task.label}
                  </Label>
                  <span className="text-primary font-semibold">+{task.points_reward} points</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Règles */}
        <Card className="lg:col-span-3 p-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <AlertTriangleIcon className="mr-2 h-6 w-6" /> Règles à Respecter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rules.map((rule) => (
                <Card key={rule.id} className="p-4 flex flex-col items-center text-center">
                  <h3 className="text-xl font-semibold mb-2">{rule.label}</h3>
                  <p className="text-muted-foreground mb-3">Pénalité: <span className="font-bold text-destructive">-{rule.points_penalty} points</span></p>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleRuleViolation(rule.id)}
                  >
                    Signaler une Violation
                  </Button>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Récompenses disponibles */}
        <Card className="lg:col-span-3 p-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <GiftIcon className="mr-2 h-6 w-6" /> Récompenses Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id} className="p-4 flex flex-col items-center text-center">
                  <h3 className="text-xl font-semibold mb-2">{reward.label}</h3>
                  <p className="text-muted-foreground mb-3">Coût: <span className="font-bold text-primary">{reward.cost} points</span></p>
                  <Button
                    className="w-full"
                    disabled={selectedChild.points < reward.cost}
                    onClick={() => handleRewardClaim(reward)}
                  >
                    Échanger ({reward.cost} pts)
                  </Button>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
