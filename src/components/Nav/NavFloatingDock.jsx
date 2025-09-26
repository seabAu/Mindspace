// Originally by https://v0.dev/chat/open-in-v0-SApn3qshjv4 but with several edits. // 
import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { IconBrandGithub, IconBrandX, IconExchange, IconHome, IconNewSection, IconTerminal2 } from "@tabler/icons-react";

export function FloatingDockDemo () {
    const links = [
        {
            title: "Home",
            icon: <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
            href: "#",
        },

        {
            title: "Products",
            icon: <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
            href: "#",
        },
        {
            title: "Components",
            icon: <IconNewSection className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
            href: "#",
        },
        {
            title: "Aceternity UI",
            icon: <Image src="https://assets.aceternity.com/logo-dark.png" width={ 20 } height={ 20 } alt="Aceternity Logo" />,
            href: "#",
        },
        {
            title: "Changelog",
            icon: <IconExchange className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
            href: "#",
        },

        {
            title: "Twitter",
            icon: <IconBrandX className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
            href: "#",
        },
        {
            title: "GitHub",
            icon: <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
            href: "#",
        },
    ];
    return (
        <div className="flex items-center justify-center h-[35rem] w-full">
            <FloatingDock
                mobileClassName="translate-y-20" // only for demo, remove for production
                items={ links }
            />
        </div>
    );
}

export const FloatingDock = ( {
    items,
    desktopClassName,
    mobileClassName,
} ) => {
    return (
        <>
            <FloatingDockDesktop items={ items } className={ desktopClassName } />
            <FloatingDockMobile items={ items } className={ mobileClassName } />
        </>
    );
};

const FloatingDockMobile = ( {
    items,
    className,
} ) => {
    const [ open, setOpen ] = useState( false );
    return (
        <div className={ cn( "relative block md:hidden", className ) }>
            <AnimatePresence>
                { open && (
                    <motion.div layoutId="nav" className="absolute bottom-full mb-2 inset-x-0 flex flex-col gap-2">
                        { items.map( ( item, idx ) => (
                            <motion.div
                                key={ item.title }
                                initial={ { opacity: 0, y: 10 } }
                                animate={ {
                                    opacity: 1,
                                    y: 0,
                                } }
                                exit={ {
                                    opacity: 0,
                                    y: 10,
                                    transition: {
                                        delay: idx * 0.05,
                                    },
                                } }
                                transition={ { delay: ( items.length - 1 - idx ) * 0.05 } }
                            >
                                <Link
                                    href={ item.href }
                                    key={ item.title }
                                    className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-900 flex items-center justify-center"
                                >
                                    <div className="h-4 w-4">{ item.icon }</div>
                                </Link>
                            </motion.div>
                        ) ) }
                    </motion.div>
                ) }
            </AnimatePresence>
            <button
                onClick={ () => setOpen( !open ) }
                className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-800 flex items-center justify-center"
            >
                <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
            </button>
        </div>
    );
};

const FloatingDockDesktop = ( {
    items,
    className,
} ) => {
    const mouseX = useMotionValue( Number.POSITIVE_INFINITY );
    return (
        <motion.div
            onMouseMove={ ( e ) => mouseX.set( e.pageX ) }
            onMouseLeave={ () => mouseX.set( Number.POSITIVE_INFINITY ) }
            className={ cn(
                "mx-auto hidden md:flex h-16 gap-4 items-end  rounded-2xl bg-gray-50 dark:bg-neutral-900 px-4 pb-3",
                className,
            ) }
        >
            { items.map( ( item ) => (
                <IconContainer mouseX={ mouseX } key={ item.title } { ...item } />
            ) ) }
        </motion.div>
    );
};

function IconContainer ( {
    mouseX,
    title,
    icon,
    href,
} ) {
    const ref = useRef( null );

    const distance = useTransform( mouseX, ( val ) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

        return val - bounds.x - bounds.width / 2;
    } );

    const widthTransform = useTransform( distance, [ -150, 0, 150 ], [ 40, 80, 40 ] );
    const heightTransform = useTransform( distance, [ -150, 0, 150 ], [ 40, 80, 40 ] );

    const widthTransformIcon = useTransform( distance, [ -150, 0, 150 ], [ 20, 40, 20 ] );
    const heightTransformIcon = useTransform( distance, [ -150, 0, 150 ], [ 20, 40, 20 ] );

    const width = useSpring( widthTransform, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    } );
    const height = useSpring( heightTransform, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    } );

    const widthIcon = useSpring( widthTransformIcon, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    } );
    const heightIcon = useSpring( heightTransformIcon, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    } );

    const [ hovered, setHovered ] = useState( false );

    return (
        <Link to={ href }>
            <motion.div
                ref={ ref }
                style={ { width, height } }
                onMouseEnter={ () => setHovered( true ) }
                onMouseLeave={ () => setHovered( false ) }
                className="aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center relative"
            >
                <AnimatePresence>
                    { hovered && (
                        <motion.div
                            initial={ { opacity: 0, y: 10, x: "-50%" } }
                            animate={ { opacity: 1, y: 0, x: "-50%" } }
                            exit={ { opacity: 0, y: 2, x: "-50%" } }
                            className="px-2 py-0.5 whitespace-pre rounded-md bg-gray-100 border dark:bg-neutral-800 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700 absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs"
                        >
                            { title }
                        </motion.div>
                    ) }
                </AnimatePresence>
                <motion.div style={ { width: widthIcon, height: heightIcon } } className="flex items-center justify-center">
                    { icon }
                </motion.div>
            </motion.div>
        </Link>
    );
}

