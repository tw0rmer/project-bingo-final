import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Zap, Heart, Target, Crown } from "lucide-react";
import type { Achievement, UserAchievement } from "@shared/schema";

interface AchievementBadgeProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  isLocked?: boolean;
  showAnimation?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const rarityColors = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600", 
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-orange-500"
};

const rarityGlow = {
  common: "shadow-gray-400/30",
  rare: "shadow-blue-400/50",
  epic: "shadow-purple-400/50", 
  legendary: "shadow-yellow-400/60"
};

const categoryIcons = {
  games: Trophy,
  social: Heart,
  milestone: Target,
  special: Crown
};

export function AchievementBadge({ 
  achievement, 
  userAchievement, 
  isLocked = false, 
  showAnimation = false,
  size = "md",
  onClick 
}: AchievementBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const isUnlocked = !!userAchievement;
  const IconComponent = categoryIcons[achievement.category as keyof typeof categoryIcons] || Star;
  
  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-xl", 
    lg: "w-24 h-24 text-3xl"
  };

  const badgeVariants = {
    initial: { scale: 0, rotate: -180, opacity: 0 },
    animate: { 
      scale: 1, 
      rotate: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.1 
      }
    },
    hover: { 
      scale: 1.1, 
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  const glowVariants = {
    animate: {
      boxShadow: [
        `0 0 20px ${rarityGlow[achievement.rarity as keyof typeof rarityGlow]}`,
        `0 0 40px ${rarityGlow[achievement.rarity as keyof typeof rarityGlow]}`,
        `0 0 20px ${rarityGlow[achievement.rarity as keyof typeof rarityGlow]}`
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const sparkleVariants = {
    animate: {
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: Math.random() * 2
      }
    }
  };

  return (
    <div className="relative">
      <motion.div
        className={`
          relative cursor-pointer select-none
          ${sizeClasses[size]}
          ${isLocked ? 'opacity-40 grayscale' : ''}
        `}
        variants={badgeVariants}
        initial={showAnimation ? "initial" : false}
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => {
          if (onClick) onClick();
          setShowDetails(!showDetails);
        }}
        data-testid={`achievement-badge-${achievement.id}`}
      >
        {/* Main Badge */}
        <motion.div
          className={`
            w-full h-full rounded-full 
            bg-gradient-to-br ${rarityColors[achievement.rarity as keyof typeof rarityColors]}
            border-4 border-white
            flex items-center justify-center
            relative overflow-hidden
            ${!isLocked && achievement.rarity === 'legendary' ? 'animate-pulse' : ''}
          `}
          variants={isUnlocked && showAnimation ? glowVariants : {}}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          
          {/* Icon or Emoji */}
          {achievement.icon.length === 1 ? (
            <span className={sizeClasses[size].split(' ')[2]}>{achievement.icon}</span>
          ) : (
            <IconComponent className={`${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'} text-white`} />
          )}
          
          {/* Sparkle Effects for Legendary */}
          {achievement.rarity === 'legendary' && !isLocked && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-200 rounded-full"
                  style={{
                    top: `${20 + i * 20}%`,
                    left: `${10 + i * 30}%`,
                  }}
                  variants={sparkleVariants}
                  animate="animate"
                />
              ))}
            </>
          )}
        </motion.div>
        
        {/* New Badge Indicator */}
        {userAchievement?.isNew && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          />
        )}
        
        {/* Rarity Border Effect */}
        {!isLocked && achievement.rarity === 'epic' && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-300"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
      
      {/* Tooltip/Details */}
      <AnimatePresence>
        {(isHovered || showDetails) && (
          <motion.div
            className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-gray-900 text-white rounded-lg shadow-xl min-w-[200px] max-w-[280px]"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center">
              <h3 className={`font-bold text-sm mb-1 ${rarityColors[achievement.rarity as keyof typeof rarityColors].replace('from-', 'text-').replace(' to-gray-600', '').replace(' to-blue-600', '').replace(' to-purple-600', '').replace(' to-orange-500', '')}`}>
                {achievement.name}
              </h3>
              <p className="text-xs text-gray-300 mb-2">{achievement.description}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="capitalize text-gray-400">{achievement.rarity}</span>
                <span className="text-yellow-400">+{achievement.points} pts</span>
              </div>
              {userAchievement && (
                <div className="mt-2 text-xs text-green-400">
                  Unlocked: {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                </div>
              )}
              {isLocked && (
                <div className="mt-2 text-xs text-gray-500">
                  Progress: {userAchievement?.progress || 0}/{achievement.requirement}
                </div>
              )}
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}