import { GameState } from "../types";

export const generateShareHtml = (gameState: GameState): string => {
  // Serialize state. Note: Date objects become ISO strings.
  const serializedState = JSON.stringify(gameState);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Macho AI Trainer (Portable)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18.3.1",
        "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
        "lucide-react": "https://esm.sh/lucide-react@0.378.0",
        "@google/genai": "https://esm.sh/@google/genai@^1.34.0"
      }
    }
    </script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      @keyframes float { 0% { transform: translateY(0px); opacity: 1; } 100% { transform: translateY(-50px); opacity: 0; } }
      .animate-float { animation: float 2s ease-out forwards; }
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }
      .pulse-anim { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      @keyframes chew { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.95) scaleX(1.02); } }
      .animate-chew { animation: chew 0.3s infinite; }
    </style>
</head>
<body class="bg-slate-900 text-white overflow-hidden h-screen w-screen selection:bg-purple-500">
    <div id="root"></div>

    <script type="text/babel" data-type="module">
    import React, { useState, useRef, useEffect } from 'react';
    import { createRoot } from 'react-dom/client';
    import { Upload, RotateCcw, Utensils, Share2, Camera, Brain, Lock, Download, UserPlus, Dumbbell } from 'lucide-react';
    import { GoogleGenAI, Type } from "@google/genai";

    // --- INITIAL STATE ---
    const INITIAL_FROM_SHARE = ${serializedState};

    const TARGETS = {
      calories: 2200,
      protein: 140,
      fat: 70,
      carbs: 250,
    };

    // --- COMPONENT: METERS ---
    const Meters = ({ current, targets }) => {
        const MacroBar = ({ label, current, max, color, unit }) => {
            const percent = Math.min(100, (current / max) * 100);
            const isOver = current > max;
            return (
                <div className="mb-2">
                <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">
                    <span className="text-slate-300">{label}</span>
                    <span className={\`\${isOver ? 'text-red-400' : 'text-slate-400'}\`}>
                    {Math.floor(current)} / {max}{unit}
                    </span>
                </div>
                <div className="h-2 md:h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative">
                    <div className={\`h-full transition-all duration-1000 ease-out \${color}\`} style={{ width: \`\${percent}%\` }} />
                    {isOver && <div className="absolute top-0 right-0 bottom-0 w-1 bg-red-500 animate-pulse" />}
                </div>
                </div>
            );
        };
        return (
            <div className="w-full max-w-md bg-slate-800/90 p-4 rounded-2xl backdrop-blur-md border border-slate-700 shadow-2xl z-20">
                <h3 className="text-sm font-bold text-center text-slate-200 mb-3 border-b border-slate-700 pb-2">1日の目標摂取量</h3>
                <MacroBar label="カロリー" current={current.calories} max={targets.calories} unit="kcal" color={current.calories > targets.calories ? "bg-red-500" : "bg-gradient-to-r from-green-500 to-emerald-400"} />
                <div className="grid grid-cols-3 gap-2 mt-3">
                    <MacroBar label="タンパク質" current={current.protein} max={targets.protein} unit="g" color="bg-blue-500" />
                    <MacroBar label="脂質" current={current.fat} max={targets.fat} unit="g" color="bg-yellow-500" />
                    <MacroBar label="炭水化物" current={current.carbs} max={targets.carbs} unit="g" color="bg-orange-500" />
                </div>
            </div>
        );
    };

    // --- COMPONENT: BODYBUILDER ---
    const BodyBuilder = ({ muscle, health, status, bodyFat, isPoisoned, isEating, isHappy }) => {
        let stage = 1;
        if (muscle >= 80) stage = 3;
        else if (muscle >= 40) stage = 2;

        const fatMultiplier = bodyFat * 2;
        let skinColor = "#fb923c"; 
        let bellyColor = "#fde047"; 
        const flameInner = "#fef08a";
        const flameOuter = "#ef4444";
        
        if (stage === 2) { skinColor = "#dc2626"; } 
        else if (stage === 3) { skinColor = "#f97316"; }

        let filter = "";
        if (isPoisoned) { filter = "hue-rotate(270deg) saturate(150%) brightness(0.8)"; } 
        else if (status === 'SICK') { filter = "hue-rotate(90deg) grayscale(40%)"; }

        const flameScale = stage === 3 ? 1.5 : stage === 2 ? 1.2 : 0.8;

        return (
            <div className="relative w-full h-full flex justify-center items-center transition-all duration-700 ease-in-out">
                {isPoisoned && (
                    <div className="absolute inset-0 z-50 pointer-events-none flex justify-center items-center">
                        <div className="absolute -top-10 animate-bounce text-4xl">☠️</div>
                        <div className="absolute top-0 right-20 w-4 h-4 rounded-full bg-purple-600/80 animate-float" style={{ animationDelay: '0s' }} />
                        <div className="absolute top-10 left-20 w-6 h-6 rounded-full bg-purple-500/80 animate-float" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute -top-5 right-10 w-3 h-3 rounded-full bg-purple-700/80 animate-float" style={{ animationDelay: '1s' }} />
                    </div>
                )}
                <svg viewBox="0 0 400 400" className={\`h-full w-auto drop-shadow-2xl transition-all duration-500 \${isEating ? 'animate-chew' : ''}\`} style={{ filter }}>
                     <defs>
                        <radialGradient id="fireGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                     {(status === 'PUMPED' || muscle > 75) && !isPoisoned && (
                        <g className="animate-pulse opacity-30"><circle cx="200" cy="220" r={160 + (muscle/2)} fill="url(#fireGradient)" /></g>
                     )}
                     <g transform="translate(200, 220)">
                        <g transform={stage === 3 ? "translate(80, 50)" : "translate(60, 60)"}>
                             <path d={stage === 3 ? "M -20 0 Q 20 20 80 -40 L 60 -50 Q 10 0 -20 -30" : "M -10 0 Q 30 10 50 -30 L 35 -35 Q 20 0 -10 -20"} fill={skinColor} />
                             <g transform={\`translate(\${stage === 3 ? 70 : 45}, -40) scale(\${isPoisoned ? flameScale * 0.5 : flameScale})\`}>
                                <path d="M 0 0 Q 10 -30 0 -60 Q -10 -30 0 0" fill={flameOuter} className="animate-pulse">
                                     <animate attributeName="d" values="M 0 0 Q 10 -30 0 -60 Q -10 -30 0 0; M 0 0 Q 15 -35 5 -65 Q -5 -25 0 0; M 0 0 Q 10 -30 0 -60 Q -10 -30 0 0" dur="0.8s" repeatCount="indefinite" />
                                </path>
                                <path d="M 0 -10 Q 5 -30 0 -50 Q -5 -30 0 -10" fill={flameInner} />
                             </g>
                        </g>
                        {stage === 1 && (
                            <g>
                                <ellipse cx="0" cy="20" rx={60 + fatMultiplier} ry={70 - (fatMultiplier/2)} fill={skinColor} />
                                <ellipse cx="0" cy="25" rx={40 + fatMultiplier} ry={55 - (fatMultiplier/2)} fill={bellyColor} />
                            </g>
                        )}
                        {stage === 2 && (
                            <g>
                                <path d={\`M -\${50 + fatMultiplier} -20 L -\${40 + fatMultiplier} 80 L \${40 + fatMultiplier} 80 L \${50 + fatMultiplier} -20 Z\`} fill={skinColor} stroke={skinColor} strokeWidth="20" strokeLinejoin="round" />
                                <path d={\`M -\${30 + fatMultiplier} -10 L -\${25 + fatMultiplier} 70 L \${25 + fatMultiplier} 70 L \${30 + fatMultiplier} -10 Z\`} fill={bellyColor} opacity="0.9" />
                            </g>
                        )}
                        {stage === 3 && (
                            <g transform="translate(0, -20)">
                                <ellipse cx="0" cy="40" rx={80 + fatMultiplier} ry={90 - (fatMultiplier/2)} fill={skinColor} />
                                <ellipse cx="0" cy="45" rx={50 + fatMultiplier} ry={70 - (fatMultiplier/2)} fill={bellyColor} />
                            </g>
                        )}
                        <g transform="translate(0, 80)">
                            <ellipse cx="-40" cy="0" rx="25" ry={stage === 3 ? 30 : 15} fill={skinColor} />
                            <ellipse cx="40" cy="0" rx="25" ry={stage === 3 ? 30 : 15} fill={skinColor} />
                            <path d="M -50 10 L -45 20 M -40 12 L -35 22" stroke="white" strokeWidth="3" />
                            <path d="M 50 10 L 45 20 M 40 12 L 35 22" stroke="white" strokeWidth="3" />
                        </g>
                         <g transform="translate(0, 0)">
                            <path d={stage === 3 ? \`M -50 -10 Q -90 10 -\${70 + (muscle/4)} 40\` : \`M -40 0 Q -70 20 -60 40\`} stroke={skinColor} strokeWidth={stage === 1 ? 18 : 25} strokeLinecap="round" fill="none" />
                            <path d={stage === 3 ? \`M 50 -10 Q 90 10 \${70 + (muscle/4)} 40\` : \`M 40 0 Q 70 20 60 40\`} stroke={skinColor} strokeWidth={stage === 1 ? 18 : 25} strokeLinecap="round" fill="none" />
                        </g>
                        <g transform={stage === 3 ? "translate(0, -90)" : stage === 2 ? "translate(0, -60)" : "translate(0, -50)"}>
                             {stage === 1 && ( <circle cx="0" cy="0" r={55 + (bodyFat)} fill={skinColor} /> )}
                             {stage === 2 && (<g><path d="M 0 -40 L -20 -70 L 10 -45" fill={skinColor} /><ellipse cx="0" cy="0" rx={50 + (bodyFat)} ry={55} fill={skinColor} /></g>)}
                             {stage === 3 && (<g><path d="M -30 50 Q 0 80 30 50 L 30 0 L -30 0 Z" fill={skinColor} /><path d="M -20 -40 L -35 -80 L -10 -50" fill={skinColor} /><path d="M 20 -40 L 35 -80 L 10 -50" fill={skinColor} /><ellipse cx="0" cy="-10" rx={55 + (bodyFat)} ry={60} fill={skinColor} /></g>)}
                             <g transform="translate(0, 0)">
                                {(status === 'SICK' || isPoisoned) ? (
                                    <g><path d="M -25 -10 L -15 0 M -25 0 L -15 -10" stroke="#333" strokeWidth="3" /><path d="M 15 -10 L 25 0 M 15 0 L 25 -10" stroke="#333" strokeWidth="3" /></g>
                                ) : (
                                    <g>
                                        {stage === 1 ? (
                                            <g>
                                                <circle cx="-20" cy="-10" r="6" fill="#1e293b" /><circle cx="-18" cy="-12" r="2" fill="white" />
                                                <circle cx="20" cy="-10" r="6" fill="#1e293b" /><circle cx="22" cy="-12" r="2" fill="white" />
                                                {isHappy && <g><path d="M -26 -6 Q -20 0 -14 -6" stroke={skinColor} strokeWidth="3" fill="none" /><path d="M 14 -6 Q 20 0 26 -6" stroke={skinColor} strokeWidth="3" fill="none" /></g>}
                                            </g>
                                        ) : (
                                            <g>
                                                {isHappy ? (
                                                     <g><path d="M -30 -10 Q -20 -20 -10 -10" stroke="white" strokeWidth="4" fill="none" /><path d="M 10 -10 Q 20 -20 30 -10" stroke="white" strokeWidth="4" fill="none" /></g>
                                                ) : (
                                                    <g>
                                                        <path d="M -30 -15 L -10 -5 L -10 -15 Z" fill="white" /><circle cx="-18" cy="-10" r="3" fill="#1e293b" />
                                                        <path d="M 30 -15 L 10 -5 L 10 -15 Z" fill="white" /><circle cx="18" cy="-10" r="3" fill="#1e293b" />
                                                        <path d="M -35 -20 L -10 -10" stroke={skinColor === "#dc2626" ? "#7f1d1d" : "#c2410c"} strokeWidth="3" />
                                                        <path d="M 35 -20 L 10 -10" stroke={skinColor === "#dc2626" ? "#7f1d1d" : "#c2410c"} strokeWidth="3" />
                                                    </g>
                                                )}
                                            </g>
                                        )}
                                    </g>
                                )}
                                <circle cx="-5" cy="10" r="1" fill="#78350f" opacity="0.6" /><circle cx="5" cy="10" r="1" fill="#78350f" opacity="0.6" />
                                {isEating ? (
                                    <ellipse cx="0" cy="20" rx="10" ry="12" fill="#78350f" />
                                ) : (
                                    <path d={ (status === 'SICK' || isPoisoned) ? "M -10 25 Q 0 20 10 25" : isHappy ? "M -15 20 Q 0 35 15 20" : "M -15 20 Q 0 28 15 20" } stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round" />
                                )}
                                {stage > 1 && status !== 'SICK' && !isPoisoned && !isHappy && !isEating && (
                                     <g><path d="M -12 21 L -12 26 L -8 22" fill="white" /><path d="M 12 21 L 12 26 L 8 22" fill="white" /></g>
                                )}
                             </g>
                        </g>
                     </g>
                </svg>
            </div>
        );
    }

    // --- GEMINI SERVICE (SDK Version for Export) ---
    const analyzeFoodImage = async (apiKey, base64Data, mimeType) => {
        try {
             const ai = new GoogleGenAI({ apiKey: apiKey });
             const modelId = "gemini-2.0-flash";

             const isPdf = mimeType === 'application/pdf';
             const promptText = isPdf 
                ? "あなたはフィットネス栄養士です。このドキュメント（メニュー、レシピ、食事リスト）を分析してください。食品（カレーやシチューなどの複合料理も含む）を特定し、栄養価を要約してください。nameとreasoningは必ず日本語で出力してください。"
                : "あなたはフィットネス栄養士です。この画像を分析してください。それが食べ物かどうか判定してください。重要：生の食材（野菜、肉）、単純な調理品（ステーキ）、複雑な料理（カレー、シチュー、スープ）など、あらゆる種類の食品を認識してください。表示されている部分の合計栄養成分（カロリー、タンパク質、脂質、炭水化物）を推定してください。ジャンクフードやお菓子、添加物の多そうな加工食品の場合は isUnhealthy を true にしてください。JSONを返してください。nameとreasoningは必ず日本語で出力してください。";

             const analysisSchema = {
                type: Type.OBJECT,
                properties: {
                    isFood: { type: Type.BOOLEAN, description: "True if the image/document contains ANY food item." },
                    name: { type: Type.STRING, description: "Short name of the food item found (in Japanese)." },
                    calories: { type: Type.INTEGER, description: "Estimated total calories (kcal)." },
                    protein_g: { type: Type.INTEGER, description: "Estimated protein in grams." },
                    fat_g: { type: Type.INTEGER, description: "Estimated fat in grams." },
                    carbs_g: { type: Type.INTEGER, description: "Estimated carbohydrates in grams." },
                    sugar_g: { type: Type.INTEGER, description: "Estimated sugar content in grams." },
                    isUnhealthy: { type: Type.BOOLEAN, description: "True if high in sugar, highly processed, contains many additives, or is 'junk food'." },
                    reasoning: { type: Type.STRING, description: "Short comment from the perspective of a fitness coach character (in Japanese)." },
                },
                required: ["isFood", "name", "calories", "protein_g", "fat_g", "carbs_g", "sugar_g", "isUnhealthy", "reasoning"],
             };

             const response = await ai.models.generateContent({
                model: modelId,
                contents: {
                    parts: [
                        { inlineData: { mimeType: mimeType, data: base64Data } },
                        { text: promptText }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: analysisSchema,
                    temperature: 0.4,
                },
             });

             const jsonText = response.text;
             if (!jsonText) throw new Error("No response text from Gemini");

             return JSON.parse(jsonText);

        } catch (error) {
            console.error("Gemini Analysis Error:", error);
            // Re-throw to be caught in handleFiles
            throw error; 
        }
    }

    // --- MAIN APP COMPONENT ---
    const App = () => {
        const [gameState, setGameState] = useState(INITIAL_FROM_SHARE);
        const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_api_key") || "");
        const [showKeyModal, setShowKeyModal] = useState(!apiKey);
        const [dragActive, setDragActive] = useState(false);
        const [floatingText, setFloatingText] = useState([]);
        const fileInputRef = useRef(null);
        const cameraInputRef = useRef(null);
        const logEndRef = useRef(null);

        useEffect(() => {
            logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, [gameState.history]);

        const saveKey = (key) => {
            if (!key) return;
            localStorage.setItem("gemini_api_key", key);
            setApiKey(key);
            setShowKeyModal(false);
        };

        const addFloatingText = (text, type) => {
            const id = Date.now();
            setFloatingText(prev => [...prev, { text, type, id }]);
            setTimeout(() => {
                setFloatingText(prev => prev.filter(ft => ft.id !== id));
            }, 2000);
        };

        const handleReset = () => {
            setGameState({
                muscle: 10,
                health: 100,
                status: 'NORMAL',
                isPoisoned: false,
                isEating: false,
                isHappy: false,
                history: [],
                loading: false,
                dailyTotals: { calories: 0, protein: 0, fat: 0, carbs: 0 },
            });
        };

        const handleShare = () => {
             addFloatingText("ブラウザのメニューから保存してください", "neutral");
        };

        const handleDownloadApp = () => {
             const htmlContent = document.documentElement.outerHTML;
             const blob = new Blob([htmlContent], { type: 'text/html' });
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = \`macho-ai-backup-\${new Date().toISOString().split('T')[0]}.html\`;
             document.body.appendChild(a);
             a.click();
             document.body.removeChild(a);
             URL.revokeObjectURL(url);
             addFloatingText("保存しました！", "good");
        };

        const processFile = (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64String = reader.result.split(',')[1];
                    try {
                        const analysis = await analyzeFoodImage(apiKey, base64String, file.type);
                        
                        setGameState(prev => {
                             if (!analysis.isFood) {
                                addFloatingText("食べ物じゃない！", "neutral");
                                return { ...prev }; 
                            }
                            let newIsPoisoned = prev.isPoisoned;
                            const isJunk = analysis.isUnhealthy || analysis.sugar_g > 30;
                            
                            if (isJunk) {
                                newIsPoisoned = true;
                                addFloatingText("毒だ...！", "bad");
                            } else if (newIsPoisoned) {
                                if (analysis.protein_g > 15 && analysis.sugar_g < 10) {
                                    newIsPoisoned = false;
                                    addFloatingText("解毒した！", "good");
                                } else {
                                    addFloatingText("健康的な食事が必要...", "bad");
                                }
                            }
        
                            const newTotals = {
                                calories: prev.dailyTotals.calories + analysis.calories,
                                protein: prev.dailyTotals.protein + analysis.protein_g,
                                fat: prev.dailyTotals.fat + analysis.fat_g,
                                carbs: prev.dailyTotals.carbs + analysis.carbs_g,
                            };
        
                            const proteinRatio = newTotals.protein / TARGETS.protein;
                            const currentMuscle = Math.min(100, proteinRatio * 100); 
        
                            const excessCalories = Math.max(0, newTotals.calories - TARGETS.calories);
                            const excessFat = Math.max(0, newTotals.fat - TARGETS.fat);
                            const excessCarbs = Math.max(0, newTotals.carbs - TARGETS.carbs);
                            let bodyFat = (excessCalories / 500) * 10 + (excessFat / 10) * 5 + (excessCarbs / 50) * 2;
        
                            let newStatus = prev.status;
                            let newIsHappy = false;
        
                             if (newIsPoisoned) {
                                 addFloatingText("毒状態になった", "bad");
                            } else if (newTotals.calories < 500 && newTotals.protein < 20) {
                                newStatus = 'NORMAL';
                            } else if (excessCalories > 500 || excessFat > 40) {
                                newStatus = 'CHUBBY';
                                addFloatingText("太ってきた！", "bad");
                            } else if (newTotals.protein >= TARGETS.protein * 0.4 && bodyFat < 20) {
                                newStatus = 'PUMPED';
                                if (!isJunk) { newIsHappy = true; addFloatingText("いいバルクだ！", "good"); }
                            } else if (analysis.name.includes("酒") || analysis.name.includes("ビール")) {
                                newStatus = 'SICK';
                                addFloatingText("二日酔いだ...", "bad");
                            } else {
                                newStatus = 'NORMAL';
                            }
                             if (!newIsPoisoned && analysis.protein_g > 10 && analysis.fat_g < 20 && !analysis.isUnhealthy) {
                                newIsHappy = true;
                            }
                            
                            const newLog = {
                                id: Date.now().toString(),
                                foodName: analysis.name,
                                effect: analysis.reasoning,
                                timestamp: new Date(), 
                                macros: { calories: analysis.calories, protein: analysis.protein_g, fat: analysis.fat_g, carbs: analysis.carbs_g }
                            };
        
                            return {
                                muscle: currentMuscle,
                                health: 100 - Math.min(50, bodyFat),
                                status: newStatus,
                                isPoisoned: newIsPoisoned,
                                isEating: true,
                                isHappy: newIsHappy,
                                history: [...prev.history, newLog],
                                loading: true, // Keep loading true during sequence
                                dailyTotals: newTotals,
                            };
                        });
                        setTimeout(() => setGameState(p => ({...p, isEating: false})), 2000);
                    } catch (e) {
                        console.error(e);
                        addFloatingText("エラー: キーを確認してください", "bad");
                        setShowKeyModal(true); // Open modal on error
                    }
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        };

        const handleFiles = async (fileList) => {
            if (!apiKey) { setShowKeyModal(true); return; }
            if (!fileList || fileList.length === 0) return;
            const files = Array.from(fileList);
            
            setGameState(prev => ({ ...prev, loading: true }));

            for (const file of files) {
                const isImage = file.type.startsWith('image/');
                const isPdf = file.type === 'application/pdf';

                if (!isImage && !isPdf) {
                    addFloatingText("画像かPDFのみ！", "neutral");
                    continue;
                }
                
                await processFile(file);
                await new Promise(r => setTimeout(r, 1000));
            }
            
            setGameState(prev => ({ ...prev, loading: false }));
        };

        const onDragEnter = (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            // Do not allow dragging if the key modal is open
            if (showKeyModal) return;
            setDragActive(true); 
        };
        const onDragLeave = (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            setDragActive(false); 
        };
        const onDragOver = (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            // Maintain the check here too just in case
            if (showKeyModal) return;
        };
        const onDrop = (e) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            setDragActive(false);
            
            if (showKeyModal) return; // Ignore drops if modal is open

            if (e.dataTransfer.files?.[0]) handleFiles(e.dataTransfer.files);
        };

        const visualBodyFat = Math.max(0, (gameState.dailyTotals.calories - TARGETS.calories) / 50);

        return (
            <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-900 font-sans"
             onDragEnter={onDragEnter}
             onDragLeave={onDragLeave}
             onDragOver={onDragOver}
             onDrop={onDrop}
            >
                {/* API KEY MODAL */}
                {showKeyModal && (
                    <div className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-amber-900/20 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
                            
                            <h2 className="text-2xl font-black text-amber-500 mb-4 flex items-center gap-2 relative z-10">
                                <Brain className="w-8 h-8" />
                                AI連携セットアップ
                            </h2>
                            
                            <div className="space-y-4 text-slate-300 text-sm mb-6 relative z-10">
                                <p>
                                    このアプリはGoogleのAI<strong>「Gemini」</strong>を使用して、写真から食べ物を判定し、カロリーや栄養素を計算します。
                                </p>
                                
                                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                                    <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                                        <Lock size={16} /> なぜキーが必要なのですか？
                                    </h3>
                                    <p className="mb-2">
                                        AIによる高度な画像解析を行うため、Googleのサーバーに接続する必要があります。
                                        そのサーバーを利用するための<strong>「通行証」</strong>としてAPIキーが必要です。
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700">
                                        ※入力されたキーはあなたのブラウザ内にのみ保存され、開発者や外部に送信されることはありません。
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <input 
                                    type="password" 
                                    placeholder="ここにAPIキーを入力 (AIzaSy...)"
                                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white p-4 rounded-xl mb-4 font-mono transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && saveKey(e.target.value)}
                                />
                                <button 
                                    onClick={(e) => saveKey(e.target.previousSibling.value)} 
                                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Brain size={18} />
                                    連携を開始する
                                </button>
                                
                                <div className="mt-4 text-center">
                                    <a 
                                        href="https://aistudio.google.com/app/apikey" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-amber-500 hover:text-amber-300 underline decoration-amber-500/50 hover:decoration-amber-300 underline-offset-4 transition-colors"
                                    >
                                        APIキーを無料で取得する (Google AI Studio) &rarr;
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                 <div className="absolute top-1/4 w-full flex flex-col items-center pointer-events-none z-50">
                    {floatingText.map(ft => (
                        <div key={ft.id} className={\`text-2xl font-black animate-float mb-2 shadow-black drop-shadow-md \${ft.type === 'good' ? 'text-green-400' : ft.type === 'bad' ? 'text-purple-400' : 'text-yellow-200'}\`}>
                            {ft.text}
                        </div>
                    ))}
                </div>

                 <div className="flex-1 relative flex flex-col items-center overflow-hidden transition-colors duration-300">
                    {/* Gym Background & Atmosphere */}
                    <div className="absolute inset-0 z-0 bg-slate-950 pointer-events-none">
                        {/* Wall Texture */}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23475569\\' fill-opacity=\\'0.4\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
                        
                        {/* Mirror */}
                        <div className="absolute top-[5%] left-[5%] right-[5%] bottom-[20%] bg-slate-900 border-8 border-slate-700 rounded-lg overflow-hidden shadow-2xl">
                             <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/50 via-slate-800/30 to-transparent skew-y-3 scale-110 opacity-50"></div>
                        </div>

                        {/* Floor */}
                        <div className="absolute bottom-0 w-full h-[20%] bg-[#1a1c2e] border-t border-slate-700">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                        </div>

                        {/* Decor */}
                        <div className="absolute bottom-[5%] left-[5%] opacity-40 blur-[1px]">
                            <Dumbbell size={64} className="text-slate-600 rotate-12" />
                        </div>
                        <div className="absolute bottom-[8%] right-[10%] opacity-40 blur-[1px]">
                            <Dumbbell size={80} className="text-slate-600 -rotate-45" />
                        </div>
                    </div>

                     {/* --- MAIN SCROLL AREA --- */}
                    <div className="flex-1 w-full flex flex-col items-center overflow-y-auto z-10 scrollbar-hide">
                        
                        {/* 1. Character Area */}
                        <div className="flex-shrink-0 w-full md:w-3/4 lg:w-1/2 min-h-[45vh] md:min-h-[55vh] relative flex items-end justify-center pb-0 p-2">
                            {gameState.loading && (
                                <div className="absolute inset-0 flex items-center justify-center z-50">
                                    <div className="bg-slate-900/80 px-6 py-4 rounded-full border border-amber-500/50 flex flex-col items-center gap-2 animate-pulse">
                                        <Utensils className="text-amber-400 animate-bounce" />
                                        <span className="text-lg font-bold text-white">食事中...</span>
                                    </div>
                                </div>
                            )}
                            <BodyBuilder 
                                muscle={gameState.muscle} 
                                health={gameState.health} 
                                status={gameState.status}
                                bodyFat={visualBodyFat}
                                isPoisoned={gameState.isPoisoned}
                                isEating={gameState.isEating}
                                isHappy={gameState.isHappy}
                            />
                        </div>

                        {/* 2. Meters */}
                        <div className="w-full px-4 mt-1 flex justify-center shrink-0 z-20">
                            <Meters current={gameState.dailyTotals} targets={TARGETS} />
                        </div>

                        {/* 3. Stomach (Log) Area */}
                        <div className="w-full max-w-md px-4 mt-4 pb-20 shrink-0">
                            <div className="bg-rose-950/40 border-2 border-rose-900/50 rounded-3xl p-4 backdrop-blur-sm shadow-inner shadow-rose-950 relative overflow-hidden">
                                {/* Stomach Label */}
                                <div className="absolute top-2 right-4 text-rose-300/50 text-xs font-bold flex items-center gap-1">
                                    <span className="text-xl">胃</span> STOMACH
                                </div>
                                
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-hide">
                                    {gameState.history.length === 0 ? (
                                        <div className="text-rose-200/50 text-center py-6 italic text-sm">
                                            胃袋は空っぽです...<br/>写真をドロップして食べさせてください
                                        </div>
                                    ) : (
                                        gameState.history.map(log => (
                                            <div key={log.id} className="bg-rose-900/60 border border-rose-800/50 rounded-xl p-2 text-xs text-rose-100 flex justify-between items-center shadow-sm">
                                                <div className="flex-1">
                                                    <div className="font-bold text-sm">{log.foodName}</div>
                                                    <div className="text-[10px] opacity-80">{log.effect}</div>
                                                </div>
                                                <div className="text-right pl-2 border-l border-rose-800/50 ml-2">
                                                    <div className="font-mono font-bold text-rose-200">{log.macros.calories}kcal</div>
                                                    <div className="text-[9px] text-rose-300">P:{log.macros.protein} F:{log.macros.fat} C:{log.macros.carbs}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={logEndRef} />
                                </div>
                            </div>
                        </div>
                     </div>

                     {dragActive && (
                        <div className="absolute inset-0 border-4 border-dashed border-amber-400 bg-amber-500/10 flex items-center justify-center z-40 pointer-events-none backdrop-blur-sm">
                            <div className="text-4xl font-bold text-amber-200 drop-shadow-lg">モンスターに餌をやる！</div>
                        </div>
                    )}
                     
                     <div className="absolute top-4 left-4 z-30 flex gap-2 flex-wrap">
                        {/* ALBUM INPUT */}
                         <button onClick={() => fileInputRef.current?.click()} className="bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 border border-slate-600 text-white p-3 rounded-xl shadow-lg flex items-center gap-2">
                            <Upload size={18} /> <span className="hidden sm:inline font-semibold">アルバム</span>
                         </button>
                         
                         {/* CAMERA INPUT */}
                         <button onClick={() => cameraInputRef.current?.click()} className="bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 border border-slate-600 text-white p-3 rounded-xl shadow-lg flex items-center gap-2">
                            <Camera size={18} /> <span className="hidden sm:inline font-semibold">撮影</span>
                         </button>
                         
                         <button onClick={() => setShowKeyModal(true)} className="bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 border border-slate-600 text-white p-3 rounded-xl shadow-lg" title="APIキー設定">
                            <Lock size={18} />
                        </button>

                         <button onClick={handleDownloadApp} className="bg-emerald-900/60 backdrop-blur-md hover:bg-emerald-800 border border-emerald-600 text-emerald-200 hover:text-white p-3 rounded-xl shadow-lg" title="今の状態を保存 (バックアップ)">
                            <Download size={18} />
                        </button>
                        
                         <button onClick={handleReset} className="bg-slate-800/80 backdrop-blur-md hover:bg-red-900/50 border border-slate-600 text-slate-300 hover:text-white p-3 rounded-xl shadow-lg" title="リセット">
                            <RotateCcw size={18} />
                        </button>
                        
                        {/* HIDDEN INPUTS */}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" multiple onChange={(e) => handleFiles(e.target.files)}/>
                        <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handleFiles(e.target.files)}/>
                     </div>
                 </div>
            </div>
        );
    }

    const root = createRoot(document.getElementById('root'));
    root.render(<App />);
    </script>
</body>
</html>`;
};
