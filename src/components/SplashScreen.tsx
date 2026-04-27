"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center w-screen h-screen bg-gradient-to-br from-pink-500 to-purple-600"
          style={{
            background: "linear-gradient(135deg, #FF008C 0%, #A600FF 100%)"
          }}
        >
          {/* Logo Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8,
              delay: 0.3,
              ease: "easeOut"
            }}
            className="relative"
          >
            {/* Main Logo */}
            <motion.img
              src="/splashscreen.png"
              alt="AJ Empire"
              className="w-48 h-48 object-contain"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6,
                delay: 0.5,
                ease: "easeOut"
              }}
            />
            
            {/* Subtle glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                filter: "blur(20px)"
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              transition={{ 
                duration: 1,
                delay: 0.7,
                ease: "easeOut"
              }}
            />
          </motion.div>

          {/* Loading indicator dots */}
          <motion.div
            className="absolute bottom-20 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-white rounded-full"
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ 
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>

          {/* Brand text */}
          <motion.div
            className="absolute bottom-32 text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6,
              delay: 0.8,
              ease: "easeOut"
            }}
          >
            <h1 className="text-2xl font-bold text-center tracking-wide">AJ Empire</h1>
            <p className="text-sm opacity-80 mt-1">Premium Beauty Experience</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
