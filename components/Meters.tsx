import React from 'react';
import { DailyMacros } from '../types';

interface MetersProps {
  current: DailyMacros;
  targets: DailyMacros;
}

const MacroBar: React.FC<{ label: string; current: number; max: number; color: string; unit: string }> = ({ label, current, max, color, unit }) => {
  const percent = Math.min(100, (current / max) * 100);
  const isOver = current > max;
  
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">
        <span className="text-slate-300">{label}</span>
        <span className={`${isOver ? 'text-red-400' : 'text-slate-400'}`}>
          {Math.floor(current)} / {max}{unit}
        </span>
      </div>
      <div className="h-2 md:h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${percent}%` }}
        />
        {isOver && (
            <div className="absolute top-0 right-0 bottom-0 w-1 bg-red-500 animate-pulse" />
        )}
      </div>
    </div>
  );
};

export const Meters: React.FC<MetersProps> = ({ current, targets }) => {
  return (
    <div className="w-full max-w-md bg-slate-800/90 p-4 rounded-2xl backdrop-blur-md border border-slate-700 shadow-2xl z-20">
      <h3 className="text-sm font-bold text-center text-slate-200 mb-3 border-b border-slate-700 pb-2">1日の目標摂取量</h3>
      
      <MacroBar 
        label="カロリー" 
        current={current.calories} 
        max={targets.calories} 
        unit="kcal" 
        color={current.calories > targets.calories ? "bg-red-500" : "bg-gradient-to-r from-green-500 to-emerald-400"} 
      />
      
      <div className="grid grid-cols-3 gap-2 mt-3">
        <MacroBar 
            label="タンパク質" 
            current={current.protein} 
            max={targets.protein} 
            unit="g" 
            color="bg-blue-500"
        />
        <MacroBar 
            label="脂質" 
            current={current.fat} 
            max={targets.fat} 
            unit="g" 
            color="bg-yellow-500"
        />
        <MacroBar 
            label="炭水化物" 
            current={current.carbs} 
            max={targets.carbs} 
            unit="g" 
            color="bg-orange-500"
        />
      </div>
    </div>
  );
};