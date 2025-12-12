import React, { useState, useEffect, useCallback } from 'react';
import { RobotPart } from '../types';
import RobotModel from './RobotModel';
import Sidebar from './Sidebar';

const robotPartsData: RobotPart[] = [
    { id: 'head', name: 'Cognitive Core', description: 'The robot\'s main thinking and sensing unit.' },
    { id: 'torso', name: 'Energy Hub', description: 'Houses the primary power source, energizing all robotic systems.' },
    { id: 'left_arm', name: 'Utility Manipulator', description: 'A versatile arm for interacting with the world.' },
    { id: 'right_arm', name: 'Heavy-Duty Gripper', description: 'A strong arm for lifting and carrying objects.' },
    { id: 'left_leg', name: 'Stabilizer Leg', description: 'Helps the robot keep its balance.' },
    { id: 'right_leg', name: 'Propulsion Leg', description: 'Helps the robot move around.' },
];

const RobotExplorer: React.FC = () => {
    const [selectedPart, setSelectedPart] = useState<RobotPart | null>(null);
    const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);

    useEffect(() => {
        // Animate panel in on mount
        setTimeout(() => setIsPanelVisible(true), 100);
    }, []);

    const handleSelectPart = useCallback((partId: string | null) => {
        if (!partId) {
            setSelectedPart(null);
            return;
        }
        const part = robotPartsData.find(p => p.id === partId);
        if (part) {
            setSelectedPart(part);
        }
    }, []);


    return (
        <div className="flex flex-col h-screen w-full overflow-hidden p-4 md:p-8 animate-fade-in">
            <header className="flex-shrink-0">
                <h1 className="text-5xl md:text-6xl font-extrabold text-center text-cyan-300 tracking-widest uppercase mb-4">
                    Robot Explorer
                </h1>
            </header>
             <div className="flex flex-col md:flex-row flex-grow min-h-0 gap-8 mt-4">
                <main className="flex-1 flex items-center justify-center h-full">
                    <RobotModel selectedPartId={selectedPart?.id || null} onSelectPart={handleSelectPart} />
                </main>
                <Sidebar
                    selectedPart={selectedPart}
                    isVisible={isPanelVisible}
                />
            </div>
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