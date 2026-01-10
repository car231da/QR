import { useState } from 'react';
import { Type, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TextInputZoneProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  error?: string;
}

export function TextInputZone({ onSubmit, isLoading, error }: TextInputZoneProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="relative">
          <div className={cn(
            "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6",
            "bg-gradient-to-br from-primary/10 to-accent/10"
          )}>
            <Type className="w-10 h-10 text-muted-foreground" />
          </div>
          
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your message here... (no word limit)"
            className={cn(
              "min-h-[200px] resize-none rounded-2xl border-2 p-4 text-base",
              "focus:border-primary focus:ring-0 transition-colors",
              error && "border-destructive/50"
            )}
            disabled={isLoading}
          />
          
          <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
            {text.length} characters
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          size="lg"
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate QR Code
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-destructive animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
