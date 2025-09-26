import React, { useCallback, useEffect, useState } from 'react';
import * as utils from 'akashatools';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Calendar, Shield, EditIcon } from 'lucide-react';
import { Spinner } from '@/components/Loader/Spinner';
import { useNavigate, useParams } from 'react-router-dom';
import useGlobalStore from '@/store/global.store';
import { Button } from '@/components/ui/button';
import { fetchUserById } from '@/lib/services/authService';
import useAuth from '@/lib/hooks/useAuth';
import { isObjectId } from '@/lib/utilities/data';

// Here any other user can view a user's front-facing profile and, if enabled, send a message or add them to a team. 
const UserProfilePage = ( props ) => {
    const {
        title = 'Profile',
        subtitle = 'Loading, please wait...',
        children,
    } = props;

    const { handleGetUserProfileData, handleFetchUserById, handleUpdateUser } = useAuth();
    const { id } = useParams();

    const [ userProfileData, setUserProfileData ] = useState( null );

    // Get id of profile to figure out which user to display. 
    // Dynamically fetch the full user

    const navigate = useNavigate();

    const user = useGlobalStore( ( state ) => state.user ); // The viewing user
    const userData = useGlobalStore( ( state ) => state.userData ); // ALl user data
    const userProfile = userData?.find( ( u ) => ( u?.id === id ) );

    // if ( !userProfileData ) {
    //     setUserProfileData( handleGetUserProfileData() );
    // }

    useEffect( () => {
        console.log( "UserProfilePage :: id = ", id, userProfileData );
        let data;
        if ( isObjectId( id ) ) {
            data = handleFetchUserById( id );
        }
        else {
            data = user;
        }
        setUserProfileData( data );
    }, [ id ] );

    const formatDate = ( dateString ) => {
        return new Date( dateString ).toLocaleDateString( 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        } );
    };

    const getRoleColor = ( role ) => {
        const colors = {
            guest: "bg-gray-100 text-gray-800",
            user: "bg-blue-100 text-blue-800",
            editor: "bg-green-100 text-green-800",
            writer: "bg-purple-100 text-purple-800",
            creator: "bg-orange-100 text-orange-800",
            admin: "bg-red-100 text-red-800",
            superadmin: "bg-red-200 text-red-900"
        };
        return colors[ role ] || colors.guest;
    };

    const handleEditProfile = () => {
        navigate( `/dash/user/profile` );
    };

    // TODO :: Change this to dynamically fetch the full user data on load and not show anything until that fetch has completed.

    return (
        <div className={ `h-full w-full flex flex-grow flex-1 flex-col justify-stretch items-center` }>
            { title !== '' && ( <div className={ `font-bold text-lg` }>{ title }</div> ) }
            { subtitle !== '' && ( <div className={ `font-normal text-base` }>{ subtitle }</div> ) }
            { userProfileData
                ?
                // <UserProfile user={ user } userProfile={ userProfileData } />
                ( <div className="max-w-2xl mx-auto p-6 space-y-6">
                    { userProfileData && ( <Card>
                        <CardHeader className="text-center">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                                { userProfileData?.display_name?.charAt( 0 )?.toUpperCase() }
                            </div>
                            <CardTitle className="text-2xl">{ userProfileData?.display_name }</CardTitle>
                            <p className="text-muted-foreground">@{ userProfileData?.username }</p>
                            <Badge className={ getRoleColor( userProfileData?.role ) }>
                                <Shield className="w-3 h-3 mr-1" />
                                { userProfileData?.role?.charAt( 0 )?.toUpperCase() + userProfileData?.role?.slice( 1 ) }
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Separator />

                            <div className="grid gap-4">
                                { userProfileData?.name && (
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Full Name</p>
                                            <p className="text-sm text-muted-foreground">{ userProfileData?.name }</p>
                                        </div>
                                    </div>
                                ) }

                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-sm text-muted-foreground">{ userProfileData?.email }</p>
                                    </div>
                                </div>

                                { userProfileData?.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Phone</p>
                                            <p className="text-sm text-muted-foreground">{ userProfileData?.phone }</p>
                                        </div>
                                    </div>
                                ) }

                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Member Since</p>
                                        <p className="text-sm text-muted-foreground">{ formatDate( userProfileData?.register_date ) }</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Last Active</p>
                                        <p className="text-sm text-muted-foreground">{ formatDate( userProfileData?.last_login ) }</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            { user?.id === id && (
                                <Button type="button" variant="outline" onClick={ handleEditProfile }>
                                    <EditIcon className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                            ) }
                        </CardFooter>
                    </Card> ) }
                </div> )
                : ( <Spinner
                    variant={ 'orbit' }
                    size={ 'xl' }
                    color={ 'currentColor' }
                    overlay={ true }
                    className={ `` }
                /> ) }
        </div>
    );
};


function UserProfile ( { user = {}, userProfile = null } ) {
    const userProfileData = { ...( userProfile !== null ? userProfile : {} ) };
    const { id } = useParams();

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            { userProfile && ( <Card>
                <CardHeader className="text-center">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                        { userProfileData?.display_name?.charAt( 0 )?.toUpperCase() }
                    </div>
                    <CardTitle className="text-2xl">{ userProfileData?.display_name }</CardTitle>
                    <p className="text-muted-foreground">@{ userProfileData?.username }</p>
                    <Badge className={ getRoleColor( userProfileData?.role ) }>
                        <Shield className="w-3 h-3 mr-1" />
                        { userProfileData?.role?.charAt( 0 )?.toUpperCase() + userProfileData?.role?.slice( 1 ) }
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Separator />

                    <div className="grid gap-4">
                        { userProfileData?.name && (
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Full Name</p>
                                    <p className="text-sm text-muted-foreground">{ userProfileData?.name }</p>
                                </div>
                            </div>
                        ) }

                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">{ userProfileData?.email }</p>
                            </div>
                        </div>

                        { userProfileData?.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Phone</p>
                                    <p className="text-sm text-muted-foreground">{ userProfileData?.phone }</p>
                                </div>
                            </div>
                        ) }

                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Member Since</p>
                                <p className="text-sm text-muted-foreground">{ formatDate( userProfileData?.register_date ) }</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Last Active</p>
                                <p className="text-sm text-muted-foreground">{ formatDate( userProfileData?.last_login ) }</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    { user?.id === id && (
                        <Button type="button" variant="outline" onClick={ handleEditProfile }>
                            <EditIcon className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    ) }
                </CardFooter>
            </Card> ) }
        </div>
    );
}


export default UserProfilePage;