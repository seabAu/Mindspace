"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    MessageCircle,
    Bug,
    HelpCircle,
    Send,
    Sparkles,
    CheckCircle,
    AlertTriangle,
    Info,
    Loader2,
    Save,
    RotateCcw,
} from "lucide-react";
import { GetLocal, SetLocal, DeleteLocal } from "@/lib/utilities/local";
import HomeContainer from "../Home/HomeContainer";

const FORM_STORAGE_KEYS = {
    contact: "contact_form_data",
    bug: "bug_report_data",
    support: "support_ticket_data",
};

const PRIORITY_OPTIONS = [
    { value: "low", label: "Low", color: "bg-green-500" },
    { value: "medium", label: "Medium", color: "bg-yellow-500" },
    { value: "high", label: "High", color: "bg-orange-500" },
    { value: "urgent", label: "Urgent", color: "bg-red-500" },
];

const BUG_SEVERITY_OPTIONS = [
    { value: "minor", label: "Minor", description: "Small issue that doesn't affect functionality" },
    { value: "major", label: "Major", description: "Significant issue affecting functionality" },
    { value: "critical", label: "Critical", description: "Severe issue preventing normal use" },
    { value: "blocker", label: "Blocker", description: "Complete system failure" },
];

const CATEGORY_OPTIONS = [
    { value: "general", label: "General Inquiry" },
    { value: "billing", label: "Billing & Payments" },
    { value: "technical", label: "Technical Support" },
    { value: "feature", label: "Feature Request" },
    { value: "account", label: "Account Issues" },
    { value: "other", label: "Other" },
];

export default function ContactPage () {
    const [ activeTab, setActiveTab ] = useState( "contact" );
    const [ loading, setLoading ] = useState( false );
    const [ lastSaved, setLastSaved ] = useState( {} );

    // Form states
    const [ contactForm, setContactForm ] = useState( {
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
    } );

    const [ bugForm, setBugForm ] = useState( {
        name: "",
        email: "",
        title: "",
        severity: "",
        browser: "",
        os: "",
        steps: "",
        expected: "",
        actual: "",
        additional: "",
    } );

    const [ supportForm, setSupportForm ] = useState( {
        name: "",
        email: "",
        subject: "",
        priority: "",
        category: "",
        description: "",
        urgency: "",
    } );

    /**
     * Saves form data to localStorage with timestamp
     * @param {string} formType - Type of form (contact, bug, support)
     * @param {Object} data - Form data to save
     */
    const saveFormData = useCallback( ( formType, data ) => {
        const saveData = {
            ...data,
            savedAt: new Date().toISOString(),
        };
        SetLocal( FORM_STORAGE_KEYS[ formType ], saveData );
        setLastSaved( ( prev ) => ( {
            ...prev,
            [ formType ]: new Date().toISOString(),
        } ) );
    }, [] );

    /**
     * Loads form data from localStorage
     * @param {string} formType - Type of form to load
     * @returns {Object} Saved form data or empty object
     */
    const loadFormData = useCallback( ( formType ) => {
        const saved = GetLocal( FORM_STORAGE_KEYS[ formType ], {} );
        if ( saved?.savedAt ) {
            setLastSaved( ( prev ) => ( {
                ...prev,
                [ formType ]: saved?.savedAt,
            } ) );
            // Remove savedAt from form data
            const { savedAt, ...formData } = saved;
            return formData;
        }
        return {};
    }, [] );

    /**
     * Clears saved form data from localStorage
     * @param {string} formType - Type of form to clear
     */
    const clearSavedData = useCallback( ( formType ) => {
        DeleteLocal( FORM_STORAGE_KEYS[ formType ] );
        setLastSaved( ( prev ) => ( {
            ...prev,
            [ formType ]: null,
        } ) );
    }, [] );

    /**
     * Handles form input changes and auto-saves to localStorage
     * @param {string} formType - Type of form being updated
     * @param {string} field - Field name being updated
     * @param {string} value - New field value
     */
    const handleFormChange = useCallback(
        ( formType, field, value ) => {
            const setters = {
                contact: setContactForm,
                bug: setBugForm,
                support: setSupportForm,
            };

            setters[ formType ]( ( prev ) => {
                const updated = { ...prev, [ field ]: value };
                // Auto-save after a short delay
                setTimeout( () => saveFormData( formType, updated ), 500 );
                return updated;
            } );
        },
        [ saveFormData ],
    );

    /**
     * Validates form data before submission
     * @param {string} formType - Type of form to validate
     * @param {Object} data - Form data to validate
     * @returns {Object} Validation result with isValid and errors
     */
    const validateForm = useCallback( ( formType, data ) => {
        const errors = [];

        // Common validations
        if ( !data.name?.trim() ) errors.push( "Name is required" );
        if ( !data.email?.trim() ) errors.push( "Email is required" );
        else if ( !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( data.email ) ) {
            errors.push( "Invalid email format" );
        }

        // Form-specific validations
        switch ( formType ) {
            case "contact":
                if ( !data.subject?.trim() ) errors.push( "Subject is required" );
                if ( !data.message?.trim() ) errors.push( "Message is required" );
                if ( !data.category ) errors.push( "Category is required" );
                break;

            case "bug":
                if ( !data.title?.trim() ) errors.push( "Bug title is required" );
                if ( !data.severity ) errors.push( "Severity is required" );
                if ( !data.steps?.trim() ) errors.push( "Steps to reproduce are required" );
                if ( !data.expected?.trim() ) errors.push( "Expected behavior is required" );
                if ( !data.actual?.trim() ) errors.push( "Actual behavior is required" );
                break;

            case "support":
                if ( !data.subject?.trim() ) errors.push( "Subject is required" );
                if ( !data.description?.trim() ) errors.push( "Description is required" );
                if ( !data.priority ) errors.push( "Priority is required" );
                if ( !data.category ) errors.push( "Category is required" );
                break;
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }, [] );

    /**
     * Submits form data to server
     * @param {string} formType - Type of form being submitted
     */
    const handleSubmit = useCallback(
        async ( formType ) => {
            const forms = { contact: contactForm, bug: bugForm, support: supportForm };
            const formData = forms[ formType ];

            const validation = validateForm( formType, formData );
            if ( !validation.isValid ) {
                validation.errors.forEach( ( error ) => toast.error( error ) );
                return;
            }

            setLoading( true );

            try {
                // Simulate API call
                await new Promise( ( resolve ) => setTimeout( resolve, 2000 ) );

                // Simulate random failure (10% chance)
                if ( Math.random() < 0.1 ) {
                    throw new Error( "Server error. Please try again." );
                }

                // Success - clear saved data
                clearSavedData( formType );

                // Reset form
                const resetters = {
                    contact: () => setContactForm( { name: "", email: "", subject: "", category: "", message: "" } ),
                    bug: () =>
                        setBugForm( {
                            name: "",
                            email: "",
                            title: "",
                            severity: "",
                            browser: "",
                            os: "",
                            steps: "",
                            expected: "",
                            actual: "",
                            additional: "",
                        } ),
                    support: () =>
                        setSupportForm( {
                            name: "",
                            email: "",
                            subject: "",
                            priority: "",
                            category: "",
                            description: "",
                            urgency: "",
                        } ),
                };
                resetters[ formType ]();

                const messages = {
                    contact: "Thank you for your message! We'll get back to you within 24 hours.",
                    bug: "Bug report submitted successfully! Our development team will investigate this issue.",
                    support: "Support ticket created! You'll receive a confirmation email with your ticket number.",
                };

                toast.success( messages[ formType ] );
            } catch ( error ) {
                console.error( "Form submission error:", error );
                toast.error( error.message || "Failed to submit. Please try again." );
            } finally {
                setLoading( false );
            }
        },
        [ contactForm, bugForm, supportForm, validateForm, clearSavedData ],
    );

    /**
     * Resets form to saved state from localStorage
     * @param {string} formType - Type of form to reset
     */
    const resetToSaved = useCallback(
        ( formType ) => {
            const saved = loadFormData( formType );
            const setters = {
                contact: setContactForm,
                bug: setBugForm,
                support: setSupportForm,
            };
            setters[ formType ]( saved );
            toast.info( "Form restored from saved data" );
        },
        [ loadFormData ],
    );

    // Load saved data on mount
    useEffect( () => {
        const savedContact = loadFormData( "contact" );
        const savedBug = loadFormData( "bug" );
        const savedSupport = loadFormData( "support" );

        if ( Object.keys( savedContact ).length > 0 ) {
            setContactForm( savedContact );
            toast.info( "Restored unsaved contact form data" );
        }
        if ( Object.keys( savedBug ).length > 0 ) {
            setBugForm( savedBug );
            toast.info( "Restored unsaved bug report data" );
        }
        if ( Object.keys( savedSupport ).length > 0 ) {
            setSupportForm( savedSupport );
            toast.info( "Restored unsaved support ticket data" );
        }
    }, [ loadFormData ] );

    /**
     * Renders the last saved indicator
     * @param {string} formType - Type of form
     * @returns {JSX.Element} Last saved indicator
     */
    const renderLastSaved = useMemo(
        () => ( formType ) => {
            const savedTime = lastSaved[ formType ];
            if ( !savedTime ) return null;

            const timeAgo = new Date( savedTime ).toLocaleTimeString();
            return (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Save className="h-3 w-3" />
                    <span>Last saved: { timeAgo }</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={ () => resetToSaved( formType ) }>
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restore
                    </Button>
                </div>
            );
        },
        [ lastSaved, resetToSaved ],
    );

    return (
        <HomeContainer classNames="">
            {/* Animated Background Effects */ }
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-500"></div>
                <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-300"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-700"></div>
            </div>

            {/* Header */ }
            <header className="relative z-10 border-b bg-background/80 backdrop-blur-sm bg-gradient-to-br from-background via-background to-muted/20">
                <div className="mx-auto px-4 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <MessageCircle className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Contact Us</h1>
                            <p className="text-muted-foreground">We're here to help with any questions or issues</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */ }
            <main className="relative z-10 mx-auto px-4 py-8 ">
                <div className="max-w-4xl mx-auto">
                    <Tabs value={ activeTab } onValueChange={ setActiveTab } className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8">
                            <TabsTrigger value="contact" className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                Contact & Feedback
                            </TabsTrigger>
                            <TabsTrigger value="bug" className="flex items-center gap-2">
                                <Bug className="h-4 w-4" />
                                Bug Report
                            </TabsTrigger>
                            <TabsTrigger value="support" className="flex items-center gap-2">
                                <HelpCircle className="h-4 w-4" />
                                Support Ticket
                            </TabsTrigger>
                        </TabsList>

                        {/* Contact Form */ }
                        <TabsContent value="contact">
                            <Card className="gradient-card border-border/50">
                                <CardHeader className="p-4">
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageCircle className="h-5 w-5 text-primary" />
                                        Contact & Feedback
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Have a question or want to share feedback? We'd love to hear from you!
                                    </p>
                                    { renderLastSaved( "contact" ) }
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact-name">Name *</Label>
                                            <Input
                                                id="contact-name"
                                                value={ contactForm.name }
                                                onChange={ ( e ) => handleFormChange( "contact", "name", e.target.value ) }
                                                placeholder="Your full name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact-email">Email *</Label>
                                            <Input
                                                id="contact-email"
                                                type="email"
                                                value={ contactForm.email }
                                                onChange={ ( e ) => handleFormChange( "contact", "email", e.target.value ) }
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact-category">Category *</Label>
                                        <Select
                                            value={ contactForm.category }
                                            onValueChange={ ( value ) => handleFormChange( "contact", "category", value ) }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                { CATEGORY_OPTIONS.map( ( option ) => (
                                                    <SelectItem key={ option.value } value={ option.value }>
                                                        { option.label }
                                                    </SelectItem>
                                                ) ) }
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact-subject">Subject *</Label>
                                        <Input
                                            id="contact-subject"
                                            value={ contactForm.subject }
                                            onChange={ ( e ) => handleFormChange( "contact", "subject", e.target.value ) }
                                            placeholder="Brief description of your inquiry"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact-message">Message *</Label>
                                        <Textarea
                                            id="contact-message"
                                            value={ contactForm.message }
                                            onChange={ ( e ) => handleFormChange( "contact", "message", e.target.value ) }
                                            placeholder="Please provide details about your question or feedback..."
                                            rows={ 6 }
                                        />
                                    </div>

                                    <Button onClick={ () => handleSubmit( "contact" ) } disabled={ loading } className="w-full">
                                        { loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send Message
                                            </>
                                        ) }
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Bug Report Form */ }
                        <TabsContent value="bug">
                            <Card className="gradient-card border-border/50">
                                <CardHeader className="p-4">
                                    <CardTitle className="flex items-center gap-2">
                                        <Bug className="h-5 w-5 text-red-500" />
                                        Bug Report
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Found a bug? Help us fix it by providing detailed information about the issue.
                                    </p>
                                    { renderLastSaved( "bug" ) }
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="bug-name">Name *</Label>
                                            <Input
                                                id="bug-name"
                                                value={ bugForm.name }
                                                onChange={ ( e ) => handleFormChange( "bug", "name", e.target.value ) }
                                                placeholder="Your full name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bug-email">Email *</Label>
                                            <Input
                                                id="bug-email"
                                                type="email"
                                                value={ bugForm.email }
                                                onChange={ ( e ) => handleFormChange( "bug", "email", e.target.value ) }
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bug-title">Bug Title *</Label>
                                        <Input
                                            id="bug-title"
                                            value={ bugForm.title }
                                            onChange={ ( e ) => handleFormChange( "bug", "title", e.target.value ) }
                                            placeholder="Brief description of the bug"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bug-severity">Severity *</Label>
                                        <Select
                                            value={ bugForm.severity }
                                            onValueChange={ ( value ) => handleFormChange( "bug", "severity", value ) }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select severity level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                { BUG_SEVERITY_OPTIONS.map( ( option ) => (
                                                    <SelectItem key={ option.value } value={ option.value }>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{ option.label }</span>
                                                            <span className="text-xs text-muted-foreground">{ option.description }</span>
                                                        </div>
                                                    </SelectItem>
                                                ) ) }
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="bug-browser">Browser</Label>
                                            <Input
                                                id="bug-browser"
                                                value={ bugForm.browser }
                                                onChange={ ( e ) => handleFormChange( "bug", "browser", e.target.value ) }
                                                placeholder="e.g., Chrome 120, Firefox 121"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bug-os">Operating System</Label>
                                            <Input
                                                id="bug-os"
                                                value={ bugForm.os }
                                                onChange={ ( e ) => handleFormChange( "bug", "os", e.target.value ) }
                                                placeholder="e.g., Windows 11, macOS 14"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bug-steps">Steps to Reproduce *</Label>
                                        <Textarea
                                            id="bug-steps"
                                            value={ bugForm.steps }
                                            onChange={ ( e ) => handleFormChange( "bug", "steps", e.target.value ) }
                                            placeholder="1. Go to...&#10;2. Click on...&#10;3. Enter..."
                                            rows={ 4 }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bug-expected">Expected Behavior *</Label>
                                        <Textarea
                                            id="bug-expected"
                                            value={ bugForm.expected }
                                            onChange={ ( e ) => handleFormChange( "bug", "expected", e.target.value ) }
                                            placeholder="What should have happened?"
                                            rows={ 3 }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bug-actual">Actual Behavior *</Label>
                                        <Textarea
                                            id="bug-actual"
                                            value={ bugForm.actual }
                                            onChange={ ( e ) => handleFormChange( "bug", "actual", e.target.value ) }
                                            placeholder="What actually happened?"
                                            rows={ 3 }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bug-additional">Additional Information</Label>
                                        <Textarea
                                            id="bug-additional"
                                            value={ bugForm.additional }
                                            onChange={ ( e ) => handleFormChange( "bug", "additional", e.target.value ) }
                                            placeholder="Any additional context, screenshots, or error messages..."
                                            rows={ 3 }
                                        />
                                    </div>

                                    <Button onClick={ () => handleSubmit( "bug" ) } disabled={ loading } className="w-full">
                                        { loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting Report...
                                            </>
                                        ) : (
                                            <>
                                                <Bug className="mr-2 h-4 w-4" />
                                                Submit Bug Report
                                            </>
                                        ) }
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Support Ticket Form */ }
                        <TabsContent value="support">
                            <Card className="gradient-card border-border/50">
                                <CardHeader className="p-4">
                                    <CardTitle className="flex items-center gap-2">
                                        <HelpCircle className="h-5 w-5 text-blue-500" />
                                        Support Ticket
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Need help with your account or have a technical issue? Create a support ticket.
                                    </p>
                                    { renderLastSaved( "support" ) }
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="support-name">Name *</Label>
                                            <Input
                                                id="support-name"
                                                value={ supportForm.name }
                                                onChange={ ( e ) => handleFormChange( "support", "name", e.target.value ) }
                                                placeholder="Your full name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="support-email">Email *</Label>
                                            <Input
                                                id="support-email"
                                                type="email"
                                                value={ supportForm.email }
                                                onChange={ ( e ) => handleFormChange( "support", "email", e.target.value ) }
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="support-subject">Subject *</Label>
                                        <Input
                                            id="support-subject"
                                            value={ supportForm.subject }
                                            onChange={ ( e ) => handleFormChange( "support", "subject", e.target.value ) }
                                            placeholder="Brief description of your issue"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="support-priority">Priority *</Label>
                                            <Select
                                                value={ supportForm.priority }
                                                onValueChange={ ( value ) => handleFormChange( "support", "priority", value ) }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    { PRIORITY_OPTIONS.map( ( option ) => (
                                                        <SelectItem key={ option.value } value={ option.value }>
                                                            <div className="flex items-center gap-2">
                                                                <div className={ `w-2 h-2 rounded-full ${ option.color }` } />
                                                                { option.label }
                                                            </div>
                                                        </SelectItem>
                                                    ) ) }
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="support-category">Category *</Label>
                                            <Select
                                                value={ supportForm.category }
                                                onValueChange={ ( value ) => handleFormChange( "support", "category", value ) }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    { CATEGORY_OPTIONS.map( ( option ) => (
                                                        <SelectItem key={ option.value } value={ option.value }>
                                                            { option.label }
                                                        </SelectItem>
                                                    ) ) }
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="support-urgency">Urgency Level</Label>
                                        <Input
                                            id="support-urgency"
                                            value={ supportForm.urgency }
                                            onChange={ ( e ) => handleFormChange( "support", "urgency", e.target.value ) }
                                            placeholder="How urgent is this issue? (optional)"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="support-description">Description *</Label>
                                        <Textarea
                                            id="support-description"
                                            value={ supportForm.description }
                                            onChange={ ( e ) => handleFormChange( "support", "description", e.target.value ) }
                                            placeholder="Please provide a detailed description of your issue or question..."
                                            rows={ 6 }
                                        />
                                    </div>

                                    <div className="bg-muted/20 p-3 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium">Response Times:</p>
                                                <ul className="text-muted-foreground mt-1 space-y-1">
                                                    <li>
                                                        •{ " " }
                                                        <Badge variant="outline" className="text-xs mr-1">
                                                            Low
                                                        </Badge>{ " " }
                                                        2-3 business days
                                                    </li>
                                                    <li>
                                                        •{ " " }
                                                        <Badge variant="outline" className="text-xs mr-1">
                                                            Medium
                                                        </Badge>{ " " }
                                                        1-2 business days
                                                    </li>
                                                    <li>
                                                        •{ " " }
                                                        <Badge variant="outline" className="text-xs mr-1">
                                                            High
                                                        </Badge>{ " " }
                                                        4-8 hours
                                                    </li>
                                                    <li>
                                                        •{ " " }
                                                        <Badge variant="outline" className="text-xs mr-1">
                                                            Urgent
                                                        </Badge>{ " " }
                                                        1-2 hours
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <Button onClick={ () => handleSubmit( "support" ) } disabled={ loading } className="w-full">
                                        { loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating Ticket...
                                            </>
                                        ) : (
                                            <>
                                                <HelpCircle className="mr-2 h-4 w-4" />
                                                Create Support Ticket
                                            </>
                                        ) }
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Additional Help Section */ }
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="gradient-card border-border/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">Quick Response</h3>
                                    <p className="text-xs text-muted-foreground">Most inquiries answered within 24 hours</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="gradient-card border-border/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">Expert Support</h3>
                                    <p className="text-xs text-muted-foreground">Dedicated team of technical experts</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="gradient-card border-border/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">Priority Support</h3>
                                    <p className="text-xs text-muted-foreground">Urgent issues get immediate attention</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </HomeContainer>
    )
}
