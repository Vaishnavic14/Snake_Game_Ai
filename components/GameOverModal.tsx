import React, { useEffect, useState } from 'react';
import { generateGameCommentary } from '../services/geminiService';
import { Trophy, RefreshCw, AlertTriangle } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  highScore: number;
  causeOfDeath: string;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ score, highScore, causeOfDeath, onRestart }) => {
  const [commentary, setCommentary] = useState<string>("Analyzing gameplay...");

  useEffect(() => {
    let isMounted = true;
    generateGameCommentary(score, causeOfDeath).then(text => {
      if (isMounted) setCommentary(text);
    });
    return () => { isMounted = false; };
  }, [score, causeOfDeath]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-neon-red shadow-neon-red"></div>
        
        <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase font-mono">
          Game Over
        </h2>
        
        <div className="flex justify-center items-center gap-2 text-slate-400 mb-6 text-sm">
           <AlertTriangle size={16} /> <span>{causeOfDeath}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Score</p>
            <p className="text-3xl font-mono text-neon-green">{score}</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Best</p>
            <div className="flex items-center justify-center gap-2">
              <Trophy size={16} className="text-yellow-500" />
              <p className="text-3xl font-mono text-white">{highScore}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 min-h-[60px] flex items-center justify-center">
          <p className="text-slate-300 italic font-medium leading-relaxed">
            "{commentary}"
          </p>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-4 bg-neon-green hover:bg-green-400 text-black font-bold text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-neon-green"
        >
          <RefreshCw size={20} />
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;