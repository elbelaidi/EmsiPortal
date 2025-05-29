
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatBot from './ChatBot';
import { useIsMobile } from '../hooks/use-mobile';

const ChatBotToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className={`fixed ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-40 h-12 w-12 rounded-full bg-emsi-green hover:bg-emsi-darkgreen shadow-lg`}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      <ChatBot isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatBotToggle;
