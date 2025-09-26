// https://21st.dev/kokonutd/beams-background/default // 
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CONTENT_HEADER_HEIGHT } from "@/lib/config/constants";

/* interface AnimatedGradientBackgroundProps {
    className?;
    children?: React.ReactNode;
    intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
    x;
    y;
    width;
    length;
    angle;
    speed;
    opacity;
    hue;
    pulse;
    pulseSpeed;
}
 */
function createBeam ( width, height ) {
    const angle = -35 + Math.random() * 10;
    return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 1.5 - height * 0.25,
        width: 30 + Math.random() * 60,
        length: height * 2.5,
        angle: angle,
        speed: 0.6 + Math.random() * 1.2,
        opacity: 0.12 + Math.random() * 0.16,
        hue: 190 + Math.random() * 70,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
    };
}

export function BeamsBackground ( {
    className,
    intensity = "subtle",
    text = "Mindspace Compass",
    tagline,
    useBackground = true,
    numParticles = 4500,
    textColor = '#800874',
    children,
} ) {
    const canvasRef = useRef( null );
    const beamsRef = useRef( [] );
    const animationFrameRef = useRef( 0 );
    const MINIMUM_BEAMS = 20;

    const opacityMap = {
        subtle: 0.7,
        medium: 0.85,
        strong: 1,
    };

    useEffect( () => {
        const canvas = canvasRef.current;
        if ( !canvas ) return;

        const ctx = canvas.getContext( "2d" );
        if ( !ctx ) return;

        const updateCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${ window.innerWidth }px`;
            canvas.style.height = `${ window.innerHeight }px`;
            ctx.scale( dpr, dpr );

            const totalBeams = MINIMUM_BEAMS * 1.5;
            beamsRef.current = Array.from( { length: totalBeams }, () =>
                createBeam( canvas.width, canvas.height )
            );
        };

        updateCanvasSize();
        window.addEventListener( "resize", updateCanvasSize );

        function resetBeam ( beam, index, totalBeams ) {
            if ( !canvas ) return beam;

            const column = index % 3;
            const spacing = canvas.width / 3;

            beam.y = canvas.height + 100;
            beam.x =
                column * spacing +
                spacing / 2 +
                ( Math.random() - 0.5 ) * spacing * 0.5;
            beam.width = 100 + Math.random() * 100;
            beam.speed = 0.5 + Math.random() * 0.4;
            beam.hue = 190 + ( index * 70 ) / totalBeams;
            beam.opacity = 0.2 + Math.random() * 0.1;
            return beam;
        }

        function drawBeam ( ctx, beam ) {
            ctx.save();
            ctx.translate( beam.x, beam.y );
            ctx.rotate( ( beam.angle * Math.PI ) / 180 );

            // Calculate pulsing opacity
            const pulsingOpacity =
                beam.opacity *
                ( 0.8 + Math.sin( beam.pulse ) * 0.2 ) *
                opacityMap[ intensity ];

            const gradient = ctx.createLinearGradient( 0, 0, 0, beam.length );

            // Enhanced gradient with multiple color stops
            gradient.addColorStop( 0, `hsla(${ beam.hue }, 85%, 65%, 0)` );
            gradient.addColorStop(
                0.1,
                `hsla(${ beam.hue }, 85%, 65%, ${ pulsingOpacity * 0.5 })`
            );
            gradient.addColorStop(
                0.4,
                `hsla(${ beam.hue }, 85%, 65%, ${ pulsingOpacity })`
            );
            gradient.addColorStop(
                0.6,
                `hsla(${ beam.hue }, 85%, 65%, ${ pulsingOpacity })`
            );
            gradient.addColorStop(
                0.9,
                `hsla(${ beam.hue }, 85%, 65%, ${ pulsingOpacity * 0.5 })`
            );
            gradient.addColorStop( 1, `hsla(${ beam.hue }, 85%, 65%, 0)` );

            ctx.fillStyle = gradient;
            ctx.fillRect( -beam.width / 2, 0, beam.width, beam.length );
            ctx.restore();
        }

        function animate () {
            if ( !canvas || !ctx ) return;

            ctx.clearRect( 0, 0, canvas.width, canvas.height );
            ctx.filter = "blur(35px)";

            const totalBeams = beamsRef.current.length;
            beamsRef.current.forEach( ( beam, index ) => {
                beam.y -= beam.speed;
                beam.pulse += beam.pulseSpeed;

                // Reset beam when it goes off screen
                if ( beam.y + beam.length < -100 ) {
                    resetBeam( beam, index, totalBeams );
                }

                drawBeam( ctx, beam );
            } );

            animationFrameRef.current = requestAnimationFrame( animate );
        }

        animate();

        return () => {
            window.removeEventListener( "resize", updateCanvasSize );
            if ( animationFrameRef.current ) {
                cancelAnimationFrame( animationFrameRef.current );
            }
        };
    }, [ intensity ] );

    return (
        <div
            className={ cn(
                "relative min-h-screen w-full overflow-hidden bg-neutral-950",
                className
            ) }
        >
            <canvas
                ref={ canvasRef }
                className="absolute inset-0"
                style={ { filter: "blur(15px)" } }
            />

            { children && children }
            <motion.div
                className="absolute inset-0 bg-neutral-950/5"
                animate={ {
                    opacity: [ 0.05, 0.15, 0.05 ],
                } }
                transition={ {
                    duration: 10,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                } }
                style={ {
                    backdropFilter: "blur(50px)",
                } }
            />

                { children && children }
            { !useBackground && ( <div className="relative z-10 flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-6 px-4 text-center">
                    { text !== '' && ( <motion.h1
                        className="text-6xl md:text-7xl lg:text-8xl font-semibold text-white tracking-tighter"
                        initial={ { opacity: 0, y: 20 } }
                        animate={ { opacity: 1, y: 0 } }
                        transition={ { duration: 0.8 } }
                    >
                        { text }
                    </motion.h1> ) }
                    { tagline !== '' && ( <motion.p
                        className="text-lg md:text-2xl lg:text-3xl text-white/70 tracking-tighter"
                        initial={ { opacity: 0, y: 20 } }
                        animate={ { opacity: 1, y: 0 } }
                        transition={ { duration: 0.8 } }
                    >
                        { tagline }
                    </motion.p> ) }
                </div>
            </div> ) }
        </div>
    );
}



/* interface CyberBackgroundProps {
  title?
  subtitle?
  particleCount?
  noiseIntensity?
  particleSize?: { min; max }
  className?
} */

function createNoise () {
    const permutation = [
        151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240,
        21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88,
        237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83,
        111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80,
        73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
        52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182,
        189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22,
        39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210,
        144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84,
        204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78,
        66, 215, 61, 156, 180,
    ];

    const p = new Array( 512 );
    for ( let i = 0; i < 256; i++ ) p[ 256 + i ] = p[ i ] = permutation[ i ];

    function fade ( t ) {
        return t * t * t * ( t * ( t * 6 - 15 ) + 10 );
    }

    function lerp ( t, a, b ) {
        return a + t * ( b - a );
    }

    function grad ( hash, x, y, z ) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ( ( h & 1 ) === 0 ? u : -u ) + ( ( h & 2 ) === 0 ? v : -v );
    }

    return {
        simplex3: ( x, y, z ) => {
            const X = Math.floor( x ) & 255;
            const Y = Math.floor( y ) & 255;
            const Z = Math.floor( z ) & 255;

            x -= Math.floor( x );
            y -= Math.floor( y );
            z -= Math.floor( z );

            const u = fade( x );
            const v = fade( y );
            const w = fade( z );

            const A = p[ X ] + Y;
            const AA = p[ A ] + Z;
            const AB = p[ A + 1 ] + Z;
            const B = p[ X + 1 ] + Y;
            const BA = p[ B ] + Z;
            const BB = p[ B + 1 ] + Z;

            return lerp(
                w,
                lerp(
                    v,
                    lerp( u, grad( p[ AA ], x, y, z ), grad( p[ BA ], x - 1, y, z ) ),
                    lerp( u, grad( p[ AB ], x, y - 1, z ), grad( p[ BB ], x - 1, y - 1, z ) ),
                ),
                lerp(
                    v,
                    lerp( u, grad( p[ AA + 1 ], x, y, z - 1 ), grad( p[ BA + 1 ], x - 1, y, z - 1 ) ),
                    lerp( u, grad( p[ AB + 1 ], x, y - 1, z - 1 ), grad( p[ BB + 1 ], x - 1, y - 1, z - 1 ) ),
                ),
            );
        },
    };
}

const COLOR_SCHEME = {
    light: {
        particle: {
            color: "rgba(0, 0, 0, 0.07)",
        },
        background: "rgba(255, 255, 255, 0.12)",
    },
    dark: {
        particle: {
            color: "rgba(255, 255, 255, 0.07)",
        },
        background: "rgba(0, 0, 0, 0.12)",
    },
};

/* interface Particle {
  x
  y
  size
  velocity: { x; y }
  life
  maxLife
} */

export function ParticlesBackground ( {
    useBackground = true,
    title = "Particles Background",
    subtitle = "Make your website stand out",
    particleCount = 2000,
    noiseIntensity = 0.003,
    particleSize = { min: 0.5, max: 2 },
    className,
    children,
} ) {
    const canvasRef = useRef( null );
    const noise = createNoise();

    useEffect( () => {
        const canvas = canvasRef.current;
        if ( !canvas ) return;

        const ctx = canvas.getContext( "2d", { alpha: true } );
        if ( !ctx ) return;

        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if ( !container ) return;

            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };

        resizeCanvas();

        const particles = Array.from( { length: particleCount }, () => ( {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * ( particleSize.max - particleSize.min ) + particleSize.min,
            velocity: { x: 0, y: 0 },
            life: Math.random() * 100,
            maxLife: 100 + Math.random() * 50,
        } ) );

        const animate = () => {
            const isDark = document.documentElement.classList.contains( "dark" );
            const scheme = isDark ? COLOR_SCHEME.dark : COLOR_SCHEME.light;

            ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)";
            ctx.fillRect( 0, 0, canvas.width, canvas.height );

            for ( const particle of particles ) {
                particle.life += 1;
                if ( particle.life > particle.maxLife ) {
                    particle.life = 0;
                    particle.x = Math.random() * canvas.width;
                    particle.y = Math.random() * canvas.height;
                }

                const opacity = Math.sin( ( particle.life / particle.maxLife ) * Math.PI ) * 0.15;

                const n = noise.simplex3( particle.x * noiseIntensity, particle.y * noiseIntensity, Date.now() * 0.0001 );

                const angle = n * Math.PI * 4;
                particle.velocity.x = Math.cos( angle ) * 2;
                particle.velocity.y = Math.sin( angle ) * 2;

                particle.x += particle.velocity.x;
                particle.y += particle.velocity.y;

                if ( particle.x < 0 ) particle.x = canvas.width;
                if ( particle.x > canvas.width ) particle.x = 0;
                if ( particle.y < 0 ) particle.y = canvas.height;
                if ( particle.y > canvas.height ) particle.y = 0;

                ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${ opacity })` : `rgba(0, 0, 0, ${ opacity })`;
                ctx.beginPath();
                ctx.arc( particle.x, particle.y, particle.size, 0, Math.PI * 2 );
                ctx.fill();
            }

            requestAnimationFrame( animate );
        };

        animate();

        const handleResize = () => {
            resizeCanvas();
        };

        window.addEventListener( "resize", handleResize );
        return () => window.removeEventListener( "resize", handleResize );
    }, [ particleCount, noiseIntensity, particleSize, noise ] );

    return (
        <div className={ cn( "relative w-full h-screen overflow-hidden", "bg-white dark:bg-black", className ) }>
            <canvas ref={ canvasRef } className="absolute inset-0 w-full h-full" />
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                { children && children }
                { !useBackground && ( <motion.div
                    initial={ { opacity: 0, y: 20 } }
                    animate={ { opacity: 1, y: 0 } }
                    transition={ { duration: 0.8 } }
                    className="text-center space-y-4"
                >
                    <h1 className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-black to-black/70 dark:from-white dark:to-white/70 drop-shadow-sm">
                        { title }
                    </h1>
                    <Link
                        to={ `#` }
                        className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-black/90 to-black/50 dark:from-white/90 dark:to-white/50 flex items-center justify-center">
                        { subtitle }
                    </Link>
                </motion.div> ) }
            </div>
        </div>
    );
}


/* 
interface FlickeringGridProps {
    squareSize?;
    gridGap?;
    flickerChance?;
    color?;
    width?;
    height?;
    className?;

    maxOpacity?;
} */

export const FlickeringGridBackground = ( {
    squareSize = 4,
    gridGap = 6,
    flickerChance = 0.3,
    color = "rgb(0, 0, 0)",
    width,
    height,
    className,
    maxOpacity = 0.3,
    children
}, ...props ) => {
    const canvasRef = useRef( null );
    const containerRef = useRef( null );
    const [ isInView, setIsInView ] = useState( false );
    const [ canvasSize, setCanvasSize ] = useState( { width: 0, height: 0 } );

    const memoizedColor = useMemo( () => {
        const toRGBA = ( color ) => {
            if ( typeof window === "undefined" ) {
                return `rgba(0, 0, 0,`;
            }
            const canvas = document.createElement( "canvas" );
            canvas.width = canvas.height = 1;
            const ctx = canvas.getContext( "2d" );
            if ( !ctx ) return "rgba(255, 0, 0,";
            ctx.fillStyle = color;
            ctx.fillRect( 0, 0, 1, 1 );
            const [ r, g, b ] = Array.from( ctx.getImageData( 0, 0, 1, 1 ).data );
            return `rgba(${ r }, ${ g }, ${ b },`;
        };
        return toRGBA( color );
    }, [ color ] );

    const setupCanvas = useCallback(
        ( canvas, width, height ) => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${ width }px`;
            canvas.style.height = `${ height }px`;
            const cols = Math.floor( width / ( squareSize + gridGap ) );
            const rows = Math.floor( height / ( squareSize + gridGap ) );

            const squares = new Float32Array( cols * rows );
            for ( let i = 0; i < squares.length; i++ ) {
                squares[ i ] = Math.random() * maxOpacity;
            }

            return { cols, rows, squares, dpr };
        },
        [ squareSize, gridGap, maxOpacity ],
    );

    const updateSquares = useCallback(
        ( squares, deltaTime ) => {
            for ( let i = 0; i < squares.length; i++ ) {
                if ( Math.random() < flickerChance * deltaTime ) {
                    squares[ i ] = Math.random() * maxOpacity;
                }
            }
        },
        [ flickerChance, maxOpacity ],
    );

    const drawGrid = useCallback(
        (
            ctx,
            width,
            height,
            cols,
            rows,
            squares,
            dpr,
        ) => {
            ctx.clearRect( 0, 0, width, height );
            ctx.fillStyle = "transparent";
            ctx.fillRect( 0, 0, width, height );

            for ( let i = 0; i < cols; i++ ) {
                for ( let j = 0; j < rows; j++ ) {
                    const opacity = squares[ i * rows + j ];
                    ctx.fillStyle = `${ memoizedColor }${ opacity })`;
                    ctx.fillRect(
                        i * ( squareSize + gridGap ) * dpr,
                        j * ( squareSize + gridGap ) * dpr,
                        squareSize * dpr,
                        squareSize * dpr,
                    );
                }
            }
        },
        [ memoizedColor, squareSize, gridGap ],
    );

    useEffect( () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if ( !canvas || !container ) return;

        const ctx = canvas.getContext( "2d" );
        if ( !ctx ) return;

        let animationFrameId;
        let gridParams;

        const updateCanvasSize = () => {
            const newWidth = width || container.clientWidth;
            const newHeight = height || container.clientHeight;
            setCanvasSize( { width: newWidth, height: newHeight } );
            gridParams = setupCanvas( canvas, newWidth, newHeight );
        };

        updateCanvasSize();

        let lastTime = 0;
        const animate = ( time ) => {
            if ( !isInView ) return;

            const deltaTime = ( time - lastTime ) / 1000;
            lastTime = time;

            updateSquares( gridParams.squares, deltaTime );
            drawGrid(
                ctx,
                canvas.width,
                canvas.height,
                gridParams.cols,
                gridParams.rows,
                gridParams.squares,
                gridParams.dpr,
            );
            animationFrameId = requestAnimationFrame( animate );
        };

        const resizeObserver = new ResizeObserver( () => {
            updateCanvasSize();
        } );

        resizeObserver.observe( container );

        const intersectionObserver = new IntersectionObserver(
            ( [ entry ] ) => {
                setIsInView( entry.isIntersecting );
            },
            { threshold: 0 },
        );

        intersectionObserver.observe( canvas );

        if ( isInView ) {
            animationFrameId = requestAnimationFrame( animate );
        }

        return () => {
            cancelAnimationFrame( animationFrameId );
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
        };
    }, [ setupCanvas, updateSquares, drawGrid, width, height, isInView ] );

    return (
        <div ref={ containerRef } 
                className={ `pointer-events-none w-full rounded-xl relative flex flex-col !min-h-[calc(100vh_-_var(--header-height))] !h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] ${ className } !z-20 mb-4` }
                style={ {
                    '--header-height': `${ String( CONTENT_HEADER_HEIGHT - 4 ) }rem`,
                } }>
            <canvas
                ref={ canvasRef }
                className="pointer-events-none"
                style={ {
                    width: canvasSize.width,
                    height: canvasSize.height,
                } }
            />
            { children && children }
        </div>
    );
};

/*  export function FlickeringGridDemo() {
        return (
            <div className="relative h-[500px] rounded-lg w-full bg-background overflow-hidden border">
                <FlickeringGrid
                    className="z-0 absolute inset-0 size-full"
                    squareSize={4}
                    gridGap={6}
                    color="#6B7280"
                    maxOpacity={0.5}
                    flickerChance={0.1}
                    height={800}
                    width={800}
                />
            </div>
        );
    }
*/