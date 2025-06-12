import { Link } from 'react-router-dom';
import { HomeIcon, UserIcon, SettingsIcon, LogOutIcon, LogInIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { ModeToggle } from '@/components/layout/mode-toggle';

export function MainNav() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center space-x-4">
        <Link to="/" className="flex items-center space-x-2">
          <HomeIcon className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Family Dashboard</span>
        </Link>
        {user && (
          <>
            <Link to="/dashboard/parent">
              <Button variant="ghost">
                <UserIcon className="h-4 w-4 mr-2" /> Parent Dashboard
              </Button>
            </Link>
            <Link to="/dashboard/child">
              <Button variant="ghost">
                <UserIcon className="h-4 w-4 mr-2" /> Child Dashboard
              </Button>
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <ModeToggle />
        {user ? (
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOutIcon className="h-4 w-4 mr-2" /> Déconnexion
          </Button>
        ) : (
          <Link to="/auth">
            <Button variant="ghost">
              <LogInIcon className="h-4 w-4 mr-2" /> Connexion
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
