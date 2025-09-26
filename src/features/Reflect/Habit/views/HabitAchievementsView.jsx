"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Trophy,
    Target,
    Zap,
    Calendar,
    Award,
    Star,
    Crown,
    Medal,
    Flame,
    Clock,
    BarChart3,
    Settings,
    Sunrise,
    Moon,
    RotateCcw,
    Palette,
    Sword,
} from "lucide-react";
import useReflectStore from "@/store/reflect.store";
import useAchievement from "../lib/hooks/useAchievement";
import useGlobalStore from "@/store/global.store";

const HabitAchievementsView = () => {
    const {
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
    } = useAchievement();
    const { habitsData, getActiveHabits } = useReflectStore();
    const { user } = useGlobalStore();
    const activeHabits = useMemo( () => ( getActiveHabits() ), [ habitsData ] );
    // const { user, getActiveHabits } = useHabitStore();
    // const habits = getActiveHabits();

    const stats = useMemo( () => calculateUserStats( user, activeHabits ), [ user, activeHabits ] );
    const levelProgress = useMemo( () => getUserLevelProgress( user.habitTrackerData.totalPoints ), [ user ] );

    const achievementsByCategory = useMemo( () => {
        const categories = {};

        Object.entries( ACHIEVEMENT_DEFINITIONS ).forEach( ( [ key, achievement ] ) => {
            if ( !categories[ achievement.category ] ) {
                categories[ achievement.category ] = [];
            }

            const progress = getAchievementProgress( key, stats[ achievement.type ] || 0 );
            const earnedAchievements = user.habitTrackerData.achievements.filter( ( a ) => a.key === key );

            categories[ achievement.category ].push( {
                key,
                ...achievement,
                progress,
                earnedAchievements,
                currentValue: stats[ achievement.type ] || 0,
            } );
        } );

        return categories;
    }, [ stats, user ] );

    const totalEarned = user.habitTrackerData.achievements.length;
    const totalPossible = Object.values( ACHIEVEMENT_DEFINITIONS ).reduce(
        ( sum, achievement ) => sum + achievement.maxTier,
        0,
    );

    const recentAchievements = user.habitTrackerData.achievements
        .sort( ( a, b ) => new Date( b.earnedAt ) - new Date( a.earnedAt ) )
        .slice( 0, 5 );

    const categoryColors = {
        consistency: "text-blue-400",
        longevity: "text-green-400",
        engagement: "text-purple-400",
        milestone: "text-yellow-400",
        special: "text-pink-400",
    };

    const categoryIcons = {
        consistency: Target,
        longevity: Clock,
        engagement: Zap,
        milestone: Trophy,
        special: Star,
    };

    // Icon mapping for achievements
    const getAchievementIcon = ( achievementKey ) => {
        const iconMap = {
            daily_warrior: Flame,
            habit_master: Target,
            streak_legend: Zap,
            multi_streaker: Star,
            veteran: Trophy,
            time_traveler: Calendar,
            habit_creator: Settings,
            data_explorer: BarChart3,
            perfectionist: Crown,
            point_collector: Award,
            level_climber: Medal,
            early_bird: Sunrise,
            night_owl: Moon,
            comeback_kid: RotateCcw,
            variety_seeker: Palette,
            difficulty_master: Sword,
        };
        return iconMap[ achievementKey ] || Star;
    };

    const renderAchievementCard = ( achievement ) => {
        const { progress, earnedAchievements, currentValue } = achievement;
        const latestEarned = earnedAchievements[ earnedAchievements.length - 1 ];
        const IconComponent = getAchievementIcon( achievement.key );

        return (
            <Card key={ achievement.key } className="relative bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <IconComponent className="w-5 h-5 text-cyan-400" />
                            <div>
                                <CardTitle className="text-sm text-slate-100">{ achievement.name }</CardTitle>
                                <div className="text-xs text-slate-400 capitalize">{ achievement.category }</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-slate-100">
                                { progress.currentTier }/{ progress.maxTier }
                            </div>
                            <div className="text-xs text-slate-400">Tiers</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-2">
                        {/* Current progress */ }
                        <div className="text-xs text-slate-300">
                            { progress.isMaxed ? (
                                <span className="text-green-400 font-medium flex items-center gap-1">
                                    <Trophy className="w-3 h-3" />
                                    Maxed Out!
                                </span>
                            ) : (
                                <span>
                                    { currentValue.toLocaleString() } / { progress.nextRequirement?.toLocaleString() || "∞" }
                                </span>
                            ) }
                        </div>

                        {/* Progress bar */ }
                        { !progress.isMaxed && <Progress value={ Math.min( progress.progress, 100 ) } className="h-2 bg-slate-700" /> }

                        {/* Latest earned tier */ }
                        { latestEarned && (
                            <div className="flex items-center justify-between text-xs">
                                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                                    <IconComponent className="w-3 h-3 mr-1" />
                                    Tier { latestEarned.tier }
                                </Badge>
                                <span className="text-slate-400">+{ latestEarned.points } pts</span>
                            </div>
                        ) }

                        {/* Next tier preview */ }
                        { !progress.isMaxed && (
                            <div className="text-xs text-slate-400">
                                Next:{ " " }
                                { achievement.description.replace(
                                    /\{(days|count|points|level|months)\}/g,
                                    progress.nextRequirement?.toLocaleString() || "∞",
                                ) }
                            </div>
                        ) }
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-4">
            {/* User Level & Overview */ }
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2 bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center space-x-2 text-slate-100">
                            <Medal className="w-6 h-6 text-yellow-400" />
                            <span>Level { levelProgress.currentLevel }</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-300">
                                <span>{ levelProgress.pointsInCurrentLevel.toLocaleString() } points</span>
                                <span>{ levelProgress.pointsNeededForLevel.toLocaleString() } needed</span>
                            </div>
                            <Progress value={ levelProgress.progress } className="h-3 bg-slate-700" />
                            <div className="text-xs text-slate-400 text-center">
                                { ( levelProgress.pointsNeededForLevel - levelProgress.pointsInCurrentLevel ).toLocaleString() } points to
                                level { levelProgress.currentLevel + 1 }
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-400">{ totalEarned }</div>
                            <div className="text-xs text-slate-400">of { totalPossible } achievements</div>
                            <div className="text-xs text-slate-400 mt-1">
                                { ( ( totalEarned / totalPossible ) * 100 ).toFixed( 1 ) }% complete
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Achievements */ }
            { recentAchievements.length > 0 && (
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-100">Recent Achievements</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2">
                            { recentAchievements.map( ( achievement ) => {
                                const IconComponent = getAchievementIcon( achievement.key );
                                return (
                                    <div
                                        key={ achievement.id }
                                        className="flex items-center justify-between p-2 rounded border border-slate-700 bg-slate-900/50"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <IconComponent className="w-5 h-5 text-cyan-400" />
                                            <div>
                                                <div className="text-xs font-medium text-slate-100">{ achievement.name }</div>
                                                <div className="text-xs text-slate-400">{ achievement.description }</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                                                +{ achievement.points }
                                            </Badge>
                                            <div className="text-xs text-slate-400">
                                                { new Date( achievement.earnedAt ).toLocaleDateString() }
                                            </div>
                                        </div>
                                    </div>
                                );
                            } ) }
                        </div>
                    </CardContent>
                </Card>
            ) }

            {/* Achievement Categories */ }
            <Tabs defaultValue="consistency" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
                    { Object.keys( categoryColors ).map( ( category ) => {
                        const IconComponent = categoryIcons[ category ];
                        return (
                            <TabsTrigger
                                key={ category }
                                value={ category }
                                className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                            >
                                <IconComponent className="w-3 h-3 mr-1" />
                                { category.charAt( 0 ).toUpperCase() + category.slice( 1 ) }
                            </TabsTrigger>
                        );
                    } ) }
                </TabsList>

                { Object.entries( achievementsByCategory ).map( ( [ category, achievements ] ) => (
                    <TabsContent key={ category } value={ category }>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            { achievements.map( renderAchievementCard ) }
                        </div>
                    </TabsContent>
                ) ) }
            </Tabs>

            {/* Statistics Summary */ }
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-100">Your Statistics</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div className="text-center">
                            <div className="text-lg font-bold text-blue-400">{ stats.daily_signin_streak }</div>
                            <div className="text-slate-400">Sign-in Streak</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-400">{ stats.total_habit_completions }</div>
                            <div className="text-slate-400">Total Completions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-purple-400">{ stats.longest_habit_streak }</div>
                            <div className="text-slate-400">Longest Streak</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-yellow-400">{ stats.simultaneous_streaks }</div>
                            <div className="text-slate-400">Active Streaks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-pink-400">{ stats.habits_created }</div>
                            <div className="text-slate-400">Habits Created</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-orange-400">{ stats.total_days_active }</div>
                            <div className="text-slate-400">Days Active</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-red-400">{ stats.perfect_days }</div>
                            <div className="text-slate-400">Perfect Days</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-indigo-400">{ stats.hero_habits_active }</div>
                            <div className="text-slate-400">Hero Habits</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default HabitAchievementsView;
