import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import { AuthContextType } from '@/types';
import { toast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Correctement déstructurer l'objet retourné par onAuthStateChange
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user || null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return () => {
      // Appeler unsubscribe sur l'objet d'abonnement
      authListener.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast({
        title: 'Erreur de connexion',
        description: error.message,
        variant: 'destructive',
      });
    }
    return { error };
  };

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Inscription réussie',
        description: 'Veuillez vérifier votre email pour confirmer votre compte.',
      });
    }
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Erreur de déconnexion',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté.',
      });
    }
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
