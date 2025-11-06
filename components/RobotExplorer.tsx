import React, { useState, useEffect, useCallback } from 'react';
import { RobotPart } from '../types';
import RobotModel from './RobotModel';
import Sidebar from './Sidebar';
import { getPartDescription, getTextToSpeech } from '../services/geminiService';

const robotPartsData: RobotPart[] = [
    { id: 'head', name: 'Cognitive Core', description: 'The robot\'s main thinking and sensing unit.' },
    { id: 'torso', name: 'Energy Hub', description: 'Houses the power source that keeps the robot going.' },
    { id: 'left_arm', name: 'Utility Manipulator', description: 'A versatile arm for interacting with the world.' },
    { id: 'right_arm', name: 'Heavy-Duty Gripper', description: 'A strong arm for lifting and carrying objects.' },
    { id: 'left_leg', name: 'Stabilizer Leg', description: 'Helps the robot keep its balance.' },
    { id: 'right_leg', name: 'Propulsion Leg', description: 'Helps the robot move around.' },
];

const RobotExplorer: React.FC = () => {
    const [selectedPart, setSelectedPart] = useState<RobotPart | null>(null);
    const [geminiDescription, setGeminiDescription] = useState<string>('');
    const [audioData, setAudioData] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
    const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);

    useEffect(() => {
        // Animate panel in on mount
        setTimeout(() => setIsPanelVisible(true), 100);
    }, []);

    const handleSelectPart = useCallback(async (partId: string | null) => {
        if (!partId) {
            setSelectedPart(null);
            setGeminiDescription('');
            setAudioData(null);
            return;
        }
        const part = robotPartsData.find(p => p.id === partId);
        if (part) {
            setSelectedPart(part);
            setIsLoading(true);
            setIsAudioLoading(true);
            setGeminiDescription('');
            setAudioData(null);

            try {
                const desc = await getPartDescription(part.name);
                setGeminiDescription(desc);
                setIsLoading(false);

                const audioBase64 = await getTextToSpeech(desc);
                setAudioData(audioBase64);

            } catch (error) {
                console.error("Error during Gemini API fetch:", error);
                // On any error, fall back to the onboard data cache.
                setGeminiDescription(`${part.description} [UPLINK INTERRUPTED. REVERTING TO ONBOARD DATA CACHE.]`);
                setIsLoading(false);
                setAudioData(null);
            } finally {
                // Ensure audio loading spinner always stops.
                setIsAudioLoading(false);
            }
        }
    }, []);


    return (
        <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden p-4 md:p-8 gap-8 animate-fade-in">
             <main className="flex-1 flex items-center justify-center h-full">
                <RobotModel selectedPartId={selectedPart?.id || null} onSelectPart={handleSelectPart} />
            </main>
            <Sidebar
                selectedPart={selectedPart}
                geminiDescription={geminiDescription}
                audioData={audioData}
                isLoading={isLoading}
                isAudioLoading={isAudioLoading}
                isVisible={isPanelVisible}
            />
        </div>
    );
};

// Simple fade-in animation for Tailwind
const animationStyles = `
@keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
}
@keyframes blink {
    50% { opacity: 0; }
}
.blinking-cursor {
    animation: blink 1s step-end infinite;
    font-weight: bold;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = animationStyles;
document.head.appendChild(styleSheet);


export default RobotExplorer;