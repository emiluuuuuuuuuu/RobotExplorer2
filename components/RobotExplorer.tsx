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

    const handleSelectPart = useCallback((partId: string | null) => {
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

            getPartDescription(part.name)
                .then(desc => {
                    setGeminiDescription(desc);
                    setIsLoading(false); // Text is ready
                    // Now fetch audio for the new description
                    return getTextToSpeech(desc);
                })
                .then(audioBase64 => {
                    setAudioData(audioBase64);
                })
                .catch(err => {
                    console.error("Error fetching data from Gemini:", err);
                    setGeminiDescription('Error fetching data from Gemini.');
                    setIsLoading(false);
                })
                .finally(() => {
                    setIsAudioLoading(false); // Audio process is finished (success or fail)
                });
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
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = animationStyles;
document.head.appendChild(styleSheet);


export default RobotExplorer;