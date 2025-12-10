import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VoicePicking({ onCommand, enabled = false }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log('Heard:', transcript);
      
      // Parse voice commands
      parseCommand(transcript);
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, []);

  const parseCommand = (transcript) => {
    // Extract numbers and bin codes from speech
    const pickMatch = transcript.match(/pick (\d+) (?:from )?(?:bin )?([a-z0-9-]+)/i);
    
    if (pickMatch) {
      const quantity = parseInt(pickMatch[1]);
      const binCode = pickMatch[2].toUpperCase();
      
      speak(`Picking ${quantity} from bin ${binCode}`);
      onCommand({ action: 'pick', quantity, binCode });
      return;
    }

    // Confirm command
    if (transcript.includes('confirm') || transcript.includes('complete')) {
      speak('Confirmed');
      onCommand({ action: 'confirm' });
      return;
    }

    // Navigation
    if (transcript.includes('next')) {
      speak('Moving to next item');
      onCommand({ action: 'next' });
      return;
    }

    if (transcript.includes('repeat')) {
      speak('Repeating last instruction');
      onCommand({ action: 'repeat' });
      return;
    }

    toast.error('Command not recognized');
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      toast('Voice picking stopped', { icon: '🔇' });
    } else {
      recognition.start();
      setIsListening(true);
      toast.success('Voice picking active. Say "Pick 10 from Bin A3"');
    }
  };

  if (!enabled || !recognition) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <button
        onClick={toggleListening}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          isListening 
            ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isListening ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </button>

      {isListening && (
        <div className="absolute bottom-20 left-0 bg-black text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap">
          Listening...
        </div>
      )}
    </div>
  );
}
