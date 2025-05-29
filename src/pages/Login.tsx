
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { Logo } from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password, role);
      
      if (!success) {
        throw new Error('Invalid credentials');
      }

      toast({
        title: "Connexion réussie", 
        description: "Bienvenue EMSI",
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Échec de connexion",
        description: error instanceof Error ? error.message : "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes - quick login buttons
  const quickLogin = (userType: 'student' | 'supervisor') => {
    if (userType === 'student') {
      setEmail('test@university.edu');
      setPassword('123');
      setRole('student');
    } else {
      setEmail('superviser@gmail.com');
      setPassword('password');
      setRole('supervisor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/emsilogo.png" 
            alt="EMSI Logo" 
            className="h-24 mx-auto mb-4" 
          />
          <h1 className="text-2xl font-bold text-emsi-green mb-1"> EMSI</h1>
          <p className="text-muted-foreground">Système de suivi des présences</p>
        </div>

        <div className="bg-card border rounded-lg shadow-sm p-6">
          <Tabs defaultValue="student" onValueChange={(value) => setRole(value as UserRole)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="student">Étudiant</TabsTrigger>
              <TabsTrigger value="supervisor">Surveillant</TabsTrigger>
            </TabsList>
            <input type="hidden" name="role" value={role} />
            
            <TabsContent value="student">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="etudiant@gmail.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium">
                      Mot de passe
                    </label>
                    <a href="#" className="text-sm text-primary hover:underline">
                      Mot de passe oublié?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-emsi-green hover:bg-emsi-darkgreen"
                  disabled={loading}
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter en tant qu\'Étudiant'}
                </Button>
                
                {/* Quick login for demo */}
                <div className="pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => quickLogin('student')}
                  >
                    Demo: Connexion rapide étudiant
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="supervisor">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="supervisor-email" className="block text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="supervisor-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="superviser@gmail.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="supervisor-password" className="block text-sm font-medium">
                      Mot de passe
                    </label>
                    <a href="#" className="text-sm text-primary hover:underline">
                      Mot de passe oublié?
                    </a>
                  </div>
                  <Input
                    id="supervisor-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-emsi-green hover:bg-emsi-darkgreen"
                  disabled={loading}
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter en tant que Surveillant'}
                </Button>
                
                {/* Quick login for demo */}
                <div className="pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => quickLogin('supervisor')}
                  >
                    Demo: Connexion rapide surveillant
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="text-center mt-4 text-sm text-muted-foreground">
          École Marocaine des Sciences de l'Ingénieur
          <br />© 2025 EMSI. Tous droits réservés.
        </div>
      </div>
    </div>
  );
};

export default Login;
