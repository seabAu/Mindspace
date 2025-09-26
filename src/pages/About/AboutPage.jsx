"use client";

import { useState, useEffect } from "react";
import {
    Brain,
    Users,
    Zap,
    Shield,
    BarChart3,
    CheckCircle,
    ArrowRight,
    Star,
    Target,
    Rocket,
    Globe,
    Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import HomeHeader from "../HomeHeader";
import HomeContainer from "../Home/HomeContainer";

/**
 * Feature showcase carousel component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Feature carousel
 */
const FeatureCarousel = () => {
    const [ activeIndex, setActiveIndex ] = useState( 0 );

    const features = [
        {
            icon: <Brain className="h-12 w-12" />,
            title: "Orion AI Assistant",
            description: "Get intelligent insights and recommendations powered by advanced AI",
            benefits: [
                "Smart task prioritization",
                "Automated scheduling",
                "Predictive analytics",
                "Natural language queries",
            ],
        },
        {
            icon: <Users className="h-12 w-12" />,
            title: "Team Collaboration",
            description: "Work seamlessly with your team across multiple workspaces",
            benefits: [ "Real-time synchronization", "Role-based permissions", "Team chat integration", "Shared workspaces" ],
        },
        {
            icon: <BarChart3 className="h-12 w-12" />,
            title: "Advanced Analytics",
            description: "Track productivity and performance with detailed insights",
            benefits: [ "Custom dashboards", "Performance metrics", "Time tracking", "Export capabilities" ],
        },
        {
            icon: <Shield className="h-12 w-12" />,
            title: "Enterprise Security",
            description: "Bank-level security with end-to-end encryption",
            benefits: [ "256-bit encryption", "SOC 2 compliance", "Regular audits", "Data backups" ],
        },
    ];

    useEffect( () => {
        const interval = setInterval( () => {
            setActiveIndex( ( prev ) => ( prev + 1 ) % features.length );
        }, 5000 );
        return () => clearInterval( interval );
    }, [ features.length ] );

    return (
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                { features.map( ( feature, index ) => (
                    <Card
                        key={ index }
                        className={ `cursor-pointer transition-all duration-500 ${ activeIndex === index
                            ? "border-primary shadow-xl scale-105 bg-primary/5"
                            : "hover:border-primary/50 hover:shadow-lg"
                            }` }
                        onClick={ () => setActiveIndex( index ) }
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-center space-x-4">
                                <div
                                    className={ `p-3 rounded-xl transition-colors ${ activeIndex === index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                        }` }
                                >
                                    { feature.icon }
                                </div>
                                <div>
                                    <CardTitle className="text-xl">{ feature.title }</CardTitle>
                                    <p className="text-muted-foreground text-sm mt-1">{ feature.description }</p>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                ) ) }
            </div>

            <div className="relative">
                <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20">
                    <CardHeader>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-4 bg-primary rounded-xl text-primary-foreground">{ features[ activeIndex ].icon }</div>
                            <div>
                                <CardTitle className="text-2xl">{ features[ activeIndex ].title }</CardTitle>
                                <p className="text-muted-foreground">{ features[ activeIndex ].description }</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            { features[ activeIndex ].benefits.map( ( benefit, index ) => (
                                <div key={ index } className="flex items-center space-x-3">
                                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                                    <span className="text-sm">{ benefit }</span>
                                </div>
                            ) ) }
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

/**
 * Statistics component with animated progress bars
 * @returns {JSX.Element} Statistics section
 */
const Statistics = () => {
    const [ animated, setAnimated ] = useState( false );

    const stats = [
        { label: "Productivity Increase", value: 85, suffix: "%" },
        { label: "Time Saved Daily", value: 2.5, suffix: " hours" },
        { label: "Task Completion Rate", value: 94, suffix: "%" },
        { label: "User Satisfaction", value: 98, suffix: "%" },
    ];

    useEffect( () => {
        const timer = setTimeout( () => setAnimated( true ), 500 );
        return () => clearTimeout( timer );
    }, [] );

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            { stats.map( ( stat, index ) => (
                <Card key={ index } className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-primary mb-2">
                            { animated ? stat.value : 0 }
                            { stat.suffix }
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">{ stat.label }</div>
                        <Progress
                            value={ animated ? ( stat.suffix === "%" ? stat.value : ( stat.value / 5 ) * 100 ) : 0 }
                            className="h-2"
                        />
                    </CardContent>
                </Card>
            ) ) }
        </div>
    );
};

/**
 * Main about page component
 * @returns {JSX.Element} About page
 */
export default function AboutPage () {
    const technologies = [
        { name: "MERN Stack", description: "Built using the popular and performant MERN Stack" },
        { name: "AI Integration", description: "Advanced machine learning for smart insights" },
        { name: "Real-time Sync", description: "Instant updates across all devices" },
        { name: "Cloud Security", description: "Enterprise-grade data protection" },
    ];

    const milestones = [
        { year: "2025", title: "Company Founded", description: "Started with a vision to revolutionize productivity with a simple planner app made for ADHD, by ADHD." },
        // { year: "2023", title: "First 1,000 Users", description: "Reached our first major user milestone" },
        // { year: "2024", title: "AI Integration", description: "Launched Orion AI assistant" },
        // { year: "2024", title: "10,000+ Users", description: "Growing community of productive teams" },
    ];

    return (
        <HomeContainer className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
            {/* Hero Section */ }
            <section className="max-w-7xl mx-auto px-6 py-20 text-center">
                <Badge variant="secondary" className="mb-6 px-4 py-2">
                    <Award className="h-4 w-4 mr-2" />
                    Award-winning productivity platform
                </Badge>

                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    About Akasha
                </h1>

                <p className="text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
                    We're on a mission to revolutionize how teams work together. Our AI-powered platform combines intelligent automation with intuitive design to help you achieve more than you ever thought possible.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <Link to="/signup">
                        <Button size="lg" className="px-8 py-4 text-lg">
                            Start Your Journey
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link to="/pricing">
                        <Button variant="outline" size="lg" className="px-8 py-4 text-lg bg-transparent">
                            View Pricing
                        </Button>
                    </Link>
                </div>

                <Statistics />
            </section>

            {/* Mission Section */ }
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                            We believe that productivity shouldn't be complicated. That's why we've built Akasha to be the most intuitive, powerful, and intelligent workspace management platform available.
                        </p>
                        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                            Our team of engineers, designers, and productivity experts work tirelessly to create tools that adapt to your workflow, not the other way around.
                        </p>
                        <div className="flex items-center space-x-4">
                            <Target className="h-8 w-8 text-primary" />
                            <div>
                                <h3 className="font-semibold">Our Goal</h3>
                                <p className="text-muted-foreground">Empower every team to achieve their full potential</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                            <CardContent className="p-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="text-center">
                                        <Globe className="h-12 w-12 text-primary mx-auto mb-3" />
                                        <div className="text-2xl font-bold">150+</div>
                                        <div className="text-sm text-muted-foreground">Countries</div>
                                    </div>
                                    <div className="text-center">
                                        <Users className="h-12 w-12 text-primary mx-auto mb-3" />
                                        <div className="text-2xl font-bold">10K+</div>
                                        <div className="text-sm text-muted-foreground">Active Users</div>
                                    </div>
                                    <div className="text-center">
                                        <Rocket className="h-12 w-12 text-primary mx-auto mb-3" />
                                        <div className="text-2xl font-bold">50M+</div>
                                        <div className="text-sm text-muted-foreground">Tasks Completed</div>
                                    </div>
                                    <div className="text-center">
                                        <Star className="h-12 w-12 text-primary mx-auto mb-3" />
                                        <div className="text-2xl font-bold">4.9</div>
                                        <div className="text-sm text-muted-foreground">User Rating</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Features Section */ }
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">What Makes Us Different</h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Discover the features that set Akasha apart from other productivity platforms.
                    </p>
                </div>

                <FeatureCarousel />
            </section>

            {/* Technology Section */ }
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Built with Modern Technology</h2>
                    <p className="text-xl text-muted-foreground">
                        Powered by the latest technologies for maximum performance and reliability.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    { technologies.map( ( tech, index ) => (
                        <Card key={ index } className="text-center hover:shadow-lg transition-all hover:scale-105">
                            <CardHeader>
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Zap className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-lg">{ tech.name }</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">{ tech.description }</p>
                            </CardContent>
                        </Card>
                    ) ) }
                </div>
            </section>

            {/* Timeline Section */ }
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
                    <p className="text-xl text-muted-foreground">Key milestones in our mission to revolutionize productivity.</p>
                </div>

                <div className="relative">
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary/20"></div>
                    <div className="space-y-12">
                        { milestones.map( ( milestone, index ) => (
                            <div key={ index } className={ `flex items-center ${ index % 2 === 0 ? "flex-row" : "flex-row-reverse" }` }>
                                <div className={ `w-1/2 ${ index % 2 === 0 ? "pr-8 text-right" : "pl-8" }` }>
                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <Badge variant="secondary" className="w-fit mx-auto">
                                                { milestone.year }
                                            </Badge>
                                            <CardTitle className="text-xl">{ milestone.title }</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground">{ milestone.description }</p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="relative z-10 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
                                <div className="w-1/2"></div>
                            </div>
                        ) ) }
                    </div>
                </div>
            </section>

            {/* CTA Section */ }
            <section className="max-w-7xl mx-auto px-6 py-20">
                <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
                    <CardContent className="text-center py-16">
                        <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Workflow?</h2>
                        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                            Join thousands of teams who have already discovered the power of intelligent productivity.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/signup">
                                <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/pricing">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="px-8 py-4 text-lg border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                                >
                                    View Pricing Plans
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </HomeContainer>
    );
}
