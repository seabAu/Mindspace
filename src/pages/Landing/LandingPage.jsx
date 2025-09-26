"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Star, Zap, Shield, Globe, Sparkles, Target } from "lucide-react";

export default function LandingPage () {
    const [ currentFeature, setCurrentFeature ] = useState( 0 );
    const [ stats, setStats ] = useState( {
        users: 0,
        projects: 0,
        satisfaction: 0,
    } );

    const features = [
        {
            icon: <Target className="h-8 w-8" />,
            title: "Smart Task Management",
            description: "AI-powered task prioritization and intelligent scheduling that adapts to your workflow.",
        },
        {
            icon: <Zap className="h-8 w-8" />,
            title: "Lightning Fast Performance",
            description: "Built for speed with real-time collaboration and instant sync across all your devices.",
        },
        {
            icon: <Shield className="h-8 w-8" />,
            title: "Enterprise Security",
            description: "Bank-grade encryption and compliance with SOC 2, GDPR, and other security standards.",
        },
        {
            icon: <Globe className="h-8 w-8" />,
            title: "Global Collaboration",
            description: "Work seamlessly with teams across time zones with built-in translation and scheduling.",
        },
    ];

    const testimonials = [
        {
            name: "Sarah Chen",
            role: "Product Manager at TechCorp",
            content: "This platform transformed how our team collaborates. We've seen a 40% increase in productivity.",
            rating: 5,
            avatar: "SC",
        },
        {
            name: "Michael Rodriguez",
            role: "Startup Founder",
            content: "The AI features are incredible. It's like having a personal assistant that never sleeps.",
            rating: 5,
            avatar: "MR",
        },
        {
            name: "Emily Johnson",
            role: "Freelance Designer",
            content: "Simple, powerful, and beautiful. Everything I need to manage my projects in one place.",
            rating: 5,
            avatar: "EJ",
        },
    ];

    // Animate stats on mount
    useEffect( () => {
        const animateStats = () => {
            const duration = 2000;
            const steps = 60;
            const stepDuration = duration / steps;

            let step = 0;
            const interval = setInterval( () => {
                const progress = step / steps;
                const easeOut = 1 - Math.pow( 1 - progress, 3 );

                setStats( {
                    users: Math.floor( easeOut * 50000 ),
                    projects: Math.floor( easeOut * 125000 ),
                    satisfaction: Math.floor( easeOut * 98 ),
                } );

                step++;
                if ( step > steps ) {
                    clearInterval( interval );
                }
            }, stepDuration );
        };

        animateStats();
    }, [] );

    // Auto-rotate features
    useEffect( () => {
        const interval = setInterval( () => {
            setCurrentFeature( ( prev ) => ( prev + 1 ) % features.length );
        }, 4000 );

        return () => clearInterval( interval );
    }, [ features.length ] );

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* Animated Background */ }
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Header */ }
            {/* <header className="relative z-10 border-b bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold">ProductivityPro</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm hover:text-primary transition-colors">
                                Sign In
                            </Link>
                            <Button asChild>
                                <Link to="/signup">Get Started</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header> */}
            <HomeHeader />

            {/* Hero Section */ }
            <section className="relative z-10 py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="secondary" className="mb-4">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Now with AI-powered insights
                    </Badge>

                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Supercharge Your
                        <br />
                        <span className="text-primary">Productivity</span>
                    </h1>

                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        The all-in-one workspace that combines task management, team collaboration, and AI-powered insights to help
                        you achieve more.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Button size="lg" asChild className="text-lg px-8">
                            <Link to="/signup">
                                Start Free Trial
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="text-lg px-8 bg-transparent">
                            <Link to="/demo">Watch Demo</Link>
                        </Button>
                    </div>

                    {/* Stats */ }
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{ stats.users.toLocaleString() }+</div>
                            <div className="text-sm text-muted-foreground">Active Users</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{ stats.projects.toLocaleString() }+</div>
                            <div className="text-sm text-muted-foreground">Projects Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{ stats.satisfaction }%</div>
                            <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Carousel */ }
            <section className="py-20 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to manage projects, collaborate with teams, and boost productivity.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <Card className="gradient-card border-border/50 overflow-hidden">
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-4">
                                        <div className="text-primary">{ features[ currentFeature ].icon }</div>
                                        <h3 className="text-2xl font-bold">{ features[ currentFeature ].title }</h3>
                                        <p className="text-muted-foreground text-lg">{ features[ currentFeature ].description }</p>
                                        <div className="flex gap-2">
                                            { features.map( ( _, index ) => (
                                                <button
                                                    key={ index }
                                                    className={ `w-2 h-2 rounded-full transition-colors ${ index === currentFeature ? "bg-primary" : "bg-muted"
                                                        }` }
                                                    onClick={ () => setCurrentFeature( index ) }
                                                />
                                            ) ) }
                                        </div>
                                    </div>
                                    <div className="bg-muted/20 rounded-lg p-8 flex items-center justify-center">
                                        <div className="text-6xl text-primary/20">{ features[ currentFeature ].icon }</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Testimonials */ }
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Loved by Teams Worldwide</h2>
                        <p className="text-muted-foreground">See what our customers have to say</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        { testimonials.map( ( testimonial, index ) => (
                            <Card key={ index } className="gradient-card border-border/50">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                                            { testimonial.avatar }
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm">{ testimonial.name }</div>
                                            <div className="text-xs text-muted-foreground">{ testimonial.role }</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        { Array.from( { length: testimonial.rating } ).map( ( _, i ) => (
                                            <Star key={ i } className="h-4 w-4 fill-primary text-primary" />
                                        ) ) }
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">"{ testimonial.content }"</p>
                                </CardContent>
                            </Card>
                        ) ) }
                    </div>
                </div>
            </section>

            {/* CTA Section */ }
            <section className="py-20 bg-primary/5">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Join thousands of teams already using ProductivityPro to streamline their workflow and achieve their goals
                        faster.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" asChild className="text-lg px-8">
                            <Link to="/signup">
                                Start Your Free Trial
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="text-lg px-8 bg-transparent">
                            <Link to="/pricing">View Pricing</Link>
                        </Button>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            14-day free trial
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            No credit card required
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Cancel anytime
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */ }
            <footer className="border-t bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                                </div>
                                <span className="font-bold">ProductivityPro</span>
                            </div>
                            <p className="text-sm text-muted-foreground">The all-in-one workspace for modern teams.</p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Product</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <Link to="/features" className="block hover:text-foreground transition-colors">
                                    Features
                                </Link>
                                <Link to="/pricing" className="block hover:text-foreground transition-colors">
                                    Pricing
                                </Link>
                                <Link to="/integrations" className="block hover:text-foreground transition-colors">
                                    Integrations
                                </Link>
                                <Link to="/api" className="block hover:text-foreground transition-colors">
                                    API
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Company</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <Link to="/about" className="block hover:text-foreground transition-colors">
                                    About
                                </Link>
                                <Link to="/careers" className="block hover:text-foreground transition-colors">
                                    Careers
                                </Link>
                                <Link to="/blog" className="block hover:text-foreground transition-colors">
                                    Blog
                                </Link>
                                <Link to="/contact" className="block hover:text-foreground transition-colors">
                                    Contact
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Support</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <Link to="/help" className="block hover:text-foreground transition-colors">
                                    Help Center
                                </Link>
                                <Link to="/docs" className="block hover:text-foreground transition-colors">
                                    Documentation
                                </Link>
                                <Link to="/status" className="block hover:text-foreground transition-colors">
                                    Status
                                </Link>
                                <Link to="/security" className="block hover:text-foreground transition-colors">
                                    Security
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-muted-foreground">© 2024 ProductivityPro. All rights reserved.</p>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-4 md:mt-0">
                            <Link to="/privacy" className="hover:text-foreground transition-colors">
                                Privacy
                            </Link>
                            <Link to="/terms" className="hover:text-foreground transition-colors">
                                Terms
                            </Link>
                            <Link to="/cookies" className="hover:text-foreground transition-colors">
                                Cookies
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
