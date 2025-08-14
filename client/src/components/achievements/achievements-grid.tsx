import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Filter, Search, Medal } from "lucide-react";
import { AchievementBadge } from "./achievement-badge";
import type { Achievement, UserAchievement } from "@shared/schema";

interface AchievementsGridProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  isLoading?: boolean;
}

type FilterCategory = 'all' | 'games' | 'social' | 'milestone' | 'special';
type FilterRarity = 'all' | 'common' | 'rare' | 'epic' | 'legendary';
type FilterStatus = 'all' | 'unlocked' | 'locked';

export function AchievementsGrid({ achievements, userAchievements, isLoading }: AchievementsGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [rarityFilter, setRarityFilter] = useState<FilterRarity>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  // Create map of user achievements for quick lookup
  const userAchievementMap = new Map(
    userAchievements.map(ua => [ua.achievementId, ua])
  );

  // Filter achievements based on current filters
  const filteredAchievements = achievements.filter(achievement => {
    const userAchievement = userAchievementMap.get(achievement.id);
    const isUnlocked = !!userAchievement;

    // Search filter
    if (searchTerm && !achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !achievement.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && achievement.category !== categoryFilter) {
      return false;
    }

    // Rarity filter
    if (rarityFilter !== 'all' && achievement.rarity !== rarityFilter) {
      return false;
    }

    // Status filter
    if (statusFilter === 'unlocked' && !isUnlocked) {
      return false;
    }
    if (statusFilter === 'locked' && isUnlocked) {
      return false;
    }

    return true;
  });

  // Sort achievements: unlocked first, then by rarity, then by name
  const sortedAchievements = filteredAchievements.sort((a, b) => {
    const aUnlocked = userAchievementMap.has(a.id);
    const bUnlocked = userAchievementMap.has(b.id);
    
    if (aUnlocked !== bUnlocked) {
      return bUnlocked ? 1 : -1; // Unlocked first
    }
    
    const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
    const aPriority = rarityOrder[a.rarity as keyof typeof rarityOrder];
    const bPriority = rarityOrder[b.rarity as keyof typeof rarityOrder];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher rarity first
    }
    
    return a.name.localeCompare(b.name);
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  // Calculate stats
  const totalPoints = userAchievements.reduce((sum, ua) => {
    const achievement = achievements.find(a => a.id === ua.achievementId);
    return sum + (achievement?.points || 0);
  }, 0);

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <Trophy className="w-6 h-6 animate-spin" />
            <span>Loading achievements...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="achievements-grid">
      {/* Stats Header */}
      <div className="bg-gradient-to-r from-casino-gold to-yellow-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Achievements</h2>
            <p className="text-yellow-100">
              {unlockedCount} of {totalCount} unlocked • {totalPoints} total points
            </p>
          </div>
          <div className="text-right">
            <Medal className="w-12 h-12 mb-2 mx-auto text-yellow-200" />
            <div className="text-sm text-yellow-100">Achievement Level</div>
            <div className="text-xl font-bold">
              {Math.floor(totalPoints / 100) + 1}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-yellow-100 mb-1">
            <span>Progress</span>
            <span>{Math.round((unlockedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-yellow-600 rounded-full h-2">
            <motion.div
              className="bg-white rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-casino-gold focus:border-transparent"
            data-testid="search-achievements"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Category Filter */}
          <div className="flex items-center space-x-1">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Category:</span>
            {(['all', 'games', 'social', 'milestone', 'special'] as FilterCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-casino-gold text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                data-testid={`filter-category-${cat}`}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Rarity Filter */}
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">Rarity:</span>
            {(['all', 'common', 'rare', 'epic', 'legendary'] as FilterRarity[]).map((rarity) => (
              <button
                key={rarity}
                onClick={() => setRarityFilter(rarity)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  rarityFilter === rarity
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                data-testid={`filter-rarity-${rarity}`}
              >
                {rarity === 'all' ? 'All' : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">Status:</span>
            {(['all', 'unlocked', 'locked'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                data-testid={`filter-status-${status}`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {sortedAchievements.length} of {achievements.length} achievements
      </div>

      {/* Achievements Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sortedAchievements.map((achievement) => {
          const userAchievement = userAchievementMap.get(achievement.id);
          const isLocked = !userAchievement;

          return (
            <motion.div
              key={achievement.id}
              variants={itemVariants}
              className="flex flex-col items-center"
            >
              <AchievementBadge
                achievement={achievement}
                userAchievement={userAchievement}
                isLocked={isLocked}
                size="md"
              />
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-900 truncate w-16">
                  {achievement.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {achievement.rarity}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {sortedAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}