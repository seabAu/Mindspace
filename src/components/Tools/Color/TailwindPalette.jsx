// https://v0.dev/chat/color-palette-starter-pIpsX6U9Mmy // 

import { useState } from "react";
import { Lock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy } from "lucide-react";

export default function ColorPalette () {
    const [ open, setOpen ] = useState( false );
    const [ copied, setCopied ] = useState( null );

    // Color palette data
    const colorPalettes = {
        foggyGray: {
            "50": "#F4F5F0",
            "100": "#E7E9DE",
            "200": "#CDD0B9",
            "300": "#B6BB9B",
            "400": "#9AA17A",
            "500": "#7E855D",
            "600": "#626947",
            "700": "#4C5239",
            "800": "#3F4331",
            "900": "#373B2D",
            "950": "#1C1E15",
        },
        tanHide: {
            "50": "#FFF7ED",
            "100": "#FFECD5",
            "200": "#FED6AA",
            "300": "#FDB874",
            "400": "#FB9342",
            "500": "#F97016",
            "600": "#EA550C",
            "700": "#C23F0C",
            "800": "#9A3212",
            "900": "#7C2C12",
            "950": "#431307",
        },
        keppel: {
            "50": "#F2FBF9",
            "100": "#D3F4EC",
            "200": "#A6E9D9",
            "300": "#72D6C2",
            "400": "#41B4A1",
            "500": "#2CA08F",
            "600": "#218074",
            "700": "#1E675E",
            "800": "#1C534D",
            "900": "#1C4541",
            "950": "#0A2927",
        },
    };

    // Generate JSON format
    const jsonFormat = JSON.stringify( colorPalettes, null, 2 );

    // Generate Tailwind config format
    const tailwindFormat = `/** @type {import('tailwindcss').Config} */
    module.exports = {
    theme: {
        extend: {
        colors: {
            // Foggy Gray
            foggy: ${ JSON.stringify( colorPalettes.foggyGray, null, 8 ) },
            
            // Tan Hide
            tan: ${ JSON.stringify( colorPalettes.tanHide, null, 8 ) },
            
            // Keppel
            keppel: ${ JSON.stringify( colorPalettes.keppel, null, 8 ) },
        },
        },
    },
    }`;

    // Generate CSS Variables format
    const cssVariablesFormat = `:root {
  /* Foggy Gray */
${ Object.entries( colorPalettes.foggyGray )
            .map( ( [ key, value ] ) => `  --foggy-${ key }: ${ value };` )
            .join( "\n" ) }

  /* Tan Hide */
${ Object.entries( colorPalettes.tanHide )
            .map( ( [ key, value ] ) => `  --tan-${ key }: ${ value };` )
            .join( "\n" ) }

  /* Keppel */
${ Object.entries( colorPalettes.keppel )
            .map( ( [ key, value ] ) => `  --keppel-${ key }: ${ value };` )
            .join( "\n" ) }
}`;

    const copyToClipboard = async ( text, format ) => {
        await navigator.clipboard.writeText( text );
        setCopied( format );
        setTimeout( () => setCopied( null ), 2000 );
    };

    const downloadFile = ( content, filename, contentType ) => {
        const blob = new Blob( [ content ], { type: contentType } );
        const url = URL.createObjectURL( blob );
        const a = document.createElement( "a" );
        a.href = url;
        a.download = filename;
        document.body.appendChild( a );
        a.click();
        document.body.removeChild( a );
        URL.revokeObjectURL( url );
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 space-y-12">
            {/* Global Export Button */ }
            <div className="flex justify-end">
                <Dialog open={ open } onOpenChange={ setOpen }>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export All Palettes
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Export Color Palettes</DialogTitle>
                        </DialogHeader>

                        <Tabs defaultValue="tailwind" className="mt-4">
                            <TabsList className="grid grid-cols-3 mb-4">
                                <TabsTrigger value="tailwind">Tailwind Config</TabsTrigger>
                                <TabsTrigger value="json">JSON</TabsTrigger>
                                <TabsTrigger value="css">CSS Variables</TabsTrigger>
                            </TabsList>

                            <TabsContent value="tailwind" className="space-y-4">
                                <div className="flex justify-between">
                                    <h2 className="text-lg font-semibold">Tailwind Configuration</h2>
                                    <div className="space-x-2">
                                        <Button variant="outline" size="sm" onClick={ () => copyToClipboard( tailwindFormat, "tailwind" ) }>
                                            { copied === "tailwind" ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" /> }
                                            { copied === "tailwind" ? "Copied!" : "Copy" }
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={ () => downloadFile( tailwindFormat, "tailwind-colors.js", "text/javascript" ) }
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-60 text-black dark:text-white">
                                    <pre className="text-sm">{ tailwindFormat }</pre>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-900 text-black dark:text-white">
                                    <h3 className="font-semibold mb-2">How to use in your Next.js app:</h3>
                                    <ol className="list-decimal list-inside space-y-2 text-sm">
                                        <li>
                                            Copy the above configuration into your{ " " }
                                            <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">tailwind.config.js</code> file
                                        </li>
                                        <li>Merge it with your existing theme.extend.colors configuration</li>
                                        <li>
                                            Use the colors in your components like:{ " " }
                                            <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">
                                                className="bg-foggy-500 text-tan-50"
                                            </code>
                                        </li>
                                    </ol>
                                </div>
                            </TabsContent>

                            <TabsContent value="json" className="space-y-4">
                                <div className="flex justify-between">
                                    <h2 className="text-lg font-semibold">JSON Format</h2>
                                    <div className="space-x-2">
                                        <Button variant="outline" size="sm" onClick={ () => copyToClipboard( jsonFormat, "json" ) }>
                                            { copied === "json" ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" /> }
                                            { copied === "json" ? "Copied!" : "Copy" }
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={ () => downloadFile( jsonFormat, "color-palettes.json", "application/json" ) }
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-60 text-black dark:text-white">
                                    <pre className="text-sm">{ jsonFormat }</pre>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-900 text-black dark:text-white">
                                    <h3 className="font-semibold mb-2">How to use in your Next.js app:</h3>
                                    <ol className="list-decimal list-inside space-y-2 text-sm">
                                        <li>
                                            Save this JSON to a file in your project, e.g.,{ " " }
                                            <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">colors.json</code>
                                        </li>
                                        <li>
                                            Import it in your tailwind.config.js:{ " " }
                                            <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">
                                                const colors = require('./colors.json')
                                            </code>
                                        </li>
                                        <li>
                                            Use it in your theme:{ " " }
                                            <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">
                                                colors: { "{" } foggy: colors.foggyGray, ... { "}" }
                                            </code>
                                        </li>
                                    </ol>
                                </div>
                            </TabsContent>

                            <TabsContent value="css" className="space-y-4">
                                <div className="flex justify-between">
                                    <h2 className="text-lg font-semibold">CSS Variables</h2>
                                    <div className="space-x-2">
                                        <Button variant="outline" size="sm" onClick={ () => copyToClipboard( cssVariablesFormat, "css" ) }>
                                            { copied === "css" ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" /> }
                                            { copied === "css" ? "Copied!" : "Copy" }
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={ () => downloadFile( cssVariablesFormat, "color-variables.css", "text/css" ) }
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-60 text-black dark:text-white">
                                    <pre className="text-sm">{ cssVariablesFormat }</pre>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-900 text-black dark:text-white">
                                    <h3 className="font-semibold mb-2">How to use in your Next.js app:</h3>
                                    <ol className="list-decimal list-inside space-y-2 text-sm">
                                        <li>
                                            Add these CSS variables to your global CSS file (e.g.,{ " " }
                                            <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">app/globals.css</code>)
                                        </li>
                                        <li>Configure Tailwind to use these variables in your tailwind.config.js:</li>
                                        <li className="ml-6">
                                            <pre className="bg-gray-200 dark:bg-gray-800 p-2 rounded text-xs">
                                                { `theme: {
  extend: {
    colors: {
      foggy: {
        50: 'var(--foggy-50)',
        // ... other shades
      },
      // ... other color palettes
    }
  }
}`}
                                            </pre>
                                        </li>
                                    </ol>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Foggy Gray Palette */ }
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-medium">Foggy Gray</h2>
                    <div className="flex gap-4">
                        <button className="hover:text-gray-300">Contrast grid</button>
                        <button className="hover:text-gray-300">Export</button>
                        <button className="hover:text-gray-300">Edit</button>
                        <button className="hover:text-gray-300">Save</button>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-2">
                    <ColorSwatch shade="50" hex="F4F5F0" bg="bg-[#F4F5F0]" />
                    <ColorSwatch shade="100" hex="E7E9DE" bg="bg-[#E7E9DE]" />
                    <ColorSwatch shade="200" hex="CDD0B9" bg="bg-[#CDD0B9]" locked />
                    <ColorSwatch shade="300" hex="B6BB9B" bg="bg-[#B6BB9B]" />
                    <ColorSwatch shade="400" hex="9AA17A" bg="bg-[#9AA17A]" />
                    <ColorSwatch shade="500" hex="7E855D" bg="bg-[#7E855D]" />
                    <ColorSwatch shade="600" hex="626947" bg="bg-[#626947]" />
                    <ColorSwatch shade="700" hex="4C5239" bg="bg-[#4C5239]" />
                    <ColorSwatch shade="800" hex="3F4331" bg="bg-[#3F4331]" />
                    <ColorSwatch shade="900" hex="373B2D" bg="bg-[#373B2D]" />
                    <ColorSwatch shade="950" hex="1C1E15" bg="bg-[#1C1E15]" />
                </div>
            </div>

            {/* Tan Hide Palette */ }
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-medium">Tan Hide</h2>
                    <div className="flex gap-4">
                        <button className="hover:text-gray-300">Contrast grid</button>
                        <button className="hover:text-gray-300">Export</button>
                        <button className="hover:text-gray-300">Edit</button>
                        <button className="hover:text-gray-300">Save</button>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-2">
                    <ColorSwatch shade="50" hex="FFF7ED" bg="bg-[#FFF7ED]" />
                    <ColorSwatch shade="100" hex="FFECD5" bg="bg-[#FFECD5]" />
                    <ColorSwatch shade="200" hex="FED6AA" bg="bg-[#FED6AA]" />
                    <ColorSwatch shade="300" hex="FDB874" bg="bg-[#FDB874]" />
                    <ColorSwatch shade="400" hex="FB9342" bg="bg-[#FB9342]" locked />
                    <ColorSwatch shade="500" hex="F97016" bg="bg-[#F97016]" />
                    <ColorSwatch shade="600" hex="EA550C" bg="bg-[#EA550C]" />
                    <ColorSwatch shade="700" hex="C23F0C" bg="bg-[#C23F0C]" />
                    <ColorSwatch shade="800" hex="9A3212" bg="bg-[#9A3212]" />
                    <ColorSwatch shade="900" hex="7C2C12" bg="bg-[#7C2C12]" />
                    <ColorSwatch shade="950" hex="431307" bg="bg-[#431307]" />
                </div>
            </div>

            {/* Keppel Palette */ }
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-medium">Keppel</h2>
                    <div className="flex gap-4">
                        <button className="hover:text-gray-300">Contrast grid</button>
                        <button className="hover:text-gray-300">Export</button>
                        <button className="hover:text-gray-300">Edit</button>
                        <button className="hover:text-gray-300">Save</button>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-2">
                    <ColorSwatch shade="50" hex="F2FBF9" bg="bg-[#F2FBF9]" />
                    <ColorSwatch shade="100" hex="D3F4EC" bg="bg-[#D3F4EC]" />
                    <ColorSwatch shade="200" hex="A6E9D9" bg="bg-[#A6E9D9]" />
                    <ColorSwatch shade="300" hex="72D6C2" bg="bg-[#72D6C2]" />
                    <ColorSwatch shade="400" hex="41B4A1" bg="bg-[#41B4A1]" locked />
                    <ColorSwatch shade="500" hex="2CA08F" bg="bg-[#2CA08F]" />
                    <ColorSwatch shade="600" hex="218074" bg="bg-[#218074]" />
                    <ColorSwatch shade="700" hex="1E675E" bg="bg-[#1E675E]" />
                    <ColorSwatch shade="800" hex="1C534D" bg="bg-[#1C534D]" />
                    <ColorSwatch shade="900" hex="1C4541" bg="bg-[#1C4541]" />
                    <ColorSwatch shade="950" hex="0A2927" bg="bg-[#0A2927]" />
                </div>
            </div>
        </div>
    );
}

/* interface ColorSwatchProps {
    shade;
    hex;
    bg;
    locked?: boolean;
} */

function ColorSwatch ( { shade, hex, bg, locked = false } ) {
    return (
        <div className={ `${ bg } rounded-lg p-4 flex flex-col justify-between h-32 text-black relative` }>
            { locked && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-black/70" />
                </div>
            ) }
            <div className="font-bold text-2xl">{ shade }</div>
            <div className="text-sm">{ hex }</div>
        </div>
    );
}

