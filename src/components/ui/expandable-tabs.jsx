import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import useOnClickOutside from "@/lib/hooks/useOnClickOutside";
import { Button } from "./button";
import { ArrowBigDown } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { caseCamelToSentence } from "@/lib/utilities/string";

// interface Tab {
//   title: string;
//   icon: LucideIcon;
//   type?: never;
// }

// interface Separator {
//   type: "separator";
//   title?: never;
//   icon?: never;
// }

// type TabItem = Tab | Separator;

// interface ExpandableTabsProps {
//   tabs: TabItem[];
//   className?: string;
//   activeColor?: string;
//   onChange?: (index | null) => void;
// }

const buttonVariants = {
    initial: {
        gap: 0,
        paddingLeft: ".5rem",
        paddingRight: ".5rem",
    },
    animate: ( isSelected ) => ( {
        gap: isSelected ? ".5rem" : 0,
        paddingLeft: isSelected ? "1rem" : ".5rem",
        paddingRight: isSelected ? "1rem" : ".5rem",
    } ),
};

const spanVariants = {
    initial: { width: 0, opacity: 0 },
    animate: { width: "auto", opacity: 1 },
    exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 };

export function ExpandableTabs ( {
    tabs,
    className,
    activeColor = "text-primary",
    onChange,
} ) {
    const [ selected, setSelected ] = useState( null );
    const [ toggled, setToggled ] = useState( true );
    const outsideClickRef = useRef( null );

    useOnClickOutside( outsideClickRef, () => {
        setSelected( null );
        onChange?.( null );
    } );

    const handleSelect = ( index ) => {
        setSelected( index );
        onChange?.( index );
    };

    const Separator = () => (
        <div className="mx-1 h-[24px] w-[1.2px] bg-border" aria-hidden="true" />
    );

    return (
        <div className={ `w-full flex flex-row absolute bottom-0 items-center justify-center z-2000 gap-4 saturate-50 backdrop-blur-3xl fill-mode-both` }>
            <Button
                variant={ 'ghost' }
                size={ 'xs' }
                className={ `px-4 py-2 m-0 border rounded-lg !h-7 flex-shrink ${ toggled === true ? '-bottom-4' : 'bottom-0' } relative` }
                onClick={ () => { setToggled( !toggled ); } }
            >
                <ArrowBigDown className={ `p-0 m-0 w-min !size-4 ${ toggled === true ? 'rotate-180' : '' } hover:animate-rotate transition-all self-center` } />
            </Button>
            <div className={ twMerge(
                `items-center justify-center opacity-30 hover:opacity-80 transition-all duration-150 rounded-full shadow-lg ease-in-out radius-m-4 relative`,
                toggled === true ? '-bottom-24' : 'bottom-0',
                // `saturate-50 backdrop-blur-3xl fill-mode-backwards bg-background/5 backdrop-blur-lg `,
            ) }
            >
                <div
                    ref={ outsideClickRef }
                    className={ twMerge(
                        "flex flex-wrap items-center gap-2",
                        // `saturate-50 backdrop-blur-sm fill-mode-backwards`,
                        className,
                        `border-primary-purple-400 bg-primary-purple-400/20 rounded-2xl border`,
                    ) }>
                    { tabs.map( ( tab, index ) => {
                        if ( tab.type === "separator" ) {
                            return <Separator key={ `separator-${ index }` } />;
                        }

                        const Icon = tab.icon;
                        return (
                            <motion.button
                                key={ tab.title }
                                variants={ buttonVariants }
                                initial={ false }
                                animate="animate"
                                custom={ selected === index }
                                onClick={ () => handleSelect( index ) }
                                transition={ transition }
                                className={ cn(
                                    "relative flex items-center rounded-xl px-2 py-2 text-sm font-medium transition-colors duration-300",
                                    selected === index
                                        ? cn( "bg-muted", activeColor )
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                ) }
                            >
                                <Icon size={ 20 } />
                                <AnimatePresence initial={ false }>
                                    { selected === index && (
                                        <motion.span
                                            variants={ spanVariants }
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            transition={ transition }
                                            className="overflow-hidden"
                                        >
                                            { caseCamelToSentence( tab.title ) }
                                        </motion.span>
                                    ) }
                                </AnimatePresence>
                            </motion.button>
                        );
                    } ) }
                </div>
            </div>
        </div>
    );
}

/*  import { Bell, Home, HelpCircle, Settings, Shield, Mail, User, FileText, Lock } from "lucide-react";
    import { ExpandableTabs } from "@/components/ui/expandable-tabs";

    function DefaultDemo () {
        const tabs = [
            { title: "Dashboard", icon: Home },
            { title: "Notifications", icon: Bell },
            { type: "separator" },
            { title: "Settings", icon: Settings },
            { title: "Support", icon: HelpCircle },
            { title: "Security", icon: Shield },
        ];

        return (
            <div className="flex flex-col gap-4">
                <ExpandableTabs tabs={ tabs } />
            </div>
        );
    }

    function CustomColorDemo () {
        const tabs = [
            { title: "Profile", icon: User },
            { title: "Messages", icon: Mail },
            { type: "separator" },
            { title: "Documents", icon: FileText },
            { title: "Privacy", icon: Lock },
        ];

        return (
            <div className="flex flex-col gap-4">
                <ExpandableTabs
                    tabs={ tabs }
                    activeColor="text-blue-500"
                    className="border-blue-200 dark:border-blue-800"
                />
            </div>
        );
    }

    export { DefaultDemo, CustomColorDemo };
*/