import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface TextMessage {
  content: string;
  created_at: string;
}

export default function ViewText() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState<TextMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = searchParams.get('id');

  useEffect(() => {
    async function fetchMessage() {
      if (!id) {
        setError('Missing message ID');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('text_messages')
          .select('content, created_at')
          .eq('id', id)
          .single();

        if (fetchError || !data) {
          setError('Message not found');
        } else {
          setMessage(data);
        }
      } catch (err) {
        setError('Failed to load message');
      } finally {
        setLoading(false);
      }
    }

    fetchMessage();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-2xl">
          <div className="animate-pulse text-foreground">Loading message...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-2xl text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const formattedDate = message ? new Date(message.created_at).toLocaleString() : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="glass-card-elevated max-w-2xl w-full rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            📄 Shared Message
          </h1>
          <p className="text-sm opacity-80 mt-1">Created: {formattedDate}</p>
        </div>
        <div className="p-6 bg-card">
          <div className="text-lg leading-relaxed text-card-foreground whitespace-pre-wrap break-words">
            {message?.content}
          </div>
        </div>
        <div className="border-t border-border p-4 text-center text-muted-foreground text-sm bg-muted/30">
          Shared via QR Share
        </div>
      </div>
    </div>
  );
}
