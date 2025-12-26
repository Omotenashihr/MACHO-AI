import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BodyBuilder } from './components/BodyBuilder';
import { Meters } from './components/Meters';
import { analyzeFoodImage } from './services/geminiService';
import { generateShareHtml } from './utils/exportService';
import { GameState, LogEntry, DailyMacros } from './types';
import { Upload, Dumbbell, Utensils, RotateCcw, FileText, Share2, Camera, Brain, Lock, Download, UserPlus, Trees } from 'lucide-react';

// Recommended Daily Intake (Approximate for a generic male adult/bodybuilder context)
const TARGETS: DailyMacros = {
  calories: 2200,
  protein: 140,
  fat: 70,
  carbs: 250,
};

const INITIAL_STATE: GameState = {
  muscle: 10,
  health: 100,
  status: 'NORMAL',
  isPoisoned: false,
  isEating: false,
  isHappy: false,
  history: [],
  loading: false,
  dailyTotals: {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  },
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_api_key") || "");
  const [showKeyModal, setShowKeyModal] = useState(!apiKey);
  const [dragActive, setDragActive] = useState(false);
  const [floatingText, setFloatingText] = useState<{text: string, type: 'good'|'bad'|'neutral', id: number}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest log item
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.history]);

  const saveKey = (key: string) => {
    if (!key) return;
    localStorage.setItem("gemini_api_key", key);
    setApiKey(key);
    setShowKeyModal(false);
  };

  const addFloatingText = (text: string, type: 'good'|'bad'|'neutral') => {
    const id = Date.now();
    setFloatingText(prev => [...prev, { text, type, id }]);
    setTimeout(() => {
      setFloatingText(prev => prev.filter(ft => ft.id !== id));
    }, 2000);
  };

  const handleReset = () => {
      setGameState(INITIAL_STATE);
  };

  const handleShare = () => {
    const htmlContent = generateShareHtml(INITIAL_STATE);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `macho-ai-game-start.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addFloatingText("招待用ゲームを保存しました！", "good");
  };

  const handleDownloadApp = () => {
    const htmlContent = generateShareHtml(gameState);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `macho-ai-backup.html`; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addFloatingText("続きから遊べるファイルを保存！", "good");
  };

  const processFile = (file: File): Promise<void> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = (reader.result as string).split(',')[1];
          const mimeType = file.type;
    
          try {
            const analysis = await analyzeFoodImage(base64String, mimeType);
            
            setGameState(prev => {
                let newStatus = prev.status;
                let newIsPoisoned = prev.isPoisoned;
                let newIsHappy = false;
        
                if (!analysis.isFood) {
                addFloatingText("食べ物じゃない！", "neutral");
                return { ...prev }; 
                }
        
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
        
                const newTotals: DailyMacros = {
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
                
                if (newIsPoisoned) {
                    addFloatingText("毒状態になった", "bad");
                } else if (newTotals.calories < 500 && newTotals.protein < 20) {
                    newStatus = 'NORMAL';
                } else if (excessCalories > 500 || excessFat > 40) {
                    newStatus = 'CHUBBY';
                    addFloatingText("太ってきた！", "bad");
                } else if (newTotals.protein >= TARGETS.protein * 0.4 && bodyFat < 20) {
                    newStatus = 'PUMPED';
                    if (!isJunk) {
                        newIsHappy = true;
                        addFloatingText("いいバルクだ！", "good");
                    }
                } else if (analysis.name.toLowerCase().includes("alcohol") || analysis.name.includes("酒") || analysis.name.includes("ビール")) {
                    newStatus = 'SICK';
                    addFloatingText("二日酔いだ...", "bad");
                } else {
                    newStatus = 'NORMAL';
                }
        
                if (!newIsPoisoned && analysis.protein_g > 10 && analysis.fat_g < 20 && !analysis.isUnhealthy) {
                    newIsHappy = true;
                }
        
                const newLog: LogEntry = {
                    id: Date.now().toString(),
                    foodName: analysis.name,
                    effect: analysis.reasoning,
                    timestamp: new Date(),
                    macros: {
                        calories: analysis.calories,
                        protein: analysis.protein_g,
                        fat: analysis.fat_g,
                        carbs: analysis.carbs_g
                    }
                };
        
                return {
                muscle: currentMuscle,
                health: 100 - Math.min(50, bodyFat),
                status: newStatus,
                isPoisoned: newIsPoisoned,
                isEating: true, 
                isHappy: newIsHappy,
                history: [...prev.history, newLog], // Append to end for list view
                loading: true, 
                dailyTotals: newTotals,
                };
            });
    
            setTimeout(() => {
                setGameState(prev => ({ ...prev, isEating: false }));
            }, 2000);

          } catch (e) {
              console.error(e);
              addFloatingText("エラーが発生しました", "bad");
          }
          
          resolve();
        };
        reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!apiKey) {
        setShowKeyModal(true);
        return;
    }
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

  const onDragEnter = (e: React.DragEvent) => { 
      e.preventDefault(); 
      e.stopPropagation(); 
      if (showKeyModal) return;
      setDragActive(true); 
  };
  const onDragLeave = (e: React.DragEvent) => { 
      e.preventDefault(); 
      e.stopPropagation(); 
      setDragActive(false); 
  };
  const onDragOver = (e: React.DragEvent) => { 
      e.preventDefault(); 
      e.stopPropagation(); 
      if (showKeyModal) return;
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setDragActive(false);
    if (showKeyModal) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const visualBodyFat = Math.max(0, (gameState.dailyTotals.calories - TARGETS.calories) / 50);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-900 font-sans">
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
                    <p>このアプリはGoogleのAI<strong>「Gemini」</strong>を使用して、写真から食べ物を判定し、カロリーや栄養素を計算します。</p>
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                        <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                            <Lock size={16} /> なぜキーが必要なのですか？
                        </h3>
                        <p className="mb-2">AIによる高度な画像解析を行うため、Googleのサーバーに接続する必要があります。そのサーバーを利用するための<strong>「通行証」</strong>としてAPIキーが必要です。</p>
                        <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700">※入力されたキーはあなたのブラウザ内にのみ保存され、開発者や外部に送信されることはありません。</p>
                    </div>
                </div>
                <div className="relative z-10">
                    <input type="password" placeholder="ここにAPIキーを入力 (AIzaSy...)" className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white p-4 rounded-xl mb-4 font-mono transition-all" onKeyDown={(e) => e.key === 'Enter' && saveKey(e.currentTarget.value)} />
                    <button onClick={(e) => saveKey((e.currentTarget.previousSibling as HTMLInputElement).value)} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                        <Brain size={18} /> 連携を開始する
                    </button>
                    <div className="mt-4 text-center">
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-amber-500 hover:text-amber-300 underline decoration-amber-500/50 hover:decoration-amber-300 underline-offset-4 transition-colors">APIキーを無料で取得する (Google AI Studio) &rarr;</a>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Floating Text */}
      <div className="absolute top-1/4 w-full flex flex-col items-center pointer-events-none z-50">
        {floatingText.map(ft => (
            <div key={ft.id} className={`text-2xl font-black animate-float mb-2 shadow-black drop-shadow-md ${
                ft.type === 'good' ? 'text-green-400' : ft.type === 'bad' ? 'text-purple-400' : 'text-yellow-200'
            }`}>{ft.text}</div>
        ))}
      </div>

      <main 
        className={`flex-1 relative flex flex-col items-center overflow-hidden transition-colors duration-300 ${dragActive ? 'bg-amber-900/20' : ''}`}
        onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        {/* Gym Background & Atmosphere */}
        <div className="absolute inset-0 z-0 bg-slate-950 pointer-events-none">
            {/* Wall Texture */}
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23475569\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            
            {/* Mirror */}
            <div className="absolute top-[5%] left-[5%] right-[5%] bottom-[20%] bg-slate-900 border-8 border-slate-700 rounded-lg overflow-hidden shadow-2xl">
                 <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/50 via-slate-800/30 to-transparent skew-y-3 scale-110 opacity-50"></div>
            </div>

            {/* Floor */}
            <div className="absolute bottom-0 w-full h-[20%] bg-[#1a1c2e] border-t border-slate-700">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
            </div>
             {/* Decor */}
            <div className="absolute bottom-[5%] left-[5%] opacity-40 blur-[1px]"><Dumbbell size={64} className="text-slate-600 rotate-12" /></div>
            <div className="absolute bottom-[8%] right-[10%] opacity-40 blur-[1px]"><Dumbbell size={80} className="text-slate-600 -rotate-45" /></div>
        </div>

        {/* --- MAIN SCROLL AREA --- */}
        <div className="flex-1 w-full flex flex-col items-center overflow-y-auto z-10 scrollbar-hide">
            
            {/* 1. Character Area (Expanded) */}
            {/* Increased min-height and removed max-w restriction to make character bigger. Reduced padding. */}
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

            {/* 2. Meters (Reduced Gap) */}
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

        {/* Hidden Inputs */}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" multiple onChange={(e) => handleFiles(e.target.files)}/>
        <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handleFiles(e.target.files)}/>
        
        {/* Action Buttons */}
        <div className="absolute top-4 left-4 z-30 flex gap-2 flex-wrap">
            <button onClick={() => fileInputRef.current?.click()} className="bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 border border-slate-600 text-white p-3 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95">
                <Upload size={18} />
                <span className="hidden sm:inline font-semibold">アルバム</span>
            </button>
            <button onClick={() => cameraInputRef.current?.click()} className="bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 border border-slate-600 text-white p-3 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95">
                <Camera size={18} />
                <span className="hidden sm:inline font-semibold">撮影</span>
            </button>
            <button onClick={() => setShowKeyModal(true)} className="bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 border border-slate-600 text-white p-3 rounded-xl shadow-lg transition-all active:scale-95" title="APIキー設定">
                <Lock size={18} />
            </button>
            <button onClick={handleDownloadApp} className="bg-emerald-900/60 backdrop-blur-md hover:bg-emerald-800 border border-emerald-600 text-emerald-200 hover:text-white p-3 rounded-xl shadow-lg transition-all active:scale-95" title="今の状態を保存 (バックアップ)">
                <Download size={18} />
            </button>
            <button onClick={handleShare} className="bg-purple-900/60 backdrop-blur-md hover:bg-purple-800 border border-purple-600 text-purple-200 hover:text-white p-3 rounded-xl shadow-lg transition-all active:scale-95" title="友人にゲームを送る (初期状態)">
                <UserPlus size={18} />
            </button>
            <button onClick={handleReset} className="bg-slate-800/80 backdrop-blur-md hover:bg-red-900/50 border border-slate-600 text-slate-300 hover:text-white p-3 rounded-xl shadow-lg transition-all active:scale-95" title="リセット">
                <RotateCcw size={18} />
            </button>
        </div>
      </main>
    </div>
  );
};

export default App;