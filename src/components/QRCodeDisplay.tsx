import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Download, Copy, Check, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface QRCodeDisplayProps {
  url: string;
  fileName: string;
}

export function QRCodeDisplay({ url, fileName }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: 400,
          margin: 2,
          color: {
            dark: '#1a1a2e',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('QR generation error:', err);
        toast.error('Failed to generate QR code');
      }
    };

    generateQR();
  }, [url]);

  const handleDownloadPDF = async () => {
    if (!qrDataUrl) return;
    
    try {
      // Create A4 PDF (210mm x 297mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // QR code size ~100mm (similar to blue square in sample)
      const qrSize = 100;
      
      // Center the QR code on the page
      const pageWidth = 210;
      const pageHeight = 297;
      const x = (pageWidth - qrSize) / 2;
      const y = (pageHeight - qrSize) / 2 - 20; // Slightly above center

      // Add QR code image
      pdf.addImage(qrDataUrl, 'PNG', x, y, qrSize, qrSize);

      // Add file name below QR code
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      const textWidth = pdf.getTextWidth(fileName);
      pdf.text(fileName, (pageWidth - textWidth) / 2, y + qrSize + 15);

      // Add "Scan to view" text
      pdf.setFontSize(14);
      pdf.setTextColor(26, 26, 46);
      const scanText = 'Scan to view';
      const scanTextWidth = pdf.getTextWidth(scanText);
      pdf.text(scanText, (pageWidth - scanTextWidth) / 2, y + qrSize + 8);

      // Download the PDF
      pdf.save(`${fileName.split('.')[0]}-qrcode.pdf`);
      toast.success('QR code PDF downloaded!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  if (!qrDataUrl) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="w-10 h-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 animate-scale-in">
      <div className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
        <div className="relative bg-card p-4 rounded-2xl shadow-lg border border-border/50">
          <img 
            src={qrDataUrl} 
            alt="QR Code" 
            className="w-[240px] h-[240px] sm:w-[280px] sm:h-[280px]"
          />
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-foreground">Scan to view</p>
        <p className="text-xs text-muted-foreground truncate max-w-[280px]">{fileName}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[320px]">
        <Button
          onClick={handleDownloadPDF}
          className="flex-1 gap-2"
          size="lg"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button
          onClick={handleCopyLink}
          variant="secondary"
          className="flex-1 gap-2"
          size="lg"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
      </div>

      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
      >
        <Link2 className="w-4 h-4" />
        Open file in new tab
      </a>
    </div>
  );
}
