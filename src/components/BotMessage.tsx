import type { BotResponse } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ShieldCheck, BrainCircuit } from 'lucide-react';

interface BotMessageProps {
  response: BotResponse;
}

export function BotMessage({ response }: BotMessageProps) {
  const { answer, confidence, evidence, type } = response;

  const getConfidenceBadge = () => {
    if (confidence === undefined) return null;

    let variant: 'default' | 'outline' | 'destructive';
    if (confidence > 0.7) {
      variant = 'default';
    } else if (confidence > 0.4) {
      variant = 'outline';
    } else {
      variant = 'destructive';
    }

    return (
      <Badge variant={variant} className="flex items-center gap-1.5">
        <BrainCircuit className="h-3.5 w-3.5" />
        Confidence: {(confidence * 100).toFixed(0)}%
      </Badge>
    );
  };

  return (
    <div className="space-y-3">
      <p className="whitespace-pre-wrap">{answer}</p>

      <div className="flex items-center gap-2">
        {type === 'exact' && (
          <Badge variant="secondary" className="border-green-500/50 text-green-700">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
            Exact Match
          </Badge>
        )}
        {confidence !== undefined && getConfidenceBadge()}
      </div>

      {evidence && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="evidence" className="border-b-0">
            <AccordionTrigger className="py-2 text-sm font-medium text-muted-foreground hover:no-underline">
              <div className="flex items-center gap-2">
                Show Verified Evidence
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                <code>{evidence}</code>
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
