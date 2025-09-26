"use client";

import { useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Target, Calendar, TrendingUp, Award, Zap, Star, Crown, Medal } from "lucide-react";
import useReflectStore from "@/store/reflect.store";
import useReflect from "@/lib/hooks/useReflect";

const HabitStreaksView = () => {
    const { habitsData, getActiveHabits } = useReflectStore();
    const {
        calculateHabitStreak,
        awardHabitCompletionPoints,
        awardDailySignIn,
        getStreakLevel,
        getNextMilestone
    } = useReflect();

    // const activeHabits = getActiveHabits();
    const activeHabits = useMemo( () => ( getActiveHabits() ), [ habitsData ] );

    const calculateStreaks = ( habit ) => {
        const sortedActivity = habit.activity
            .filter( ( a ) => {
                if ( habit.inputType === "custom" ) {
                    return a.notes && a.notes.trim() !== "";
                }
                return a.value > 0;
            } )
            .sort( ( a, b ) => new Date( a.date ) - new Date( b.date ) );

        if ( sortedActivity.length === 0 ) {
            return { current: 0, longest: 0, total: 0, lastActivity: null };
        }

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 1;
        const total = sortedActivity.length;

        const today = new Date();
        const lastActivityDate = new Date( sortedActivity[ sortedActivity.length - 1 ].date );

        const daysSinceLastActivity = differenceInDays( today, lastActivityDate );
        if ( daysSinceLastActivity <= 1 ) {
            currentStreak = 1;
            for ( let i = sortedActivity.length - 2; i >= 0; i-- ) {
                const currentDate = new Date( sortedActivity[ i + 1 ].date );
                const prevDate = new Date( sortedActivity[ i ].date );
                const daysDiff = differenceInDays( currentDate, prevDate );

                if ( daysDiff === 1 ) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        for ( let i = 1; i < sortedActivity.length; i++ ) {
            const currentDate = new Date( sortedActivity[ i ].date );
            const prevDate = new Date( sortedActivity[ i - 1 ].date );
            const daysDiff = differenceInDays( currentDate, prevDate );

            if ( daysDiff === 1 ) {
                tempStreak++;
            } else {
                longestStreak = Math.max( longestStreak, tempStreak );
                tempStreak = 1;
            }
        }
        longestStreak = Math.max( longestStreak, tempStreak );

        return {
            current: currentStreak,
            longest: longestStreak,
            total,
            lastActivity: lastActivityDate,
        };
    };

    const habitStreaks = useMemo(
        () =>
            activeHabits.map( ( habit ) => ( {
                ...habit,
                streaks: calculateStreaks( habit ),
            } ) ),
        [ activeHabits ],
    );

    const topStreaks = habitStreaks.sort( ( a, b ) => b.streaks.current - a.streaks.current ).slice( 0, 3 );

    const totalActiveStreaks = habitStreaks.filter( ( h ) => h.streaks.current > 0 ).length;
    const averageStreak = habitStreaks.reduce( ( sum, h ) => sum + h.streaks.current, 0 ) / habitStreaks.length || 0;

    return (
        <div className="space-y-4">
            {/* Overview Stats */ }
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <div>
                                <div className="text-lg font-bold text-slate-100">{ totalActiveStreaks }</div>
                                <div className="text-xs text-slate-400">Active</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <div>
                                <div className="text-lg font-bold text-slate-100">{ Math.round( averageStreak ) }</div>
                                <div className="text-xs text-slate-400">Avg</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <div>
                                <div className="text-lg font-bold text-slate-100">
                                    { Math.max( ...habitStreaks.map( ( h ) => h.streaks.longest ), 0 ) }
                                </div>
                                <div className="text-xs text-slate-400">Best</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            <div>
                                <div className="text-lg font-bold text-slate-100">
                                    { habitStreaks.reduce( ( sum, h ) => sum + h.streaks.total, 0 ) }
                                </div>
                                <div className="text-xs text-slate-400">Total</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* All Habits Streaks */ }
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-100">All Habit Streaks</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-3">
                        { habitStreaks.map( ( habit ) => {
                            const streakLevel = getStreakLevel( habit.streaks.current );
                            const IconComponent = streakLevel.icon;
                            const nextMilestone = getNextMilestone( habit.streaks.current );
                            const progressToNext = ( habit.streaks.current / nextMilestone ) * 100;

                            return (
                                <div key={ habit.id } className="border border-slate-700 rounded p-3 bg-slate-900/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full" style={ { backgroundColor: habit.color } } />
                                            <div>
                                                <div className="text-sm font-medium text-slate-100">{ habit.title }</div>
                                                <div className="text-xs text-slate-400 capitalize">{ habit.inputType }</div>
                                            </div>
                                        </div>

                                        <div className={ `flex items-center space-x-1 ${ streakLevel.color }` }>
                                            {/* <IconComponent className="w-4 h-4" /> */ }
                                            { IconComponent }
                                            <span className="text-xs font-medium">{ streakLevel.level }</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-2">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-cyan-400">{ habit.streaks.current }</div>
                                            <div className="text-xs text-slate-400">Current</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-yellow-400">{ habit.streaks.longest }</div>
                                            <div className="text-xs text-slate-400">Best</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-green-400">{ habit.streaks.total }</div>
                                            <div className="text-xs text-slate-400">Total</div>
                                        </div>
                                    </div>

                                    { habit.streaks.current > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-slate-300">
                                                <span>Progress to { nextMilestone } days</span>
                                                <span>
                                                    { habit.streaks.current }/{ nextMilestone }
                                                </span>
                                            </div>
                                            <Progress value={ Math.min( progressToNext, 100 ) } className="h-2 bg-slate-700" />
                                        </div>
                                    ) }

                                    { habit.streaks.lastActivity && (
                                        <div className="mt-2 text-xs text-slate-400">
                                            Last: { format( habit.streaks.lastActivity, "M/d/yy" ) }
                                        </div>
                                    ) }
                                </div>
                            );
                        } ) }
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default HabitStreaksView;
