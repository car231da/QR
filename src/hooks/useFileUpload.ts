import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface UploadResult {
  publicUrl: string;
  fileName: string;
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      // Generate unique file path with UUID prefix
      const fileExtension = file.name.split('.').pop() || '';
      const uniqueId = uuidv4();
      const filePath = `${uniqueId}/${file.name}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(data.path);

      // Store file metadata in database
      const { error: dbError } = await supabase
        .from('file_uploads')
        .insert({
          file_name: file.name,
          file_path: data.path,
          file_size: file.size,
          file_type: file.type || 'application/octet-stream',
          public_url: publicUrl,
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Continue anyway, the file is uploaded
      }

      const result = {
        publicUrl,
        fileName: file.name,
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
