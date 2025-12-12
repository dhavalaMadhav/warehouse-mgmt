import { useState } from 'react';
import QrReader from "react-web-qr-reader";
import { X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QRScanner({ onScan, onClose }) {
  const [facingMode, setFacingMode] = useState('environment');

  const handleScan = (result, error) => {
    if (result) {
      toast.success('QR Code scanned!');
      onScan(result.text);
      onClose();
    }
    if (error && error.name !== 'NotFoundException') {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-md">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30"
          >
            <Camera className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-lg overflow-hidden">
<QrReader
  delay={300}
  onError={handleError}
  onScan={handleScan}
/>

        </div>

        <p className="text-center text-white mt-4 text-sm">
          Position QR code within the frame
        </p>
      </div>
    </div>
  );
}
