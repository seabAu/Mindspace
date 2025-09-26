import React from 'react';
import { Button } from '../ui/button';
import { ArrowBigLeft, Sun, Moon, IceCream, ServerCog, LogIn, UserCircle2Icon } from 'lucide-react';
import { ThemeToggle } from '../Theme/ThemeToggle';
import * as utils from 'akashatools';

import { useNavigate } from 'react-router-dom';
import useAuth from '@/lib/hooks/useAuth';
import { buildNav } from '@/lib/utilities/nav';
import useGlobalStore from '@/store/global.store';

const Header = ( props ) => {
    const {
        children
    } = props;

    const {
        debug,
        setDebug,
        requestFetchData,
        setRequestFetchData,
        requestFetchUser,
        setRequestFetchUser,
        data,
        setData,
        user,
        setUser,
        userLoggedIn,
        setUserLoggedIn,
        userToken,
        setUserToken,
        settingsDialogOpen,
        setSettingsDialogOpen,
        theme,
        setTheme,
        openSidebar,
        setOpenSidebar,
        dashboardActive,
        setDashboardActive,
    } = useGlobalStore();

    const {
        // Variables
        // userLoggedIn,
        // setUserLoggedIn,
        authData,
        setAuthData,
        userToken: authUserToken,
        setUserToken: setAuthUserToken,
        user: authUserData,
        setUser: setAuthUserData,
        error: authError,
        setError: setAuthError,
        loading: authLoading,
        setLoading: setAuthLoading,
        debug: authDebug,
        setDebug: setAuthDebug,

        // Fetch functions
        login,
        signup,
        authUser,

        // Getter / Setter functions
        SetToken,
        GetToken,
        DeleteToken,
    } = useAuth();

    const navigate = useNavigate();

    const headerBtns = [ {
        index: 0,
        enabled: true,
        name: 'login',
        label: 'Login',
        icon: ( <LogIn className={ `text-xl` } /> ),
        type: 'button',
        onClick: async () => {
            // let authed = await authUser( [ 'guest', 'user', 'admin' ] );
            console.log( "Header.jsx :: login event" );
            navigate( '/login' );
            // if ( userLoggedIn && userToken !== '' || authed ) {
            //     // Either already signed in, OR freshly authenticated.
            //     // TODO :: Improve this later. 
            //     navigate( '/dash' );
            // }
            // else {
            //     navigate( '/login' );
            // }
        },
    },
    {
        index: 1,
        enabled: true,
        name: 'signup',
        label: 'Sign Up',
        icon: ( <UserCircle2Icon className={ `text-xl` } /> ),
        type: 'button',
        onClick: async () => {
            // let authed = await authUser( [ 'guest', 'user', 'admin' ] );
            console.log( "Header.jsx :: signup event" );
            navigate( '/signup' );
            // if ( userLoggedIn && userToken !== '' || authed ) {
            //     // Either already signed in, OR freshly authenticated.
            //     // TODO :: Improve this later. 
            //     navigate( '/dash' );
            // }
            // else {
            //     navigate( '/signup' );
            // }
        },
    }
    ];

    return (
        <div className={ `header` }>
            { children }
            <div className={ `header-left` }>
                {/* Left header - logo */ }
                <div className={ `flex flex-row items-center p-0` }>
                    <button
                        className={ `w-fit h-fit p-0` }
                        onClick={ () => { setOpenSidebar( !openSidebar ); } }
                    >
                        <ArrowBigLeft className={ `w-fit h-fit p-0` } />
                    </button>
                </div>
            </div>
            <div className={ `header-main` }>
                {/* Middle header */ }
            </div>
            <div className={ `header-right justify-end` }>
                {/* Right header - avatar, user dropdown, notification bell, etc. */ }
                <div className={ `flex flex-row flex-nowrap justify-center items-center h-full` }>
                    <ThemeToggle />

                    { utils.val.isValidArray( headerBtns, true ) && (
                        <div className={ `p-0 m-0 h-full relative top-0 right-0 w-auto` }>
                            <div className={ `sidebar-nav-header-controls h-full w-full` }>
                                { buildNav( headerBtns ) }
                            </div>
                        </div>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default Header;
