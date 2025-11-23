import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameStatus, Direction, Coordinate } from './types';
import { GRID_SIZE, INITIAL_SPEED, INITIAL_SNAKE, INITIAL_DIRECTION, KEY_MAP, MIN_SPEED, SPEED_DECREMENT } from './constants';
import GridCell from './components/GridCell';
import Controls from './components/Controls';
import GameOverModal from './components/GameOverModal';
import { Activity } from 'lucide-react';

const App: React.FC = () => {
  // Game State
  const [snake, setSnake] = useState<Coordinate[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Coordinate>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [causeOfDeath, setCauseOfDeath] = useState<string>('');
  
  // Refs for mutable state in the interval closure
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);
  const lastProcessedDirectionRef = useRef<Direction>(INITIAL_DIRECTION);
  const gameLoopRef = useRef<number | null>(null);

  // Initialize High Score
  useEffect(() => {
    const stored = localStorage.getItem('snake_highscore');
    if (stored) setHighScore(parseInt(stored, 10));
  }, []);

  const generateFood = useCallback((currentSnake: Coordinate[]): Coordinate => {
    let newFood: Coordinate;
    let isColliding;
    // Simple rejection sampling
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isColliding = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    } while (isColliding);
    return newFood;
  }, []);

  const gameOver = useCallback((reason: string) => {
    setStatus(GameStatus.GAME_OVER);
    setCauseOfDeath(reason);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    
    setHighScore(prev => {
      const newHigh = Math.max(prev, score);
      localStorage.setItem('snake_highscore', newHigh.toString());
      return newHigh;
    });
  }, [score]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    lastProcessedDirectionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setStatus(GameStatus.PLAYING);
    setFood(generateFood(INITIAL_SNAKE));
  };

  const handleDirectionChange = useCallback((newDir: Direction) => {
    const currentLastDir = lastProcessedDirectionRef.current;
    
    // Prevent 180 degree turns based on the LAST PROCESSED direction
    const isOpposite = 
      (newDir === Direction.UP && currentLastDir === Direction.DOWN) ||
      (newDir === Direction.DOWN && currentLastDir === Direction.UP) ||
      (newDir === Direction.LEFT && currentLastDir === Direction.RIGHT) ||
      (newDir === Direction.RIGHT && currentLastDir === Direction.LEFT);

    if (!isOpposite) {
      directionRef.current = newDir;
      setDirection(newDir); // Update UI state for visual feedback
    }
  }, []);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEY_MAP[e.key] && status === GameStatus.PLAYING) {
        e.preventDefault();
        handleDirectionChange(KEY_MAP[e.key]);
      } else if (e.key === ' ' && status === GameStatus.IDLE) {
        resetGame();
      } else if (e.key === ' ' && status === GameStatus.GAME_OVER) {
        resetGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, handleDirectionChange]);

  // Game Loop
  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;
        lastProcessedDirectionRef.current = currentDir;

        const newHead = { ...head };

        switch (currentDir) {
          case Direction.UP: newHead.y -= 1; break;
          case Direction.DOWN: newHead.y += 1; break;
          case Direction.LEFT: newHead.x -= 1; break;
          case Direction.RIGHT: newHead.x += 1; break;
        }

        // Wall Collision
        if (
          newHead.x < 0 || 
          newHead.x >= GRID_SIZE || 
          newHead.y < 0 || 
          newHead.y >= GRID_SIZE
        ) {
          gameOver("Crashed into a wall");
          return prevSnake;
        }

        const willGrow = newHead.x === food.x && newHead.y === food.y;

        // Self Collision
        // If we are not growing, the tail will move, so it's safe to step into the tail's position.
        // If we ARE growing, the tail stays, so we can't step into it.
        const bodyToCheck = willGrow ? prevSnake : prevSnake.slice(0, -1);
        
        if (bodyToCheck.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
           // Ensure we don't count immediate 180 turn attempts as self-collision here (handled by isOpposite),
           // but rather genuine loops.
           if (prevSnake.length > 2) { 
             gameOver("Bit your own tail");
             return prevSnake;
           }
        }

        const newSnake = [newHead, ...prevSnake];

        if (willGrow) {
          setScore(s => s + 1);
          setSpeed(s => Math.max(MIN_SPEED, s - SPEED_DECREMENT));
          setFood(generateFood(newSnake));
          // Don't pop tail -> grow
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    };

    gameLoopRef.current = window.setInterval(moveSnake, speed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [status, food, speed, gameOver, generateFood]);


  // Optimization: Pre-calculate snake positions for O(1) lookup during render
  // This avoids O(Grid * SnakeLength) which can be up to 400 * 400 operations.
  const snakeSet = useMemo(() => {
    const set = new Set<string>();
    snake.forEach(s => set.add(`${s.x},${s.y}`));
    return set;
  }, [snake]);

  const renderGrid = () => {
    const cells = [];
    const head = snake[0];
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isFood = food.x === x && food.y === y;
        const isHead = head.x === x && head.y === y;
        const isSnake = snakeSet.has(`${x},${y}`);

        cells.push(
          <GridCell 
            key={`${x}-${y}`} 
            isSnake={isSnake} 
            isHead={isHead} 
            isFood={isFood}
            isGameOver={status === GameStatus.GAME_OVER}
          />
        );
      }
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 font-sans text-slate-200">
      
      {/* Header */}
      <div className="w-full max-w-lg mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-600 drop-shadow-lg">
            SNAKE
            <span className="text-sm font-mono ml-2 text-neon-blue not-italic align-top opacity-80">AI</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">GEMINI POWERED</p>
        </div>
        
        <div className="flex gap-4">
          <div className="text-right">
             <p className="text-[10px] text-slate-500 uppercase tracking-wider">Score</p>
             <p className="text-2xl font-mono text-neon-green leading-none">{score}</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-slate-500 uppercase tracking-wider">Best</p>
             <p className="text-2xl font-mono text-white leading-none">{highScore}</p>
          </div>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="relative group">
        
        {/* The Grid */}
        <div 
          className="bg-slate-900 border-4 border-slate-800 rounded-xl shadow-2xl overflow-hidden relative"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            width: 'min(90vw, 400px)',
            height: 'min(90vw, 400px)',
          }}
        >
          {renderGrid()}
        </div>

        {/* Start Overlay */}
        {status === GameStatus.IDLE && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-lg z-20">
            <button 
              onClick={resetGame}
              className="bg-neon-green hover:bg-green-400 text-black px-8 py-3 rounded-full font-bold shadow-neon-green animate-bounce transition-all"
            >
              START GAME
            </button>
          </div>
        )}

        {/* Game Over Modal */}
        {status === GameStatus.GAME_OVER && (
          <GameOverModal 
            score={score} 
            highScore={highScore} 
            causeOfDeath={causeOfDeath}
            onRestart={resetGame} 
          />
        )}
      </div>

      {/* Controls / Info */}
      <div className="mt-8 w-full max-w-lg">
        <Controls onDirectionChange={handleDirectionChange} />
        
        <div className="hidden md:flex items-center justify-center gap-6 text-slate-500 text-xs font-mono mt-4">
          <div className="flex items-center gap-2">
            <span className="border border-slate-700 rounded px-1">W</span>
            <span className="border border-slate-700 rounded px-1">A</span>
            <span className="border border-slate-700 rounded px-1">S</span>
            <span className="border border-slate-700 rounded px-1">D</span>
            <span>to Move</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
             <Activity size={12} />
             <span>Speed: {Math.round(1000/speed)}tps</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;