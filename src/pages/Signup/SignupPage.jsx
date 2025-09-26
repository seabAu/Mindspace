"use client";

import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Check, Zap, Mail, Lock, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from 'react-router-dom';
import HomeHeader from "../HomeHeader";
import HomeContainer from '@/pages/Home/HomeContainer';

/**
 * Free tier signup page component
 * @returns {JSX.Element} Signup page
 */
export default function SignupPage () {
    // const router = useRouter();
    const navigate = useNavigate();
    const [ showPassword, setShowPassword ] = useState( false );
    const [ showConfirmPassword, setShowConfirmPassword ] = useState( false );
    const [ loading, setLoading ] = useState( false );
    const [ errors, setErrors ] = useState( {} );
    const [ formData, setFormData ] = useState( {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
        subscribeNewsletter: true,
    } );

    /**
     * Validates form data with comprehensive checks
     * @returns {Object} Validation errors object
     */
    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if ( !formData.firstName.trim() ) {
            newErrors.firstName = "First name is required";
        } else if ( formData.firstName.length < 2 ) {
            newErrors.firstName = "First name must be at least 2 characters";
        }

        if ( !formData.lastName.trim() ) {
            newErrors.lastName = "Last name is required";
        } else if ( formData.lastName.length < 2 ) {
            newErrors.lastName = "Last name must be at least 2 characters";
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if ( !formData.email ) {
            newErrors.email = "Email is required";
        } else if ( !emailRegex.test( formData.email ) ) {
            newErrors.email = "Please enter a valid email address";
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if ( !formData.password ) {
            newErrors.password = "Password is required";
        } else if ( formData.password.length < 8 ) {
            newErrors.password = "Password must be at least 8 characters";
        } else if ( !passwordRegex.test( formData.password ) ) {
            newErrors.password = "Password must contain uppercase, lowercase, number, and special character";
        }

        // Confirm password validation
        if ( !formData.confirmPassword ) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if ( formData.password !== formData.confirmPassword ) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Terms agreement validation
        if ( !formData.agreeToTerms ) {
            newErrors.agreeToTerms = "You must agree to the terms and conditions";
        }

        return newErrors;
    };

    /**
     * Handles form input changes
     * @param {Event} e - Input change event
     */
    const handleInputChange = ( e ) => {
        const { name, value, type, checked } = e.target;
        setFormData( ( prev ) => ( {
            ...prev,
            [ name ]: type === "checkbox" ? checked : value,
        } ) );

        // Clear error when user starts typing
        if ( errors[ name ] ) {
            setErrors( ( prev ) => ( {
                ...prev,
                [ name ]: "",
            } ) );
        }
    };

    /**
     * Handles form submission
     * @param {Event} e - Form submit event
     */
    const handleSubmit = async ( e ) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if ( Object.keys( validationErrors ).length > 0 ) {
            setErrors( validationErrors );
            return;
        }

        setLoading( true );
        setErrors( {} );

        try {
            const response = await fetch( "/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify( {
                    ...formData,
                    plan: "free",
                } ),
            } );

            const data = await response.json();

            if ( response.ok ) {
                // Redirect to dashboard on successful signup
                // router.push( "/dashboard" );
                navigate( '/dash' );
            } else {
                setErrors( { submit: data.message || "Something went wrong. Please try again." } );
            }
        } catch ( error ) {
            setErrors( { submit: "Network error. Please check your connection and try again." } );
        } finally {
            setLoading( false );
        }
    };

    const freeFeatures = [
        "3 Workspaces",
        "5 Task Tags",
        "15 Event Categories",
        "100 Tasks per month",
        "2 Team Members",
        "1GB Storage",
        "Basic Analytics",
        "Email Support",
    ];

    return (
        <HomeContainer classNames="min-h-screen !bg-transparent flex items-center justify-center p-6">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Features */ }
                <div className="space-y-8">

                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Check className="h-5 w-5 text-primary" />
                                <span>What's included in Free</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                { freeFeatures.map( ( feature, index ) => (
                                    <div key={ index } className="flex items-center space-x-2">
                                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                        <span className="text-sm">{ feature }</span>
                                    </div>
                                ) ) }
                            </div>
                            <div className="mt-6 pt-6 border-t">
                                <p className="text-sm text-muted-foreground mb-3">Ready for more? Upgrade to Premium anytime for:</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Unlimited Everything</span>
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Orion AI</span>
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Priority Support</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side - Signup Form */ }
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Create Your Free Account</CardTitle>
                        <p className="text-muted-foreground mt-2">Join thousands of productive teams worldwide</p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        { errors.submit && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{ errors.submit }</AlertDescription>
                            </Alert>
                        ) }

                        <form onSubmit={ handleSubmit } className="space-y-4">
                            {/* Name Fields */ }
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            placeholder="John"
                                            value={ formData.firstName }
                                            onChange={ handleInputChange }
                                            className={ `pl-10 ${ errors.firstName ? "border-destructive" : "" }` }
                                            required
                                        />
                                    </div>
                                    { errors.firstName && <p className="text-sm text-destructive">{ errors.firstName }</p> }
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            placeholder="Doe"
                                            value={ formData.lastName }
                                            onChange={ handleInputChange }
                                            className={ `pl-10 ${ errors.lastName ? "border-destructive" : "" }` }
                                            required
                                        />
                                    </div>
                                    { errors.lastName && <p className="text-sm text-destructive">{ errors.lastName }</p> }
                                </div>
                            </div>

                            {/* Email Field */ }
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={ formData.email }
                                        onChange={ handleInputChange }
                                        className={ `pl-10 ${ errors.email ? "border-destructive" : "" }` }
                                        required
                                    />
                                </div>
                                { errors.email && <p className="text-sm text-destructive">{ errors.email }</p> }
                            </div>

                            {/* Password Field */ }
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={ showPassword ? "text" : "password" }
                                        placeholder="Create a strong password"
                                        value={ formData.password }
                                        onChange={ handleInputChange }
                                        className={ `pl-10 pr-10 ${ errors.password ? "border-destructive" : "" }` }
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={ () => setShowPassword( !showPassword ) }
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        { showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" /> }
                                    </button>
                                </div>
                                { errors.password && <p className="text-sm text-destructive">{ errors.password }</p> }
                                <p className="text-xs text-muted-foreground">
                                    Must contain uppercase, lowercase, number, and special character
                                </p>
                            </div>

                            {/* Confirm Password Field */ }
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={ showConfirmPassword ? "text" : "password" }
                                        placeholder="Confirm your password"
                                        value={ formData.confirmPassword }
                                        onChange={ handleInputChange }
                                        className={ `pl-10 pr-10 ${ errors.confirmPassword ? "border-destructive" : "" }` }
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={ () => setShowConfirmPassword( !showConfirmPassword ) }
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        { showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" /> }
                                    </button>
                                </div>
                                { errors.confirmPassword && <p className="text-sm text-destructive">{ errors.confirmPassword }</p> }
                            </div>

                            {/* Checkboxes */ }
                            <div className="space-y-3">
                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="agreeToTerms"
                                        name="agreeToTerms"
                                        checked={ formData.agreeToTerms }
                                        onCheckedChange={ ( checked ) => setFormData( ( prev ) => ( { ...prev, agreeToTerms: checked } ) ) }
                                        className={ errors.agreeToTerms ? "border-destructive" : "" }
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label htmlFor="agreeToTerms" className="text-sm font-normal">
                                            I agree to the{ " " }
                                            <Link to="/terms" className="text-primary hover:underline">
                                                Terms of Service
                                            </Link>{ " " }
                                            and{ " " }
                                            <Link to="/privacy" className="text-primary hover:underline">
                                                Privacy Policy
                                            </Link>
                                        </Label>
                                        { errors.agreeToTerms && <p className="text-xs text-destructive">{ errors.agreeToTerms }</p> }
                                    </div>
                                </div>

                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="subscribeNewsletter"
                                        name="subscribeNewsletter"
                                        checked={ formData.subscribeNewsletter }
                                        onCheckedChange={ ( checked ) => setFormData( ( prev ) => ( { ...prev, subscribeNewsletter: checked } ) ) }
                                    />
                                    <Label htmlFor="subscribeNewsletter" className="text-sm font-normal">
                                        Send me product updates and productivity tips
                                    </Label>
                                </div>
                            </div>

                            {/* Submit Button */ }
                            <Button type="submit" className="w-full py-6 text-lg" disabled={ loading }>
                                { loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        <span>Creating Account...</span>
                                    </div>
                                ) : (
                                    <>
                                        Create Free Account
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                ) }
                            </Button>
                        </form>

                        {/* Login Link */ }
                        <div className="text-center pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{ " " }
                                <Link to="/login" className="text-primary hover:underline font-medium">
                                    Sign in here
                                </Link>
                            </p>
                        </div>

                        {/* Upgrade Link */ }
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Want unlimited features?{ " " }
                                <Link to="/subscribe" className="text-primary hover:underline font-medium">
                                    Start Premium Trial
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </HomeContainer>
    );
}
