import { useCallback, useState } from 'react';
import { Upload, FileIcon, X, AlertCircle, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFileSelect: (file: File, password?: string) => void;
  isUploading: boolean;
  error?: string;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function FileUploadZone({ onFileSelect, isUploading, error }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 50MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }
    if (!ALLOWED_TYPES.includes(file.type) && file.type !== '') {
      return 'File type not supported. Please upload PDF, images, videos, audio, or documents.';
    }
    return null;
  }, []);

  const handleFile = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setSelectedFile(file);
  }, [validateFile]);

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile, passwordEnabled ? password : undefined);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    setPasswordEnabled(false);
    setPassword('');
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const displayError = error || validationError;

  return (
    <div className="w-full space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative w-full min-h-[200px] rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer",
          "flex flex-col items-center justify-center gap-4 p-8",
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          isUploading && "pointer-events-none opacity-60",
          displayError && "border-destructive/50"
        )}
      >
        <input
          type="file"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept={ALLOWED_TYPES.join(',')}
          disabled={isUploading}
        />

        {selectedFile && !displayError ? (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileIcon className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground truncate max-w-[250px]">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            {!isUploading && (
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="mt-2 p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
              isDragging 
                ? "bg-primary/20 scale-110" 
                : "bg-gradient-to-br from-primary/10 to-accent/10"
            )}>
              <Upload className={cn(
                "w-10 h-10 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                Drop your file here
              </p>
              <p className="text-muted-foreground mt-1">
                or <span className="text-primary font-medium">browse</span> to upload
              </p>
            </div>
            <p className="text-xs text-muted-foreground max-w-[280px]">
              PDF, images, videos, audio, documents up to 50MB
            </p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      {/* Password Protection */}
      {selectedFile && !displayError && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="file-password-toggle" className="text-sm font-medium cursor-pointer">
                Password Protection
              </Label>
            </div>
            <Switch
              id="file-password-toggle"
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
      )}

      {/* Upload Button */}
      {selectedFile && !displayError && (
        <Button
          onClick={handleUpload}
          disabled={isUploading || (passwordEnabled && !password.trim())}
          size="lg"
          className="w-full gap-2 animate-fade-in"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate QR Code
            </>
          )}
        </Button>
      )}

      {displayError && (
        <div className="mt-3 flex items-center gap-2 text-destructive animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{displayError}</p>
        </div>
      )}
    </div>
  );
}
