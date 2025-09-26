// https://ui.shadcn.com/blocks#blocks // 


import * as React from "react";
// import { AppSidebar } from "@/components/app-sidebar";
// import { NavUser } from "@/components/nav-user";
import { Label } from "@/components/ui/label";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
    ArchiveX,
    Command,
    File,
    Inbox,
    Send,
    Trash2
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// This is sample data
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Inbox",
            url: "#",
            icon: Inbox,
            isActive: true,
        },
        {
            title: "Drafts",
            url: "#",
            icon: File,
            isActive: false,
        },
        {
            title: "Sent",
            url: "#",
            icon: Send,
            isActive: false,
        },
        {
            title: "Junk",
            url: "#",
            icon: ArchiveX,
            isActive: false,
        },
        {
            title: "Trash",
            url: "#",
            icon: Trash2,
            isActive: false,
        },
    ],
    mails: [
        {
            name: "William Smith",
            email: "williamsmith@example.com",
            subject: "Meeting Tomorrow",
            date: "09:34 AM",
            teaser:
                "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
        },
        {
            name: "Alice Smith",
            email: "alicesmith@example.com",
            subject: "Re: Project Update",
            date: "Yesterday",
            teaser:
                "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
        },
        {
            name: "Bob Johnson",
            email: "bobjohnson@example.com",
            subject: "Weekend Plans",
            date: "2 days ago",
            teaser:
                "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
        },
        {
            name: "Emily Davis",
            email: "emilydavis@example.com",
            subject: "Re: Question about Budget",
            date: "2 days ago",
            teaser:
                "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
        },
        {
            name: "Michael Wilson",
            email: "michaelwilson@example.com",
            subject: "Important Announcement",
            date: "1 week ago",
            teaser:
                "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
        },
        {
            name: "Sarah Brown",
            email: "sarahbrown@example.com",
            subject: "Re: Feedback on Proposal",
            date: "1 week ago",
            teaser:
                "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
        },
        {
            name: "David Lee",
            email: "davidlee@example.com",
            subject: "New Project Idea",
            date: "1 week ago",
            teaser:
                "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
        },
        {
            name: "Olivia Wilson",
            email: "oliviawilson@example.com",
            subject: "Vacation Plans",
            date: "1 week ago",
            teaser:
                "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
        },
        {
            name: "James Martin",
            email: "jamesmartin@example.com",
            subject: "Re: Conference Registration",
            date: "1 week ago",
            teaser:
                "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
        },
        {
            name: "Sophia White",
            email: "sophiawhite@example.com",
            subject: "Team Dinner",
            date: "1 week ago",
            teaser:
                "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
        },
    ],
};

export function Page () {
    return (
        <SidebarProvider
            style={ {
                "--sidebar-width": `${ 350 }px`,
            } }
        >
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">All Inboxes</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Inbox</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    { Array.from( { length: 24 } ).map( ( _, index ) => (
                        <div
                            key={ index }
                            className="aspect-video h-12 w-full rounded-lg bg-muted/50"
                        />
                    ) ) }
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

export function AppSidebar ( { ...props } ) {
    // Note: I'm using state to show active item.
    // IRL you should use the url/router.
    const [ activeItem, setActiveItem ] = React.useState( data.navMain[ 0 ] );
    const [ mails, setMails ] = React.useState( data.mails );
    const { setOpen } = useSidebar();

    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
            { ...props }
        >
            {/* This is the first sidebar */ }
            {/* We disable collapsible and adjust width to icon. */ }
            {/* This will make the sidebar appear as icons. */ }
            <Sidebar
                collapsible="none"
                className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
            >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                                <a href="#">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Command className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">Acme Inc</span>
                                        <span className="truncate text-xs">Enterprise</span>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent className="px-1.5 md:px-0">
                            <SidebarMenu>
                                { data.navMain.map( ( item ) => (
                                    <SidebarMenuItem key={ item.title }>
                                        <SidebarMenuButton
                                            tooltip={ {
                                                children: item.title,
                                                hidden: false,
                                            } }
                                            onClick={ () => {
                                                setActiveItem( item );
                                                const mail = data.mails.sort( () => Math.random() - 0.5 );
                                                setMails(
                                                    mail.slice(
                                                        0,
                                                        Math.max( 5, Math.floor( Math.random() * 10 ) + 1 )
                                                    )
                                                );
                                                setOpen( true );
                                            } }
                                            isActive={ activeItem.title === item.title }
                                            className="px-2.5 md:px-2"
                                        >
                                            <item.icon />
                                            <span>{ item.title }</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ) ) }
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <NavUser user={ data.user } />
                </SidebarFooter>
            </Sidebar>

            {/* This is the second sidebar */ }
            {/* We disable collapsible and let it fill remaining space */ }
            <Sidebar collapsible="none" className="hidden flex-1 md:flex">
                <SidebarHeader className="gap-3.5 border-b p-4">
                    <div className="flex w-full items-center justify-between">
                        <div className="text-base font-medium text-foreground">
                            { activeItem.title }
                        </div>
                        <Label className="flex items-center gap-2 text-sm">
                            <span>Unreads</span>
                            <Switch className="shadow-none" />
                        </Label>
                    </div>
                    <SidebarInput placeholder="Type to search..." />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className="px-0">
                        <SidebarGroupContent>
                            { mails.map( ( mail ) => (
                                <a
                                    href="#"
                                    key={ mail.email }
                                    className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                >
                                    <div className="flex w-full items-center gap-2">
                                        <span>{ mail.name }</span>{ " " }
                                        <span className="ml-auto text-xs">{ mail.date }</span>
                                    </div>
                                    <span className="font-medium">{ mail.subject }</span>
                                    <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                                        { mail.teaser }
                                    </span>
                                </a>
                            ) ) }
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </Sidebar>
    );
}


export function NavUser ( {
    user,
} ) {
    const { isMobile } = useSidebar();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={ user.avatar } alt={ user.name } />
                                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{ user.name }</span>
                                <span className="truncate text-xs">{ user.email }</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={ isMobile ? "bottom" : "right" }
                        align="end"
                        sideOffset={ 4 }
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={ user.avatar } alt={ user.name } />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{ user.name }</span>
                                    <span className="truncate text-xs">{ user.email }</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles />
                                Upgrade to Premium
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <BadgeCheck />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard />
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}


/*  import { cn } from "@/lib/utils";
    import { Button } from "@/components/ui/button";
    import {
        Dialog,
        DialogContent,
        DialogDescription,
        DialogHeader,
        DialogTitle,
        DialogTrigger,
    } from "@/components/ui/dialog";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import {
        Tooltip,
        TooltipContent,
        TooltipProvider,
        TooltipTrigger,
    } from "@/components/ui/tooltip";
    import { Check, Copy, UserRoundPlus } from "lucide-react";
    import { useId, useRef, useState } from "react";

    function Component () {
        const id = useId();
        const [ emails, setEmails ] = useState( [ "mark@yourcompany.com", "jane@yourcompany.com", "" ] );
        const [ copied, setCopied ] = useState < boolean > ( false );
        const inputRef = useRef < HTMLInputElement > ( null );
        const lastInputRef = useRef < HTMLInputElement > ( null );

        const addEmail = () => {
            setEmails( [ ...emails, "" ] );
        };

        const handleEmailChange = ( index: number, value: string ) => {
            const newEmails = [ ...emails ];
            newEmails[ index ] = value;
            setEmails( newEmails );
        };

        const handleCopy = () => {
            if ( inputRef.current ) {
                navigator.clipboard.writeText( inputRef.current.value );
                setCopied( true );
                setTimeout( () => setCopied( false ), 1500 );
            }
        };

        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">Invite members</Button>
                </DialogTrigger>
                <DialogContent
                    onOpenAutoFocus={ ( e ) => {
                        e.preventDefault();
                        lastInputRef.current?.focus();
                    } }
                >
                    <div className="flex flex-col gap-2">
                        <div
                            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
                            aria-hidden="true"
                        >
                            <UserRoundPlus className="opacity-80" size={ 16 } strokeWidth={ 2 } />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-left">Invite team members</DialogTitle>
                            <DialogDescription className="text-left">
                                Invite teammates to earn free components.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Invite via email</Label>
                                <div className="space-y-3">
                                    { emails.map( ( email, index ) => (
                                        <Input
                                            key={ index }
                                            id={ `team-email-${ index + 1 }` }
                                            placeholder="hi@yourcompany.com"
                                            type="email"
                                            value={ email }
                                            onChange={ ( e ) => handleEmailChange( index, e.target.value ) }
                                            ref={ index === emails.length - 1 ? lastInputRef : undefined }
                                        />
                                    ) ) }
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={ addEmail }
                                className="text-sm underline hover:no-underline"
                            >
                                + Add another
                            </button>
                        </div>
                        <Button type="button" className="w-full">
                            Send invites
                        </Button>
                    </form>

                    <hr className="my-1 border-t border-border" />

                    <div className="space-y-2">
                        <Label htmlFor={ id }>Invite via magic link</Label>
                        <div className="relative">
                            <Input
                                ref={ inputRef }
                                id={ id }
                                className="pe-9"
                                type="text"
                                defaultValue="https://originui.com/refer/87689"
                                readOnly
                            />
                            <TooltipProvider delayDuration={ 0 }>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={ handleCopy }
                                            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed"
                                            aria-label={ copied ? "Copied" : "Copy to clipboard" }
                                            disabled={ copied }
                                        >
                                            <div
                                                className={ cn(
                                                    "transition-all",
                                                    copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
                                                ) }
                                            >
                                                <Check
                                                    className="stroke-emerald-500"
                                                    size={ 16 }
                                                    strokeWidth={ 2 }
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <div
                                                className={ cn(
                                                    "absolute transition-all",
                                                    copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
                                                ) }
                                            >
                                                <Copy size={ 16 } strokeWidth={ 2 } aria-hidden="true" />
                                            </div>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="px-2 py-1 text-xs">Copy to clipboard</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    export { Component };

*/