'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { X, Pause, Play, RefreshCw } from 'lucide-react';

interface ScanScreenProps {
  isScanning: boolean;
  progress: number;
  phase: string;
  logs: string[];
  onCancel: () => void;
}

export function ScanScreen({ isScanning, progress, phase, logs, onCancel }: ScanScreenProps) {
  const controls = useAnimation();
  const rotation = useMotionValue(0);

  useEffect(() => {
    if (isScanning) {
      controls.start('scanning');
    } else {
      controls.start('idle');
    }
  }, [isScanning, controls]);

  return (
    <div className="h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 z-10">
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center active:scale-90 transition-transform"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <span className="text-white font-semibold">Scanning...</span>
        <button className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center active:scale-90 transition-transform">
          <Pause className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Radar Animation Container */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-black" />

        {/* Radar Circles */}
        <div className="relative w-64 h-64">
          {/* Outer Ring - Rotating */}
          <motion.div
            variants={{
              idle: { rotate: 0 },
              scanning: {
                rotate: 360,
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                },
              },
            }}
            animate={controls}
            className="absolute inset-0 border-2 border-blue-500/20 rounded-full"
          />

          {/* Middle Ring - Rotating Reverse */}
          <motion.div
            variants={{
              idle: { rotate: 0 },
              scanning: {
                rotate: -360,
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                },
              },
            }}
            animate={controls}
            className="absolute inset-8 border-2 border-purple-500/20 rounded-full"
          />

          {/* Inner Ring - Pulse */}
          <motion.div
            variants={{
              idle: { scale: 1, opacity: 0.3 },
              scanning: {
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              },
            }}
            animate={controls}
            className="absolute inset-16 border-2 border-green-500/30 rounded-full"
          />

          {/* Center Scanner */}
          <motion.div
            variants={{
              idle: { scale: 1, rotate: 0 },
              scanning: {
                rotate: 360,
                transition: {
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                },
              },
            }}
            animate={controls}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Scanner Beam */}
            <div className="absolute w-full h-full rounded-full overflow-hidden">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{
                  rotate: 360,
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }}
                className="w-full h-1/2 origin-bottom"
                style={{
                  background: 'linear-gradient(to top, transparent, rgba(59, 130, 246, 0.3))',
                }}
              />
            </div>
          </motion.div>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <motion.div
              animate={{ scale: isScanning ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 rounded-full bg-black/50 border-2 border-blue-500/50 flex items-center justify-center backdrop-blur-sm"
            >
              <span className="text-3xl font-bold text-white">{progress}%</span>
            </motion.div>

            {/* Phase Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={phase}
              className="absolute -bottom-16 text-center"
            >
              <p className="text-white font-medium">{phase}</p>
              <p className="text-xs text-gray-500 mt-1">
                {logs.length} tasks completed
              </p>
            </motion.div>
          </div>

          {/* Floating Particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-500 rounded-full"
              style={{
                top: `${20 + (i * 10)}%`,
                left: `${20 + (i * 10)}%`,
              }}
              animate={
                isScanning
                  ? {
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.8, 0.3],
                      transition: {
                        duration: 1.5,
                        delay: i * 0.2,
                        repeat: Infinity,
                      },
                    }
                  : { scale: 1, opacity: 0.3 }
              }
            />
          ))}
        </div>
      </div>

      {/* Bottom Sheet - Live Logs */}
      <motion.div
        initial={{ y: 200 }}
        animate={{ y: isScanning ? 0 : 200 }}
        className="bg-gray-900/95 backdrop-blur-xl rounded-t-3xl p-4 min-h-[200px] max-h-[300px] overflow-hidden"
      >
        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Scan Activity</h3>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Live</span>
          </div>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[200px]">
          {logs.slice(-5).map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400">{log}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}