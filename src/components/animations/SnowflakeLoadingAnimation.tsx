import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Snowflake {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

export function SnowflakeLoadingAnimation({ onComplete }: { onComplete?: () => void }) {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    // Создаём снежинки для фона
    const flakes: Snowflake[] = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 3,
      duration: Math.random() * 4 + 4,
      opacity: Math.random() * 0.7 + 0.3,
    }));
    setSnowflakes(flakes);

    // Завершаем анимацию через 4 секунды
    const timer = setTimeout(() => {
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
      {/* Северное сияние на фоне */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 w-1/2 h-1/2 rounded-full blur-[120px]"
          style={{
            background: "radial-gradient(ellipse, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-20 right-1/4 w-1/3 h-1/3 rounded-full blur-[100px]"
          style={{
            background: "radial-gradient(ellipse, rgba(147, 51, 234, 0.25) 0%, transparent 70%)",
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Падающие снежинки */}
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute text-white"
          style={{
            left: `${flake.x}%`,
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
          }}
          initial={{ top: "-5%", rotate: 0 }}
          animate={{
            top: "105%",
            rotate: 360,
            x: [0, 15, -15, 10, -10, 0],
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: "linear",
            x: {
              duration: flake.duration / 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          ❄
        </motion.div>
      ))}

      {/* Центральная снежинка */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
          }}
        >
          {/* Свечение снежинки */}
          <motion.div
            className="absolute inset-0 rounded-full blur-[60px]"
            style={{
              background: "radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(59, 130, 246, 0.3) 50%, transparent 70%)",
              width: "200px",
              height: "200px",
              transform: "translate(-50%, -50%)",
              left: "50%",
              top: "50%",
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Главная снежинка SVG */}
          <motion.svg
            viewBox="0 0 200 200"
            className="w-48 h-48 md:w-64 md:h-64"
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <defs>
              <linearGradient id="snowflakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#bfdbfe" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* 6 лучей снежинки */}
            {[0, 60, 120, 180, 240, 300].map((angle, index) => (
              <g key={index} transform={`rotate(${angle} 100 100)`} filter="url(#glow)">
                {/* Главный луч */}
                <motion.line
                  x1="100" y1="100" x2="100" y2="15"
                  stroke="url(#snowflakeGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
                
                {/* Верхние ветви */}
                <motion.line
                  x1="100" y1="40" x2="85" y2="55"
                  stroke="url(#snowflakeGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                />
                <motion.line
                  x1="100" y1="40" x2="115" y2="55"
                  stroke="url(#snowflakeGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                />
                
                {/* Средние ветви */}
                <motion.line
                  x1="100" y1="55" x2="80" y2="70"
                  stroke="url(#snowflakeGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                />
                <motion.line
                  x1="100" y1="55" x2="120" y2="70"
                  stroke="url(#snowflakeGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                />
                
                {/* Маленькие кристаллы на концах */}
                <motion.circle
                  cx="100" cy="15"
                  r="4"
                  fill="url(#snowflakeGradient)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                />
                <motion.circle
                  cx="85" cy="55"
                  r="2"
                  fill="url(#snowflakeGradient)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.2 + index * 0.1 }}
                />
                <motion.circle
                  cx="115" cy="55"
                  r="2"
                  fill="url(#snowflakeGradient)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.2 + index * 0.1 }}
                />
              </g>
            ))}
            
            {/* Центральный кристалл */}
            <motion.circle
              cx="100" cy="100"
              r="12"
              fill="url(#snowflakeGradient)"
              filter="url(#glow)"
              initial={{ scale: 0 }}
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Внутренний узор */}
            <motion.circle
              cx="100" cy="100"
              r="20"
              fill="none"
              stroke="url(#snowflakeGradient)"
              strokeWidth="1.5"
              opacity="0.7"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </motion.svg>

          {/* Частицы вокруг снежинки */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: "50%",
                top: "50%",
              }}
              animate={{
                x: [0, Math.cos((i * 30 * Math.PI) / 180) * 100],
                y: [0, Math.sin((i * 30 * Math.PI) / 180) * 100],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: 1.5 + i * 0.1,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Текст */}
      <motion.div
        className="absolute bottom-24 left-0 right-0 text-center space-y-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-300">
            EvloevFilm
          </span>
        </motion.h1>
        
        <motion.p
          className="text-xl text-blue-200/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          ❄ Зимняя сказка кино ❄
        </motion.p>

        {/* Индикатор загрузки */}
        <motion.div
          className="w-64 h-1 mx-auto mt-6 bg-blue-900/50 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 via-white to-blue-400 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
