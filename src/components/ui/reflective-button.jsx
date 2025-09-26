import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

export function ReflectiveButton ( { children, className, ...props } ) {
    const [ position, setPosition ] = useState( { x: 0, y: 0 } );
    const [ isHovering, setIsHovering ] = useState( false );

    const handleMouseMove = useCallback( ( e ) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition( {
            x: ( ( e.clientX - rect.left ) / rect.width ) * 100,
            y: ( ( e.clientY - rect.top ) / rect.height ) * 100,
        } );
    }, [] );

    return (
        <Button
            className={ `relative group ${ className }` }
            onMouseMove={ handleMouseMove }
            onMouseEnter={ () => setIsHovering( true ) }
            onMouseLeave={ () => setIsHovering( false ) }
            { ...props }
        >
            <div
                className="absolute inset-[-1px] rounded-full pointer-events-none"
                style={ {
                    opacity: isHovering ? 1 : 0,
                    background: "transparent",
                    transition: "opacity 0.15s ease",
                } }
            >
                <div
                    className="absolute inset-0 rounded-full"
                    style={
                        {
                            background: "transparent",
                            border: "1px solid rgba(45, 212, 191, 0.7)",
                            clipPath: "inset(0px round 9999px)",
                            maskImage: "radial-gradient(circle at var(--mouse-x) var(--mouse-y), black, transparent 100%)",
                            WebkitMaskImage: "radial-gradient(circle at var(--mouse-x) var(--mouse-y), black, transparent 100%)",
                            "--mouse-x": `${ position.x }%`,
                            "--mouse-y": `${ position.y }%`,
                        }
                    }
                />
            </div>
            { children }
        </Button>
    );
}

/*  import { Camera, FileCode, LayoutDashboard, Droplet, Calculator } from "lucide-react";
    import { ReflectiveButton } from "./components/reflective-button";

    export default function ButtonRow () {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-wrap justify-center gap-1.5 p-4 max-w-4xl">
                    <ReflectiveButton
                        variant="outline"
                        className="h-8 px-3 rounded-full bg-white hover:bg-white text-gray-700 shadow-sm border border-gray-200 text-[13px] font-medium whitespace-nowrap inline-flex items-center"
                    >
                        <Camera className="w-3.5 h-3.5 stroke-[1.5px]" />
                        Clone a Screenshot
                    </ReflectiveButton>

                    <ReflectiveButton
                        variant="outline"
                        className="h-8 px-3 rounded-full bg-white hover:bg-white text-gray-700 shadow-sm border border-gray-200 text-[13px] font-medium whitespace-nowrap inline-flex items-center"
                    >
                        <FileCode className="w-3.5 h-3.5 stroke-[1.5px]" />
                        Import from Figma
                    </ReflectiveButton>

                    <ReflectiveButton
                        variant="outline"
                        className="h-8 px-3 rounded-full bg-white hover:bg-white text-gray-700 shadow-sm border border-gray-200 text-[13px] font-medium whitespace-nowrap inline-flex items-center"
                    >
                        <LayoutDashboard className="w-3.5 h-3.5 stroke-[1.5px]" />
                        Landing Page
                    </ReflectiveButton>

                    <ReflectiveButton
                        variant="outline"
                        className="h-8 px-3 rounded-full bg-white hover:bg-white text-gray-700 shadow-sm border border-gray-200 text-[13px] font-medium whitespace-nowrap inline-flex items-center"
                    >
                        <Droplet className="w-3.5 h-3.5 stroke-[1.5px]" />
                        Sign Up Form
                    </ReflectiveButton>

                    <ReflectiveButton
                        variant="outline"
                        className="h-8 px-3 rounded-full bg-white hover:bg-white text-gray-700 shadow-sm border border-gray-200 text-[13px] font-medium whitespace-nowrap inline-flex items-center"
                    >
                        <Calculator className="w-3.5 h-3.5 stroke-[1.5px]" />
                        Calculate Factorial
                    </ReflectiveButton>
                </div>
            </div>
        );
    }
*/
