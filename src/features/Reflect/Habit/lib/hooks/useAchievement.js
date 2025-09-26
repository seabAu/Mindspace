
import React from 'react';
import { Button } from '@/components/ui/button';
import { BellRingIcon } from 'lucide-react';
import { differenceInDays } from "date-fns";
import useReflect from '@/lib/hooks/useReflect';
// import { getUserData, saveUserData, awardPoints } from "./user-data";
// import { calculateHabitStreak } from '../utilities/rewards-system';

const useAchievement = () => {
    const { user, setUser } = useGlobalStore();
    const { calculateHabitStreak } = useReflect();
    /**
     * Calculate user level based on total points using shallow exponential growth
     * Formula: level = floor(log(points/100 + 1) / log(1.15)) + 1
     * Each level requires ~15% more points than the previous
     */
    const calculateUserLevel = ( totalPoints ) => {
        if ( totalPoints < 100 ) return 1;
        return Math.floor( Math.log( totalPoints / 100 + 1 ) / Math.log( 1.15 ) ) + 1;
    };

    /**
     * Calculate points needed for next level
     */
    const getPointsForLevel = ( level ) => {
        if ( level <= 1 ) return 100;
        return Math.floor( 100 * ( Math.pow( 1.15, level - 1 ) - 1 ) );
    };

    /**
     * Get points needed for next level from current points
     */
    const getPointsToNextLevel = ( currentPoints ) => {
        const currentLevel = calculateUserLevel( currentPoints );
        const nextLevelPoints = getPointsForLevel( currentLevel + 1 );
        return nextLevelPoints - currentPoints;
    };

    /**
     * Achievement definitions with mathematical progression
     */
    const ACHIEVEMENT_DEFINITIONS = {
        // CONSISTENCY ACHIEVEMENTS
        daily_warrior: {
            name: "Daily Warrior",
            description: "Sign in consecutively for {days} days",
            category: "consistency",
            type: "daily_signin_streak",
            tiers: ( n ) => Math.pow( 2, n ) * 3, // 3, 6, 12, 24, 48, 96...
            points: ( tier ) => tier * 50 + 25, // 75, 125, 175, 225...
            maxTier: 20,
        },

        habit_master: {
            name: "Habit Master",
            description: "Complete any habit {count} times",
            category: "consistency",
            type: "total_habit_completions",
            tiers: ( n ) => Math.pow( 2, n ) * 5, // 5, 10, 20, 40, 80...
            points: ( tier ) => tier * 30 + 20, // 50, 80, 110, 140...
            maxTier: 25,
        },

        streak_legend: {
            name: "Streak Legend",
            description: "Maintain a {days}-day streak on any habit",
            category: "consistency",
            type: "longest_habit_streak",
            tiers: ( n ) => Math.pow( 1.5, n ) * 7, // 7, 10, 15, 23, 34, 51...
            points: ( tier ) => tier * 75 + 50, // 125, 200, 275, 350...
            maxTier: 15,
        },

        multi_streaker: {
            name: "Multi-Streaker",
            description: "Maintain {count} active streaks simultaneously",
            category: "consistency",
            type: "simultaneous_streaks",
            tiers: ( n ) => n + 2, // 3, 4, 5, 6, 7...
            points: ( tier ) => tier * 100 + 100, // 200, 300, 400, 500...
            maxTier: 20,
        },

        // LONGEVITY ACHIEVEMENTS
        veteran: {
            name: "Platform Veteran",
            description: "Use the app for {days} total days",
            category: "longevity",
            type: "total_days_active",
            tiers: ( n ) => Math.pow( 1.8, n ) * 10, // 10, 18, 32, 58, 104...
            points: ( tier ) => tier * 60 + 40, // 100, 160, 220, 280...
            maxTier: 18,
        },

        time_traveler: {
            name: "Time Traveler",
            description: "Track habits across {months} different months",
            category: "longevity",
            type: "months_active",
            tiers: ( n ) => n * 2 + 1, // 3, 5, 7, 9, 11...
            points: ( tier ) => tier * 80 + 70, // 150, 230, 310, 390...
            maxTier: 24,
        },

        // ENGAGEMENT ACHIEVEMENTS
        habit_creator: {
            name: "Habit Creator",
            description: "Create {count} different habits",
            category: "engagement",
            type: "habits_created",
            tiers: ( n ) => Math.pow( 1.4, n ) * 2, // 2, 3, 4, 6, 8, 11...
            points: ( tier ) => tier * 40 + 35, // 75, 115, 155, 195...
            maxTier: 15,
        },

        data_explorer: {
            name: "Data Explorer",
            description: "View charts {count} times",
            category: "engagement",
            type: "charts_viewed",
            tiers: ( n ) => Math.pow( 2, n ) * 5, // 5, 10, 20, 40, 80...
            points: ( tier ) => tier * 15 + 10, // 25, 40, 55, 70...
            maxTier: 20,
        },

        perfectionist: {
            name: "Perfectionist",
            description: "Complete all active habits in a single day {count} times",
            category: "engagement",
            type: "perfect_days",
            tiers: ( n ) => Math.pow( 1.6, n ) * 2, // 2, 3, 5, 8, 13, 21...
            points: ( tier ) => tier * 120 + 80, // 200, 320, 440, 560...
            maxTier: 12,
        },

        // MILESTONE ACHIEVEMENTS
        point_collector: {
            name: "Point Collector",
            description: "Accumulate {points} total points",
            category: "milestone",
            type: "total_points",
            tiers: ( n ) => Math.pow( 2.5, n ) * 500, // 500, 1250, 3125, 7812...
            points: ( tier ) => tier * 200 + 100, // 300, 500, 700, 900...
            maxTier: 15,
        },

        level_climber: {
            name: "Level Climber",
            description: "Reach user level {level}",
            category: "milestone",
            type: "user_level",
            tiers: ( n ) => n * 5, // 5, 10, 15, 20, 25...
            points: ( tier ) => tier * 150 + 200, // 350, 500, 650, 800...
            maxTier: 20,
        },

        // SPECIAL ACHIEVEMENTS
        early_bird: {
            name: "Early Bird",
            description: "Complete habits before 8 AM {count} times",
            category: "special",
            type: "early_completions",
            tiers: ( n ) => Math.pow( 1.7, n ) * 3, // 3, 5, 9, 15, 26...
            points: ( tier ) => tier * 45 + 30, // 75, 120, 165, 210...
            maxTier: 12,
        },

        night_owl: {
            name: "Night Owl",
            description: "Complete habits after 10 PM {count} times",
            category: "special",
            type: "late_completions",
            tiers: ( n ) => Math.pow( 1.7, n ) * 3, // 3, 5, 9, 15, 26...
            points: ( tier ) => tier * 45 + 30, // 75, 120, 165, 210...
            maxTier: 12,
        },

        comeback_kid: {
            name: "Comeback Kid",
            description: "Restart a habit after a {days}+ day break {count} times",
            category: "special",
            type: "habit_restarts",
            tiers: ( n ) => n + 1, // 2, 3, 4, 5, 6...
            points: ( tier ) => tier * 90 + 60, // 150, 240, 330, 420...
            maxTier: 15,
        },

        variety_seeker: {
            name: "Variety Seeker",
            description: "Have {count} different habit types active",
            category: "special",
            type: "habit_types_active",
            tiers: ( n ) => n + 2, // 3, 4, 5, 6, 7...
            points: ( tier ) => tier * 70 + 50, // 120, 190, 260, 330...
            maxTier: 10,
        },

        difficulty_master: {
            name: "Difficulty Master",
            description: "Maintain {count} 'Hero' difficulty habits simultaneously",
            category: "special",
            type: "hero_habits_active",
            tiers: ( n ) => n + 1, // 2, 3, 4, 5, 6...
            points: ( tier ) => tier * 150 + 100, // 250, 400, 550, 700...
            maxTier: 8,
        },
    };

    /**
     * Calculate current tier for an achievement
     */
    const calculateAchievementTier = ( achievementKey, currentValue ) => {
        const achievement = ACHIEVEMENT_DEFINITIONS[ achievementKey ];
        if ( !achievement ) return 0;

        for ( let tier = 1; tier <= achievement.maxTier; tier++ ) {
            const requiredValue = Math.floor( achievement.tiers( tier ) );
            if ( currentValue < requiredValue ) {
                return tier - 1;
            }
        }
        return achievement.maxTier;
    };

    /**
     * Get next tier requirement for an achievement
     */
    const getNextTierRequirement = ( achievementKey, currentTier ) => {
        const achievement = ACHIEVEMENT_DEFINITIONS[ achievementKey ];
        if ( !achievement || currentTier >= achievement.maxTier ) return null;

        return Math.floor( achievement.tiers( currentTier + 1 ) );
    };

    /**
     * Check and award new achievements
     */
    const checkAndAwardAchievements = ( habits = [] ) => {
        // const userData = getUserData();
        const userData = user;
        const currentAchievements = userData.habitTrackerData.achievements || [];
        const newAchievements = [];

        // Calculate current stats
        const stats = calculateUserStats( userData, habits );

        // Check each achievement type
        Object.entries( ACHIEVEMENT_DEFINITIONS ).forEach( ( [ key, achievement ] ) => {
            const currentValue = stats[ achievement.type ] || 0;
            const currentTier = calculateAchievementTier( key, currentValue );

            // Check if user has earned any new tiers
            for ( let tier = 1; tier <= currentTier; tier++ ) {
                const achievementId = `${ key }_tier_${ tier }`;
                const alreadyEarned = currentAchievements.some( ( a ) => a.id === achievementId );

                if ( !alreadyEarned ) {
                    const requiredValue = Math.floor( achievement.tiers( tier ) );
                    const points = achievement.points( tier );

                    const newAchievement = {
                        id: achievementId,
                        key,
                        tier,
                        name: `${ achievement.name } ${ tier }`,
                        description: achievement.description.replace(
                            /\{(days|count|points|level|months)\}/g,
                            requiredValue.toLocaleString(),
                        ),
                        category: achievement.category,
                        points,
                        earnedAt: new Date(),
                        requiredValue,
                    };

                    newAchievements.push( newAchievement );
                    userData.habitTrackerData.achievements.push( newAchievement );

                    // Award points
                    awardPoints( points, `Achievement: ${ newAchievement.name }` );
                }
            }
        } );

        if ( newAchievements.length > 0 ) {
            setUser( userData );
        }

        return newAchievements;
    };

    /**
     * Calculate user statistics for achievement checking
     */
    const calculateUserStats = ( userData, habits ) => {
        const now = new Date();
        const registerDate = new Date( userData.register_date );
        const daysSinceRegister = differenceInDays( now, registerDate );

        // Calculate habit-related stats
        let totalHabitCompletions = 0;
        let longestHabitStreak = 0;
        let activeStreaks = 0;
        let perfectDays = 0;
        const habitsCreated = habits.length;
        let heroHabitsActive = 0;
        const habitTypesActive = new Set();

        habits.forEach( ( habit ) => {
            // Count completions
            const completions = habit.activity.filter( ( a ) => {
                if ( habit.inputType === "custom" ) {
                    return a.notes && a.notes.trim() !== "";
                }
                return a.value > 0;
            } ).length;
            totalHabitCompletions += completions;

            // Calculate streaks
            const streakData = calculateHabitStreak( habit );
            if ( streakData.current > 0 ) activeStreaks++;
            longestHabitStreak = Math.max( longestHabitStreak, streakData.longest );

            // Count hero difficulty habits
            if ( habit.difficulty === "hero" && habit.isActive ) {
                heroHabitsActive++;
            }

            // Count habit types
            if ( habit.isActive && habit.habitType && habit.habitType !== "none" ) {
                habitTypesActive.add( habit.habitType );
            }
        } );

        // Calculate perfect days (simplified - would need more complex logic in real app)
        const activeHabits = habits.filter( ( h ) => h.isActive );
        if ( activeHabits.length > 0 ) {
            // This is a simplified calculation - in reality you'd check each day
            perfectDays = Math.floor( totalHabitCompletions / activeHabits.length / 10 ); // Rough estimate
        }

        return {
            daily_signin_streak: userData.habitTrackerData.dailySignInStreak || 0,
            total_habit_completions: totalHabitCompletions,
            longest_habit_streak: longestHabitStreak,
            simultaneous_streaks: activeStreaks,
            total_days_active: daysSinceRegister,
            months_active: Math.ceil( daysSinceRegister / 30 ),
            habits_created: habitsCreated,
            charts_viewed: userData.habitTrackerData.chartsViewed || 0,
            perfect_days: perfectDays,
            total_points: userData.habitTrackerData.totalPoints || 0,
            user_level: calculateUserLevel( userData.habitTrackerData.totalPoints || 0 ),
            early_completions: userData.habitTrackerData.earlyCompletions || 0,
            late_completions: userData.habitTrackerData.lateCompletions || 0,
            habit_restarts: userData.habitTrackerData.habitRestarts || 0,
            habit_types_active: habitTypesActive.size,
            hero_habits_active: heroHabitsActive,
        };
    };

    /**
     * Get achievement progress for display
     */
    const getAchievementProgress = ( achievementKey, currentValue ) => {
        const achievement = ACHIEVEMENT_DEFINITIONS[ achievementKey ];
        if ( !achievement ) return null;

        const currentTier = calculateAchievementTier( achievementKey, currentValue );
        const nextRequirement = getNextTierRequirement( achievementKey, currentTier );

        return {
            currentTier,
            maxTier: achievement.maxTier,
            currentValue,
            nextRequirement,
            progress: nextRequirement ? ( currentValue / nextRequirement ) * 100 : 100,
            isMaxed: currentTier >= achievement.maxTier,
        };
    };

    /**
     * Get user level progress
     */
    const getUserLevelProgress = ( totalPoints ) => {
        const currentLevel = calculateUserLevel( totalPoints );
        const currentLevelPoints = getPointsForLevel( currentLevel );
        const nextLevelPoints = getPointsForLevel( currentLevel + 1 );
        const pointsInCurrentLevel = totalPoints - currentLevelPoints;
        const pointsNeededForLevel = nextLevelPoints - currentLevelPoints;

        return {
            currentLevel,
            totalPoints,
            currentLevelPoints,
            nextLevelPoints,
            pointsInCurrentLevel,
            pointsNeededForLevel,
            progress: ( pointsInCurrentLevel / pointsNeededForLevel ) * 100,
        };
    };

    return {
        calculateUserLevel,
        getPointsForLevel,
        getPointsToNextLevel,
        ACHIEVEMENT_DEFINITIONS,
        calculateAchievementTier,
        getNextTierRequirement,
        checkAndAwardAchievements,
        calculateUserStats,
        getAchievementProgress,
        getUserLevelProgress,
    };
};

export default useAchievement;
