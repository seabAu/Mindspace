'use client';

import { Button } from '@/components/ui/button';
import useAuth from '@/lib/hooks/useAuth';

const SignOutButton = ( {
    variant = 'outline',
    size = 'default',
    className = '',
    children,
    onSignOut,
} ) => {
    const { logout, userLoggedIn } = useAuth();

    const handleSignOut = () => {
        logout();
        if ( onSignOut ) {
            onSignOut();
        }
    };

    if ( !userLoggedIn ) {
        return null;
    }

    return (
        <Button
            variant={ variant }
            size={ size }
            className={ className }
            onClick={ () => handleSignOut() }>
            { children || 'Sign Out' }
        </Button>
    );
};

export default SignOutButton;
