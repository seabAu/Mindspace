"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Link, useLocation } from "react-router-dom";
import LogoIcon from '@/assets/img/mindspace_logo_sunset.png';
import HelpDropdown from "./HelpDropdown";
import ParticleText from '@/components/Effects/ParticleText';
import {
    ParticlesBackground, 
    BeamsBackground,
} from '@/components/Effects/BackgroundEffects';
import Effects from '@/components/Effects/Effects';
import { CONTENT_HEADER_HEIGHT } from "../lib/config/constants";

const HomeHeader = ( {
    title = "",
    useEffectBackground = true,
    effectType = "bgpaths",
    children,
} ) => {
    const location = useLocation();
    const { pathname } = location;
    const path = useMemo( () => pathname?.split( '/' ).filter( x => x ), [ pathname ] );
    const endpoint = useMemo( () => path?.length > 0 ? path[ path.length - 1 ] : '', [ path ] );

    return (
        <nav
            //  className={ `flex items-center justify-between p-6 max-w-full min-w-full mx-auto bg-cosmic-purple space-x-2 saturate-50 backdrop-blur-sm fill-mode-backwards` }
            className={ `flex items-center justify-between p-6 max-w-full min-w-full mx-auto bg-cosmic-purple space-x-2 saturate-50 backdrop-blur-sm fill-mode-backwards !min-h-[calc(var(--header-height))] !h-[calc(var(--header-height))] !max-h-[calc(var(--header-height))] z-30 shadow-3xl` }
            style={ {
                '--header-height': `${ String( CONTENT_HEADER_HEIGHT ) }rem`,
            } }
        >

            <Link to="/" className={ `flex items-center space-x-2` }>
                <img className="w-10 h-10 p-0 !aspect-square" src={ LogoIcon } />
                <span className="text-xl font-bold font-sans">Akasha Mindspace</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">

                { endpoint !== '' && (
                    <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                        Home
                    </Link>
                ) }

                { endpoint !== '' && (
                    <Link to="/akasha" className="text-muted-foreground hover:text-foreground transition-colors">
                        Akasha
                    </Link>
                ) }

                { endpoint !== 'about' && (
                    <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                        About
                    </Link>
                ) }

                { endpoint !== 'pricing' && (
                    <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                        Pricing
                    </Link>
                ) }

                { endpoint !== 'support' && (
                    <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                        Contact Us
                    </Link>
                ) }

                { endpoint !== 'login' && (
                    <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                        Login
                    </Link>
                ) }

                { endpoint !== 'signup' && (
                    <Link to="/signup">
                        <Button>Get Started</Button>
                    </Link>
                ) }

                <HelpDropdown />

            </div>
        </nav>
    );
};

export default HomeHeader;