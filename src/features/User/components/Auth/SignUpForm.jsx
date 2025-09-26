"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import useAuth from "@/lib/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { UserPlus, RefreshCw, Check, X, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

const SignUpForm = ( {
    onSuccess,
    onSwitchToSignIn,
    credentials = {
        username: "",
        display_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        phoneOptInConsent: false,
        emailOptInConsent: false,
    },
    setCredentials,
    className = "",
} ) => {
    const { signup, loading, error } = useAuth();
    const [ showPasswords, setShowPasswords ] = useState( false );
    const passwordStrength = calculatePasswordStrength( credentials.password );
    const passwordsMatch =
        credentials.password && credentials.confirmPassword && credentials.password === credentials.confirmPassword;
    const showPasswordMismatch = credentials.confirmPassword && !passwordsMatch;

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

    const handleSubmit = async ( e ) => {
        e.preventDefault();
        const result = await signup( credentials );
        if ( result && onSuccess ) {
            onSuccess( result );
        }
    };

    return (
        <Card className={ `h-max flex-grow mx-auto my-10 my-auto mx-auto overflow-hidden max-w-sm ${ className }` }>
            { loading && <Loader /> }
            <CardHeader>
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <CardDescription>Create a new account to get started</CardDescription>
            </CardHeader>
            <CardContent className={ `h-[90%] max-h-[90vh]` }>
                <form onSubmit={ handleSubmit } className="space-y-4">
                    { error && (
                        <Alert variant="destructive">
                            <AlertDescription>{ error }</AlertDescription>
                        </Alert>
                    ) }

                    {/* Username */ }
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Choose a username"
                            required
                            value={ credentials.username }
                            onChange={ ( e ) => setCredentials( { ...credentials, username: e.target.value } ) }
                        />
                    </div>

                    {/* Display name */ }
                    <div className="space-y-2">
                        <Label htmlFor="display_name">Display Name</Label>
                        <Input
                            id="display_name"
                            type="text"
                            placeholder="Your display name"
                            required
                            value={ credentials.display_name }
                            onChange={ ( e ) => setCredentials( { ...credentials, display_name: e.target.value } ) }
                        />
                    </div>

                    {/* Phone */ }
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number (optional)</Label>
                        <h6 className={ `capitalize font-sans text-xs` }>
                            {
                                "The phone number is only for delivering notifications. You can receive notifications other ways if you do not wish to share this."
                            }
                        </h6>
                        <Input
                            id="phone"
                            type="phone"
                            placeholder="(###)-###-####"
                            value={ credentials.phone }
                            onChange={ ( e ) => setCredentials( { ...credentials, phone: e.target.value } ) }
                        />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    <Label htmlFor="phoneOptInConsent">Allow SMS for Notifications or MFA?</Label>
                                </div>
                                {/* <p className="text-sm text-muted-foreground">Opt-in to allow notifications via SMS</p>
                                <h6 className={ `font-sans text-xs` }>
                                    { "Consent can be withdrawn at any time via your profile settings" }
                                </h6> */}
                            </div>
                            <Switch
                                size={ 4 }
                                id="phoneOptInConsent"
                                defaultChecked={ credentials?.phoneOptInConsent ?? false }
                                onCheckedChange={ ( checked ) => setCredentials( { ...credentials, phoneOptInConsent: checked } ) }
                            />
                        </div>

                        <Separator />

                    </div>

                    {/* Email */ }
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            required
                            value={ credentials.email }
                            onChange={ ( e ) => setCredentials( { ...credentials, email: e.target.value } ) }
                        />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    <Label htmlFor="emailOptInConsent">Allow Email for Notifications or MFA?</Label>
                                </div>
                                {/* <p className="text-sm text-muted-foreground">Opt-in to allow notifications via SMS</p>
                                <h6 className={ `font-sans text-xs` }>
                                    { "Consent can be withdrawn at any time via your profile settings" }
                                </h6> */}
                            </div>
                            <Switch
                                size={ 4 }
                                id="emailOptInConsent"
                                defaultChecked={ credentials?.emailOptInConsent ?? false }
                                onCheckedChange={ ( checked ) => setCredentials( { ...credentials, emailOptInConsent: checked } ) }
                            />
                        </div>

                    </div>

                    <Separator />

                    {/* Password */ }
                    { ( credentials.password || credentials.confirmPassword ) && (
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

                            { credentials.password && (
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
                                    placeholder="Create a password"
                                    required
                                    value={ credentials.password }
                                    onChange={ ( e ) => setCredentials( { ...credentials, password: e.target.value } ) }
                                    className="pr-10"
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
                                    required
                                    value={ credentials.confirmPassword }
                                    onChange={ ( e ) => setCredentials( { ...credentials, confirmPassword: e.target.value } ) }
                                    className="pr-10"
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
                                <li className={ credentials.password?.length >= 6 ? "text-green-500" : "" }>• At least 6 characters</li>
                                <li className={ /[a-z]/.test( credentials.password ) ? "text-green-500" : "" }>• One lowercase letter</li>
                                <li className={ /[A-Z]/.test( credentials.password ) ? "text-green-500" : "" }>
                                    • One uppercase letter (recommended)
                                </li>
                                <li className={ /\d/.test( credentials.password ) ? "text-green-500" : "" }>• One number (recommended)</li>
                            </ul>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={ loading }>
                        { loading ? "Creating Account..." : "Sign Up" }
                    </Button>

                    { onSwitchToSignIn && (
                        <div className="text-center text-sm">
                            Already have an account?{ " " }
                            <Button variant="link" onClick={ onSwitchToSignIn } className="p-0">
                                Sign In
                            </Button>
                        </div>
                    ) }
                </form>
            </CardContent>
        </Card>
    );
};


const Loader = ( { className = "", size = "default" } ) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        default: "w-6 h-6",
        lg: "w-8 h-8",
    };

    return (
        <div
            className={ `fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 ${ className }` }
        >
            <div className="flex flex-col items-center gap-2">
                <Loader2 className={ `${ sizeClasses[ size ] } animate-spin text-primary` } />
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
};


export default SignUpForm;
