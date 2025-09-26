// https://v0.dev/chat/color-palette-starter-pIpsX6U9Mmy // 

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Download } from "lucide-react";

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

export default function ColorPaletteExporter () {
    const [ copied, setCopied ] = useState( null );

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
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8 bg-white dark:bg-gray-950 rounded-lg shadow-lg">
            <div>
                <h1 className="text-3xl font-bold mb-2">Color Palette Exporter</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Export your color palettes in different formats for use in your Next.js application with Tailwind CSS.
                </p>
            </div>

            <Tabs defaultValue="tailwind">
                <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="tailwind">Tailwind Config</TabsTrigger>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                    <TabsTrigger value="css">CSS Variables</TabsTrigger>
                </TabsList>

                <TabsContent value="tailwind" className="space-y-4">
                    <div className="flex justify-between">
                        <h2 className="text-xl font-semibold">Tailwind Configuration</h2>
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
                    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-96">
                        <pre className="text-sm">{ tailwindFormat }</pre>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-900">
                        <h3 className="font-semibold mb-2">How to use in your Next.js app:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>
                                Copy the above configuration into your{ " " }
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">tailwind.config.js</code> file
                            </li>
                            <li>Merge it with your existing theme.extend.colors configuration</li>
                            <li>
                                Use the colors in your components like:{ " " }
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">className="bg-foggy-500 text-tan-50"</code>
                            </li>
                        </ol>
                    </div>
                </TabsContent>

                <TabsContent value="json" className="space-y-4">
                    <div className="flex justify-between">
                        <h2 className="text-xl font-semibold">JSON Format</h2>
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
                    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-96">
                        <pre className="text-sm">{ jsonFormat }</pre>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-900">
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
                        <h2 className="text-xl font-semibold">CSS Variables</h2>
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
                    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-96">
                        <pre className="text-sm">{ cssVariablesFormat }</pre>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-900">
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
        </div>
    );
}

