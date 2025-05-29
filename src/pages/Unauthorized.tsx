
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Accès non autorisé</h1>
        <p className="text-muted-foreground mb-6">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Retour
          </Button>
          <Button onClick={() => navigate('/')}>
            Accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
