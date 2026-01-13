import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TextResult {
  viewUrl: string;
  textPreview: string;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useTextMessage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TextResult | null>(null);

  const saveText = useCallback(async (content: string, password?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const insertData: { content: string; password_hash?: string } = { content };
      
      if (password && password.trim()) {
        insertData.password_hash = await hashPassword(password.trim());
      }

      const { data, error: insertError } = await supabase
        .from('text_messages')
        .insert(insertData)
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }

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
