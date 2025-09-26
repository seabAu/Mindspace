import * as utils from 'akashatools';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Eye, Users, UserPlus, Loader2, RefreshCw, EyeOff } from "lucide-react";
// import { updateUser, getCurrentUser } from "@/lib/api";
// import { useRouter } from "next/navigation";
import { useNavigate } from 'react-router-dom';
import useAuth from '@/lib/hooks/useAuth';
import useGlobalStore from '@/store/global.store';
import { USER_ROLE_DEFS } from '../../lib/config/config';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { twMerge } from 'tailwind-merge';
import { CONTENT_BREADCRUMBS_HEIGHT, CONTENT_HEADER_HEIGHT } from '../../lib/config/constants';
import { calculatePasswordStrength, formatPhoneNumber } from '../../lib/utilities/validation';
import { toast } from "sonner";

// On this page, the current user can edit all their user data, separate from settings, such as contact and profile details. 
const UserSettingsPage = ( props ) => {
    const {
        title = 'UserSettingsPage',
        children,
    } = props;
    return (
        <div className={ `` }>
            <UserSettings />
        </div>
    );
};

function UserSettings ( props ) {
    const [ formData, setFormData ] = useState( null );
    const [ originalData, setOriginalData ] = useState( null );
    const [ errors, setErrors ] = useState( {} );
    const [ loading, setLoading ] = useState( true );
    const [ saving, setSaving ] = useState( false );
    const [ hasChanges, setHasChanges ] = useState( false );
    const [ showPasswords, setShowPasswords ] = useState( false );
    const passwordStrength = calculatePasswordStrength( formData?.password );
    const passwordsMatch = formData?.password && formData?.confirmPassword && formData?.password === formData?.confirmPassword;
    const showPasswordMismatch = formData?.confirmPassword && !passwordsMatch;

    const handleGeneratePassword = () => {
        const newPassword = generatePassword();
        setCredentials( {
            ...credentials,
            password: newPassword,
            confirmPassword: newPassword,
        } );
    };

    const togglePasswordVisibility = () => {
        setShowPasswords( !showPasswords );
    };

    // const router = useRouter();
    const navigate = useNavigate();

    const user = useGlobalStore( ( state ) => state.user ); // The viewing user
    const { handleUpdateUser } = useAuth();

    const roleOptions = [ "guest", "editor", "creator", "writer", "user", "admin", "superadmin" ];

    useEffect( () => {
        const loadCurrentUser = async () => {
            try {
                // const user = await getCurrentUser();
                setFormData( user );
                setOriginalData( user );
            } catch ( error ) {
                console.error( "Failed to load user data:", error );
            } finally {
                setLoading( false );
            }
        };

        loadCurrentUser();
    }, [] );

    useEffect( () => {
        if ( formData && originalData ) {
            const changed = JSON.stringify( formData ) !== JSON.stringify( originalData );
            setHasChanges( changed );
        }
    }, [ formData, originalData ] );

    const validatePhone2 = ( phone ) => {
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        return !phone || phoneRegex.test( phone );
    };

    const validatePhone = ( phone ) => {
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
        return typeof phone === "string" && phoneRegex.test( phone.replace( /[\s\-$$$$]/g, "" ) );
    };

    const validateEmail = ( email ) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test( email );
    };

    const handleInputChange = ( field, value ) => {
        setFormData( ( prev ) => ( {
            ...prev,
            [ field ]: value,
        } ) );

        // Clear error when user starts typing
        if ( errors[ field ] ) {
            setErrors( ( prev ) => ( {
                ...prev,
                [ field ]: null,
            } ) );
        }

        // Emit live update event for profile preview
        window.dispatchEvent(
            new CustomEvent( "userUpdated", {
                detail: {
                    userId: formData.id,
                    userData: { ...formData, [ field ]: value },
                },
            } ),
        );
    };

    const handleSettingChange = ( setting, value ) => {
        const newSettings = {
            ...formData.settings,
            [ setting ]: value,
        };

        const updatedData = {
            ...formData,
            settings: newSettings,
        };

        setFormData( updatedData );

        // Emit live update event for profile preview
        window.dispatchEvent(
            new CustomEvent( "userUpdated", {
                detail: {
                    userId: formData.id,
                    userData: updatedData,
                },
            } ),
        );
    };

    const handleSubmit = async ( e ) => {
        e.preventDefault();

        const newErrors = {};

        // Validate required fields
        if ( !formData.username.trim() ) {
            newErrors.username = "Username is required";
        }

        if ( !formData.display_name.trim() ) {
            newErrors.display_name = "Display name is required";
        }

        if ( !formData.email.trim() ) {
            newErrors.email = "Email is required";
        } else if ( !validateEmail( formData.email ) ) {
            newErrors.email = "Please enter a valid email address";
        }

        if ( !formData.role ) {
            newErrors.role = "Role is required";
        }

        if ( formData.phone && !validatePhone( formData.phone ) ) {
            newErrors.phone = "Phone must be in format: 123-456-7890";
        }

        setErrors( newErrors );

        if ( Object.keys( newErrors ).length === 0 ) {
            try {
                setSaving( true );
                const updatedUser = await handleUpdateUser( formData.id, formData );
                setOriginalData( updatedUser );
                setFormData( updatedUser );
                setHasChanges( false );

                // Show success message
                toast( "Settings saved successfully!" );

                // Emit final update event
                window.dispatchEvent(
                    new CustomEvent( "userUpdated", {
                        detail: {
                            userId: updatedUser.id,
                            userData: updatedUser,
                        },
                    } ),
                );
            } catch ( error ) {
                toast( "Failed to save settings. Please try again." );
                console.error( "Save error:", error );
            } finally {
                setSaving( false );
            }
        }
    };

    const handlePreviewProfile = () => {
        // router.push( `/profile/${ formData.id }` );
        navigate( `/dash/user/${ formData?.id }/profile` );
    };

    if ( loading ) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading settings...</span>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if ( !formData ) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <p>Failed to load user settings.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const containerStyle = {
        height: `calc(100vh-${ String( CONTENT_HEADER_HEIGHT - 5 ) }rem)`, // Default: fill remaining space minus header/tabs
        minHeight: "400px", // Minimum height fallback
        width: "100%",
    };

    return (

        // <div className={ twMerge( "" ) } style={ containerStyle } { ...props }>

        <div className={ `w-full min-w-full max-w-full relative flex flex-col !min-h-[calc(100vh_-_var(--header-height))] !h-[calc(100vh_-_var(--header-height))] !max-h-[calc(100vh_-_var(--header-height))] !z-20` }
            style={ {
                '--header-height': `${ String( CONTENT_HEADER_HEIGHT + CONTENT_BREADCRUMBS_HEIGHT ) }rem`,
            } }>
            <ScrollArea className="h-full w-full p-6 space-y-6 ">
                <div className="h-full w-full mx-auto overflow-auto">
                    <Card className="overflow-auto h-full w-full mx-auto max-w-md">
                        <CardHeader>
                            <CardTitle>User Settings</CardTitle>
                            <CardDescription>
                                Manage your profile information and privacy settings
                                { hasChanges && <span className="text-orange-600 ml-2">• Unsaved changes</span> }
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={ handleSubmit }>
                            <CardContent className="space-y-8">
                                {/* Basic Information */ }
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Basic Information</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username *</Label>
                                            <Input
                                                id="username"
                                                value={ formData.username }
                                                onChange={ ( e ) => handleInputChange( "username", e.target.value ) }
                                                placeholder="Enter username"
                                            />
                                            { errors.username && <p className="text-sm text-red-500">{ errors.username }</p> }
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="display_name">Display Name *</Label>
                                            <Input
                                                id="display_name"
                                                value={ formData.display_name }
                                                onChange={ ( e ) => handleInputChange( "display_name", e.target.value ) }
                                                placeholder="Enter display name"
                                            />
                                            { errors.display_name && <p className="text-sm text-red-500">{ errors.display_name }</p> }
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={ formData.name || "" }
                                            onChange={ ( e ) => handleInputChange( "name", e.target.value ) }
                                            placeholder="Enter full name (optional)"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={ formData.email }
                                            onChange={ ( e ) => handleInputChange( "email", e.target.value ) }
                                            placeholder="Enter email address"
                                        />
                                        { errors.email && <p className="text-sm text-red-500">{ errors.email }</p> }

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <UserPlus className="w-4 h-4" />
                                                    <Label htmlFor="emailOptInConsent">Allow Email for Notifications or MFA?</Label>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Opt-in to allow notifications via SMS</p>
                                                <h6 className={ `font-sans text-xs` }>
                                                    { "Consent can be withdrawn at any time." }
                                                </h6>
                                            </div>
                                            <Switch
                                                size={ 4 }
                                                id="emailOptInConsent"
                                                defaultChecked={ formData?.emailOptInConsent ?? false }
                                                onCheckedChange={ ( checked ) => setFormData( { ...formData, emailOptInConsent: checked } ) }
                                            />
                                        </div>

                                        {/* Email contact for notifications */ }
                                        { formData?.hasOwnProperty( 'emailOptInConsent' ) && formData?.emailOptInConsent === true && (
                                            <div className={ `w-full flex-1` }>
                                                <Label htmlFor="emailNotificationContact">Email for Notifications *</Label>
                                                <p className={ `text-xs` }>If left blank, we'll message your account email address by default.</p>
                                                <Input
                                                    id="emailNotificationContact"
                                                    type="emailNotificationContact"
                                                    value={ formData.emailNotificationContact }
                                                    onChange={ ( e ) => handleInputChange( "emailNotificationContact", e.target.value ) }
                                                    placeholder={ formData?.email || "Enter email address" }
                                                />
                                                { errors.emailNotificationContact && <p className="text-sm text-red-500">{ errors.emailNotificationContact }</p> }
                                            </div>
                                        ) }

                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        { formData?.phone }
                                        { formData?.phoneNotificationContact }
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={ formatPhoneNumber( formData?.phone ) }
                                            onChange={ ( e ) => handleInputChange( "phone", ( e.target.value ).replace( /[{}[\]()\s\-$$$$.+]/g, "" ) ) }
                                            // maxlength={ 12 }
                                            minlength={ 0 }
                                            placeholder="123-456-7890"
                                        />
                                        { errors.phone && <p className="text-sm text-red-500">{ errors.phone }</p> }
                                        <p className="text-xs text-muted-foreground">Format: 123-456-7890</p>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <UserPlus className="w-4 h-4" />
                                                    <Label htmlFor="phoneOptInConsent">Allow SMS for Notifications or MFA?</Label>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Opt-in to allow notifications via SMS</p>
                                                <h6 className={ `font-sans text-xs` }>
                                                    { "Consent can be withdrawn at any time." }
                                                </h6>
                                            </div>
                                            <Switch
                                                size={ 4 }
                                                id="phoneOptInConsent"
                                                defaultChecked={ formData?.phoneOptInConsent ?? false }
                                                onCheckedChange={ ( checked ) => setFormData( { ...formData, phoneOptInConsent: checked } ) }
                                            />
                                        </div>

                                        <Separator />

                                        {/* Phone (SMS) contact for notifications */ }
                                        { formData?.hasOwnProperty( 'phoneOptInConsent' ) && formData?.phoneOptInConsent === true && (
                                            <div className={ `w-full flex-1` }>
                                                <Label htmlFor="phoneNotificationContact">Phone number for Notifications *</Label>
                                                <p className={ `text-xs` }>If left blank, we'll message your account phone number by default.</p>
                                                <Input
                                                    id="phoneNotificationContact"
                                                    type="phoneNotificationContact"
                                                    value={ formatPhoneNumber( formData?.phoneNotificationContact ) }
                                                    onChange={ ( e ) => handleInputChange( "phoneNotificationContact", e.target.value ) }
                                                    placeholder={ formData?.phone || "Enter phone number" }
                                                />
                                                { errors.phoneNotificationContact && <p className="text-sm text-red-500">{ errors.phoneNotificationContact }</p> }
                                            </div>
                                        ) }
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role *</Label>
                                        <Select value={ formData.role } onValueChange={ ( value ) => handleInputChange( "role", value ) }>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                { USER_ROLE_DEFS.map( ( role ) => (
                                                    <SelectItem key={ role } value={ role }>
                                                        { role.charAt( 0 ).toUpperCase() + role.slice( 1 ) }
                                                    </SelectItem>
                                                ) ) }
                                            </SelectContent>
                                        </Select>
                                        { errors.role && <p className="text-sm text-red-500">{ errors.role }</p> }
                                    </div>
                                </div>

                                <Separator />

                                {/* Privacy Settings */ }
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Security Settings</h3>

                                    <div className="space-y-4">

                                        {/* Password */ }
                                        { ( formData.password || formData.confirmPassword ) && (
                                            <div className="flex items-center gap-2 text-sm">
                                                { passwordsMatch ? (
                                                    <>
                                                        <Check className="w-4 h-4 text-green-500" />
                                                        <span className="text-green-500">Passwords match</span>
                                                    </>
                                                ) : showPasswordMismatch ? (
                                                    <>
                                                        <X className="w-4 h-4 text-red-500" />
                                                        <span className="text-red-500">Passwords don't match</span>
                                                    </>
                                                ) : null }
                                            </div>
                                        ) }

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="password">Password</Label>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={ handleGeneratePassword }
                                                        className="h-auto p-1 text-xs"
                                                    >
                                                        <RefreshCw className="w-3 h-3 mr-1" />
                                                        Generate
                                                    </Button>
                                                </div>

                                                { formData.password && (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span>Password strength:</span>
                                                            <span
                                                                className={ `font-medium ${ passwordStrength.label === "Strong"
                                                                    ? "text-green-500"
                                                                    : passwordStrength.label === "Good"
                                                                        ? "text-yellow-500"
                                                                        : passwordStrength.label === "Fair"
                                                                            ? "text-orange-500"
                                                                            : "text-red-500"
                                                                    }` }
                                                            >
                                                                { passwordStrength.label }
                                                            </span>
                                                        </div>
                                                        <Progress value={ passwordStrength.score } className="h-2" />
                                                    </div>
                                                ) }

                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={ showPasswords ? "text" : "password" }
                                                        placeholder="Change your password"
                                                        value={ formData.password }
                                                        onChange={ ( e ) => setFormData( { ...formData, password: e.target.value } ) }
                                                        className="pr-10"
                                                        // required
                                                        { ...{
                                                            ...( formData?.password && formData?.password !== '' ? { required: true } : {} ),
                                                        } }
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={ togglePasswordVisibility }
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    >
                                                        { showPasswords ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        ) }
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirmPassword"
                                                        type={ showPasswords ? "text" : "password" }
                                                        placeholder="Confirm your password"
                                                        value={ formData.confirmPassword }
                                                        onChange={ ( e ) => setFormData( { ...formData, confirmPassword: e.target.value } ) }
                                                        className="pr-10"
                                                        // required
                                                        { ...{
                                                            ...( formData?.confirmPassword && formData?.confirmPassword !== '' ? { required: true } : {} ),
                                                        } }
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={ togglePasswordVisibility }
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    >
                                                        { showPasswords ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        ) }
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="text-xs text-muted-foreground space-y-1">
                                                <p className="font-medium">Password requirements:</p>
                                                <ul className="space-y-0.5 ml-2">
                                                    <li className={ formData.password?.length >= 6 ? "text-green-500" : "" }>• At least 6 characters</li>
                                                    <li className={ /[a-z]/.test( formData.password ) ? "text-green-500" : "" }>• One lowercase letter</li>
                                                    <li className={ /[A-Z]/.test( formData.password ) ? "text-green-500" : "" }>
                                                        • One uppercase letter (recommended)
                                                    </li>
                                                    <li className={ /\d/.test( formData.password ) ? "text-green-500" : "" }>• One number (recommended)</li>
                                                </ul>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <Separator />

                                {/* Privacy Settings */ }
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Privacy Settings</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <Eye className="w-4 h-4" />
                                                    <Label htmlFor="profileVisible">Profile Visibility</Label>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
                                            </div>
                                            <Switch
                                                id="profileVisible"
                                                checked={ formData.settings?.profileVisible ?? true }
                                                onCheckedChange={ ( checked ) => handleSettingChange( "profileVisible", checked ) }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    <Label htmlFor="allowWorkspaceInvites">Workspace Invitations</Label>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Allow others to invite you to workspaces</p>
                                            </div>
                                            <Switch
                                                id="allowWorkspaceInvites"
                                                checked={ formData.settings?.allowWorkspaceInvites ?? true }
                                                onCheckedChange={ ( checked ) => handleSettingChange( "allowWorkspaceInvites", checked ) }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <UserPlus className="w-4 h-4" />
                                                    <Label htmlFor="allowFriendRequests">Friend Requests</Label>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Allow others to send you friend requests</p>
                                            </div>
                                            <Switch
                                                id="allowFriendRequests"
                                                checked={ formData.settings?.allowFriendRequests ?? true }
                                                onCheckedChange={ ( checked ) => handleSettingChange( "allowFriendRequests", checked ) }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between">
                                <Button type="button" variant="outline" onClick={ handlePreviewProfile }>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview Profile
                                </Button>
                                <Button type="submit" disabled={ saving || !hasChanges }>
                                    { saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Settings
                                        </>
                                    ) }
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </ScrollArea>
        </div>
    );
}


export default UserSettingsPage;