import React, { useState, useEffect, useCallback } from 'react';
import { RobotPart } from '../types';
import RobotModel from './RobotModel';
import Sidebar from './Sidebar';
import { getPartDescription } from '../services/geminiService';

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
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);

    useEffect(() => {
        // Animate panel in on mount
        setTimeout(() => setIsPanelVisible(true), 100);
    }, []);

    const handleSelectPart = useCallback(async (partId: string | null) => {
        if (!partId) {
            setSelectedPart(null);
            setGeminiDescription('');
            return;
        }
        const part = robotPartsData.find(p => p.id === partId);
        if (part) {
            setSelectedPart(part);
            setIsLoading(true);
            setGeminiDescription('');

            try {
                const desc = await getPartDescription(part.name);
                setGeminiDescription(desc);

            } catch (error) {
                console.error("Error during Gemini API fetch:", error);
                // On any error, fall back to the onboard data cache.
                setGeminiDescription(`${part.description} [UPLINK INTERRUPTED. REVERTING TO ONBOARD DATA CACHE.]`);
            } finally {
                setIsLoading(false);
            }
        }
    }, []);


    return (
        <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden p-4 md:p-8 gap-8 animate-fade-in">
             <main className="flex-1 flex flex-col items-center justify-center h-full">
                <h1 className="text-4xl font-extrabold text-cyan-300 tracking-wider text-center mb-4 uppercase">
                    Robot Explorer
                </h1>
                <RobotModel selectedPartId={selectedPart?.id || null} onSelectPart={handleSelectPart} />
            </main>
            <Sidebar
                selectedPart={selectedPart}
                geminiDescription={geminiDescription}
                isLoading={isLoading}
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