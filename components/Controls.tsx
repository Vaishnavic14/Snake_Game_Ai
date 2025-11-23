import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction } from '../types';

interface ControlsProps {
  onDirectionChange: (dir: Direction) => void;
}

const Controls: React.FC<ControlsProps> = ({ onDirectionChange }) => {
  const btnClass = "p-4 bg-slate-800/80 active:bg-neon-green/20 rounded-xl border border-slate-700 backdrop-blur-sm touch-manipulation select-none transition-colors shadow-lg";
  const iconClass = "w-8 h-8 text-white";

  return (
    <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto mt-6 md:hidden">
      <div className="col-start-2">
        <button 
          className={btnClass} 
          onClick={() => onDirectionChange(Direction.UP)}
          aria-label="Up"
        >
          <ArrowUp className={iconClass} />
        </button>
      </div>
      <div className="col-start-1 row-start-2">
        <button 
          className={btnClass} 
          onClick={() => onDirectionChange(Direction.LEFT)}
          aria-label="Left"
        >
          <ArrowLeft className={iconClass} />
        </button>
      </div>
      <div className="col-start-2 row-start-2">
        <button 
          className={btnClass} 
          onClick={() => onDirectionChange(Direction.DOWN)}
          aria-label="Down"
        >
          <ArrowDown className={iconClass} />
        </button>
      </div>
      <div className="col-start-3 row-start-2">
        <button 
          className={btnClass} 
          onClick={() => onDirectionChange(Direction.RIGHT)}
          aria-label="Right"
        >
          <ArrowRight className={iconClass} />
        </button>
      </div>
    </div>
  );
};

export default Controls;