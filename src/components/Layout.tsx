
import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';
import { useAuth } from '../context/AuthContext';
import ChatBotToggle from './ChatBotToggle';
import { Toaster } from '@/components/ui/toaster';

export const Layout = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <>
        <Outlet />
        <Toaster />
      </>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-6 px-4 sm:px-6">
        <Outlet />
      </main>
      <footer className="py-4 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          École Marocaine des Sciences de l'Ingénieur
          <br />© 2025 EMSI. Tous droits réservés.
        </div>
      </footer>
      <ChatBotToggle />
      <Toaster />
    </div>
  );
};
