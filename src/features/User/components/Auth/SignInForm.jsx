"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useAuth from "@/lib/hooks/useAuth";
import Loader from "@/components/Loader/Loader";
import { Separator } from "@/components/ui/separator";

const SignInForm = ( {
    onSubmit,
    onSuccess,
    onSwitchToSignUp,
    credentials = {
        username: "",
        password: "",
    },
    setCredentials,
    integrationElements,
    className = "",
} ) => {
    const { login, loading, error } = useAuth();
    /* const [ credentials, setCredentials ] = useState( {
          username: "",
          password: "",
      } );
   */
    const handleSubmit = async ( e ) => {
        e.preventDefault();
        if ( onSubmit ) {
            const result = await onSubmit( credentials );
            if ( result && onSuccess ) {
                onSuccess( result );
            }
        }
    };

    return (
        <Card className={ `max-w-sm ${ className }` }>
            { loading && <Loader /> }
            <CardHeader>
                <CardTitle className="text-2xl">Sign In</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={ handleSubmit } className="space-y-4">
                    { error && (
                        <Alert variant="destructive">
                            <AlertDescription>{ error }</AlertDescription>
                        </Alert>
                    ) }

                    { integrationElements ? (
                        <>
                            <Separator />
                            <p className={ `font-medium text-sm font-sans` }>{ `Or sign in with . . .` }</p>
                            <div className={ `flex flex-col` }>{ integrationElements }</div>
                            <Separator />
                        </>
                    ) : (
                        <></>
                    ) }
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            required
                            value={ credentials.username }
                            onChange={ ( e ) => setCredentials( { ...credentials, username: e.target.value } ) }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            required
                            value={ credentials.password }
                            onChange={ ( e ) => setCredentials( { ...credentials, password: e.target.value } ) }
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={ loading }>
                        { loading ? "Signing In..." : "Sign In" }
                    </Button>
                </form>
                { onSwitchToSignUp && (
                    <div className="text-center text-sm">
                        Don't have an account?{ " " }
                        <Button variant="link" onClick={ () => onSwitchToSignUp() } className="p-0">
                            Sign Up
                        </Button>
                    </div>
                ) }
            </CardContent>
        </Card>
    );
};

export default SignInForm;
