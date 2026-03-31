"use client";

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Search } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceSearchProps {
  onTranscript: (text: string) => void;
}

export default function VoiceSearch({ onTranscript }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [lang, setLang] = useState('en-US'); // 'en-US' or 'ta-IN'

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang;

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.error(`Voice error: ${event.error}`);
        }
      };
      
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        toast.info(`Heard: "${transcript}"`);
      };

      setRecognition(rec);
    }
  }, [onTranscript, lang]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      if (!recognition) return toast.error("Speech recognition not supported.");
      recognition.start();
    }
  };

  const toggleLang = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLang(prev => prev === 'en-US' ? 'ta-IN' : 'en-US');
    toast.success(`Language set to ${lang === 'en-US' ? 'Tamil' : 'English'}`);
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={toggleLang}
        className="px-2 py-1 text-[10px] font-bold bg-gray-100 text-gray-500 rounded-lg hover:bg-orange-100 hover:text-orange-600 transition-colors"
      >
        {lang === 'en-US' ? 'EN' : 'TA'}
      </button>
      <button 
        onClick={toggleListening}
        className={`p-3 rounded-full transition-all shadow-md ${
          isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-600 hover:bg-orange-50'
        }`}
        title={isListening ? "Listening..." : "Voice Search"}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
    </div>
  );
}
