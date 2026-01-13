import { useState } from 'react';
import { Type, Sparkles, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TextInputZoneProps {
  onSubmit: (text: string, password?: string) => void;
  isLoading: boolean;
  error?: string;
}

export function TextInputZone({ onSubmit, isLoading, error }: TextInputZoneProps) {
  const [text, setText] = useState('');
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim(), passwordEnabled ? password : undefined);
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
              "min-h-[160px] resize-none rounded-2xl border-2 p-4 text-base",
              "focus:border-primary focus:ring-0 transition-colors",
              error && "border-destructive/50"
            )}
            disabled={isLoading}
          />
          
          <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
            {text.length} characters
          </div>
        </div>

        {/* Password Protection */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="password-toggle" className="text-sm font-medium cursor-pointer">
                Password Protection
              </Label>
            </div>
            <Switch
              id="password-toggle"
              checked={passwordEnabled}
              onCheckedChange={setPasswordEnabled}
            />
          </div>
          
          {passwordEnabled && (
            <div className="relative animate-fade-in">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading || (passwordEnabled && !password.trim())}
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
