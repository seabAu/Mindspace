"use client";

import { cn } from "@/lib/utils";
/* eslint-disable react/prop-types */
import React, { useMemo, useState } from 'react';
import { cva } from 'class-variance-authority';
import {
    LoaderCircleIcon,
    LoaderIcon,
    LoaderPinwheelIcon,
} from 'lucide-react';
import './Spinner.css';
import './loader.css';
import { twMerge } from 'tailwind-merge';

/**
 * Validates and normalizes spinner props to prevent crashes
 * @param {Object} props - Raw props object
 * @returns {Object} Validated and normalized props
 */
const validateSpinnerProps = ( props = {} ) => {
    const { variant = "default", size = "md", color = "currentColor", overlay = false, className = "", ...rest } = props;

    // Validate variant
    const validVariants = [
        "default",
        "circle",
        "pinwheel",
        "pulse",
        "wave",
        "dots",
        "circles",
        "bars",
        "grid",
        "ripple",
        "arc",
        "orbit",
    ];
    const normalizedVariant = validVariants.includes( variant ) ? variant : "default";

    // Validate size
    const validSizes = [ "xs", "sm", "md", "lg", "xl", "xxl" ];
    const normalizedSize = validSizes.includes( size ) ? size : "md";

    // Validate color
    const normalizedColor = typeof color === "string" && color.trim() ? color : "currentColor";

    // Validate overlay
    const normalizedOverlay = Boolean( overlay );

    // Validate className
    const normalizedClassName = typeof className === "string" ? className : "";

    return {
        variant: normalizedVariant,
        size: normalizedSize,
        color: normalizedColor,
        overlay: normalizedOverlay,
        className: normalizedClassName,
        ...rest,
    };
};

/**
 * Size class mappings for consistent sizing
 */
const sizeClasses = {
    default: 'h-4 w-4',
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    icon: 'h-10 w-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    xxl: 'w-24 h-24',
};

/**
 * Lucide icon spinner variants with error boundaries
 */
const LucideSpinners = ( { variant, className, ...props } ) => {
    try {
        switch ( variant ) {
            case "circle":
                return <LoaderCircleIcon className={ cn( "animate-spin", className ) } { ...props } />;
            case "pinwheel":
                return <LoaderPinwheelIcon className={ cn( "animate-spin", className ) } { ...props } />;
            default:
                return <LoaderIcon className={ cn( "animate-spin", className ) } { ...props } />;
        }
    } catch ( error ) {
        console.error( "[v0] Spinner: Error rendering Lucide spinner:", error );
        return <div className={ cn( "animate-spin rounded-full border-2 border-current border-t-transparent", className ) } />;
    }
};

/**
 * CSS-based spinner variants with error handling
 */
const CSSSpinners = ( { variant, size, color } ) => {
    const sizeClass = sizeClasses[ size ] || sizeClasses.md;

    try {
        switch ( variant ) {
            case "pulse":
                return <div className={ cn( "animate-pulse rounded-full", sizeClass ) } style={ { backgroundColor: color } } />;

            case "wave":
                return (
                    <div className={ cn( "flex justify-center items-center space-x-1", sizeClass ) }>
                        { [ 0, 1, 2 ].map( ( i ) => (
                            <div
                                key={ i }
                                className="w-1 h-4 animate-bounce rounded-full"
                                style={ {
                                    backgroundColor: color,
                                    animationDelay: `${ i * 0.1 }s`,
                                } }
                            />
                        ) ) }
                    </div>
                );

            case "dots":
                return (
                    <div className={ cn( "flex justify-center items-center space-x-1", sizeClass ) }>
                        { [ 0, 1, 2 ].map( ( i ) => (
                            <div
                                key={ i }
                                className="w-2 h-2 animate-bounce rounded-full"
                                style={ {
                                    backgroundColor: color,
                                    animationDelay: `${ i * 0.1 }s`,
                                } }
                            />
                        ) ) }
                    </div>
                );

            case "circles":
                return (
                    <div className={ cn( "relative", sizeClass ) }>
                        { [ 0, 1, 2 ].map( ( i ) => (
                            <div
                                key={ i }
                                className="absolute inset-0 rounded-full animate-ping opacity-75"
                                style={ {
                                    backgroundColor: color,
                                    animationDelay: `${ i * 0.5 }s`,
                                } }
                            />
                        ) ) }
                    </div>
                );

            case "bars":
                return (
                    <div className={ cn( "flex justify-center items-center space-x-1", sizeClass ) }>
                        { [ 0, 1, 2, 3 ].map( ( i ) => (
                            <div
                                key={ i }
                                className="w-1 animate-pulse"
                                style={ {
                                    backgroundColor: color,
                                    animationDelay: `${ i * 0.15 }s`,
                                    height: size === "sm" ? "10px" : size === "lg" ? "30px" : "20px",
                                } }
                            />
                        ) ) }
                    </div>
                );

            case "arc":
                return (
                    <div className={ cn( "relative", sizeClass ) }>
                        <div
                            className="absolute inset-0 rounded-full border-2 border-t-current border-transparent animate-spin"
                            style={ { borderTopColor: color } }
                        />
                    </div>
                );

            default:
                return (
                    <div
                        className={ cn( "animate-spin rounded-full border-2 border-current border-t-transparent", sizeClass ) }
                        style={ { borderColor: `${ color }33`, borderTopColor: color } }
                    />
                );
        }
    } catch ( error ) {
        console.error( "[v0] Spinner: Error rendering CSS spinner:", error );
        return (
            <div
                className={ cn( "animate-spin rounded-full border-2 border-current border-t-transparent", sizeClass ) }
                style={ { borderColor: `${ color }33`, borderTopColor: color } }
            />
        );
    }
};

/**
 * Overlay wrapper component
 */
const SpinnerOverlay = ( { children } ) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
            { children }
        </div>
    );
};

/**
 * Main Spinner component with comprehensive error handling
 * @param {Object} props - Spinner configuration
 * @returns {JSX.Element} Rendered spinner component
 */
export const Spinner = ( props ) => {
    const validatedProps = useMemo( () => validateSpinnerProps( props ), [ props ] );
    const { variant, size, color, overlay, className } = validatedProps;

    const spinnerContent = useMemo( () => {
        try {
            const lucideVariants = [ "default", "circle", "pinwheel" ];

            if ( lucideVariants.includes( variant ) ) {
                return <LucideSpinners variant={ variant } className={ cn( sizeClasses[ size ], className ) } style={ { color } } />;
            } else {
                return <CSSSpinners variant={ variant } size={ size } color={ color } />;
            }
        } catch ( error ) {
            console.error( "[v0] Spinner: Error generating spinner content:", error );
            return (
                <div
                    className={ cn(
                        "animate-spin rounded-full border-2 border-current border-t-transparent",
                        sizeClasses[ size ],
                        className,
                    ) }
                    style={ { borderColor: `${ color }33`, borderTopColor: color } }
                />
            );
        }
    }, [ variant, size, color, className ] );

    try {
        if ( overlay ) {
            return <SpinnerOverlay>{ spinnerContent }</SpinnerOverlay>;
        }

        return <div className={ cn( "flex items-center justify-center", className ) }>{ spinnerContent }</div>;
    } catch ( error ) {
        console.error( "[v0] Spinner: Error rendering spinner wrapper:", error );
        return (
            <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
            </div>
        );
    }
};

export default Spinner;



// /* eslint-disable react/prop-types */
// import React, { useMemo, useState } from 'react';
// import { cn } from '@/lib/utils';
// import {
//     LoaderCircleIcon,
//     LoaderIcon,
//     LoaderPinwheelIcon,
//     //   type LucideProps,
// } from 'lucide-react';
// import { cva } from 'class-variance-authority';
// import './Spinner.css';
// import './loader.css';
// import { twMerge } from 'tailwind-merge';

// const sizeClasses = {
//     default: 'h-4 w-4',
//     xs: 'w-4 h-4',
//     sm: 'w-6 h-6',
//     md: 'w-8 h-8',
//     icon: 'h-10 w-10',
//     lg: 'w-12 h-12',
//     xl: 'w-16 h-16',
//     xxl: 'w-24 h-24',
// };

// /*
// const spinnerVariants = cva(
//     "text-muted-foreground animate-spin", {
//     variants: {
//         default: 'h-4 w-4',
//         sm: 'h-2 w-2',
//         lg: 'h-6 w-6',
//         xl: 'h-12 w-12',
//         xxl: 'h-16 w-16',
//         icon: 'h-10 w-10',
//     },
//     defaultVariants: {
//         size: 'default',
//     },
// },
// );

// export const Spinner = ( { size } ) => {
//     return (
//         <Loader
//             className={
//                 cn(
//                     spinnerVariants( { size } )
//                 )
//             }
//         />
//     );
// };
// */

// export const SpinnerCSS = ( props ) => {
//     const {
//         size = 'sm',
//         variant = 1,
//         overlay = true,
//         debug = true,
//         className = '',
//     } = props;

//     const getVariantClassNames = ( v ) => {
//         if (
//             Array.from( { length: 25 }, ( _, i ) => String( i ) ).includes(
//                 variant.toString(),
//             )
//         ) {
//             // Return regular css variant(s)
//             //setCSSVariant( `spinner${ v }` );
//             return `spinner spinner${ v }`;
//         } else {
//             // Return spicy new kind.
//             //setCSSVariant( `spinner${ v }` );
//             return `spinner spinner${ v }`;
//         }
//     };
//     const [ cssVariant, setCSSVariant ] = useState( `spinner spinner${ variant }` );

//     if ( overlay ) {
//         return (
//             <SpinnerOverlay>
//                 { variant && cssVariant && <div className={ `${ cssVariant }` } /> }
//             </SpinnerOverlay>
//         );
//     }

//     return (
//         <div className={ cn( 'flex items-center justify-center', className ) }>
//             { variant && cssVariant && <div className={ `${ cssVariant }` } /> }
//         </div>
//     );
// };

export const SpinnerReact = ( props ) => {
    const {
        size = 'md',
        variant = 2,
        padding = 0,
        margin = 0,
        radius,
        height = 50,
        width = 50,
        cx = 0,
        cy = 0,
        fill = 'none',
        stroke,
        strokeWidth,
        spinnerPadding = 0,
    } = props;

    const spinnerContainerStyles = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        alignContent: 'center',
        // height: height,
        // width: `${width > 100 ? 100 : width}%`,
        // backgroundColor: fillercolor,
        // borderRadius: borderRadius,
        padding: `${ padding }px`,
        margin: `${ margin }`,
    };

    const spinnerStyles = {
        padding: `${ spinnerPadding }px`,
        textAlign: 'middle',
        transition: 'width 1s ease-in-out',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        top: '50%',
        left: '50%',
        margin: '-25px 0 0 -25px',
        width: `${ height }px`,
        height: `${ width }px`,
    };

    const spinnerPathStyles = {
        // stroke: "#111111",
        strokeLinecap: 'rounsd',
        padding: `${ padding }px`,
        color: 'white',
    };

    return (
        <div
            className={ `loader-spinner-container` }
            style={ spinnerContainerStyles }>
            <svg
                id={ `spinner` }
                key={ `spinner` }
                className={ `spinner${ variant ? ' spinner' + variant : '' }` }
                style={ spinnerStyles }
                viewBox={ `0 0 50 50` }>
                <circle
                    style={ spinnerPathStyles }
                    className='path'
                    cx={ cx ?? '25' }
                    cy={ cy ?? '25' }
                    r={ radius ?? '20' }
                    fill={ fill ?? 'none' }
                    stroke={ stroke ?? '#111111' }
                    // pathlength={1}
                    strokeWidth={ strokeWidth ?? '5' }></circle>
            </svg>
        </div>
    );
};

// /* export type SpinnerProps = LucideProps & {
//   variant?:
//     | 'default'
//     | 'circle'
//     | 'pinwheel'
//     | 'circle-filled'
//     | 'ellipsis'
//     | 'ring'
//     | 'bars'
//     | 'infinite';
// }; */

// // type SpinnerVariantProps = Omit<SpinnerProps, 'variant'>;

// const Default = ( { className, ...props } ) => (
//     <LoaderIcon
//         className={ cn( 'animate-spin', className ) }
//         { ...props }
//     />
// );

// const Circle = ( { className, ...props } ) => (
//     <LoaderCircleIcon
//         className={ cn( 'animate-spin', className ) }
//         { ...props }
//     />
// );

// const Pinwheel = ( { className, ...props } ) => (
//     <LoaderPinwheelIcon
//         className={ cn( 'animate-spin', className ) }
//         { ...props }
//     />
// );

// const CircleFilled = ( { className, size = 24, ...props } ) => (
//     <div
//         className='relative'
//         style={ { width: size, height: size } }>
//         <div className='absolute inset-0 rotate-180'>
//             <LoaderCircleIcon
//                 className={ cn(
//                     'animate-spin',
//                     className,
//                     'text-foreground opacity-20',
//                 ) }
//                 size={ size }
//                 { ...props }
//             />
//         </div>
//         <LoaderCircleIcon
//             className={ cn( 'relative animate-spin', className ) }
//             size={ size }
//             { ...props }
//         />
//     </div>
// );

// const Ellipsis = ( { size = 24, ...props } ) => {
//     return (
//         <svg
//             xmlns='http://www.w3.org/2000/svg'
//             width={ size }
//             height={ size }
//             viewBox='0 0 24 24'
//             { ...props }>
//             <title>Loading...</title>
//             <circle
//                 cx='4'
//                 cy='12'
//                 r='2'
//                 fill='currentColor'>
//                 <animate
//                     id='ellipsis1'
//                     begin='0;ellipsis3.end+0.25s'
//                     attributeName='cy'
//                     calcMode='spline'
//                     dur='0.6s'
//                     values='12;6;12'
//                     keySplines='.33,.66,.66,1;.33,0,.66,.33'
//                 />
//             </circle>
//             <circle
//                 cx='12'
//                 cy='12'
//                 r='2'
//                 fill='currentColor'>
//                 <animate
//                     begin='ellipsis1.begin+0.1s'
//                     attributeName='cy'
//                     calcMode='spline'
//                     dur='0.6s'
//                     values='12;6;12'
//                     keySplines='.33,.66,.66,1;.33,0,.66,.33'
//                 />
//             </circle>
//             <circle
//                 cx='20'
//                 cy='12'
//                 r='2'
//                 fill='currentColor'>
//                 <animate
//                     id='ellipsis3'
//                     begin='ellipsis1.begin+0.2s'
//                     attributeName='cy'
//                     calcMode='spline'
//                     dur='0.6s'
//                     values='12;6;12'
//                     keySplines='.33,.66,.66,1;.33,0,.66,.33'
//                 />
//             </circle>
//         </svg>
//     );
// };

// const Ring = ( { size = 24, ...props } ) => (
//     <svg
//         xmlns='http://www.w3.org/2000/svg'
//         width={ size }
//         height={ size }
//         viewBox='0 0 44 44'
//         stroke='currentColor'
//         { ...props }>
//         <title>Loading...</title>
//         <g
//             fill='none'
//             fillRule='evenodd'
//             strokeWidth='2'>
//             <circle
//                 cx='22'
//                 cy='22'
//                 r='1'>
//                 <animate
//                     attributeName='r'
//                     begin='0s'
//                     dur='1.8s'
//                     values='1; 20'
//                     calcMode='spline'
//                     keyTimes='0; 1'
//                     keySplines='0.165, 0.84, 0.44, 1'
//                     repeatCount='indefinite'
//                 />
//                 <animate
//                     attributeName='stroke-opacity'
//                     begin='0s'
//                     dur='1.8s'
//                     values='1; 0'
//                     calcMode='spline'
//                     keyTimes='0; 1'
//                     keySplines='0.3, 0.61, 0.355, 1'
//                     repeatCount='indefinite'
//                 />
//             </circle>
//             <circle
//                 cx='22'
//                 cy='22'
//                 r='1'>
//                 <animate
//                     attributeName='r'
//                     begin='-0.9s'
//                     dur='1.8s'
//                     values='1; 20'
//                     calcMode='spline'
//                     keyTimes='0; 1'
//                     keySplines='0.165, 0.84, 0.44, 1'
//                     repeatCount='indefinite'
//                 />
//                 <animate
//                     attributeName='stroke-opacity'
//                     begin='-0.9s'
//                     dur='1.8s'
//                     values='1; 0'
//                     calcMode='spline'
//                     keyTimes='0; 1'
//                     keySplines='0.3, 0.61, 0.355, 1'
//                     repeatCount='indefinite'
//                 />
//             </circle>
//         </g>
//     </svg>
// );

// const Bars = ( { size = 24, ...props } ) => (
//     <svg
//         xmlns='http://www.w3.org/2000/svg'
//         width={ size }
//         height={ size }
//         viewBox='0 0 24 24'
//         { ...props }>
//         <title>Loading...</title>
//         <style>{ `
//       .spinner-bar {
//         animation: spinner-bars-animation .8s linear infinite;
//         animation-delay: -.8s;
//       }
//       .spinner-bars-2 {
//         animation-delay: -.65s;
//       }
//       .spinner-bars-3 {
//         animation-delay: -0.5s;
//       }
//       @keyframes spinner-bars-animation {
//         0% {
//           y: 1px;
//           height: 22px;
//         }
//         93.75% {
//           y: 5px;
//           height: 14px;
//           opacity: 0.2;
//         }
//       }
//     `}</style>
//         <rect
//             className='spinner-bar'
//             x='1'
//             y='1'
//             width='6'
//             height='22'
//             fill='currentColor'
//         />
//         <rect
//             className='spinner-bar spinner-bars-2'
//             x='9'
//             y='1'
//             width='6'
//             height='22'
//             fill='currentColor'
//         />
//         <rect
//             className='spinner-bar spinner-bars-3'
//             x='17'
//             y='1'
//             width='6'
//             height='22'
//             fill='currentColor'
//         />
//     </svg>
// );

// const Infinite = ( { size = 24, ...props } ) => (
//     <svg
//         xmlns='http://www.w3.org/2000/svg'
//         width={ size }
//         height={ size }
//         viewBox='0 0 100 100'
//         preserveAspectRatio='xMidYMid'
//         { ...props }>
//         <title>Loading...</title>
//         <path
//             fill='none'
//             stroke='currentColor'
//             strokeWidth='10'
//             strokeDasharray='205.271142578125 51.317785644531256'
//             d='M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z'
//             strokeLinecap='round'
//             style={ {
//                 transform: 'scale(0.8)',
//                 transformOrigin: '50px 50px',
//             } }>
//             <animate
//                 attributeName='stroke-dashoffset'
//                 repeatCount='indefinite'
//                 dur='2s'
//                 keyTimes='0;1'
//                 values='0;256.58892822265625'
//             />
//         </path>
//     </svg>
// );

// export const SpinnerVariants = ( { variant, ...props } ) => {
//     switch ( variant ) {
//         case 'circle':
//             return <Circle { ...props } />;
//         case 'pinwheel':
//             return <Pinwheel { ...props } />;
//         case 'circle-filled':
//             return <CircleFilled { ...props } />;
//         case 'ellipsis':
//             return <Ellipsis { ...props } />;
//         case 'ring':
//             return <Ring { ...props } />;
//         case 'bars':
//             return <Bars { ...props } />;
//         case 'infinite':
//             return <Infinite { ...props } />;
//         default:
//             return <Default { ...props } />;
//     }
// };

// export const Spinner = (
//     {
//         variant = 'pulse',
//         size = 'md',
//         color = 'currentColor',
//         overlay = false,
//         className,
//     },
//     ...props
// ) => {
//     const spinnerVariants = {
//         pulse: ( size, color ) => (
//             <div
//                 className={ cn( `animate-pulse rounded-full`, size ) }
//                 style={ { backgroundColor: color } }></div>
//         ),
//         wave: ( size, color ) => (
//             <div
//                 className={ cn(
//                     `flex justify-center items-center space-x-1`,
//                     size,
//                 ) }>
//                 { [ 0, 1, 2 ].map( ( i ) => (
//                     <div
//                         key={ i }
//                         className={ cn( `w-2 h-2 animate-wave`, size ) }
//                         style={ {
//                             backgroundColor: color ?? `#000000`,
//                             animationDelay: `${ i * 0.1 }s`,
//                         } }></div>
//                 ) ) }
//             </div>
//         ),
//         dots: ( size, color ) => (
//             <div
//                 className={ cn(
//                     `flex justify-center items-center space-x-1`,
//                     size,
//                 ) }>
//                 { [ 0, 1, 2 ].map( ( i ) => (
//                     <div
//                         key={ i }
//                         className={ cn( `rounded-full animate-bounce`, size ) }
//                         style={ {
//                             backgroundColor: color,
//                             animationDelay: `${ i * 0.1 }s`,
//                             width:
//                                 size === 'sm'
//                                     ? '4px'
//                                     : size === 'md'
//                                         ? '6px'
//                                         : '8px',
//                             height:
//                                 size === 'sm'
//                                     ? '4px'
//                                     : size === 'md'
//                                         ? '6px'
//                                         : '8px',
//                         } }></div>
//                 ) ) }
//             </div>
//         ),
//         circles: ( size, color ) => (
//             <div className={ cn( `relative`, size ) }>
//                 { [ 0, 1, 2 ].map( ( i ) => (
//                     <div
//                         key={ i }
//                         className={ `absolute inset-0 rounded-full animate-ping opacity-75` }
//                         style={ {
//                             backgroundColor: color,
//                             animationDelay: `${ i * 0.5 }s`,
//                         } }></div>
//                 ) ) }
//             </div>
//         ),
//         bars: ( size, color ) => (
//             <div
//                 className={ cn(
//                     `flex justify-center items-center space-x-1`,
//                     size,
//                 ) }>
//                 { [ 0, 1, 2, 3 ].map( ( i ) => (
//                     <div
//                         key={ i }
//                         className={ `w-1 animate-scale-y` }
//                         style={ {
//                             backgroundColor: color,
//                             animationDelay: `${ i * 0.15 }s`,
//                             height:
//                                 size === 'sm'
//                                     ? '10px'
//                                     : size === 'md'
//                                         ? '20px'
//                                         : '30px',
//                         } }></div>
//                 ) ) }
//             </div>
//         ),
//         grid: ( size, color ) => (
//             <div className={ cn( `grid grid-cols-3 gap-1`, size ) }>
//                 { [ ...Array( 9 ) ].map( ( _, i ) => (
//                     <div
//                         key={ i }
//                         className={ `animate-pulse rounded-sm` }
//                         style={ {
//                             backgroundColor: color,
//                             animationDelay: `${ i * 0.1 }s`,
//                         } }></div>
//                 ) ) }
//             </div>
//         ),
//         ripple: ( size, color ) => (
//             <div className={ cn( `relative`, size ) }>
//                 <div
//                     className={ cn(
//                         `absolute inset-0 rounded-full animate-ripple bg-primary-50 border-2 border-white border-dashed duration-1000`,
//                         size,
//                     ) }
//                     style={ {
//                         borderColor: color,
//                         animationDelay: '0.0s',
//                     } }></div>
//                 <div
//                     className={ cn(
//                         `absolute inset-0 rounded-full animate-ripple border-2 border-white border-dashed duration-1000`,
//                         size,
//                     ) }
//                     style={ {
//                         borderColor: color,
//                         animationDelay: '0.25s',
//                     } }></div>
//                 <div
//                     className={ cn(
//                         `absolute inset-0 rounded-full animate-ripple bg-primary-50 border-2 border-white border-dashed duration-1000`,
//                         size,
//                     ) }
//                     style={ {
//                         borderColor: color,
//                         animationDelay: '0.5s',
//                     } }></div>
//                 <div
//                     className={ cn(
//                         `absolute inset-0 rounded-full animate-ripple border-2 border-white border-dashed duration-1000`,
//                         size,
//                     ) }
//                     style={ {
//                         borderColor: color,
//                         animationDelay: '0.75s',
//                     } }></div>
//             </div>
//         ),
//         arc: ( size, color ) => (
//             <div className={ cn( `relative`, size ) }>
//                 <div
//                     className={ `absolute inset-0 rounded-full !border-t-[0.25rem] border-x-transparent border-dashed animate-spin` }
//                     style={ { borderColor: color } }></div>
//                 <div
//                     className={ `absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full` }
//                     style={ { backgroundColor: color } }></div>
//             </div>
//         ),
//         orbit: ( size, color ) => (
//             <div className={ cn( `relative animate-spin`, size ) }>
//                 <div
//                     className={ `absolute inset-0 rounded-full !border-[0.25rem] border-spacing-10 border-x-transparent border-double` }
//                     style={ { borderColor: color } }>
//                     <div
//                         className={ `absolute inset-0 rounded-full !border-[0.5rem] border-spacing-10 border-x-transparent border-dashed` }
//                         style={ { borderColor: color } }></div>
//                 </div>
//                 <div
//                     className={ `absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full` }
//                     style={ { backgroundColor: color } }></div>
//             </div>
//         ),
//     };

//     const spinnerContent = useMemo( () => {
//         if ( spinnerVariants?.hasOwnProperty( variant ) ) {
//             return spinnerVariants[ variant ]( sizeClasses[ size ], color );
//         } else {
//             return (
//                 <SpinnerVariants
//                     variant={ variant }
//                     size={
//                         size === 'sm'
//                             ? 4
//                             : size === 'md'
//                                 ? 6
//                                 : size === 'lg'
//                                     ? 10
//                                     : size === 'xl'
//                                         ? 16
//                                         : 8
//                     }
//                     color={ color }
//                     { ...props }
//                 />
//             );
//         }
//     } );

//     if ( overlay ) {
//         return <SpinnerOverlay>{ spinnerContent }</SpinnerOverlay>;
//     }

//     return (
//         <div className={ cn( 'flex items-center justify-center', className ) }>
//             { spinnerContent }
//         </div>
//     );
// };

// export const SpinnerOverlay = ( { children } ) => {
//     return (
//         <div
//             className={ twMerge(
//                 `absolute inset-0 flex items-center justify-center z-5000 transition-all duration-200 ease-in-out`,
//                 `bg-sextary-600/10 !bg-opacity-10 bg-gradient-to-br from-primary-purple-800/10 via-bodyprimary/0 to-secondaryAlt-300/10`,
//             ) }>
//             { children }
//         </div>
//     );
// };
