
import { useRef, useEffect, useState } from "react";

export default function ParticleText ( {
    useBackground = true,
    text = "Mindspace Compass",
    tagline,
    numParticles = 4500,
    textColor = '#800874',
} ) {
    const canvasRef = useRef( null );
    const mousePositionRef = useRef( { x: 0, y: 0 } );
    const isTouchingRef = useRef( false );
    const [ isMobile, setIsMobile ] = useState( false );

    useEffect( () => {
        const canvas = canvasRef.current;
        if ( !canvas ) return;

        const ctx = canvas.getContext( "2d" );
        if ( !ctx ) return;

        const updateCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            setIsMobile( window.innerWidth < 768 ); // Set mobile breakpoint
        };

        updateCanvasSize();

        let particles = [];

        let textImageData = null;

        function createTextImage () {
            if ( !ctx || !canvas ) return 0;

            ctx.fillStyle = textColor ?? '#9ade00'; // NVIDIA green color
            ctx.save();

            const fontSize = isMobile ? 60 : 100;
            ctx.font = `bold ${ fontSize }px 'Arial', sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Measure text width to center it properly
            const textWidth = ctx.measureText( text ).width;

            // Draw the text
            ctx.fillText( text, canvas.width / 2, canvas.height / 2 );

            ctx.restore();

            textImageData = ctx.getImageData( 0, 0, canvas.width, canvas.height );
            ctx.clearRect( 0, 0, canvas.width, canvas.height );

            return fontSize / 100; // Return scale factor
        }

        function createParticle ( scale ) {
            if ( !ctx || !canvas || !textImageData ) return null;

            const data = textImageData.data;

            for ( let attempt = 0; attempt < 100; attempt++ ) {
                const x = Math.floor( Math.random() * canvas.width );
                const y = Math.floor( Math.random() * canvas.height );

                if ( data[ ( y * canvas.width + x ) * 4 + 3 ] > 128 ) {
                    return {
                        x: x,
                        y: y,
                        baseX: x,
                        baseY: y,
                        size: Math.random() * 2 + 1, // Slightly larger particles to match the image
                        color: "#9ade00", // Default color (NVIDIA green)
                        scatteredColor: "#c4ff00", // Brighter green when scattered
                        life: Math.random() * 100 + 50,
                    };
                }
            }

            return null;
        }

        function createInitialParticles ( scale ) {
            const baseParticleCount = numParticles ?? 7000; // Increased base count for higher density
            const particleCount = Math.floor( baseParticleCount * Math.sqrt( ( canvas.width * canvas.height ) / ( 1920 * 1080 ) ) );
            for ( let i = 0; i < particleCount; i++ ) {
                const particle = createParticle( scale );
                if ( particle ) particles.push( particle );
            }
        }

        // Create background dots pattern
        function createBackgroundDots () {
            if ( !ctx || !canvas ) return [];

            const dots = [];
            const spacing = isMobile ? 20 : 30;
            const size = isMobile ? 1 : 1.5;

            for ( let x = 0; x < canvas.width; x += spacing ) {
                for ( let y = 0; y < canvas.height; y += spacing ) {
                    // Add some randomness to the grid
                    const offsetX = Math.random() * 5 - 2.5;
                    const offsetY = Math.random() * 5 - 2.5;

                    dots.push( {
                        x: x + offsetX,
                        y: y + offsetY,
                        size: size,
                    } );
                }
            }

            return dots;
        }

        const backgroundDots = ( useBackground === true ) ? ( createBackgroundDots() ) : [];

        let animationFrameId;

        function animate ( scale ) {
            if ( !ctx || !canvas ) return;
            ctx.clearRect( 0, 0, canvas.width, canvas.height );
            ctx.fillStyle = ( useBackground === true ) ? ( 'black' ) : ( 'transparent' );
            ctx.fillRect( 0, 0, canvas.width, canvas.height );

            // Draw background dots
            if ( useBackground === true ) {
                ctx.fillStyle = "#9ade00";
                ctx.globalAlpha = 0.2;
                for ( const dot of backgroundDots ) {
                    ctx.fillRect( dot.x, dot.y, dot.size, dot.size );
                }
                ctx.globalAlpha = 1.0;
            }

            const { x: mouseX, y: mouseY } = mousePositionRef.current;
            const maxDistance = 240;

            for ( let i = 0; i < particles.length; i++ ) {
                const p = particles[ i ];
                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const distance = Math.sqrt( dx * dx + dy * dy );

                if ( distance < maxDistance && ( isTouchingRef.current || !( "ontouchstart" in window ) ) ) {
                    const force = ( maxDistance - distance ) / maxDistance;
                    const angle = Math.atan2( dy, dx );
                    const moveX = Math.cos( angle ) * force * 60;
                    const moveY = Math.sin( angle ) * force * 60;
                    p.x = p.baseX - moveX;
                    p.y = p.baseY - moveY;

                    ctx.fillStyle = p.scatteredColor;
                } else {
                    p.x += ( p.baseX - p.x ) * 0.1;
                    p.y += ( p.baseY - p.y ) * 0.1;
                    ctx.fillStyle = p.color;
                }

                ctx.fillRect( p.x, p.y, p.size, p.size );

                p.life--;
                if ( p.life <= 0 ) {
                    const newParticle = createParticle( scale );
                    if ( newParticle ) {
                        particles[ i ] = newParticle;
                    } else {
                        particles.splice( i, 1 );
                        i--;
                    }
                }
            }

            const baseParticleCount = 7000;
            const targetParticleCount = Math.floor(
                baseParticleCount * Math.sqrt( ( canvas.width * canvas.height ) / ( 1920 * 1080 ) ),
            );
            while ( particles.length < targetParticleCount ) {
                const newParticle = createParticle( scale );
                if ( newParticle ) particles.push( newParticle );
            }

            animationFrameId = requestAnimationFrame( () => animate( scale ) );
        }

        const scale = createTextImage();
        createInitialParticles( scale );
        animate( scale );

        const handleResize = () => {
            updateCanvasSize();
            const newScale = createTextImage();
            particles = [];
            createInitialParticles( newScale );
        };

        const handleMove = ( x, y ) => {
            mousePositionRef.current = { x, y };
        };

        const handleMouseMove = ( e ) => {
            handleMove( e.clientX, e.clientY );
        };

        const handleTouchMove = ( e ) => {
            if ( e.touches.length > 0 ) {
                e.preventDefault();
                handleMove( e.touches[ 0 ].clientX, e.touches[ 0 ].clientY );
            }
        };

        const handleTouchStart = () => {
            isTouchingRef.current = true;
        };

        const handleTouchEnd = () => {
            isTouchingRef.current = false;
            mousePositionRef.current = { x: 0, y: 0 };
        };

        const handleMouseLeave = () => {
            if ( !( "ontouchstart" in window ) ) {
                mousePositionRef.current = { x: 0, y: 0 };
            }
        };

        window.addEventListener( "resize", handleResize );
        canvas.addEventListener( "mousemove", handleMouseMove );
        canvas.addEventListener( "touchmove", handleTouchMove, { passive: false } );
        canvas.addEventListener( "mouseleave", handleMouseLeave );
        canvas.addEventListener( "touchstart", handleTouchStart );
        canvas.addEventListener( "touchend", handleTouchEnd );

        return () => {
            window.removeEventListener( "resize", handleResize );
            canvas.removeEventListener( "mousemove", handleMouseMove );
            canvas.removeEventListener( "touchmove", handleTouchMove );
            canvas.removeEventListener( "mouseleave", handleMouseLeave );
            canvas.removeEventListener( "touchstart", handleTouchStart );
            canvas.removeEventListener( "touchend", handleTouchEnd );
            cancelAnimationFrame( animationFrameId );
        };
    }, [ isMobile, text ] );

    return (
        <div className={ `relative w-full h-dvh flex flex-col items-center justify-center ${ useBackground === false ? '!bg-transparent' : '!bg-black' }` }>
            <canvas
                ref={ canvasRef }
                className="w-full h-full absolute top-0 left-0 touch-none"
                aria-label={ `Interactive particle effect with ${ text } text` }
            />
            { !useBackground && ( <div className="absolute bottom-[100px] text-center z-10">
                <p className="font-mono text-[#9ade00] text-xs sm:text-base md:text-sm">
                    <a href="#" className="invite-link hover:text-[#c4ff00] transition-colors duration-300">
                        { text }
                    </a>
                    { tagline !== '' && ( <span className="text-gray-500 text-xs mt-2.5 block">{ tagline }</span> ) }
                </p>
            </div> ) }
        </div>
    );
}

