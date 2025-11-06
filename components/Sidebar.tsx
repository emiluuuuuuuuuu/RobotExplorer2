import React, { useState, useEffect, useRef } from 'react';
import { RobotPart } from '../types';
import { LoaderIcon, SpeakerWaveIcon, StopIcon } from './icons';

// Audio decoding utilities as per Gemini documentation
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


interface SidebarProps {
  selectedPart: RobotPart | null;
  geminiDescription: string;
  audioData: string | null;
  isLoading: boolean;
  isAudioLoading: boolean;
  isVisible: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedPart, geminiDescription, audioData, isLoading, isAudioLoading, isVisible }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize AudioContext on mount and ensure it's available for playback
    if (!audioContextRef.current) {
        // FIX: Cast window to `any` to allow access to the vendor-prefixed `webkitAudioContext` for older browsers.
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    // Cleanup function to close the audio context when the component unmounts
    return () => {
      audioContextRef.current?.close().catch(console.error);
    }
  }, []);

  // Effect for handling audio playback (including autoplay)
  useEffect(() => {
    // Stop and clear any previous audio source when the selected part changes.
    if (sourceRef.current) {
      sourceRef.current.onended = null;
      sourceRef.current.stop();
      sourceRef.current = null;
    }

    if (!audioData || !audioContextRef.current) {
      setIsPlaying(false);
      return;
    }
    
    let isCancelled = false;

    const playAudio = async () => {
      if (audioContextRef.current!.state === 'suspended') {
        await audioContextRef.current!.resume();
      }

      setIsPlaying(true);
      try {
        const audioBuffer = await decodeAudioData(
            decode(audioData),
            audioContextRef.current!,
            24000, 1
        );
        if (isCancelled) return;

        const source = audioContextRef.current!.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current!.destination);
        source.onended = () => {
          setIsPlaying(false);
          sourceRef.current = null;
        };
        source.start();
        sourceRef.current = source;
      } catch (error) {
        console.error("Failed to play audio:", error);
        setIsPlaying(false);
      }
    };

    playAudio();

    // Cleanup function runs when `audioData` changes again, or on unmount.
    return () => {
      isCancelled = true;
      if (sourceRef.current) {
        sourceRef.current.onended = null; // Important to prevent state update after cleanup
        sourceRef.current.stop();
        sourceRef.current = null;
      }
    };
  }, [audioData]); // This effect is keyed to audioData changes.

  const handleStopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop(); // onended callback will handle setting isPlaying to false
    }
  };


  return (
    <aside className={`w-full md:w-1/3 lg:w-1/4 h-full flex flex-col bg-slate-950/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 transition-all duration-500 ease-in-out transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
      <div className="flex-grow">
        <h2 className="text-2xl font-bold text-cyan-300 border-b-2 border-cyan-300/30 pb-2">SYSTEM DIAGNOSTICS</h2>
        
        {selectedPart ? (
          <div className="mt-6 font-mono text-slate-300 animate-fade-in">
            <div className="mb-4">
              <p className="text-sm text-slate-400 tracking-widest">COMPONENT</p>
              <h3 className="text-xl font-bold text-white">{selectedPart.name}</h3>
            </div>
            <div className="mb-4">
              <p className="text-sm text-slate-400 tracking-widest">BASE FUNCTION</p>
              <p className="text-md text-slate-200">{selectedPart.description}</p>
            </div>
            <div>
              <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-400 tracking-widest">GEMINI ANALYSIS</p>
                  
                  {/* Loading spinner for audio */}
                  {isAudioLoading && <LoaderIcon className="w-5 h-5 animate-spin text-cyan-400" />}

                  {/* Stop button appears only when audio is playing */}
                  {!isAudioLoading && isPlaying && (
                      <button
                          onClick={handleStopAudio}
                          className="text-cyan-400 hover:text-cyan-200 transition-colors"
                          aria-label="Stop audio description"
                      >
                          <StopIcon className="w-6 h-6" />
                      </button>
                  )}
                  
                  {/* Placeholder icon when audio is ready but not playing (finished or stopped) */}
                  {!isAudioLoading && !isPlaying && audioData && (
                      <SpeakerWaveIcon className="w-6 h-6 text-slate-600" />
                  )}
              </div>
              {isLoading ? (
                <div className="flex items-center space-x-2 mt-2">
                  <LoaderIcon className="w-5 h-5 animate-spin text-cyan-400" />
                  <p>ACCESSING DATABASE...</p>
                </div>
              ) : (
                <p className="text-md text-slate-200 mt-1 min-h-[6rem]">{geminiDescription}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-10 text-center text-slate-500 font-mono">
            <p>// NO COMPONENT SELECTED</p>
            <p>Awaiting user input...</p>
            <p>Hover over or click a robot part to analyze.</p>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-slate-700 pt-4 mt-6 text-right">
        <p className="font-mono text-sm text-slate-400">OPERATOR</p>
        <p className="text-md font-bold text-slate-200">ZUNAIRA SOOMRO</p>
        <p className="text-xs text-slate-500">FROM 8-B</p>
      </div>
    </aside>
  );
};

export default Sidebar;