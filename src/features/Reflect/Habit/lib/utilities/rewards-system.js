import { differenceInDays } from "date-fns";
import { awardPoints, getUserData, saveUserData } from "./user-data";
import { DAILY_POINTS, HABIT_DIFFICULTY_OPTIONS, STREAK_MILESTONES } from "@/lib/config/constants";

/**
 * Calculate streak for a habit considering interval and difficulty
 */
export const calculateHabitStreak = ( habit ) => {
    const difficulty = HABIT_DIFFICULTY_OPTIONS.find( ( d ) => d.value === habit.difficulty ) || HABIT_DIFFICULTY_OPTIONS[ 1 ];
    const interval = habit.interval || 0;
    const intervalDays = interval === 0 ? 1 : interval;

    const sortedActivity = habit.activity
        .filter( ( a ) => {
            if ( habit.inputType === "custom" ) {
                return a.notes && a.notes.trim() !== "";
            }
            return a.value > 0;
        } )
        .sort( ( a, b ) => new Date( a.date ) - new Date( b.date ) );

    if ( sortedActivity.length === 0 ) {
        return { current: 0, longest: 0, total: 0, lastActivity: null, missedIntervals: 0 };
    }

    const today = new Date();
    const lastActivityDate = new Date( sortedActivity[ sortedActivity.length - 1 ].date );

    // Calculate current streak
    let currentStreak = 0;
    const missedIntervals = 0;
    let totalMissedInCurrentStreak = 0;

    // Check if we're within grace period from today
    const daysSinceLastActivity = differenceInDays( today, lastActivityDate );
    const allowedGap = intervalDays * difficulty.graceMultiplier;

    if ( daysSinceLastActivity <= allowedGap ) {
        currentStreak = 1;

        // Count backwards through activities
        for ( let i = sortedActivity.length - 2; i >= 0; i-- ) {
            const currentDate = new Date( sortedActivity[ i + 1 ].date );
            const prevDate = new Date( sortedActivity[ i ].date );
            const daysBetween = differenceInDays( currentDate, prevDate );

            // Expected gap is the interval
            const expectedGap = intervalDays;
            const maxAllowedGap = intervalDays * difficulty.graceMultiplier;

            if ( daysBetween <= maxAllowedGap ) {
                currentStreak++;

                // Count missed intervals in this gap
                if ( daysBetween > expectedGap ) {
                    const missedInThisGap = Math.floor( ( daysBetween - expectedGap ) / intervalDays );
                    totalMissedInCurrentStreak += missedInThisGap;

                    // For "hero" difficulty, check if we've exceeded the limit
                    if ( difficulty.value === "hero" && totalMissedInCurrentStreak > difficulty.maxMissedIntervals ) {
                        break;
                    }
                }
            } else {
                break;
            }
        }
    }

    // Calculate longest streak (similar logic but for all time)
    let longestStreak = 0;
    let tempStreak = 1;
    let tempMissed = 0;

    for ( let i = 1; i < sortedActivity.length; i++ ) {
        const currentDate = new Date( sortedActivity[ i ].date );
        const prevDate = new Date( sortedActivity[ i - 1 ].date );
        const daysBetween = differenceInDays( currentDate, prevDate );
        const maxAllowedGap = intervalDays * difficulty.graceMultiplier;

        if ( daysBetween <= maxAllowedGap ) {
            tempStreak++;

            if ( daysBetween > intervalDays ) {
                const missedInThisGap = Math.floor( ( daysBetween - intervalDays ) / intervalDays );
                tempMissed += missedInThisGap;

                if ( difficulty.value === "hero" && tempMissed > difficulty.maxMissedIntervals ) {
                    longestStreak = Math.max( longestStreak, tempStreak - 1 );
                    tempStreak = 1;
                    tempMissed = 0;
                }
            }
        } else {
            longestStreak = Math.max( longestStreak, tempStreak );
            tempStreak = 1;
            tempMissed = 0;
        }
    }
    longestStreak = Math.max( longestStreak, tempStreak );

    return {
        current: currentStreak,
        longest: longestStreak,
        total: sortedActivity.length,
        lastActivity: lastActivityDate,
        missedIntervals: totalMissedInCurrentStreak,
        difficulty: difficulty.value,
        pointsMultiplier: difficulty.pointsMultiplier,
    };
};

/**
 * Award points for habit completion
 */
export const awardHabitCompletionPoints = ( habit, streakData ) => {
    const basePoints = DAILY_POINTS.HABIT_COMPLETION;
    const streakBonus = Math.floor( streakData.current / 7 ) * DAILY_POINTS.STREAK_BONUS_BASE;
    const difficultyMultiplier = streakData.pointsMultiplier || 1;

    const totalPoints = Math.floor( ( basePoints + streakBonus ) * difficultyMultiplier );

    awardPoints( totalPoints, `${ habit.title } completion (${ streakData.current } day streak)` );

    // Check for milestone achievements
    const milestone = STREAK_MILESTONES.find( ( m ) => m.days === streakData.current );
    if ( milestone ) {
        awardPoints( milestone.points, `Milestone: ${ milestone.name } for ${ habit.title }` );
    }

    return totalPoints;
};

/**
 * Award daily sign-in points
 */
export const awardDailySignIn = ( userData, saveUserData = () => { } ) => {
    if ( !userData || saveUserData ) {
        console.error( "Error in habits rewards system: Cannot reward daily sign in, user is not defined." );
        return;
    }
    // const userData = getUserData();
    const today = new Date().toDateString();

    if ( userData.habitTrackerData.lastSignIn !== today ) {
        userData.habitTrackerData.lastSignIn = today;
        userData.habitTrackerData.dailySignInStreak += 1;
        saveUserData( userData );

        const points = DAILY_POINTS.SIGN_IN + Math.floor( userData.habitTrackerData.dailySignInStreak / 7 ) * 5;
        awardPoints( points, `Daily sign-in (${ userData.habitTrackerData.dailySignInStreak } day streak)` );

        return points;
    }

    return 0;
};

/**
 * Get streak level information
 */
export const getStreakLevel = ( streak, difficulty = "determined" ) => {
    const difficultyData = HABIT_DIFFICULTY_OPTIONS.find( ( d ) => d.value === difficulty ) || HABIT_DIFFICULTY_OPTIONS[ 1 ];

    if ( streak >= 365 ) return { level: "Legendary", icon: "👑", color: "text-yellow-500" };
    if ( streak >= 180 ) return { level: "Master", icon: "🏆", color: "text-purple-500" };
    if ( streak >= 90 ) return { level: "Expert", icon: "🥇", color: "text-blue-500" };
    if ( streak >= 30 ) return { level: "Champion", icon: "🥈", color: "text-green-500" };
    if ( streak >= 14 ) return { level: "Warrior", icon: "⚔️", color: "text-orange-500" };
    if ( streak >= 7 ) return { level: "Fighter", icon: "💪", color: "text-red-500" };
    return { level: "Beginner", icon: "🌱", color: "text-gray-500" };
};
