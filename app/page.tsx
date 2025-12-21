'use client';

import { useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Bullet extends Position {
  speed: number;
}

interface Enemy extends Position {
  speed: number;
}

interface Star extends Position {
  speed: number;
}

const PLAYER_SPEED = 5;
const BULLET_SPEED = 4;
const ENEMY_SPEED = 0.3;
const PLAYER_SIZE = 100;
const ENEMY_SIZE = 125;
const SPAWN_INTERVAL = 2; // seconds
const SHOT_COOLDOWN = 500; // ms
const STAR_INTERVAL = 5; // seconds

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [ammo, setAmmo] = useState(30);
  const [keys, setKeys] = useState<Set<string>>(new Set());

  const playerRef = useRef<Position>({ x: canvasSize.width / 2, y: canvasSize.height - 50 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const animationRef = useRef<number>(0);
  const spawnTimer = useRef(0);
  const lastShot = useRef(0);
  const starsRef = useRef<Star[]>([]);
  const starTimer = useRef(0);
  const rocketImage = useRef<HTMLImageElement | null>(null);
  const meteorImage = useRef<HTMLImageElement | null>(null);
  const backgroundImage = useRef<HTMLImageElement | null>(null);
  const starImage = useRef<HTMLImageElement | null>(null);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.code));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.code);
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update player position when canvas size changes
  useEffect(() => {
    playerRef.current = { x: canvasSize.width / 2, y: canvasSize.height - 50 };
  }, [canvasSize]);

  // Load images
  useEffect(() => {
    const rocket = new Image();
    rocket.src = '/images/—Pngtree—transparent background rocket_15880682.png';
    rocket.onload = () => {
      rocketImage.current = rocket;
    };

    const meteor = new Image();
    meteor.src = '/images/—Pngtree—meteorite isolated on transparent background_21626756.png';
    meteor.onload = () => {
      meteorImage.current = meteor;
    };
    const background = new Image();
    background.src = '/images/—Pngtree—abstract light effect blue starry_7487073.png';
    background.onload = () => {
      backgroundImage.current = background;
    };

    const star = new Image();
    star.src = '/images/—Pngtree—vibrant neon glow star with_23492887.png';
    star.onload = () => {
      starImage.current = star;
    };
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      // Clear canvas / Draw background
      if (backgroundImage.current) {
        ctx.drawImage(backgroundImage.current, 0, 0, canvasSize.width, canvasSize.height);
      } else {
        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      }

      // Update player position
      const player = playerRef.current;
      if (keys.has('ArrowLeft') && player.x > 0) player.x -= PLAYER_SPEED;
      if (keys.has('ArrowRight') && player.x < canvasSize.width - PLAYER_SIZE) player.x += PLAYER_SPEED;
      if (keys.has('ArrowUp') && player.y > 0) player.y -= PLAYER_SPEED;
      if (keys.has('ArrowDown') && player.y < canvasSize.height - PLAYER_SIZE) player.y += PLAYER_SPEED;

      // Draw player
      if (rocketImage.current) {
        ctx.drawImage(rocketImage.current, player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
      } else {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
      }

      // Update and draw bullets
      bulletsRef.current = bulletsRef.current.filter(bullet => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) return false;

        ctx.fillStyle = '#ffff00';
        ctx.fillRect(bullet.x, bullet.y, 4, 10);
        return true;
      });

      // Update and draw enemies
      enemiesRef.current = enemiesRef.current.filter(enemy => {
        enemy.y += enemy.speed;
        if (enemy.y > canvasSize.height) return false;

        if (meteorImage.current) {
          ctx.drawImage(meteorImage.current, enemy.x, enemy.y, ENEMY_SIZE, ENEMY_SIZE);
        } else {
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(enemy.x, enemy.y, ENEMY_SIZE, ENEMY_SIZE);
        }
        return true;
      });

      // Update and draw stars
      starsRef.current = starsRef.current.filter(star => {
        star.y += star.speed;
        if (star.y > canvasSize.height) return false;

        if (starImage.current) {
          ctx.drawImage(starImage.current, star.x, star.y, 60, 60);
        } else {
          ctx.fillStyle = '#ffff00';
          ctx.fillRect(star.x, star.y, 60, 60);
        }
        return true;
      });

      // Check collisions
      bulletsRef.current.forEach((bullet, bulletIndex) => {
        enemiesRef.current.forEach((enemy, enemyIndex) => {
          if (
            bullet.x < enemy.x + ENEMY_SIZE &&
            bullet.x + 4 > enemy.x &&
            bullet.y < enemy.y + ENEMY_SIZE &&
            bullet.y + 10 > enemy.y
          ) {
            bulletsRef.current.splice(bulletIndex, 1);
            enemiesRef.current.splice(enemyIndex, 1);
            setScore(prev => prev + 10);
          }
        });
      });

      // Check player collision with enemies
      enemiesRef.current.forEach(enemy => {
        if (
          player.x < enemy.x + ENEMY_SIZE &&
          player.x + PLAYER_SIZE > enemy.x &&
          player.y < enemy.y + ENEMY_SIZE &&
          player.y + PLAYER_SIZE > enemy.y &&
          enemy.y + ENEMY_SIZE > player.y &&
          enemy.y < player.y + PLAYER_SIZE / 4
        ) {
          setGameOver(true);
        }
      });

      // Check player collision with stars
      starsRef.current.forEach((star, index) => {
        if (
          player.x < star.x + 60 &&
          player.x + PLAYER_SIZE > star.x &&
          player.y < star.y + 60 &&
          player.y + PLAYER_SIZE > star.y
        ) {
          starsRef.current.splice(index, 1);
          setAmmo(prev => prev + 15);
        }
      });

      // Spawn enemies
      spawnTimer.current += 1/60;
      if (spawnTimer.current > SPAWN_INTERVAL + Math.random() * 1) {
        for (let i = 0; i < 3; i++) {
          enemiesRef.current.push({
            x: Math.random() * (canvasSize.width - ENEMY_SIZE),
            y: -ENEMY_SIZE,
            speed: ENEMY_SPEED + Math.random() * 0.5,
          });
        }
        spawnTimer.current = 0;
      }

      // Spawn stars
      starTimer.current += 1/60;
      if (starTimer.current > STAR_INTERVAL) {
        starsRef.current.push({
          x: Math.random() * (canvasSize.width - 60),
          y: -60,
          speed: 1,
        });
        starTimer.current = 0;
      }

      // Shoot bullets
      if (keys.has('Space') && ammo > 0 && Date.now() - lastShot.current > SHOT_COOLDOWN) {
        bulletsRef.current.push({
          x: player.x + PLAYER_SIZE / 2 - 2,
          y: player.y,
          speed: BULLET_SPEED,
        });
        setAmmo(prev => prev - 1);
        lastShot.current = Date.now();
      }

      if (!gameOver) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    gameLoop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [keys, gameOver]);

  const resetGame = () => {
    playerRef.current = { x: canvasSize.width / 2, y: canvasSize.height - PLAYER_SIZE - 50 };
    bulletsRef.current = [];
    enemiesRef.current = [];
    starsRef.current = [];
    setScore(0);
    setAmmo(30);
    setGameOver(false);
  };

  return (
    <div className="fixed inset-0 bg-black">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="w-full h-full bg-black"
      />

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <h1 className="text-4xl font-bold mb-2">Space Shooter</h1>
        <div className="text-xl text-green-400">Score: {score}</div>
      </div>

      <div className="absolute top-4 right-4 text-white text-xl">
        Ammo: {ammo}
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p>Use arrow keys to move, Space to shoot</p>
        {gameOver && (
          <div className="mt-4">
            <p className="text-red-500 text-2xl mb-2">Game Over!</p>
            <button
              onClick={resetGame}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
