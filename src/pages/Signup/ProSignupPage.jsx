"use client";

import { useState } from "react";
import {
    Eye,
    EyeOff,
    ArrowRight,
    Check,
    Zap,
    Mail,
    Lock,
    User,
    AlertCircle,
    CreditCard,
    Shield,
    Crown,
    Bitcoin,
    DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import HomeHeader from "../HomeHeader";
import useAuth from "../../lib/hooks/useAuth";
import HomeContainer from '@/pages/Home/HomeContainer';

/**
 * Premium tier signup page with integrated payment processing
 * @returns {JSX.Element} Premium signup page
 */
export default function ProSignupPage () {
    const navigate = useNavigate();
    const { signup, login, verifyUser, loading: authLoading, error: authError } = useAuth();
    const [ showPassword, setShowPassword ] = useState( false );
    const [ showConfirmPassword, setShowConfirmPassword ] = useState( false );
    const [ loading, setLoading ] = useState( false );
    const [ errors, setErrors ] = useState( {} );
    const [ paymentMethod, setPaymentMethod ] = useState( "stripe" );
    const [ billingCycle, setBillingCycle ] = useState( "monthly" );

    const [ formData, setFormData ] = useState( {
        // User Info
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
        subscribeNewsletter: true,

        // Payment Info
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardName: "",

        // Billing Address
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",

        // PayPal
        paypalEmail: "",

        // Crypto
        cryptoType: "bitcoin",
    } );

    /**
     * Validates form data with comprehensive checks
     * @returns {Object} Validation errors object
     */
    const validateForm = () => {
        const newErrors = {};

        // User validation
        if ( !formData.firstName.trim() ) newErrors.firstName = "First name is required";
        if ( !formData.lastName.trim() ) newErrors.lastName = "Last name is required";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if ( !formData.email ) {
            newErrors.email = "Email is required";
        } else if ( !emailRegex.test( formData.email ) ) {
            newErrors.email = "Please enter a valid email address";
        }

        password;
        // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if ( !formData.password ) {
            newErrors.password = "Password is required";
            // } else if ( !passwordRegex.test( formData.password ) ) {
        } else if ( formData.password.length < 8 || !formData.password.match( /\d/ ) || !formData.password.match( /[a-zA-Z]/ ) ) {
            newErrors.password = "Password must contain uppercase, lowercase, number, and special character ( @ $ ! %  * ? & )";
        }

        if ( formData.password !== formData.confirmPassword ) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if ( !formData.agreeToTerms ) {
            newErrors.agreeToTerms = "You must agree to the terms and conditions";
        }

        // Payment validation
        if ( paymentMethod === "stripe" ) {
            if ( !formData.cardNumber ) newErrors.cardNumber = "Card number is required";
            if ( !formData.expiryDate ) newErrors.expiryDate = "Expiry date is required";
            if ( !formData.cvv ) newErrors.cvv = "CVV is required";
            if ( !formData.cardName ) newErrors.cardName = "Cardholder name is required";
            if ( !formData.address ) newErrors.address = "Address is required";
            if ( !formData.city ) newErrors.city = "City is required";
            if ( !formData.zipCode ) newErrors.zipCode = "ZIP code is required";
        } else if ( paymentMethod === "paypal" ) {
            if ( !formData.paypalEmail ) {
                newErrors.paypalEmail = "PayPal email is required";
            } else if ( !emailRegex.test( formData.paypalEmail ) ) {
                newErrors.paypalEmail = "Please enter a valid PayPal email";
            }
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

        if ( errors[ name ] ) {
            setErrors( ( prev ) => ( { ...prev, [ name ]: "" } ) );
        }
    };

    /**
     * Formats card number input with spaces
     * @param {string} value - Card number value
     */
    const formatCardNumber = ( value ) => {
        const v = value.replace( /\s+/g, "" ).replace( /[^0-9]/gi, "" );
        const matches = v.match( /\d{4,16}/g );
        const match = ( matches && matches[ 0 ] ) || "";
        const parts = [];
        for ( let i = 0, len = match.length; i < len; i += 4 ) {
            parts.push( match.substring( i, i + 4 ) );
        }
        if ( parts.length ) {
            return parts.join( " " );
        } else {
            return v;
        }
    };

    /**
     * Handles form submission with payment processing
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
            // First create the user account
            // const signupResponse = await fetch( "/api/users/auth/signup", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify( {
            //         firstName: formData.firstName,
            //         lastName: formData.lastName,
            //         email: formData.email,
            //         password: formData.password,
            //         plan: "pro",
            //         subscribeNewsletter: formData.subscribeNewsletter,
            //     } ),
            // } );

            // const signupData = await signupResponse.json();
            const signupData = await signup( {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                plan: "pro",
                subscribeNewsletter: formData.subscribeNewsletter,
            } );

            if ( !signupResponse.ok ) {
                setErrors( { submit: signupData.message || "Failed to create account" } );
                return;
            }

            // Then process payment
            const paymentResponse = await fetch( "/api/payment/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( {
                    userId: signupData.userId,
                    paymentMethod,
                    billingCycle,
                    amount: billingCycle === "yearly" ? 62.86 : 6.16,
                    paymentData: {
                        stripe:
                            paymentMethod === "stripe"
                                ? {
                                    cardNumber: formData.cardNumber.replace( /\s/g, "" ),
                                    expiryDate: formData.expiryDate,
                                    cvv: formData.cvv,
                                    cardName: formData.cardName,
                                    address: formData.address,
                                    city: formData.city,
                                    state: formData.state,
                                    zipCode: formData.zipCode,
                                    country: formData.country,
                                }
                                : null,
                        paypal:
                            paymentMethod === "paypal"
                                ? {
                                    email: formData.paypalEmail,
                                }
                                : null,
                        crypto:
                            paymentMethod === "crypto"
                                ? {
                                    type: formData.cryptoType,
                                }
                                : null,
                    },
                } ),
            } );

            const paymentData = await paymentResponse.json();

            if ( paymentResponse.ok ) {
                // router.push( "/dashboard" );
                navigate( '/dash' );
            } else {
                setErrors( { submit: paymentData.message || "Payment processing failed" } );
            }
        } catch ( error ) {
            setErrors( { submit: "Network error. Please check your connection and try again." } );
        } finally {
            setLoading( false );
        }
    };

    const proFeatures = [
        "Unlimited Workspaces",
        "Unlimited Task Tags",
        "Unlimited Event Categories",
        "Unlimited Tasks",
        "Unlimited Team Members",
        "100GB Storage",
        "Orion AI Assistant",
        "Advanced Analytics",
        "Priority Support",
        "Custom Integrations",
        "API Access",
        "Advanced Security",
    ];

    const pricing = {
        monthly: { amount: 6.16, total: 6.16 },
        yearly: { amount: 62.86, total: 62.86, savings: 11.06 },
    };

    const cryptoDiscount = paymentMethod === "crypto" ? 0.2 : 0;
    const finalAmount = pricing[ billingCycle ].amount * ( 1 - cryptoDiscount );

    return (
        <HomeContainer classNames="min-h-screen overflow-hidden !p-0 h-full bg-gradient-to-br from-background via-background/95 to-primary/5 w-full">
            <div className="max-w-full min-w-full space-y-8 overflow-auto flex-grow h-full px-4 w-full">
                <div className="max-w-7xl justify-center grid lg:grid-cols-2 gap-12 w-full">
                    {/* Left Side - Account Information */ }
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold flex items-center space-x-2">
                                <User className="h-6 w-6" />
                                <span>Account Information</span>
                            </CardTitle>
                            <p className="text-muted-foreground">Create your Premium account with unlimited features</p>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            { errors.submit && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className={ `text-muted-foreground` }>{ errors.submit }</AlertDescription>
                                </Alert>
                            ) }

                            <form onSubmit={ handleSubmit } className="space-y-4">
                                {/* Name Fields */ }
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            placeholder="John"
                                            value={ formData.firstName }
                                            onChange={ handleInputChange }
                                            className={ errors.firstName ? "border-destructive" : "" }
                                            required
                                        />
                                        { errors.firstName && <p className="text-sm text-destructive">{ errors.firstName }</p> }
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            placeholder="Doe"
                                            value={ formData.lastName }
                                            onChange={ handleInputChange }
                                            className={ errors.lastName ? "border-destructive" : "" }
                                            required
                                        />
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

                                {/* Password Fields */ }
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type={ showPassword ? "text" : "password" }
                                                placeholder="Create password"
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
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={ showConfirmPassword ? "text" : "password" }
                                                placeholder="Confirm password"
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
                                </div>

                                {/* Agreement Checkboxes */ }
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
                                            { !formData?.agreeToTerms && <p className="text-xs text-destructive">{ errors.agreeToTerms }</p> }
                                            {/* || ( errors.agreeToTerms && errors.agreeToTerms !== "" )  */ }
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
                            </form>
                        </CardContent>
                    </Card>

                    {/* Right Side - Payment Information */ }
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold flex items-center space-x-2">
                                <CreditCard className="h-6 w-6" />
                                <span>Payment & Billing</span>
                            </CardTitle>
                            <p className="text-muted-foreground">Secure payment processing with multiple options</p>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Billing Cycle Selection */ }
                            <div className="space-y-3">
                                <Label>Billing Cycle</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Card
                                        className={ `cursor-pointer transition-all ${ billingCycle === "monthly" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                                            }` }
                                        onClick={ () => setBillingCycle( "monthly" ) }
                                    >
                                        <CardContent className="p-4 text-center">
                                            <div className="font-semibold">Monthly</div>
                                            <div className="text-2xl font-bold">${ pricing.monthly.amount }</div>
                                            <div className="text-sm text-muted-foreground">per month</div>
                                        </CardContent>
                                    </Card>

                                    <Card
                                        className={ `cursor-pointer transition-all ${ billingCycle === "yearly" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                                            }` }
                                        onClick={ () => setBillingCycle( "yearly" ) }
                                    >
                                        <CardContent className="p-4 text-center">
                                            <div className="font-semibold">Yearly</div>
                                            <div className="text-2xl font-bold">${ pricing.yearly.amount }</div>
                                            <div className="text-sm text-muted-foreground">per year</div>
                                            <Badge variant="secondary" className="mt-1">
                                                Save 15%
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Payment Method Selection */ }
                            <Tabs value={ paymentMethod } onValueChange={ setPaymentMethod } className="space-y-4">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="stripe" className="flex items-center space-x-2">
                                        <CreditCard className="h-4 w-4" />
                                        <span>Card</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="paypal" className="flex items-center space-x-2">
                                        <DollarSign className="h-4 w-4" />
                                        <span>PayPal</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="crypto" className="flex items-center space-x-2">
                                        <Bitcoin className="h-4 w-4" />
                                        <span>Crypto</span>
                                    </TabsTrigger>
                                </TabsList>

                                {/* Credit Card Payment */ }
                                <TabsContent value="stripe" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="cardNumber">Card Number</Label>
                                            <Input
                                                id="cardNumber"
                                                name="cardNumber"
                                                type="text"
                                                placeholder="1234 5678 9012 3456"
                                                value={ formData.cardNumber }
                                                onChange={ ( e ) => {
                                                    const formatted = formatCardNumber( e.target.value );
                                                    setFormData( ( prev ) => ( { ...prev, cardNumber: formatted } ) );
                                                } }
                                                className={ errors.cardNumber ? "border-destructive" : "" }
                                                maxLength={ 19 }
                                            />
                                            { errors.cardNumber && <p className="text-sm text-destructive">{ errors.cardNumber }</p> }
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="expiryDate">Expiry Date</Label>
                                            <Input
                                                id="expiryDate"
                                                name="expiryDate"
                                                type="text"
                                                placeholder="MM/YY"
                                                value={ formData.expiryDate }
                                                onChange={ handleInputChange }
                                                className={ errors.expiryDate ? "border-destructive" : "" }
                                                maxLength={ 5 }
                                            />
                                            { errors.expiryDate && <p className="text-sm text-destructive">{ errors.expiryDate }</p> }
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="cvv">CVV</Label>
                                            <Input
                                                id="cvv"
                                                name="cvv"
                                                type="text"
                                                placeholder="123"
                                                value={ formData.cvv }
                                                onChange={ handleInputChange }
                                                className={ errors.cvv ? "border-destructive" : "" }
                                                maxLength={ 4 }
                                            />
                                            { errors.cvv && <p className="text-sm text-destructive">{ errors.cvv }</p> }
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="cardName">Cardholder Name</Label>
                                            <Input
                                                id="cardName"
                                                name="cardName"
                                                type="text"
                                                placeholder="John Doe"
                                                value={ formData.cardName }
                                                onChange={ handleInputChange }
                                                className={ errors.cardName ? "border-destructive" : "" }
                                            />
                                            { errors.cardName && <p className="text-sm text-destructive">{ errors.cardName }</p> }
                                        </div>
                                    </div>

                                    {/* Billing Address */ }
                                    <div className="space-y-4 pt-4 border-t">
                                        <h4 className="font-semibold">Billing Address</h4>

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Input
                                                id="address"
                                                name="address"
                                                type="text"
                                                placeholder="123 Main St"
                                                value={ formData.address }
                                                onChange={ handleInputChange }
                                                className={ errors.address ? "border-destructive" : "" }
                                            />
                                            { errors.address && <p className="text-sm text-destructive">{ errors.address }</p> }
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    type="text"
                                                    placeholder="New York"
                                                    value={ formData.city }
                                                    onChange={ handleInputChange }
                                                    className={ errors.city ? "border-destructive" : "" }
                                                />
                                                { errors.city && <p className="text-sm text-destructive">{ errors.city }</p> }
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="state">State</Label>
                                                <Input
                                                    id="state"
                                                    name="state"
                                                    type="text"
                                                    placeholder="NY"
                                                    value={ formData.state }
                                                    onChange={ handleInputChange }
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="zipCode">ZIP Code</Label>
                                                <Input
                                                    id="zipCode"
                                                    name="zipCode"
                                                    type="text"
                                                    placeholder="10001"
                                                    value={ formData.zipCode }
                                                    onChange={ handleInputChange }
                                                    className={ errors.zipCode ? "border-destructive" : "" }
                                                />
                                                { errors.zipCode && <p className="text-sm text-destructive">{ errors.zipCode }</p> }
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="country">Country</Label>
                                                <Select
                                                    value={ formData.country }
                                                    onValueChange={ ( value ) => setFormData( ( prev ) => ( { ...prev, country: value } ) ) }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="US">United States</SelectItem>
                                                        <SelectItem value="CA">Canada</SelectItem>
                                                        <SelectItem value="GB">United Kingdom</SelectItem>
                                                        <SelectItem value="AU">Australia</SelectItem>
                                                        <SelectItem value="DE">Germany</SelectItem>
                                                        <SelectItem value="FR">France</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* PayPal Payment */ }
                                <TabsContent value="paypal" className="space-y-4">
                                    <div className="text-center py-8">
                                        <DollarSign className="h-16 w-16 text-primary mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">Pay with PayPal</h3>
                                        <p className="text-muted-foreground mb-6">
                                            You'll be redirected to PayPal to complete your payment securely.
                                        </p>

                                        <div className="space-y-2">
                                            <Label htmlFor="paypalEmail">PayPal Email</Label>
                                            <Input
                                                id="paypalEmail"
                                                name="paypalEmail"
                                                type="email"
                                                placeholder="your@paypal.com"
                                                value={ formData.paypalEmail }
                                                onChange={ handleInputChange }
                                                className={ errors.paypalEmail ? "border-destructive" : "" }
                                            />
                                            { errors.paypalEmail && <p className="text-sm text-destructive">{ errors.paypalEmail }</p> }
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Crypto Payment */ }
                                <TabsContent value="crypto" className="space-y-4">
                                    <div className="text-center py-8">
                                        <Bitcoin className="h-16 w-16 text-primary mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">Pay with Cryptocurrency</h3>
                                        <Badge variant="secondary" className="mb-4">
                                            20% Discount Applied!
                                        </Badge>
                                        <p className="text-muted-foreground mb-6">
                                            Pay with Bitcoin, Ethereum, or other supported cryptocurrencies.
                                        </p>

                                        <div className="space-y-2">
                                            <Label htmlFor="cryptoType">Cryptocurrency</Label>
                                            <Select
                                                value={ formData.cryptoType }
                                                onValueChange={ ( value ) => setFormData( ( prev ) => ( { ...prev, cryptoType: value } ) ) }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                                                    <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                                                    <SelectItem value="litecoin">Litecoin (LTC)</SelectItem>
                                                    <SelectItem value="usdc">USD Coin (USDC)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {/* Order Summary */ }
                            <Card className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="text-lg">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Akasha ({ billingCycle })</span>
                                        <span>${ pricing[ billingCycle ].amount }</span>
                                    </div>
                                    { paymentMethod === "crypto" && (
                                        <div className="flex justify-between text-primary">
                                            <span>Crypto Discount (20%)</span>
                                            <span>-${ ( pricing[ billingCycle ].amount * 0.2 ).toFixed( 2 ) }</span>
                                        </div>
                                    ) }
                                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>${ finalAmount.toFixed( 2 ) }</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Premium Features */ }
                            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center space-x-2">
                                        <Crown className="h-5 w-5 text-primary" />
                                        <span>What's Included in Premium</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-2">
                                        { proFeatures.map( ( feature, index ) => (
                                            <div key={ index } className="flex items-center space-x-2">
                                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                                <span className="text-sm">{ feature }</span>
                                            </div>
                                        ) ) }
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Security Notice */ }
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Shield className="h-4 w-4" />
                                <span>Your payment information is encrypted and secure</span>
                            </div>

                            {/* Submit Button */ }
                            <Button type="submit" onClick={ handleSubmit } className="w-full py-6 text-lg" disabled={ loading }>
                                { loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <>
                                        Complete Premium Signup - ${ finalAmount.toFixed( 2 ) }
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                ) }
                            </Button>

                            {/* Links */ }
                            <div className="text-center space-y-2 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Already have an account?{ " " }
                                    <Link to="/login" className="text-primary hover:underline font-medium">
                                        Sign in here
                                    </Link>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Want to start with free?{ " " }
                                    <Link to="/signup" className="text-primary hover:underline font-medium">
                                        Create Free Account
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </HomeContainer>
    );
}
