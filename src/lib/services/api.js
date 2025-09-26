import axios from "axios";
import { AUTH_TOKEN_STORAGE_NAME } from "../config/constants";

// Axios docs: https://github.com/axios/axios#request-config //
// https://stackoverflow.com/questions/47407564/change-the-default-base-url-for-axios //

export const setAuthToken = ( token ) => {
    if ( token ) {
        axios.defaults.headers.common[ 'x-auth-token' ] = token;
        localStorage.setItem( AUTH_TOKEN_STORAGE_NAME, token );
    } else {
        delete axios.defaults.headers.common[ 'x-auth-token' ];
        localStorage.removeItem( AUTH_TOKEN_STORAGE_NAME );
    }
};

export const getAuthToken = () => {
    return localStorage.getItem( AUTH_TOKEN_STORAGE_NAME );
};

export const getURL = () => {
    return `${ import.meta.env.VITE_NODE_ENV === "development"
        ?
        // Development API path.
        `http://${ import.meta.env.VITE_API_URL }`
        :
        import.meta.env.VITE_NODE_ENV === "production"
            ?
            // Production API path.
            `https://${ import.meta.env.VITE_API_URL }`
            :
            // Default (no env set) API path.
            import.meta.env.VITE_API_URL
        }`;
};

export default axios.create( {
    baseURL: getURL(),
    /*
        `https:${ import.meta.env.VITE_NODE_ENV === "development"
        ? // Development API path.
        `//${ import.meta.env.VITE_API_URL }`
        : import.meta.env.VITE_NODE_ENV === "production"
            ? // Production API path.
            `//${ import.meta.env.VITE_API_URL }`
            : // Default (no env set) API path.
            import.meta.env.VITE_API_URL
        }`,
    */
    headers: {
        "x-auth-token": localStorage.getItem( AUTH_TOKEN_STORAGE_NAME ),
        "Content-type": "application/json",
        "Access-Control-Allow-Origin": "*"
    },
} );
