import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { MainNav } from '@/components/layout/main-nav';
import HomePage from '@/pages/index';
import AuthPage from '@/pages/auth';
import DashboardParent from '@/pages/dashboard-parent';
import DashboardChild from '@/pages/dashboard-child';
import ChildrenManagement from '@/pages/children-management';
import TasksManagement from '@/pages/tasks-management';
import RulesManagement from '@/pages/rules-management';
import RewardsManagement from '@/pages/rewards-management';
import HomeDashboard from '@/pages/home-dashboard';
import './App.css';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <AuthProvider>
          <MainNav />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/home" element={<HomeDashboard />} />
              <Route path="/dashboard/parent" element={<DashboardParent />} />
              <Route path="/dashboard/parent/children" element={<ChildrenManagement />} />
              <Route path="/dashboard/parent/tasks" element={<TasksManagement />} />
              <Route path="/dashboard/parent/rules" element={<RulesManagement />} />
              <Route path="/dashboard/parent/rewards" element={<RewardsManagement />} />
              <Route path="/dashboard/child" element={<DashboardChild />} />
              {/* Ajoutez d'autres routes ici si nécessaire */}
            </Routes>
          </main>
          <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
