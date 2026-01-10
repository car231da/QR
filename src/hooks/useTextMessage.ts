import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TextResult {
  viewUrl: string;
  textPreview: string;
}

export function useTextMessage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TextResult | null>(null);

  const saveText = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('text_messages')
        .insert({ content })
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }

      // Use the React app route instead of edge function
      const viewUrl = `${window.location.origin}/view?id=${data.id}`;

      const textResult = {
        viewUrl,
        textPreview: content.length > 50 ? content.substring(0, 50) + '...' : content,
      };

      setResult(textResult);
      return textResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save message';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    saveText,
    isLoading,
    error,
    result,
    reset,
  };
}
