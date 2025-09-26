import { useMemo, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import * as utils from 'akashatools';
import { ChevronRight } from "lucide-react";
import { twMerge } from "tailwind-merge";

const goals = [
    { id: 1, title: "Learn React Native", progress: 45 },
    { id: 2, title: "Run a 5k", progress: 75 },
    { id: 3, title: "Read 12 books this year", progress: 50 },
];

export function GoalsWidget () {
    const [ isCollapsed, setIsCollapsed ] = useState( false );

    return (
        <Card>
            <Collapsible defaultOpen={ !isCollapsed } className='group/collapsible'>
                <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
                    <CollapsibleTrigger className={ `flex flex-row w-full items-center justify-stretch` }>
                        <ChevronRight className={ `transition-transform group-data-[state=open]/collapsible:rotate-90 stroke-1` } />
                        <CardTitle className="text-base">Goals</CardTitle>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent className={ `w-full h-full flex-1` }>
                    <div className={ twMerge( 'space-y-1', isCollapsed && 'hidden', ) }>
                        <div className='flex justify-between items-center'>
                            <CardContent className="px-4 gap-2">
                                <div className="">
                                    { goals.map( ( goal ) => (
                                        <div key={ goal.id }>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium">{ goal.title }</span>
                                                <span className="text-xs text-muted-foreground">{ goal.progress }%</span>
                                            </div>
                                            <Progress value={ goal.progress } className="h-2" aria-label={ `${ goal.title } progress` } />
                                        </div>
                                    ) ) }
                                </div>
                            </CardContent>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
