import * as utils from 'akashatools';
import { TrendingUp } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, RadialBar, RadialBarChart } from 'recharts';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

function Chart ( props ) {
    const {
        type = 'radial',
        data = []
    } = props;

    const chartData = [
        { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
        { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
        { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
        { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
        { browser: "other", visitors: 90, fill: "var(--color-other)" },
    ];

    const chartConfig = {
        visitors: {
            label: "Visitors",
        },
        chrome: {
            label: "Chrome",
            color: "hsl(var(--chart-1))",
        },
        safari: {
            label: "Safari",
            color: "hsl(var(--chart-2))",
        },
        firefox: {
            label: "Firefox",
            color: "hsl(var(--chart-3))",
        },
        edge: {
            label: "Edge",
            color: "hsl(var(--chart-4))",
        },
        other: {
            label: "Other",
            color: "hsl(var(--chart-5))",
        },
    };

    const renderChartType = ( chartType, chartData ) => {
        switch ( chartType ) {
            case 'radial':
                return ( <Chart.Radial data={ chartData } /> );
                break;
            case 'radar':
                return ( <Chart.Radar data={ chartData } /> );
                break;
            case 'radial':
                return ( <Chart.Radial data={ chartData } /> );
                break;

            default:
                break;
        }
    };


    return (
        <>
            { utils.val.isValidArray( data, true ) && renderChartType( type, data ) }
        </>
    );
}

function RadialChart ( props ) {
    const {
        classNames = '',
        data = []
    } = props;

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Radial Chart - Grid</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={ chartConfig }
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadialBarChart data={ chartData } innerRadius={ 30 } outerRadius={ 100 }>
                        <ChartTooltip
                            cursor={ false }
                            content={ <ChartTooltipContent hideLabel nameKey="browser" /> }
                        />
                        <PolarGrid gridType="circle" />
                        <RadialBar dataKey="visitors" />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total visitors for the last 6 months
                </div>
            </CardFooter>
        </Card>
    );
}

Chart.Radial = RadialChart;

function Radar ( props ) {
    const {
        classNames = '',
        data = []
    } = props;

    const chartConfig = {
        desktop: {
            label: "Desktop",
            color: "hsl(var(--chart-1))",
            icon: ArrowDownFromLine,
        },
        mobile: {
            label: "Mobile",
            color: "hsl(var(--chart-2))",
            icon: ArrowUpFromLine,
        },
    };

    return (
        <Card>
            <CardHeader className="items-center pb-4">
                <CardTitle>Radar Chart - Icons</CardTitle>
                <CardDescription>
                    Showing total visitors for the last 6 months
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={ chartConfig }
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadarChart
                        data={ chartData }
                        margin={ {
                            top: -40,
                            bottom: -10,
                        } }
                    >
                        <ChartTooltip
                            cursor={ false }
                            content={ <ChartTooltipContent indicator="line" /> }
                        />
                        <PolarAngleAxis dataKey="month" />
                        <PolarGrid />
                        <Radar
                            dataKey="desktop"
                            fill="var(--color-desktop)"
                            fillOpacity={ 0.6 }
                        />
                        <Radar dataKey="mobile" fill="var(--color-mobile)" />
                        <ChartLegend className="mt-8" content={ <ChartLegendContent /> } />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 pt-4 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    January - June 2024
                </div>
            </CardFooter>
        </Card>
    );
}

export default Chart;