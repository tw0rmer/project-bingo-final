import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { AchievementsGrid } from "@/components/achievements/achievements-grid";
import { AchievementNotification } from "@/components/achievements/achievement-notification";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import type { Achievement, UserAchievement } from "@shared/schema";

interface AchievementData {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
}

export default function AchievementsPage() {
  const { user } = useAuth();
  const [newAchievements, setNewAchievements] = useState<Array<{achievement: Achievement, userAchievement: UserAchievement}>>([]);

  const { data, isLoading, error } = useQuery<AchievementData>({
    queryKey: ["/api/achievements"],
    enabled: !!user,
  });

  // Check for new achievements and show notifications
  useEffect(() => {
    if (data?.userAchievements) {
      const newUnlocked = data.userAchievements
        .filter(ua => ua.isNew)
        .map(ua => {
          const achievement = data.achievements.find(a => a.id === ua.achievementId);
          return achievement ? { achievement, userAchievement: ua } : null;
        })
        .filter(Boolean) as Array<{achievement: Achievement, userAchievement: UserAchievement}>;
      
      if (newUnlocked.length > 0) {
        setNewAchievements(newUnlocked);
        
        // Mark achievements as viewed after showing notifications
        setTimeout(() => {
          newUnlocked.forEach(({ userAchievement }) => {
            apiRequest('POST', `/api/achievements/${userAchievement.achievementId}/mark-viewed`)
              .catch(console.error);
          });
        }, 1000);
      }
    }
  }, [data]);

  const handleCloseNotification = (index: number) => {
    setNewAchievements(prev => prev.filter((_, i) => i !== index));
  };

  if (!user) {
    return (
      <SiteLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600">Please sign in to view your achievements.</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (error) {
    return (
      <SiteLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Achievements</h2>
            <p className="text-gray-600">Unable to load your achievements. Please try again later.</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Achievements</h1>
          <p className="text-lg text-gray-600">
            Unlock badges by playing games, reaching milestones, and engaging with the community.
          </p>
        </div>

        <AchievementsGrid
          achievements={data?.achievements || []}
          userAchievements={data?.userAchievements || []}
          isLoading={isLoading}
        />
      </div>

      {/* Achievement Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {newAchievements.map(({ achievement, userAchievement }, index) => (
          <AchievementNotification
            key={`${userAchievement.id}-${index}`}
            achievement={achievement}
            userAchievement={userAchievement}
            onClose={() => handleCloseNotification(index)}
            autoClose={true}
            duration={6000}
          />
        ))}
      </div>
    </SiteLayout>
  );
}