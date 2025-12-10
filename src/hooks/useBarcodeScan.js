import { useState, useEffect } from 'react';
import jsQR from 'jsqr';

export const useBarcodeScan = (onScan) => {
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState(null);

  const startScan = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setIsScanning(true);

      const video = document.createElement('video');
      video.srcObject = mediaStream;
      video.play();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const scanFrame = () => {
        if (!isScanning) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          onScan(code.data);
          stopScan();
        } else {
          requestAnimationFrame(scanFrame);
        }
      };

      video.addEventListener('loadedmetadata', () => {
        scanFrame();
      });
    } catch (err) {
      console.error('Camera access denied', err);
      alert('Please enable camera access');
    }
  };

  const stopScan = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => stopScan();
  }, []);

  return { isScanning, startScan, stopScan };
};
