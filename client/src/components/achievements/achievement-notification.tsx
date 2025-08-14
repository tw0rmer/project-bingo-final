import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Star } from "lucide-react";
import { AchievementBadge } from "./achievement-badge";
import type { Achievement, UserAchievement } from "@shared/schema";

interface AchievementNotificationProps {
  achievement: Achievement;
  userAchievement: UserAchievement;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function AchievementNotification({ 
  achievement, 
  userAchievement, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const containerVariants = {
    hidden: { 
      scale: 0.8, 
      opacity: 0, 
      y: 50,
      x: 50 
    },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.6
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0, 
      y: 20,
      x: 50,
      transition: { duration: 0.3 }
    }
  };

  const celebrationVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: [0, 1.2, 1], 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.2
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.4, duration: 0.4 }
    }
  };

  const getRarityStyles = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return {
          bg: 'from-yellow-400 via-orange-500 to-red-500',
          border: 'border-yellow-400',
          glow: 'shadow-yellow-400/50'
        };
      case 'epic':
        return {
          bg: 'from-purple-400 via-purple-500 to-purple-600',
          border: 'border-purple-400',
          glow: 'shadow-purple-400/50'
        };
      case 'rare':
        return {
          bg: 'from-blue-400 via-blue-500 to-blue-600',
          border: 'border-blue-400',
          glow: 'shadow-blue-400/50'
        };
      default:
        return {
          bg: 'from-gray-400 via-gray-500 to-gray-600',
          border: 'border-gray-400',
          glow: 'shadow-gray-400/30'
        };
    }
  };

  const styles = getRarityStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`
            fixed bottom-4 right-4 z-50 
            bg-white rounded-lg shadow-2xl border-2 ${styles.border}
            p-4 min-w-[320px] max-w-[400px]
            ${styles.glow} shadow-lg
          `}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          data-testid="achievement-notification"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            data-testid="close-notification"
          >
            <X size={16} className="text-gray-500" />
          </button>

          {/* Header */}
          <motion.div 
            className="flex items-center mb-3"
            variants={textVariants}
            initial="initial"
            animate="animate"
          >
            <motion.div
              variants={celebrationVariants}
              initial="initial"
              animate="animate"
            >
              <Trophy className={`w-6 h-6 mr-2 text-yellow-500`} />
            </motion.div>
            <div>
              <h3 className="font-bold text-gray-900">Achievement Unlocked!</h3>
              <p className="text-xs text-gray-600 capitalize">{achievement.rarity} Badge</p>
            </div>
          </motion.div>

          {/* Achievement Content */}
          <div className="flex items-center space-x-4">
            {/* Badge */}
            <div className="flex-shrink-0">
              <AchievementBadge
                achievement={achievement}
                userAchievement={userAchievement}
                size="lg"
                showAnimation={true}
              />
            </div>
            
            {/* Details */}
            <motion.div 
              className="flex-1 min-w-0"
              variants={textVariants}
              initial="initial"
              animate="animate"
            >
              <h4 className="font-semibold text-gray-900 truncate">{achievement.name}</h4>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{achievement.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-yellow-600 font-medium">+{achievement.points} points</span>
                <span className="text-xs text-gray-500 capitalize">{achievement.category}</span>
              </div>
            </motion.div>
          </div>

          {/* Celebration Effects */}
          {achievement.rarity === 'legendary' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                    opacity: 1
                  }}
                  animate={{
                    x: `${50 + (Math.cos(i * 45 * Math.PI / 180) * 100)}%`,
                    y: `${50 + (Math.sin(i * 45 * Math.PI / 180) * 100)}%`,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0]
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.5,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}