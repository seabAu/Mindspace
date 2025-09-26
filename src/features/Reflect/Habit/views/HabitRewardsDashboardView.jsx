"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import useGlobalStore from "@/store/global.store";
import useReflectStore from "@/store/reflect.store";

const HabitRewardsDashboardView = () => {
    const { user } = useGlobalStore();
    const { habitsData, getActiveHabits } = useReflectStore();
    // const activeHabits = getActiveHabits();
    const activeHabits = useMemo( () => ( getActiveHabits() ), [ habitsData ] );

    const recentPoints = user.habitTrackerData.pointsHistory.slice( 0, 5 );
    const nextMilestone = STREAK_MILESTONES.find( ( m ) => m.points > user.habitTrackerData.totalPoints );
    const progressToNext = nextMilestone ? ( user.habitTrackerData.totalPoints / nextMilestone.points ) * 100 : 100;

    return (
        <div className="space-y-4">
            {/* Points Overview */ }
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                            <div className="text-2xl">🏆</div>
                            <div>
                                <div className="text-2xl font-bold text-primary">{ user.habitTrackerData.totalPoints }</div>
                                <div className="text-xs text-muted-foreground">Total Points</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                            <div className="text-2xl">🔥</div>
                            <div>
                                <div className="text-2xl font-bold text-orange-500">{ user.habitTrackerData.dailySignInStreak }</div>
                                <div className="text-xs text-muted-foreground">Day Sign-in Streak</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                            <div className="text-2xl">🎖️</div>
                            <div>
                                <div className="text-2xl font-bold text-green-500">{ user.habitTrackerData.achievements.length }</div>
                                <div className="text-xs text-muted-foreground">Achievements</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress to Next Milestone */ }
            { nextMilestone && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Next Milestone: { nextMilestone.name }</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span>{ user.habitTrackerData.totalPoints } points</span>
                                <span>{ nextMilestone.points } points</span>
                            </div>
                            <Progress value={ progressToNext } className="h-2" />
                            <div className="text-xs text-muted-foreground text-center">
                                { nextMilestone.points - user.habitTrackerData.totalPoints } points to go!
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) }

            {/* Recent Points */ }
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Recent Points</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <ScrollArea className="h-32">
                        <div className="space-y-2">
                            { recentPoints.map( ( entry, index ) => (
                                <div key={ index } className="flex items-center justify-between p-2 rounded border">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium truncate">{ entry.reason }</div>
                                        <div className="text-xs text-muted-foreground">{ entry.date }</div>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                        +{ entry.points }
                                    </Badge>
                                </div>
                            ) ) }
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Achievements */ }
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Achievements</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 gap-2">
                        { user.habitTrackerData.achievements.map( ( achievement ) => (
                            <div key={ achievement.id } className="flex items-center space-x-2 p-2 rounded border">
                                <div className="text-lg">🏅</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium">{ achievement.name }</div>
                                    <div className="text-xs text-muted-foreground">{ achievement.description }</div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    { new Date( achievement.earnedAt ).toLocaleDateString() }
                                </div>
                            </div>
                        ) ) }
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default HabitRewardsDashboardView;
