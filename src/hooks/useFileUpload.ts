import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface UploadResult {
  publicUrl: string;
  fileName: string;
  fileId: string;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const uploadFile = useCallback(async (file: File, password?: string) => {
    setIsUploading(true);
    setError(null);

    try {
      const uniqueId = uuidv4();
      const filePath = `${uniqueId}/${file.name}`;

      const { data, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(data.path);

      const insertData: {
        file_name: string;
        file_path: string;
        file_size: number;
        file_type: string;
        public_url: string;
        password_hash?: string;
      } = {
        file_name: file.name,
        file_path: data.path,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream',
        public_url: publicUrl,
      };

      if (password && password.trim()) {
        insertData.password_hash = await hashPassword(password.trim());
      }

      const { data: dbData, error: dbError } = await supabase
        .from('file_uploads')
        .insert(insertData)
        .select('id')
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
      }

      const result = {
        publicUrl: dbData?.id 
          ? `${window.location.origin}/view-file?id=${dbData.id}` 
          : publicUrl,
        fileName: file.name,
        fileId: dbData?.id || '',
      };

      setUploadResult(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUploadResult(null);
    setError(null);
  }, []);

  return {
    uploadFile,
    isUploading,
    error,
    uploadResult,
    reset,
  };
}
