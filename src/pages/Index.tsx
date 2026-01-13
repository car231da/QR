import { useState, useCallback } from 'react';
import { FileUploadZone } from '@/components/FileUploadZone';
import { TextInputZone } from '@/components/TextInputZone';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useTextMessage } from '@/hooks/useTextMessage';
import { QrCode, Upload, ArrowLeft, Sparkles, Type, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Mode = 'text' | 'file';
type View = 'input' | 'result';

const Index = () => {
  const { uploadFile, isUploading, error: fileError, uploadResult, reset: resetFile } = useFileUpload();
  const { saveText, isLoading: isTextLoading, error: textError, result: textResult, reset: resetText } = useTextMessage();
  
  const [mode, setMode] = useState<Mode>('text');
  const [view, setView] = useState<View>('input');

  const handleFileSelect = useCallback(async (file: File, password?: string) => {
    const result = await uploadFile(file, password);
    if (result) {
      setView('result');
    }
  }, [uploadFile]);

  const handleTextSubmit = useCallback(async (text: string, password?: string) => {
    const result = await saveText(text, password);
    if (result) {
      setView('result');
    }
  }, [saveText]);

  const handleNewUpload = useCallback(() => {
    resetFile();
    resetText();
    setView('input');
  }, [resetFile, resetText]);

  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
    resetFile();
    resetText();
    setView('input');
  }, [resetFile, resetText]);

  const currentResult = mode === 'text' 
    ? (textResult ? { url: textResult.viewUrl, name: 'Text Message' } : null)
    : (uploadResult ? { url: uploadResult.publicUrl, name: uploadResult.fileName } : null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4">
        <div className="container max-w-4xl mx-auto flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <QrCode className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-display font-semibold text-foreground">
            QR Share
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {view === 'input' ? (
            <div className="glass-card-elevated rounded-3xl p-6 sm:p-10 animate-fade-in">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  Instant QR Generation
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
                  Share Instantly
                </h2>
                <p className="text-muted-foreground">
                  Create a QR code from text or file
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-xl mb-8">
                <button
                  onClick={() => handleModeChange('text')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
                    mode === 'text'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Type className="w-4 h-4" />
                  Text
                </button>
                <button
                  onClick={() => handleModeChange('file')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
                    mode === 'file'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <FileUp className="w-4 h-4" />
                  File
                </button>
              </div>

              {mode === 'text' ? (
                <TextInputZone 
                  onSubmit={handleTextSubmit}
                  isLoading={isTextLoading}
                  error={textError || undefined}
                />
              ) : (
                <FileUploadZone 
                  onFileSelect={handleFileSelect}
                  isUploading={isUploading}
                  error={fileError || undefined}
                />
              )}

              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary/60" />
                    {mode === 'text' ? 'No Word Limit' : 'Secure Storage'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-accent/60" />
                    {mode === 'text' ? 'View Online' : 'Unique URLs'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary/60" />
                    {mode === 'text' ? 'Instant Share' : 'Up to 50MB'}
                  </div>
                </div>
              </div>
            </div>
          ) : currentResult && (
            <div className="glass-card-elevated rounded-3xl p-6 sm:p-10 animate-fade-in">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewUpload}
                className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Create another
              </Button>

              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <QrCode className="w-4 h-4" />
                  Ready to Share
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                  Your QR Code
                </h2>
              </div>

              <QRCodeDisplay 
                url={currentResult.url}
                fileName={currentResult.name}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          {mode === 'text' 
            ? 'Text opens as a viewable page • Scan QR codes with any camera app'
            : 'Files are stored securely • Scan QR codes with any camera app'
          }
        </p>
      </footer>
    </div>
  );
};

export default Index;
