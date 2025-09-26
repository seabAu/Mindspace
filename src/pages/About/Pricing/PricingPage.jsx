"use client";

import { useState } from "react";
import { Check, X, Zap, Crown, ArrowRight, Star, Shield, Users, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import HomeHeader from "@/pages/HomeHeader";
import HomeContainer from '@/pages/Home/HomeContainer';

/**
 * Main pricing page component
 * @returns {JSX.Element} Pricing page
 */
export default function PricingPage () {
    const [ isYearly, setIsYearly ] = useState( false );

    const plans = [
        {
            name: "Free",
            description: "Perfect for individuals and small teams getting started",
            price: { monthly: 0, yearly: 0 },
            badge: null,
            features: [
                { name: "3 Workspaces", included: true },
                { name: "5 Task Tags", included: true },
                { name: "15 Event Categories & Colors", included: true },
                { name: "100 Tasks per month", included: true },
                { name: "2 Team Members", included: true },
                { name: "1GB Storage", included: true },
                { name: "Basic Analytics", included: true },
                { name: "Email Support", included: true },
                { name: "Mobile App Access", included: true },
                { name: "Orion AI Assistant", included: false },
                { name: "Unlimited Workspaces", included: false },
                { name: "Advanced Analytics", included: false },
                { name: "Priority Support", included: false },
                { name: "Custom Integrations", included: false },
                { name: "Team Collaboration Tools", included: false },
            ],
            cta: "Get Started Free",
            ctaLink: "/signup",
            popular: false,
        },
        {
            name: "Premium",
            description: "Everything you need for professional productivity",
            price: { monthly: 6.16, yearly: 62.86 },
            badge: "Most Popular",
            features: [
                { name: "Unlimited Workspaces", included: true },
                { name: "Unlimited Task Tags", included: true },
                { name: "Unlimited Event Categories & Colors", included: true },
                { name: "Unlimited Tasks", included: true },
                { name: "Unlimited Team Members", included: true },
                { name: "100GB Storage", included: true },
                { name: "Mobile App Access", included: true },
                { name: "Orion AI Assistant", included: true },
                { name: "Unlimited Workspaces", included: false },
                { name: "Advanced Analytics", included: false },
                { name: "Priority Support", included: false },
                { name: "Custom Integrations", included: false },
                { name: "Team Collaboration Tools", included: false },
                { name: "Advanced Security", included: true },
                { name: "API Access", included: true },
            ],
            cta: "Start Premium Trial",
            ctaLink: "/subscribe",
            popular: true,
        },
        {
            name: "Supporter",
            description: "For those that want to support our work!",
            price: { monthly: 6.16, yearly: 62.86 },
            badge: "Most Popular",
            features: [
                { name: "Unlimited Workspaces", included: true },
                { name: "Unlimited Task Tags", included: true },
                { name: "Unlimited Event Categories & Colors", included: true },
                { name: "Unlimited Tasks", included: true },
                { name: "Unlimited Team Members", included: true },
                { name: "100GB Storage", included: true },
                { name: "Advanced Analytics", included: true },
                { name: "Priority Support", included: true },
                { name: "Mobile App Access", included: true },
                { name: "Orion AI Assistant", included: true },
                { name: "Custom Integrations", included: true },
                { name: "Team Collaboration Tools", included: true },
                { name: "Advanced Security", included: true },
                { name: "API Access", included: true },
                { name: "Custom Branding", included: true },
            ],
            cta: "Start Supporter Trial",
            ctaLink: "/subscribe",
            popular: true,
        },
    ];

    const faqs = [
        {
            question: "Can I switch between plans?",
            answer:
                "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
        },
        {
            question: "What happens to my data if I downgrade?",
            answer:
                "Your data is always safe. If you exceed free tier limits, you'll have read-only access until you upgrade again or reduce your usage.",
        },
        {
            question: "Is there a free trial for Premium?",
            answer: "Yes! All Premium features are available for 14 days free. No credit card required to start your trial.",
        },
        {
            question: "What is the difference between Premium and Supporter?",
            answer: "They are very similar, but with Supporter you get some extra special attention in return for supporting our work. It's intended to be a donation tier, but we wanted to give something back for it too.",
        },
        {
            question: "What payment methods do you accept?",
            answer:
                "We accept all major credit cards, PayPal, and cryptocurrency payments. Crypto payments receive a 20% discount.",
        },
        {
            question: "Can I cancel anytime?",
            answer:
                "You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
        },
        {
            question: "Do you offer refunds?",
            answer:
                "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, we'll refund your payment in full.",
        },
        {
            question: "Is my data secure?",
            answer:
                "Yes! We use bank-level encryption, regular security audits, and are SOC 2 compliant. Your data is always protected.",
        },
        {
            question: "What's included in Orion AI?",
            answer:
                "Orion AI provides intelligent task prioritization, automated scheduling, natural language queries, and predictive analytics to boost your productivity.",
        },
    ];

    const features = [
        {
            category: "Workspace Management",
            items: [
                { name: "Workspaces", free: "3", premium: "Unlimited" },
                { name: "Task Tags", free: "5", premium: "Unlimited" },
                { name: "Event Categories & Colors", free: "15", premium: "Unlimited" },
                { name: "Tasks per Month", free: "100", premium: "Unlimited" },
                { name: "Team Members", free: "2", premium: "Unlimited" },
            ],
        },
        {
            category: "Storage & Analytics",
            items: [
                { name: "Storage Space", free: "1GB", premium: "100GB" },
                { name: "Analytics Dashboard", free: "Basic", premium: "Advanced" },
                { name: "Export Options", free: "CSV", premium: "CSV, PDF, Excel" },
                { name: "Data Retention", free: "6 months", premium: "Unlimited" },
            ],
        },
        {
            category: "AI & Automation",
            items: [
                { name: "Orion AI Assistant", free: "❌", premium: "✅" },
                { name: "Smart Scheduling", free: "❌", premium: "✅" },
                { name: "Predictive Analytics", free: "❌", premium: "✅" },
                { name: "Automated Insights", free: "❌", premium: "✅" },
            ],
        },
        {
            category: "Support & Security",
            items: [
                { name: "Support Level", free: "Email", premium: "Priority" },
                { name: "Response Time", free: "48 hours", premium: "4 hours" },
                { name: "Advanced Security", free: "❌", premium: "✅" },
                { name: "API Access", free: "❌", premium: "✅" },
            ],
        },
    ];

    return (
        <HomeContainer className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
            {/* Navigation */ }

            {/* Hero Section */ }
            <section className="max-w-7xl mx-auto px-6 py-20 text-center">
                <Badge variant="secondary" className="mb-6 px-4 py-2">
                    <Star className="h-4 w-4 mr-2" />
                    Simple, transparent pricing
                </Badge>

                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Choose Your Plan
                </h1>

                <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                    Start free and scale as you grow. No hidden fees, no surprises. Cancel anytime with our 30-day money-back
                    guarantee.
                </p>

                {/* Billing Toggle */ }
                <div className="flex items-center justify-center space-x-4 mb-12">
                    <Label htmlFor="billing-toggle" className={ !isYearly ? "font-semibold" : "" }>
                        Monthly
                    </Label>
                    <Switch id="billing-toggle" checked={ isYearly } onCheckedChange={ setIsYearly } />
                    <Label htmlFor="billing-toggle" className={ isYearly ? "font-semibold" : "" }>
                        Yearly
                        <Badge variant="secondary" className="ml-2">
                            Save 15%
                        </Badge>
                    </Label>
                </div>
            </section>

            {/* Pricing Cards */ }
            <section className="max-w-7xl mx-auto px-6 pb-20">
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    { plans.map( ( plan, index ) => (
                        <Card
                            key={ index }
                            className={ `relative hover:shadow-xl transition-all duration-300 ${ plan.popular ? "border-primary shadow-lg scale-105 bg-primary/5" : "hover:scale-105"
                                }` }
                        >
                            { plan.badge && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                                        <Crown className="h-3 w-3 mr-1" />
                                        { plan.badge }
                                    </Badge>
                                </div>
                            ) }

                            <CardHeader className="text-center pb-8 pt-8">
                                <div className="flex items-center justify-center mb-4">
                                    { plan.name === "Free" ? (
                                        <Users className="h-12 w-12 text-primary" />
                                    ) : (
                                        <Brain className="h-12 w-12 text-primary" />
                                    ) }
                                </div>
                                <CardTitle className="text-2xl font-bold">{ plan.name }</CardTitle>
                                <p className="text-muted-foreground mt-2">{ plan.description }</p>

                                <div className="mt-6">
                                    <div className="text-4xl font-bold">
                                        ${ isYearly ? plan.price.yearly : plan.price.monthly }
                                        { plan.price.monthly > 0 && (
                                            <span className="text-lg font-normal text-muted-foreground">/{ isYearly ? "year" : "month" }</span>
                                        ) }
                                    </div>
                                    { isYearly && plan.price.monthly > 0 && (
                                        <div className="text-sm text-muted-foreground mt-1">
                                            ${ ( plan.price.monthly * 12 ).toFixed( 2 ) } billed annually
                                        </div>
                                    ) }
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="space-y-3 mb-8">
                                    { plan.features.slice( 0, 9 ).map( ( feature, featureIndex ) => (
                                        <div key={ featureIndex } className="flex items-center space-x-3">
                                            { feature.included ? (
                                                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                                            ) : (
                                                <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            ) }
                                            <span className={ feature.included ? "" : "text-muted-foreground line-through" }>
                                                { feature.name }
                                            </span>
                                        </div>
                                    ) ) }
                                </div>

                                <Link to={ plan.ctaLink } className="block">
                                    <Button
                                        className={ `w-full py-6 text-lg ${ plan.popular ? "bg-primary hover:bg-primary/90" : "variant-outline"
                                            }` }
                                        variant={ plan.popular ? "default" : "outline" }
                                    >
                                        { plan.cta }
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) ) }
                </div>
            </section>

            {/* Feature Comparison */ }
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Detailed Feature Comparison</h2>
                    <p className="text-xl text-muted-foreground">See exactly what's included in each plan.</p>
                </div>

                <div className="space-y-8">
                    { features.map( ( category, index ) => (
                        <Card key={ index }>
                            <CardHeader>
                                <CardTitle className="text-xl">{ category.category }</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4">Feature</th>
                                                <th className="text-center py-3 px-4">Free</th>
                                                <th className="text-center py-3 px-4">Premium</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            { category.items.map( ( item, itemIndex ) => (
                                                <tr key={ itemIndex } className="border-b border-border/50">
                                                    <td className="py-3 px-4 font-medium">{ item.name }</td>
                                                    <td className="py-3 px-4 text-center">{ item.free }</td>
                                                    <td className="py-3 px-4 text-center font-semibold text-primary">{ item.premium }</td>
                                                </tr>
                                            ) ) }
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    ) ) }
                </div>
            </section>

            {/* FAQ Section */ }
            <section className="max-w-4xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-xl text-muted-foreground">Everything you need to know about our pricing and plans.</p>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                    { faqs.map( ( faq, index ) => (
                        <AccordionItem key={ index } value={ `item-${ index }` } className="border rounded-lg px-6">
                            <AccordionTrigger className="text-left font-semibold hover:no-underline">{ faq.question }</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pb-4">{ faq.answer }</AccordionContent>
                        </AccordionItem>
                    ) ) }
                </Accordion>
            </section>

            {/* Trust Indicators */ }
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Trusted by Teams Worldwide</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">Enterprise Security</h3>
                            <p className="text-muted-foreground text-sm">
                                SOC 2 compliant with bank-level encryption and regular security audits.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">10,000+ Active Users</h3>
                            <p className="text-muted-foreground text-sm">Trusted by teams in over 150 countries worldwide.</p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">4.9/5 Rating</h3>
                            <p className="text-muted-foreground text-sm">
                                Consistently rated as the best productivity platform by our users.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* CTA Section */ }
            <section className="max-w-7xl mx-auto px-6 py-20">
                <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
                    <CardContent className="text-center py-16">
                        <h2 className="text-4xl font-bold mb-4">Ready to Boost Your Productivity?</h2>
                        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                            Join thousands of teams who have transformed their workflow with Akasha.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/signup">
                                <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/subscribe">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="px-8 py-4 text-lg border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                                >
                                    Go Premium Now
                                    <Crown className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </HomeContainer>
    );
}
