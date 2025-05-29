
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, LogOut, MessageSquare, LayoutDashboard, FileText, Users, Calendar, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ChatBot from './ChatBot';

export const NavBar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);

  const getInitials = (firstName: string | undefined, lastName: string | undefined) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  const navItems = user?.role === 'supervisor' 
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5 mr-2" /> },
        { path: '/track-absences', label: 'Absence Tracking', icon: <FileText className="h-5 w-5 mr-2" /> },
        { path: '/student-management', label: 'Student Management', icon: <Users className="h-5 w-5 mr-2" /> },
        { path: '/classes-timetable', label: 'Timetables', icon: <Calendar className="h-5 w-5 mr-2" /> },
        { path: '/profile', label: 'Profile', icon: <User className="h-5 w-5 mr-2" /> },
      ]
    : [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5 mr-2" /> },
        { path: '/absence-history', label: 'Absence History', icon: <FileText className="h-5 w-5 mr-2" /> },
        { path: '/claim', label: 'Claim Absence', icon: <FileText className="h-5 w-5 mr-2" /> },
        { path: '/timetable', label: 'Timetable', icon: <Calendar className="h-5 w-5 mr-2" /> },
        { path: '/profile', label: 'Profile', icon: <User className="h-5 w-5 mr-2" /> },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        
        <nav className="hidden md:flex ml-10 flex-1">
          {user && navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-emsi-green'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4 ml-auto">
        
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          
          {user && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block text-sm font-medium">
                {user.firstName} {user.lastName}
              </span>
            </div>
          )}
          
          {user && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout}
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      {chatOpen && <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />}
    </header>
  );
};
