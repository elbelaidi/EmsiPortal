
import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useData } from '../context/DataContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '../hooks/use-mobile';
import { useAuth } from '../context/AuthContext';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBot = ({ isOpen, onClose }: ChatBotProps) => {
  const [message, setMessage] = useState('');
  const { chatMessages, sendChatMessage, students, courses, absences, classes } = useData();
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const getAbsenceInfo = (studentId: string) => {
    const studentAbsences = absences.filter(absence => absence.studentId === studentId);
    const totalCount = studentAbsences.length;
    const justifiedCount = studentAbsences.filter(absence => absence.status === 'justified').length;
    const unjustifiedCount = studentAbsences.filter(absence => absence.status === 'unjustified').length;
    const pendingCount = studentAbsences.filter(absence => absence.status === 'pending').length;
    
    return {
      total: totalCount,
      justified: justifiedCount,
      unjustified: unjustifiedCount,
      pending: pendingCount,
      absences: studentAbsences
    };
  };
  
  const getStudentInfo = (studentId: string) => {
    return students.find(s => s.id === studentId);
  };
  
  const processMessage = (msg: string, role: string) => {
    // Process user message to generate bot response
    const lowerMsg = msg.toLowerCase();
    let botResponse = '';
    
    // Check if the message is about absences
    if (lowerMsg.includes('absence') || lowerMsg.includes('absent') || lowerMsg.includes('manqué')) {
      if (role === 'student') {
        const absenceInfo = getAbsenceInfo(user?.id || '');
        botResponse = `Vous avez un total de ${absenceInfo.total} absence(s) ce semestre.\n\n${absenceInfo.justified} justifiée(s), ${absenceInfo.unjustified} non justifiée(s), et ${absenceInfo.pending} en attente de justification.\n\nSi vous voulez justifier une absence, veuillez utiliser la page "Soumettre une réclamation".`;
      } else if (role === 'supervisor') {
        const pendingCount = absences.filter(a => a.status === 'pending').length;
        const totalCount = absences.length;
        botResponse = `Il y a actuellement ${pendingCount} absence(s) en attente de justification sur un total de ${totalCount} absences.\n\nVous pouvez consulter et traiter ces absences dans l'onglet "Absence Tracking".`;
      }
    } 
    // Check if the message is about classes or schedule
    else if (lowerMsg.includes('classe') || lowerMsg.includes('cours') || lowerMsg.includes('emploi') || lowerMsg.includes('schedule') || lowerMsg.includes('timetable')) {
      if (role === 'student') {
        botResponse = `Votre emploi du temps est disponible dans l'onglet "Emploi du temps". Vous avez ${courses.length} cours programmés pour cette semaine.`;
      } else if (role === 'supervisor') {
        botResponse = `Vous pouvez consulter et gérer les emplois du temps des classes dans l'onglet "Emploi du temps des classes". Il y a ${classes.length} classes avec des emplois du temps configurés.`;
      }
    }
    // Check if the message is about student information
    else if (lowerMsg.includes('student') || lowerMsg.includes('étudiant') || lowerMsg.includes('élève')) {
      if (role === 'supervisor') {
        botResponse = `Il y a actuellement ${students.length} étudiants enregistrés dans le système.\n\nListe des étudiants :\n`;
        students.slice(0, 5).forEach(student => {
          botResponse += `- ${student.firstName} ${student.lastName} (ID: ${student.studentId})\n`;
        });
        botResponse += `\nVous pouvez consulter et gérer tous les étudiants dans l'onglet "Gestion des étudiants".`;
      } else {
        const student = getStudentInfo(user?.id || '');
        botResponse = `Que voulez-vous savoir sur votre profil d'étudiant? Vous pouvez consulter vos informations dans la page "Profil".`;
      }
    }
    // Generic response if no specific topic is detected
    else {
      botResponse = `Bonjour, je suis Assistant Absentia. Je peux vous aider avec les informations sur les absences, les cours, ou l'emploi du temps. Comment puis-je vous aider aujourd'hui?`;
    }
    
    // Send the bot response with a slight delay to seem more natural
    setTimeout(() => {
      sendChatMessage(botResponse, 'bot');
    }, 600);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendChatMessage(message.trim(), user?.role || 'student');
      setMessage('');
      
      // Process the message and generate a response
      processMessage(message.trim(), user?.role || 'student');
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className={`fixed ${isMobile ? 'bottom-16 right-2 w-[90%] max-w-[350px]' : 'bottom-4 right-4 w-80 md:w-96'} bg-background border rounded-lg shadow-lg z-50 flex flex-col max-h-[500px]`}>
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-primary">Assistant Absentia</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-3 max-h-[350px]">
        {chatMessages.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            Bonjour! Comment puis-je vous aider aujourd'hui? Vous pouvez me poser des questions sur les absences, les cours, ou l'emploi du temps.
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i}>
                      {line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      <form onSubmit={handleSendMessage} className="p-3 border-t flex">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Demandez sur les absences, cours ou emploi du temps..."
          className="flex-1 mr-2"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatBot;
