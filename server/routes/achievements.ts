import { Router } from 'express';
import { achievementStorage } from '../achievement-storage';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/achievements - Get all achievements and user achievements
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = parseInt(req.user.id);
    const achievements = achievementStorage.getAchievements();
    const userAchievements = achievementStorage.getUserAchievements(userId);
    
    // Check for new achievements based on user data
    const newAchievements = achievementStorage.checkAndUnlockAchievements(userId, req.user.balance || 0);
    
    res.json({
      achievements,
      userAchievements: [...userAchievements, ...newAchievements]
    });
  } catch (error) {
    console.error("Achievement fetch error:", error);
    res.status(500).json({ message: "Failed to fetch achievements" });
  }
});

// POST /api/achievements/:achievementId/mark-viewed - Mark achievement as viewed
router.post('/:achievementId/mark-viewed', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    achievementStorage.markAchievementAsViewed(parseInt(req.user.id), req.params.achievementId);
    res.json({ success: true });
  } catch (error) {
    console.error("Mark achievement viewed error:", error);
    res.status(500).json({ message: "Failed to mark achievement as viewed" });
  }
});

// POST /api/achievements/game-win - Trigger game win achievements
router.post('/game-win', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const newAchievements = achievementStorage.unlockGameWinAchievement(parseInt(req.user.id));
    res.json({ newAchievements });
  } catch (error) {
    console.error("Game win achievement error:", error);
    res.status(500).json({ message: "Failed to process game win achievements" });
  }
});

export default router;