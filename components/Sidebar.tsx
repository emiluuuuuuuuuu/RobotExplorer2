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

  // Effect to stop any playing audio when the selected part changes
  useEffect(() => {
    // This is a cleanup function that runs when the component re-renders
    // due to a new `selectedPart`, or when it unmounts. It ensures audio
    // from a previously selected part doesn't continue playing.
    return () => {
      if (sourceRef.current) {
        sourceRef.current.onended = null; // Prevent state update after cleanup
        sourceRef.current.stop();
        sourceRef.current = null;
      }
      setIsPlaying(false);
    };
  }, [selectedPart]);

  const handlePlayAudio = async () => {
    if (!audioData || isPlaying || !audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    setIsPlaying(true);
    try {
      const audioBuffer = await decodeAudioData(
          decode(audioData),
          audioContextRef.current!,
          24000, 1
      );

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

  const handleStopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop(); // onended callback will handle setting isPlaying to false
    }
  };
  
  const renderDescription = () => {
    const parts = geminiDescription.split(' [');
    const mainDesc = parts[0];
    const suffix = parts.length > 1 ? `[${parts[1]}` : null;

    return (
        <div className="text-md text-slate-200 mt-1 min-h-[6rem]">
            <p>{mainDesc}</p>
            {suffix && (
                <p className="mt-2 text-xs text-amber-500/80 tracking-widest font-mono">
                    {suffix}
                </p>
            )}
        </div>
    );
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
                  
                  {isAudioLoading && <LoaderIcon className="w-5 h-5 animate-spin text-cyan-400" />}

                  {!isAudioLoading && audioData && !isPlaying && (
                      <button
                          onClick={handlePlayAudio}
                          className="text-cyan-400 hover:text-cyan-200 transition-colors"
                          aria-label="Play audio description"
                      >
                          <SpeakerWaveIcon className="w-6 h-6" />
                      </button>
                  )}

                  {!isAudioLoading && isPlaying && (
                      <button
                          onClick={handleStopAudio}
                          className="text-cyan-400 hover:text-cyan-200 transition-colors"
                          aria-label="Stop audio description"
                      >
                          <StopIcon className="w-6 h-6" />
                      </button>
                  )}
                  
                  {/* Icon for when audio is unavailable */}
                  {!isAudioLoading && !audioData && (
                      <SpeakerWaveIcon className="w-6 h-6 text-slate-700" title="Audio unavailable" />
                  )}
              </div>
              {isLoading ? (
                <div className="flex items-center space-x-2 mt-2">
                  <LoaderIcon className="w-5 h-5 animate-spin text-cyan-400" />
                  <p>ACCESSING DATABASE...</p>
                </div>
              ) : (
                renderDescription()
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