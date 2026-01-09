import { useState, useRef, useEffect } from 'react';
import type { Message, BotResponse } from '@/lib/types';
import { BotMessage } from '@/components/BotMessage';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BotIcon, UserIcon } from './icons';
import { Send, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Sample data for demo purposes
const sampleStudents = [
  { name: 'Alice Johnson', id: 'S001', grade: 'A', attendance: '95%', marks: 92 },
  { name: 'Bob Smith', id: 'S002', grade: 'B+', attendance: '88%', marks: 85 },
  { name: 'Carol Williams', id: 'S003', grade: 'A-', attendance: '92%', marks: 89 },
  { name: 'David Brown', id: 'S004', grade: 'B', attendance: '78%', marks: 80 },
];

// Simulated bot response function
const getBotResponse = async (query: string): Promise<BotResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  const lowerQuery = query.toLowerCase();
  
  // Check for student name mentions
  const student = sampleStudents.find(s => 
    lowerQuery.includes(s.name.toLowerCase()) || 
    lowerQuery.includes(s.name.split(' ')[0].toLowerCase())
  );
  
  if (student) {
    if (lowerQuery.includes('attendance')) {
      return {
        type: 'exact',
        answer: `${student.name}'s attendance rate is ${student.attendance}.`,
        confidence: 0.95,
        evidence: JSON.stringify({ studentId: student.id, name: student.name, attendance: student.attendance }, null, 2)
      };
    }
    if (lowerQuery.includes('marks') || lowerQuery.includes('grade') || lowerQuery.includes('score')) {
      return {
        type: 'exact',
        answer: `${student.name} has achieved a grade of ${student.grade} with ${student.marks} marks.`,
        confidence: 0.92,
        evidence: JSON.stringify({ studentId: student.id, name: student.name, grade: student.grade, marks: student.marks }, null, 2)
      };
    }
    return {
      type: 'partial',
      answer: `I found information about ${student.name} (ID: ${student.id}):\n• Grade: ${student.grade}\n• Attendance: ${student.attendance}\n• Marks: ${student.marks}`,
      confidence: 0.88,
      evidence: JSON.stringify(student, null, 2)
    };
  }
  
  if (lowerQuery.includes('all students') || lowerQuery.includes('list students')) {
    return {
      type: 'exact',
      answer: `Here are all registered students:\n${sampleStudents.map(s => `• ${s.name} (${s.id}) - Grade: ${s.grade}`).join('\n')}`,
      confidence: 1.0,
      evidence: JSON.stringify(sampleStudents, null, 2)
    };
  }
  
  if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
    return {
      type: 'none',
      answer: `I can help you with:\n• Student attendance records\n• Student grades and marks\n• Student information lookup\n\nTry asking: "What is Alice Johnson's attendance?" or "Show me Bob's grades"`,
    };
  }
  
  return {
    type: 'none',
    answer: "I couldn't find specific information matching your query. Try asking about a specific student's attendance, marks, or grades. For example: 'What was Alice Johnson's attendance?'",
    confidence: 0.3
  };
};

const initialMessages: Message[] = [
  {
    id: 'init1',
    role: 'bot',
    content: <BotMessage response={{ type: 'none', answer: "Hello! I am an administrative assistant bot. You can ask me about student records, attendance, and marks.\n\nFor example: 'What was Alice Johnson's attendance on 2024-05-20?'" }} />
  }
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: <p>{input}</p>,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const response = await getBotResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: <BotMessage response={response} />,
      };
      if (response.type === 'error') {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.answer,
        });
      }
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An unexpected error occurred.",
        description: "Please check the console or try again later."
      });
      const errorMessage: Message = {
        id: 'error-' + Date.now().toString(),
        role: 'bot',
        content: <BotMessage response={{type: 'error', answer: 'Sorry, something went wrong on my end.'}} />
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-2xl shadow-primary/10">
      <CardContent className="pt-6">
        <ScrollArea className="h-[50vh] w-full pr-4 chat-scrollbar" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-4 ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.role === 'bot' && (
                  <Avatar className="h-9 w-9 border bg-primary text-primary-foreground">
                    <AvatarFallback>
                      <BotIcon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] rounded-lg p-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  }`}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-9 w-9 border bg-accent text-accent-foreground">
                    <AvatarFallback>
                      <UserIcon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Avatar className="h-9 w-9 border bg-primary text-primary-foreground">
                  <AvatarFallback>
                    <BotIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[75%] rounded-lg p-3 text-sm bg-card border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>Typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Input
            type="text"
            placeholder="Ask an administrative question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-accent hover:bg-accent/90">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
