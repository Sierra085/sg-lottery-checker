import React from 'react';

const CONFETTI_COUNT = 100;

export const Confetti: React.FC = () => {
    // Generate random properties for each confetti piece
    const confetti = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
        const style: React.CSSProperties = {
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
            transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random() * 0.5})`,
        };
        return <div key={i} className="confetti-piece" style={style} />;
    });

    return (
        <>
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {confetti}
            </div>
            <style>
                {`
                    @keyframes fall {
                        0% { top: -10%; opacity: 1; }
                        100% { top: 110%; opacity: 0; }
                    }

                    .confetti-piece {
                        position: absolute;
                        width: 8px;
                        height: 16px;
                        border-radius: 4px;
                        animation-name: fall;
                        animation-timing-function: linear;
                        animation-iteration-count: infinite;
                    }
                `}
            </style>
        </>
    );
};
