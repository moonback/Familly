import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ChildTask {
  id: string;
  child_id: string;
  task_id: string;
  is_completed: boolean;
  completed_at: string | null;
  due_date: string;
  tasks: {
    id: string;
    label: string;
    points_reward: number;
    is_daily: boolean;
  };
  children: {
    id: string;
    name: string;
  };
}

interface RuleViolation {
  id: string;
  child_id: string;
  rule_id: string;
  violated_at: string;
  rules: {
    id: string;
    label: string;
  };
  children: {
    id: string;
    name: string;
  };
}

export default function HomeDashboard() {
  const { user } = useAuth();
  const [childTasks, setChildTasks] = useState<ChildTask[]>([]);
  const [violations, setViolations] = useState<RuleViolation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Récupérer les tâches des enfants
      const { data: tasksData, error: tasksError } = await supabase
        .from('child_tasks')
        .select(`
          *,
          tasks (*),
          children (id, name)
        `)
        .order('due_date', { ascending: true });

      if (tasksError) throw tasksError;
      setChildTasks(tasksData || []);

      // Récupérer les violations de règles
      const { data: violationsData, error: violationsError } = await supabase
        .from('child_rules_violations')
        .select(`
          *,
          rules (*),
          children (id, name)
        `)
        .order('violated_at', { ascending: false });

      if (violationsError) throw violationsError;
      setViolations(violationsData || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, childId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('child_tasks')
        .update({ 
          is_completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      setChildTasks(childTasks.map(task => 
        task.id === taskId ? { ...task, is_completed: !currentStatus, completed_at: !currentStatus ? new Date().toISOString() : null } : task
      ));

      toast.success(!currentStatus ? 'Tâche marquée comme terminée' : 'Tâche remise en cours');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      toast.error('Erreur lors de la mise à jour de la tâche');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tableau de Bord</h1>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="tasks">Tâches</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Tâches en cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{childTasks.filter(t => !t.is_completed).length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Violations en attente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{violations.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tâches terminées aujourd'hui</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {childTasks.filter(t => t.is_completed && 
                    new Date(t.completed_at!).toDateString() === new Date().toDateString()).length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Liste des tâches</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {childTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border-b">
                    <div className="flex-1">
                      <h3 className="font-medium">{task.tasks.label}</h3>
                      <p className="text-sm text-gray-500">Enfant: {task.children.name}</p>
                      <p className="text-sm text-gray-500">
                        Date limite: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={task.is_completed ? 'default' : 'secondary'}>
                        {task.is_completed ? 'Terminé' : 'En cours'}
                      </Badge>
                      <Button
                        size="sm"
                        variant={task.is_completed ? 'outline' : 'default'}
                        onClick={() => handleTaskStatusChange(task.id, task.child_id, task.is_completed)}
                        className={task.is_completed ? '' : 'bg-green-600 hover:bg-green-700'}
                      >
                        {task.is_completed ? 'Remettre en cours' : 'Terminer'}
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle>Violations de règles</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {violations.map((violation) => (
                  <Alert key={violation.id} className="mb-4">
                    <AlertTitle>{violation.rules.label}</AlertTitle>
                    <AlertDescription>
                      <div className="flex justify-between items-center">
                        <span>Enfant: {violation.children.name}</span>
                        <Badge variant="destructive">
                          Violation
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Date: {new Date(violation.violated_at).toLocaleDateString()}
                      </p>
                    </AlertDescription>
                  </Alert>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 