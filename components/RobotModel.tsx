import React, { useState } from 'react';

interface RobotModelProps {
    selectedPartId: string | null;
    onSelectPart: (partId: string) => void;
}

const RobotPart: React.FC<{
    id: string;
    d: string;
    onSelect: () => void;
    isHovered: boolean;
    isSelected: boolean;
    onHoverChange: (isHovered: boolean) => void;
}> = ({ id, d, onSelect, isHovered, isSelected, onHoverChange }) => {
    // Dynamic classes based on state
    const fillClass = isSelected 
        ? 'fill-cyan-500' 
        : isHovered 
        ? 'fill-slate-600' 
        : 'fill-slate-800';
    
    const strokeClass = isSelected 
        ? 'stroke-cyan-200' 
        : isHovered 
        ? 'stroke-cyan-400' 
        : 'stroke-slate-950';
        
    const transformClass = isHovered || isSelected ? 'scale-105' : 'scale-100';
    
    // Add glow effect using drop-shadow
    const filterClass = isSelected 
        ? 'drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]' 
        : isHovered 
        ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' 
        : '';
    
    return (
        <path
            id={id}
            d={d}
            onClick={onSelect}
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
            className={`cursor-pointer transition-all duration-300 ease-out ${fillClass} ${strokeClass} origin-center ${transformClass} ${filterClass}`}
            style={{ transformBox: 'fill-box' }}
            strokeWidth={isSelected || isHovered ? "3" : "2"}
            strokeLinejoin="round"
        />
    );
};


const RobotModel: React.FC<RobotModelProps> = ({ selectedPartId, onSelectPart }) => {
    const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);

    const parts = [
        // Head: rounded square with a visor slit
        { id: 'head', d: 'M130 70 a5,5 0 0 1 5,-5 h30 a5,5 0 0 1 5,5 v30 a5,5 0 0 1 -5,5 h-30 a5,5 0 0 1 -5,-5 z M135 85 h30 v5 h-30 z' },
        // Torso: a bigger rounded rectangle
        { id: 'torso', d: 'M120 115 a5,5 0 0 1 5,-5 h50 a5,5 0 0 1 5,5 v60 a5,5 0 0 1 -5,5 h-50 a5,5 0 0 1 -5,-5 z' },
        // Left Arm: arm segment + rounded hand
        { id: 'left_arm', d: 'M100 125 h15 v40 h-15 z M95 165 a5,5 0 0 1 5,-5 h15 a5,5 0 0 1 5,5 v10 h-25 z' },
        // Right Arm: arm segment + rounded hand
        { id: 'right_arm', d: 'M185 125 h15 v40 h-15 z M180 165 h25 v10 a5,5 0 0 1 -5,5 h-15 a5,5 0 0 1 -5,-5 z' },
        // Left Leg: leg segment + foot
        { id: 'left_leg', d: 'M130 180 h20 v40 h-20 z M125 220 h30 v10 h-30 z' },
        // Right Leg: leg segment + foot
        { id: 'right_leg', d: 'M150 180 h20 v40 h-20 z M145 220 h30 v10 h-30 z' },
    ];

    return (
        <svg viewBox="0 0 300 300" className="w-full h-full max-w-2xl max-h-2xl drop-shadow-2xl">
            <g>
                 {/* Non-interactive neck part */}
                <path d="M145 105 h10 v10 h-10 z" className="fill-slate-800 stroke-slate-950" strokeWidth="2" />
                {parts.map(part => (
                    <RobotPart
                        key={part.id}
                        id={part.id}
                        d={part.d}
                        onSelect={() => onSelectPart(part.id)}
                        isHovered={hoveredPartId === part.id}
                        isSelected={selectedPartId === part.id}
                        onHoverChange={(isHovered) => setHoveredPartId(isHovered ? part.id : null)}
                    />
                ))}
            </g>
        </svg>
    );
};

export default RobotModel;