import React from 'react';

interface BodyBuilderProps {
  muscle: number; 
  health: number; 
  status: 'NORMAL' | 'PUMPED' | 'SICK' | 'CHUBBY';
  bodyFat: number;
  isPoisoned: boolean;
  isEating: boolean;
  isHappy: boolean;
}

export const BodyBuilder: React.FC<BodyBuilderProps> = ({ muscle, health, status, bodyFat, isPoisoned, isEating, isHappy }) => {
  // --- Evolution Logic ---
  let stage = 1;
  if (muscle >= 80) stage = 3;
  else if (muscle >= 40) stage = 2;

  // --- Dimensions & Colors ---
  const fatMultiplier = bodyFat * 2;
  
  // Base Colors
  let skinColor = "#fb923c"; // Stage 1 Orange
  let bellyColor = "#fde047"; // Yellow
  const flameInner = "#fef08a";
  const flameOuter = "#ef4444";
  
  if (stage === 2) {
      skinColor = "#dc2626"; // Stage 2 Redder
  } else if (stage === 3) {
      skinColor = "#f97316"; // Stage 3 Orange
  }

  // Visual Filters
  let filter = "";
  if (isPoisoned) {
    // Poison purple tint
    filter = "hue-rotate(270deg) saturate(150%) brightness(0.8)"; 
  } else if (status === 'SICK') {
    filter = "hue-rotate(90deg) grayscale(40%)";
  }

  // Flame Size
  const flameScale = stage === 3 ? 1.5 : stage === 2 ? 1.2 : 0.8;

  return (
    <div className="relative w-full h-full flex justify-center items-center transition-all duration-700 ease-in-out">
      {/* Poison Bubbles Overlay */}
      {isPoisoned && (
        <div className="absolute inset-0 z-50 pointer-events-none flex justify-center items-center">
            <div className="absolute -top-10 animate-bounce text-4xl">☠️</div>
            <div className="absolute top-0 right-20 w-4 h-4 rounded-full bg-purple-600/80 animate-float" style={{ animationDelay: '0s' }} />
            <div className="absolute top-10 left-20 w-6 h-6 rounded-full bg-purple-500/80 animate-float" style={{ animationDelay: '0.5s' }} />
            <div className="absolute -top-5 right-10 w-3 h-3 rounded-full bg-purple-700/80 animate-float" style={{ animationDelay: '1s' }} />
        </div>
      )}

      <svg
        viewBox="0 0 400 400"
        className={`h-full w-auto drop-shadow-2xl transition-all duration-500 ${isEating ? 'animate-chew' : ''}`}
        style={{ filter }}
      >
        <style>
            {`
            @keyframes chew {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.95) scaleX(1.02); }
            }
            .animate-chew {
                animation: chew 0.3s infinite;
            }
            `}
        </style>

        {/* Aura for Pumped/Evolution */}
        {(status === 'PUMPED' || muscle > 75) && !isPoisoned && (
           <g className="animate-pulse opacity-30">
             <circle cx="200" cy="220" r={160 + (muscle/2)} fill="url(#fireGradient)" />
           </g>
        )}
        <defs>
            <radialGradient id="fireGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
             <linearGradient id="wingTeal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
        </defs>

        <g transform="translate(200, 220)">
            
            {/* --- TAIL & FLAME --- */}
            <g transform={stage === 3 ? "translate(80, 50)" : "translate(60, 60)"}>
                <path 
                    d={
                        stage === 3 
                        ? "M -20 0 Q 20 20 80 -40 L 60 -50 Q 10 0 -20 -30" 
                        : "M -10 0 Q 30 10 50 -30 L 35 -35 Q 20 0 -10 -20" 
                    }
                    fill={skinColor}
                />
                
                {/* Flame Animation (Weaker if poisoned) */}
                <g transform={`translate(${stage === 3 ? 70 : 45}, -40) scale(${isPoisoned ? flameScale * 0.5 : flameScale})`}>
                    <path d="M 0 0 Q 10 -30 0 -60 Q -10 -30 0 0" fill={flameOuter} className="animate-pulse">
                         <animate attributeName="d" values="M 0 0 Q 10 -30 0 -60 Q -10 -30 0 0; M 0 0 Q 15 -35 5 -65 Q -5 -25 0 0; M 0 0 Q 10 -30 0 -60 Q -10 -30 0 0" dur="0.8s" repeatCount="indefinite" />
                    </path>
                    <path d="M 0 -10 Q 5 -30 0 -50 Q -5 -30 0 -10" fill={flameInner} />
                </g>
            </g>

            {/* --- BODY --- */}
            {stage === 1 && (
                <g>
                    <ellipse cx="0" cy="20" rx={60 + fatMultiplier} ry={70 - (fatMultiplier/2)} fill={skinColor} />
                    <ellipse cx="0" cy="25" rx={40 + fatMultiplier} ry={55 - (fatMultiplier/2)} fill={bellyColor} />
                </g>
            )}

            {stage === 2 && (
                <g>
                    <path d={`M -${50 + fatMultiplier} -20 L -${40 + fatMultiplier} 80 L ${40 + fatMultiplier} 80 L ${50 + fatMultiplier} -20 Z`} fill={skinColor} stroke={skinColor} strokeWidth="20" strokeLinejoin="round" />
                     <path d={`M -${30 + fatMultiplier} -10 L -${25 + fatMultiplier} 70 L ${25 + fatMultiplier} 70 L ${30 + fatMultiplier} -10 Z`} fill={bellyColor} opacity="0.9" />
                </g>
            )}

            {stage === 3 && (
                <g transform="translate(0, -20)">
                    <ellipse cx="0" cy="40" rx={80 + fatMultiplier} ry={90 - (fatMultiplier/2)} fill={skinColor} />
                    <ellipse cx="0" cy="45" rx={50 + fatMultiplier} ry={70 - (fatMultiplier/2)} fill={bellyColor} />
                </g>
            )}


            {/* --- LEGS --- */}
            <g transform="translate(0, 80)">
                <ellipse cx="-40" cy="0" rx="25" ry={stage === 3 ? 30 : 15} fill={skinColor} />
                <ellipse cx="40" cy="0" rx="25" ry={stage === 3 ? 30 : 15} fill={skinColor} />
                <path d="M -50 10 L -45 20 M -40 12 L -35 22" stroke="white" strokeWidth="3" />
                <path d="M 50 10 L 45 20 M 40 12 L 35 22" stroke="white" strokeWidth="3" />
            </g>


            {/* --- ARMS --- */}
            <g transform="translate(0, 0)">
                 <path d={stage === 3 ? `M -50 -10 Q -90 10 -${70 + (muscle/4)} 40` : `M -40 0 Q -70 20 -60 40`} stroke={skinColor} strokeWidth={stage === 1 ? 18 : 25} strokeLinecap="round" fill="none" />
                 <path d={stage === 3 ? `M 50 -10 Q 90 10 ${70 + (muscle/4)} 40` : `M 40 0 Q 70 20 60 40`} stroke={skinColor} strokeWidth={stage === 1 ? 18 : 25} strokeLinecap="round" fill="none" />
            </g>


            {/* --- HEAD --- */}
            <g transform={stage === 3 ? "translate(0, -90)" : stage === 2 ? "translate(0, -60)" : "translate(0, -50)"}>
                
                {stage === 1 && ( <circle cx="0" cy="0" r={55 + (bodyFat)} fill={skinColor} /> )}
                
                {stage === 2 && (
                    <g>
                        <path d="M 0 -40 L -20 -70 L 10 -45" fill={skinColor} />
                        <ellipse cx="0" cy="0" rx={50 + (bodyFat)} ry={55} fill={skinColor} />
                    </g>
                )}

                {stage === 3 && (
                    <g>
                        <path d="M -30 50 Q 0 80 30 50 L 30 0 L -30 0 Z" fill={skinColor} />
                        <path d="M -20 -40 L -35 -80 L -10 -50" fill={skinColor} />
                        <path d="M 20 -40 L 35 -80 L 10 -50" fill={skinColor} />
                        <ellipse cx="0" cy="-10" rx={55 + (bodyFat)} ry={60} fill={skinColor} />
                    </g>
                )}

                {/* Face Details */}
                <g transform="translate(0, 0)">
                    {/* Eyes */}
                    {status === 'SICK' || isPoisoned ? (
                         // Sick Eyes (X)
                         <g>
                            <path d="M -25 -10 L -15 0 M -25 0 L -15 -10" stroke="#333" strokeWidth="3" />
                            <path d="M 15 -10 L 25 0 M 15 0 L 25 -10" stroke="#333" strokeWidth="3" />
                         </g>
                    ) : (
                        <g>
                            {/* Eye Shape depends on stage and happiness */}
                            {stage === 1 ? (
                                // Cute Eyes
                                <g>
                                    <circle cx="-20" cy="-10" r="6" fill="#1e293b" />
                                    <circle cx="-18" cy="-12" r="2" fill="white" />
                                    <circle cx="20" cy="-10" r="6" fill="#1e293b" />
                                    <circle cx="22" cy="-12" r="2" fill="white" />
                                    {/* Cheerful eye curve if happy */}
                                    {isHappy && (
                                        <g>
                                            <path d="M -26 -6 Q -20 0 -14 -6" stroke={skinColor} strokeWidth="3" fill="none" />
                                            <path d="M 14 -6 Q 20 0 26 -6" stroke={skinColor} strokeWidth="3" fill="none" />
                                        </g>
                                    )}
                                </g>
                            ) : (
                                // Angry/Fierce Eyes
                                <g>
                                    {isHappy ? (
                                        // Happy Fierce Eyes (inverted curve)
                                        <g>
                                             <path d="M -30 -10 Q -20 -20 -10 -10" stroke="white" strokeWidth="4" fill="none" />
                                             <path d="M 10 -10 Q 20 -20 30 -10" stroke="white" strokeWidth="4" fill="none" />
                                        </g>
                                    ) : (
                                        <g>
                                            <path d="M -30 -15 L -10 -5 L -10 -15 Z" fill="white" />
                                            <circle cx="-18" cy="-10" r="3" fill="#1e293b" />
                                            <path d="M 30 -15 L 10 -5 L 10 -15 Z" fill="white" />
                                            <circle cx="18" cy="-10" r="3" fill="#1e293b" />
                                            <path d="M -35 -20 L -10 -10" stroke={skinColor === "#dc2626" ? "#7f1d1d" : "#c2410c"} strokeWidth="3" />
                                            <path d="M 35 -20 L 10 -10" stroke={skinColor === "#dc2626" ? "#7f1d1d" : "#c2410c"} strokeWidth="3" />
                                        </g>
                                    )}
                                </g>
                            )}
                        </g>
                    )}

                    {/* Nostrils */}
                    <circle cx="-5" cy="10" r="1" fill="#78350f" opacity="0.6" />
                    <circle cx="5" cy="10" r="1" fill="#78350f" opacity="0.6" />
                    
                    {/* Mouth */}
                    {isEating ? (
                         // Chewing Mouth (O shape that animates via scaleY on parent)
                        <ellipse cx="0" cy="20" rx="10" ry="12" fill="#78350f" />
                    ) : (
                        <path 
                            d={
                                status === 'SICK' || isPoisoned ? "M -10 25 Q 0 20 10 25" : // Sad
                                isHappy ? "M -15 20 Q 0 35 15 20" : // Happy smile
                                "M -15 20 Q 0 28 15 20" // Normal/Fierce
                            } 
                            stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round"
                        />
                    )}
                    
                    {/* Fangs (Stage 2/3) - Hide if sick or happy smile (looks weird) */}
                    {stage > 1 && status !== 'SICK' && !isPoisoned && !isHappy && !isEating && (
                         <g>
                             <path d="M -12 21 L -12 26 L -8 22" fill="white" />
                             <path d="M 12 21 L 12 26 L 8 22" fill="white" />
                         </g>
                    )}
                </g>
            </g>
        </g>
      </svg>
    </div>
  );
};