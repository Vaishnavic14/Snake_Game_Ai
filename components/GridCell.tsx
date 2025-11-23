import React, { memo } from 'react';

interface GridCellProps {
  isSnake: boolean;
  isHead: boolean;
  isFood: boolean;
  isGameOver: boolean;
}

const GridCell: React.FC<GridCellProps> = ({ isSnake, isHead, isFood, isGameOver }) => {
  let className = "w-full h-full rounded-sm transition-all duration-100 ";

  if (isHead) {
    className += isGameOver ? "bg-gray-500 scale-90" : "bg-neon-green shadow-neon-green z-10 scale-110";
  } else if (isSnake) {
    className += isGameOver ? "bg-gray-700" : "bg-green-500/80 border border-green-600/30";
  } else if (isFood) {
    className += "bg-neon-red shadow-neon-red animate-pulse rounded-full scale-75";
  } else {
    className += "bg-slate-800/50 border border-slate-700/10";
  }

  return <div className={className}></div>;
};

export default memo(GridCell);