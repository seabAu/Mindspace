/* https://vite.dev/config/server-options.html */
// https://vitejs.dev/config/
import path from "path";
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from "vite-plugin-svgr";
// import reactRefresh from "eslint-plugin-react-refresh";
import reactRefresh from '@vitejs/plugin-react-refresh';


import dotenv from 'dotenv';
dotenv.config(); // load env vars from .env

const VITE_NODE_ENV = 'production';

// Load env file based on `mode` in the current working directory.
// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
const env = loadEnv( mode, process.cwd(), '' );

// https://vitejs.dev/config/
const config = defineConfig( {
    plugins: [
        react( {
            // Add this line
            include: "**/*.jsx",
        } ),
        reactRefresh( {
            // Exclude storybook stories and node_modules
            exclude: [ /\.stories\.(t|j)sx?$/, /node_modules/ ],
            // Only .jsx files
            include: '**/*.jsx'
        } ),
        svgr( {
            // svgr options: https://react-svgr.com/docs/options/
            svgrOptions: { exportType: "default", ref: true, svgo: false, titleProp: true },
            include: "./**/*.svg",
        } ),
    ],
    // mode: 'development',
    mode: 'production',

    // For gh-pages
    // base: '/dist/',
    // base: '/Mindspace/',
    // root: '',
    define: {
        // Make environment variables available in the client-side code
        'process.env': process.env,
        _global: ( {} ),
        'process.env.VITE_NODE_ENV': JSON.stringify( env.VITE_NODE_ENV ),
        'process.env.VITE_PUBLIC_URL': JSON.stringify( env.VITE_PUBLIC_URL ),
        'process.env.VITE_API_URL': JSON.stringify( env.VITE_API_URL ),
        'process.env.VITE_GOOGLE_API_KEY': JSON.stringify( env.VITE_GOOGLE_API_KEY ),
        'process.env.VITE_PUBLIC_SOCKET_SERVER_URL': JSON.stringify( env.VITE_PUBLIC_SOCKET_SERVER_URL ),
        'process.env.VITE_PUBLIC_SOCKET_SERVER_PORT': JSON.stringify( env.VITE_PUBLIC_SOCKET_SERVER_PORT ),
    },
    resolve: {
        alias: {
            "@": path.resolve( __dirname, "./src" ),
            // "@n": path.resolve( __dirname, "./node-modules" ),
        },
    },

    // rest of configuration
    // https://github.com/vitejs/vite/discussions/3448#discussioncomment-749919
    esbuild: {
        loader: 'jsx',
        // loader: "tsx",
        include: /src\/.*\.jsx?$/,
        // include: /\.[jt]sx?$/,
        // include: /src\/.*\.[tj]sx?$/,
        exclude: []
    },
    optimizeDeps: {
        force: true,
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        }
    },
    // Build options
    build: {
        outDir: './build',
        emptyOutDir: true, // also necessary
        sourcemap: false,
    },
    preview: {
        port: 3200,
    },
    server: {
        hmr: true,
        watch: {
            usePolling: true,
        },
        host: true, // needed for the Docker Container port mapping to work
        port: 3200,
        open: true, // automatically open the app in the browser
        origin: 'http://127.0.0.1:3200',
        proxy: {
            "/api": {
                target: env.VITE_NODE_ENV === 'production'
                    ? ( "http://mindspace.seangb.com" )
                    : ( "http://localhost:4200" ),
                changeOrigin: true,
                rewrite: ( path ) => path.replace( /^\/api/, '' ),
                secure: false,
            }
        }
    }
} );

export default config;



/*
Multiple Server-Proxy Example: 
export default defineConfig({
  server: {
    proxy: {
      // string shorthand: http://localhost:5173/foo -> http://localhost:4567/foo
      '/foo': 'http://localhost:4567',
      // with options: http://localhost:5173/api/bar-> http://jsonplaceholder.typicode.com/bar
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // with RegEx: http://localhost:5173/fallback/ -> http://jsonplaceholder.typicode.com/
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      // Using the proxy instance
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          // proxy will be an instance of 'http-proxy'
        },
      },
      // Proxying websockets or socket.io: ws://localhost:5173/socket.io -> ws://localhost:5174/socket.io
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
      },
    },
  },
})
*/
