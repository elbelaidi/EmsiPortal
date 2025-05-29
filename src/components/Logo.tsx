
import { Link } from 'react-router-dom';

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img 
        src="/lovable-uploads/emsilogo.png" 
        alt="EMSI Logo" 
        className="h-10" 
      />
      <span className="text-xl font-semibold text-emsi-green"></span>
    </Link>
  );
};
