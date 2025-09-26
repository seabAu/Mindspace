import React, { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Rocket, Code, Database, Server } from "lucide-react";
import * as utils from 'akashatools';
// import { AdvancedBreadcrumbs } from "@/components/advanced-breadcrumbs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, User } from "lucide-react";
import { twMerge } from 'tailwind-merge';
import { CONTENT_HEADER_HEIGHT } from '@/lib/config/constants';
import { Textarea } from '@/components/ui/textarea';

export function AIPagePlatform (
    {
        title = `Orion`,
        subtitle = `Your personal assistant`,
        children,
    },
    props
) {
    const [ query, setQuery ] = useState( "" );
    return (
        <div className={ `` }>
            <div className="page-content-container mx-auto p-6 space-y-8">
                <div className="flex justify-between items-center">
                    <div className={ `` }>
                        {/* <h1 className="text-3xl font-bold tracking-tight">Orion Platform</h1>
                        <p className="text-muted-foreground">Advanced development and deployment platform</p> */}
                        { title !== '' && ( <h2 className={ `font-extrabold text-xl` }>{ title }</h2> ) }
                        { subtitle !== '' && ( <h3 className={ `font-medium text-lg` }>{ subtitle }</h3> ) }

                    </div>
                    <Button>
                        Create New Project <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                <div className="relative">
                    <Input
                        className="w-full pl-10 py-6 text-lg"
                        placeholder="Search projects, deployments, or documentation..."
                        value={ query }
                        onChange={ ( e ) => setQuery( e.target.value ) }
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={ 2 }
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>

                <Tabs defaultValue="projects" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="projects">Projects</TabsTrigger>
                        <TabsTrigger value="deployments">Deployments</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="projects" className="space-y-4 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            { projects.map( ( project ) => (
                                <ProjectCard key={ project.id } project={ project } />
                            ) ) }
                        </div>
                    </TabsContent>

                    <TabsContent value="deployments" className="space-y-4 mt-6">
                        <div className="grid grid-cols-1 gap-4">
                            { deployments.map( ( deployment ) => (
                                <DeploymentCard key={ deployment.id } deployment={ deployment } />
                            ) ) }
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <MetricCard title="Total Deployments" value="128" icon={ <Rocket className="h-8 w-8" /> } />
                            <MetricCard title="Active Projects" value="24" icon={ <Code className="h-8 w-8" /> } />
                            <MetricCard title="API Requests" value="1.2M" icon={ <Server className="h-8 w-8" /> } />
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Overview</CardTitle>
                                <CardDescription>System performance metrics for the last 30 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                                    <p className="text-muted-foreground">Performance chart visualization would appear here</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Settings</CardTitle>
                                <CardDescription>Configure your Orion platform settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SettingsCard
                                        title="API Access"
                                        description="Manage API keys and access tokens"
                                        icon={ <Database className="h-5 w-5" /> }
                                    />
                                    <SettingsCard
                                        title="Team Members"
                                        description="Manage team access and permissions"
                                        icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={ 2 }
                                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                                />
                                            </svg>
                                        }
                                    />
                                    <SettingsCard
                                        title="Billing"
                                        description="Manage subscription and payment methods"
                                        icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={ 2 }
                                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                />
                                            </svg>
                                        }
                                    />
                                    <SettingsCard
                                        title="Notifications"
                                        description="Configure email and in-app notifications"
                                        icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={ 2 }
                                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                                />
                                            </svg>
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

function ProjectCard ( { project } ) {
    return (
        <Card className="overflow-hidden">
            <div className="h-2" style={ { backgroundColor: project.color } }></div>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle>{ project.name }</CardTitle>
                    <Badge variant={ project.status === "active" ? "default" : "outline" }>{ project.status }</Badge>
                </div>
                <CardDescription>{ project.description }</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                        <Badge variant="outline">{ project.framework }</Badge>
                        <Badge variant="outline">{ project.region }</Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                        View
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function DeploymentCard ( { deployment } ) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className={ `h-3 w-3 rounded-full ${ getStatusColor( deployment.status ) }` }></div>
                        <div>
                            <h3 className="font-medium">{ deployment.project }</h3>
                            <p className="text-sm text-muted-foreground">
                                { deployment.branch } • { deployment.id.substring( 0, 7 ) }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <p className="text-sm text-muted-foreground">{ deployment.time }</p>
                        <Button variant="outline" size="sm">
                            Details
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function MetricCard ( { title, value, icon } ) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{ title }</p>
                        <p className="text-3xl font-bold mt-2">{ value }</p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full text-primary">{ icon }</div>
                </div>
            </CardContent>
        </Card>
    );
}

function SettingsCard ( { title, description, icon } ) {
    return (
        <div className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="p-2 bg-primary/10 rounded-full text-primary">{ icon }</div>
            <div>
                <h3 className="font-medium">{ title }</h3>
                <p className="text-sm text-muted-foreground">{ description }</p>
            </div>
        </div>
    );
}

function getStatusColor ( status ) {
    switch ( status ) {
        case "ready":
            return "bg-green-500";
        case "building":
            return "bg-yellow-500";
        case "error":
            return "bg-red-500";
        default:
            return "bg-gray-500";
    }
}

const projects = [
    {
        id: 1,
        name: "E-Commerce Platform",
        description: "Next.js application with Stripe integration",
        status: "active",
        framework: "Next.js",
        region: "us-east-1",
        color: "#0070f3",
    },
    {
        id: 2,
        name: "Marketing Website",
        description: "Static site with blog and CMS",
        status: "active",
        framework: "Astro",
        region: "eu-west-1",
        color: "#7928ca",
    },
    {
        id: 3,
        name: "Admin Dashboard",
        description: "Internal tools for data management",
        status: "development",
        framework: "React",
        region: "us-west-2",
        color: "#ff0080",
    },
    {
        id: 4,
        name: "Mobile API",
        description: "REST API for mobile applications",
        status: "active",
        framework: "Node.js",
        region: "ap-southeast-1",
        color: "#50e3c2",
    },
    {
        id: 5,
        name: "Analytics Service",
        description: "Data processing and visualization",
        status: "maintenance",
        framework: "Python",
        region: "us-east-2",
        color: "#f5a623",
    },
    {
        id: 6,
        name: "Authentication Service",
        description: "OAuth and SSO implementation",
        status: "active",
        framework: "Go",
        region: "eu-central-1",
        color: "#79ffe1",
    },
];

const deployments = [
    {
        id: "dep_8f7e6d5c4b3a2",
        project: "E-Commerce Platform",
        branch: "main",
        status: "ready",
        time: "2 minutes ago",
    },
    {
        id: "dep_1a2b3c4d5e6f7",
        project: "Marketing Website",
        branch: "feature/blog-redesign",
        status: "building",
        time: "5 minutes ago",
    },
    {
        id: "dep_9a8b7c6d5e4f",
        project: "Admin Dashboard",
        branch: "fix/auth-issue",
        status: "ready",
        time: "1 hour ago",
    },
    {
        id: "dep_2c3d4e5f6g7h",
        project: "Mobile API",
        branch: "develop",
        status: "error",
        time: "3 hours ago",
    },
    {
        id: "dep_3e4f5g6h7i8j",
        project: "Analytics Service",
        branch: "main",
        status: "ready",
        time: "1 day ago",
    },
];




export function OrionLoading () {
    return (
        <div className="page-content-container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48 mt-2" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>

            <Skeleton className="h-12 w-full" />

            <div className="w-full">
                <Skeleton className="h-10 w-full" />

                <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        { Array( 6 )
                            .fill()
                            .map( ( _, i ) => (
                                <Skeleton key={ i } className="h-48 w-full" />
                            ) ) }
                    </div>
                </div>
            </div>
        </div>
    );
}



export default function AIPage () {
    const [ context, setContext ] = useState( '' );
    return (
        <Card
            className={ twMerge(
                `min-h-[calc(100vh_-_var(--header-height))] h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))]`,
                `overflow-hidden !px-2 flex flex-col`,
                `page-content-container !w-full`,
            ) }
            style={ { '--header-height': `${ String( CONTENT_HEADER_HEIGHT + 2.5 ) }rem` } }
            centered={ false }
        >
            <CardHeader className="w-full h-min border-b gradient-header !p-2">
                {/* <div className="container py-2"> */ }
                {/* <AdvancedBreadcrumbs /> */ }
                <CardTitle className="text-xl font-bold">AI Chat Playground</CardTitle>
                {/* </div> */ }
            </CardHeader>
            <CardContent className="flex-1 page-content-container py-3">

                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 py-2 px-2 w-full">
                    <div className="md:col-span-1">
                        <Card className="gradient-card card-compact">
                            <CardHeader>
                                <CardTitle className="text-sm">Chat Models</CardTitle>
                            </CardHeader>
                            <CardContent className={ `p-2 flex-1` }>
                                <div className="space-y-1">
                                    { [ "GPT-4o", "Claude 3", "Gemini Pro", "Llama 3", "Custom Model" ].map( ( model, i ) => (
                                        <div
                                            key={ i }
                                            className={ `p-1.5 rounded-md cursor-pointer text-xs ${ i === 0 ? "bg-primary text-primary-foreground" : "hover:bg-muted" }` }
                                        >
                                            { model }
                                        </div>
                                    ) ) }
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-2 gradient-card border-border/50 card-compact">
                            <CardHeader>
                                <CardTitle className="text-sm">Saved Chats</CardTitle>
                            </CardHeader>
                            <CardContent className={ `p-2 flex-1` }>
                                <div className="space-y-1">
                                    { [ "Project Brainstorming", "Code Review", "Marketing Ideas", "Research Summary" ].map( ( chat, i ) => (
                                        <div key={ i } className="p-1.5 rounded-md cursor-pointer hover:bg-muted text-xs">
                                            { chat }
                                        </div>
                                    ) ) }
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-2 gradient-card border-border/50 card-compact">
                            <CardHeader>
                                <CardTitle className="text-sm">Prompt Context</CardTitle>
                            </CardHeader>
                            <CardContent className={ `p-2 flex-1` }>
                                Preview: { context }
                                <div className="space-y-1">
                                    <Textarea
                                        value={ context }
                                        onChange={ ( e ) => {
                                            if ( e.target.value !== context ) setContext( e.target.value );
                                        } }
                                        className={ `w-full h-full` }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-3">
                        <Card className="h-full flex flex-col gradient-card border-border/50 card-compact">
                            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm">Chat with GPT-4o</CardTitle>
                                        <TabsList>
                                            <TabsTrigger value="chat">Chat</TabsTrigger>
                                            <TabsTrigger value="settings">Settings</TabsTrigger>
                                        </TabsList>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
                                        <div className="flex-1 space-y-2 overflow-auto mb-2">
                                            <div className="flex gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback>
                                                        <Bot className="h-3 w-3" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 bg-muted/20 p-2 rounded-md">
                                                    <p className="text-xs">Hello! I'm your AI assistant. How can I help you today?</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback>
                                                        <User className="h-3 w-3" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 bg-primary/10 p-2 rounded-md">
                                                    <p className="text-xs">Can you help me brainstorm some ideas for a new web application?</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback>
                                                        <Bot className="h-3 w-3" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 bg-muted/20 p-2 rounded-md">
                                                    <p className="text-xs">Here are some web application ideas:</p>
                                                    <ol className="list-decimal pl-4 mt-1 space-y-0.5 text-xs">
                                                        <li>A productivity dashboard that integrates with popular tools</li>
                                                        <li>A personal finance tracker with AI-powered insights</li>
                                                        <li>A collaborative whiteboard for remote teams</li>
                                                        <li>A recipe finder that uses ingredients you already have</li>
                                                        <li>A language learning app with conversation practice</li>
                                                    </ol>
                                                    <p className="text-xs mt-1">Would you like me to elaborate on any of these ideas?</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <Input placeholder="Type your message..." className="pr-16 h-7 text-xs" />
                                            <Button size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-5 text-xs">
                                                <Send className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="settings" className="mt-0">
                                        <div className="space-y-2">
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium">Temperature</label>
                                                <input type="range" min="0" max="100" className="w-full h-1.5" />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Precise</span>
                                                    <span>Balanced</span>
                                                    <span>Creative</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-medium">Context Length</label>
                                                <select className="w-full p-1 border rounded-md bg-muted/20 border-border/30 text-xs">
                                                    <option>4K tokens</option>
                                                    <option>8K tokens</option>
                                                    <option>16K tokens</option>
                                                    <option>32K tokens</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-medium">Response Format</label>
                                                <select className="w-full p-1 border rounded-md bg-muted/20 border-border/30 text-xs">
                                                    <option>Markdown</option>
                                                    <option>Plain text</option>
                                                    <option>HTML</option>
                                                    <option>JSON</option>
                                                </select>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
