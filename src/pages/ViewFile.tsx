import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff, AlertCircle, Download, FileIcon } from 'lucide-react';

interface FileUpload {
  file_name: string;
  file_size: number;
  file_type: string;
  public_url: string;
  created_at: string;
  password_hash: string | null;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function ViewFile() {
  const [searchParams] = useSearchParams();
  const [file, setFile] = useState<FileUpload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProtected, setIsProtected] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const id = searchParams.get('id');

  useEffect(() => {
    async function fetchFile() {
      if (!id) {
        setError('Missing file ID');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('file_uploads')
          .select('file_name, file_size, file_type, public_url, created_at, password_hash')
          .eq('id', id)
          .single();

        if (fetchError || !data) {
          setError('File not found');
        } else {
          setFile(data);
          if (data.password_hash) {
            setIsProtected(true);
          } else {
            setUnlocked(true);
          }
        }
      } catch (err) {
        setError('Failed to load file');
      } finally {
        setLoading(false);
      }
    }

    fetchFile();
  }, [id]);

  const handlePasswordSubmit = async () => {
    if (!password.trim() || !file?.password_hash) return;
    
    setVerifying(true);
    setPasswordError(null);
    
    try {
      const hashedInput = await hashPassword(password.trim());
      
      if (hashedInput === file.password_hash) {
        setUnlocked(true);
      } else {
        setPasswordError('Incorrect password');
      }
    } catch (err) {
      setPasswordError('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-2xl">
          <div className="animate-pulse text-foreground">Loading file...</div>
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

  // Password entry screen
  if (isProtected && !unlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="glass-card-elevated max-w-md w-full rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary-foreground/20 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold">Protected File</h1>
            <p className="text-sm opacity-80 mt-1">Enter password to access</p>
          </div>
          <div className="p-6 bg-card space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="pr-10"
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {passwordError && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {passwordError}
              </div>
            )}
            
            <Button 
              onClick={handlePasswordSubmit} 
              className="w-full"
              disabled={!password.trim() || verifying}
            >
              {verifying ? 'Verifying...' : 'Unlock File'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = file ? new Date(file.created_at).toLocaleString() : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="glass-card-elevated max-w-md w-full rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            📁 Shared File
          </h1>
          <p className="text-sm opacity-80 mt-1">Created: {formattedDate}</p>
        </div>
        <div className="p-6 bg-card">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{file?.file_name}</p>
              <p className="text-sm text-muted-foreground">
                {file && formatFileSize(file.file_size)} • {file?.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
              </p>
            </div>
          </div>
          
          <Button asChild className="w-full gap-2">
            <a href={file?.public_url} download={file?.file_name} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4" />
              Download File
            </a>
          </Button>
        </div>
        <div className="border-t border-border p-4 text-center text-muted-foreground text-sm bg-muted/30">
          Shared via QR Share
        </div>
      </div>
    </div>
  );
}
