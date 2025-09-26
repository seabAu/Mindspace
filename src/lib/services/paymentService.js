// services/subscriptionService.js
import API from '../services/api';
import * as utils from 'akashatools';
import { toast } from 'sonner';
import { ToastAction } from '@/components/ui/toast';
import {
    handleApiRequest,
    handleError,
    handleSuccess,
} from '../utilities/fetch';

const API_BASE_URL = '/api/subscriptions'; // Base URL for subscriptions API

/**
 * Get user's current subscription
 * @param {Object} params - Request parameters
 * @returns {Promise} API response
 */
export const fetchCurrentSubscription = async ( {
    handleError = () => { },
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
    setLoading = () => { },
    setError = () => { },
    doThrowError = true,
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/current`,
        stateSetter: stateSetter,
        successCallback: ( res ) => {
            let data = res?.data?.data;
            toast( `Successfully fetched subscription: ${ data?.planName || 'Free Plan' }` );
            if ( successCallback ) successCallback( { data, stateSetter, doToast: true } );
        },
        errorCallback: ( message ) => {
            toast( `Error: Failed to fetch subscription: ${ JSON.stringify( message ) }` );
            if ( errorCallback ) errorCallback( message );
        },
        setLoading: setLoading,
        setError: setError,
        handleError: ( err ) => ( handleError( { err, setLoading, setError, doThrow: doThrowError } ) ),
    } );
};

/**
 * Create or update subscription
 * @param {Object} params - Request parameters
 * @returns {Promise} API response
 */
export const createOrUpdateSubscription = async ( {
    data,
    handleError = () => { },
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
    setLoading = () => { },
    setError = () => { },
    doThrowError = true,
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/`,
        data: data,
        requiredFields: [ 'planId' ],
        stateSetter: stateSetter,
        successCallback: ( res ) => {
            let subscriptionData = res?.data?.data;
            toast( `Successfully updated subscription to ${ subscriptionData?.planName || 'Unknown Plan' }` );
            if ( successCallback ) successCallback( { data: subscriptionData, stateSetter, doToast: true } );
        },
        errorCallback: ( message ) => {
            toast( `Error: Failed to update subscription: ${ JSON.stringify( message ) }` );
            if ( errorCallback ) errorCallback( message );
        },
        setLoading: setLoading,
        setError: setError,
        handleError: ( err ) => ( handleError( { err, setLoading, setError, doThrow: doThrowError } ) ),
    } );
};

/**
 * Cancel subscription
 * @param {Object} params - Request parameters
 * @returns {Promise} API response
 */
export const cancelSubscription = async ( {
    data,
    handleError = () => { },
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
    setLoading = () => { },
    setError = () => { },
    doThrowError = true,
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/cancel`,
        data: data,
        stateSetter: stateSetter,
        successCallback: ( res ) => {
            let subscriptionData = res?.data?.data;
            let message = subscriptionData?.cancelAtPeriodEnd
                ? 'Subscription will be canceled at period end'
                : 'Subscription canceled immediately';
            toast( `Successfully canceled subscription: ${ message }` );
            if ( successCallback ) successCallback( { data: subscriptionData, stateSetter, doToast: true } );
        },
        errorCallback: ( message ) => {
            toast( `Error: Failed to cancel subscription: ${ JSON.stringify( message ) }` );
            if ( errorCallback ) errorCallback( message );
        },
        setLoading: setLoading,
        setError: setError,
        handleError: ( err ) => ( handleError( { err, setLoading, setError, doThrow: doThrowError } ) ),
    } );
};

/**
 * Get billing history
 * @param {Object} params - Request parameters
 * @returns {Promise} API response
 */
export const fetchBillingHistory = async ( {
    page = 1,
    limit = 10,
    handleError = () => { },
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
    setLoading = () => { },
    setError = () => { },
    doThrowError = true,
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/billing-history`,
        params: { page, limit },
        stateSetter: stateSetter,
        successCallback: ( res ) => {
            let data = res?.data?.data;
            let numTransactions = data?.transactions?.length || 0;
            toast( `Successfully fetched billing history: [${ numTransactions } transactions found]` );
            if ( successCallback ) successCallback( { data, stateSetter, doToast: true } );
        },
        errorCallback: ( message ) => {
            toast( `Error: Failed to fetch billing history: ${ JSON.stringify( message ) }` );
            if ( errorCallback ) errorCallback( message );
        },
        setLoading: setLoading,
        setError: setError,
        handleError: ( err ) => ( handleError( { err, setLoading, setError, doThrow: doThrowError } ) ),
    } );
};

/**
 * Process payment for subscription
 * @param {Object} params - Request parameters
 * @returns {Promise} API response
 */
export const processPayment = async ( {
    data,
    handleError = () => { },
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
    setLoading = () => { },
    setError = () => { },
    doThrowError = true,
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/process-payment`,
        data: data,
        requiredFields: [ 'subscriptionId', 'paymentMethodId' ],
        stateSetter: stateSetter,
        successCallback: ( res ) => {
            let paymentData = res?.data?.data;
            let message = paymentData?.success
                ? 'Payment processed successfully'
                : 'Payment failed - please try again';
            toast( message );
            if ( successCallback ) successCallback( { data: paymentData, stateSetter, doToast: true } );
        },
        errorCallback: ( message ) => {
            toast( `Error: Payment processing failed: ${ JSON.stringify( message ) }` );
            if ( errorCallback ) errorCallback( message );
        },
        setLoading: setLoading,
        setError: setError,
        handleError: ( err ) => ( handleError( { err, setLoading, setError, doThrow: doThrowError } ) ),
    } );
};

/**
 * Get subscription usage analytics
 * @param {Object} params - Request parameters
 * @returns {Promise} API response
 */
export const fetchUsageAnalytics = async ( {
    handleError = () => { },
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
    setLoading = () => { },
    setError = () => { },
    doThrowError = true,
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/usage-analytics`,
        stateSetter: stateSetter,
        successCallback: ( res ) => {
            let data = res?.data?.data;
            toast( `Successfully fetched usage analytics for ${ data?.subscription?.planName || 'subscription' }` );
            if ( successCallback ) successCallback( { data, stateSetter, doToast: true } );
        },
        errorCallback: ( message ) => {
            toast( `Error: Failed to fetch usage analytics: ${ JSON.stringify( message ) }` );
            if ( errorCallback ) errorCallback( message );
        },
        setLoading: setLoading,
        setError: setError,
        handleError: ( err ) => ( handleError( { err, setLoading, setError, doThrow: doThrowError } ) ),
    } );
};

// Payment Method Service Functions

/**
 * Get user's payment methods
 * @param {Object} params - Request parameters
 * @returns {Promise} API response
 */
export const fetchPaymentMethods = async ( {
    handleError = () => { },
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
    setLoading = () => { },
    setError = () => { },
    doThrowError = true,
} ) => {
    return handleApiRequest( {
        method: 'get',
        url: `${ API_BASE_URL }/payment-methods`,
        stateSetter: stateSetter,
        successCallback: ( res ) => {
            let data = res?.data?.data;
            let numMethods = utils.val.isValidArray( data, true ) ? data?.length : 0;
            toast( `Successfully fetched payment methods: [${ numMethods } methods found]` );
            if ( successCallback ) successCallback( { data, stateSetter, doToast: true } );
        },
        errorCallback: ( message ) => {
            toast( `Error: Failed to fetch payment methods: ${ JSON.stringify( message ) }` );
            if ( errorCallback ) errorCallback( message );
        },
        setLoading: setLoading,
        setError: setError,
        handleError: ( err ) => ( handleError( { err, setLoading, setError, doThrow: doThrowError } ) ),
    } );
};

/**
 * Add new payment method
 * @param {Object} params - Request parameters
 * @returns {Promise} API response
 */
export const addPaymentMethod = async ( {
    data,
    handleError = () => { },
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
    setLoading = () => { },
    setError = () => { },
    doThrowError = true,
} ) => {
    return handleApiRequest( {
        method: 'post',
        url: `${ API_BASE_URL }/payment-methods`,
        data: data,
        requiredFields: [ 'type' ],
        stateSetter: stateSetter,
        successCallback: ( res ) => {
            let paymentMethodData = res?.data?.data;
            toast( `Successfully added payment method: ${ paymentMethodData?.getDisplayName?.() || 'New payment method' }` );
            if ( successCallback ) successCallback( { data: paymentMethodData, stateSetter, doToast: true } );
        },
        errorCallback: ( message ) => {
            toast( `Error: Failed to add payment method: ${ JSON.stringify( message ) }` );
            if ( errorCallback ) errorCallback( message );
        },
        setLoading: setLoading,
        setError: setError,
        handleError: ( err ) => ( handleError( { err, setLoading, setError, doThrow: doThrowError } ) ),
    } );
};

/**
 * Update payment method
 * @param {Object} params - Request parameters
 * @returns {Promise} API response
 */
export const updatePaymentMethod = async ( {
    id,
    data,
    handleError = () => { },
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
    setLoading = () => { },
    setError = () => { },
    doThrowError = true,
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/payment-methods/${ id }`,
        data: data,
        stateSetter: stateSetter,
        successCallback: ( res ) => {
            let paymentMethodData = res?.data?.data;
            toast( `Successfully updated payment method` );
            if ( successCallback ) successCallback( { data: paymentMethodData, stateSetter, doToast: true } );
        },
        errorCallback: ( message ) => {
            toast( `Error: Failed to update payment method: ${ JSON.stringify( message ) }` );
            if ( errorCallback ) errorCallback( message );
        },
        setLoading: setLoading,
        setError: setError,
        handleError: ( err ) => ( handleError( { err, setLoading, setError, doThrow: doThrowError } ) ),
    } );
};

/**
 * Delete payment method
 * @param {Object} params - Request parameters
 * @returns {Promise} API response
 */
export const deletePaymentMethod = async ( {
    id,
    handleError = () => { },
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
    setLoading = () => { },
    setError = () => { },
    doThrowError = true,
} ) => {
    return handleApiRequest( {
        method: 'delete',
        url: `${ API_BASE_URL }/payment-methods/${ id }`,
        stateSetter: stateSetter,
        successCallback: ( res ) => {
            let data = res?.data?.data;
            toast( `Successfully deleted payment method` );
            if ( successCallback ) successCallback( { data, stateSetter, doToast: true } );
        },
        errorCallback: ( message ) => {
            toast( `Error: Failed to delete payment method: ${ JSON.stringify( message ) }` );
            if ( errorCallback ) errorCallback( message );
        },
        setLoading: setLoading,
        setError: setError,
        handleError: ( err ) => ( handleError( { err, setLoading, setError, doThrow: doThrowError } ) ),
    } );
};

/**
 * Set default payment method
 * @param {Object} params - Request parameters
 * @returns {Promise} API response
 */
export const setDefaultPaymentMethod = async ( {
    id,
    handleError = () => { },
    stateSetter = () => { },
    successCallback = () => { },
    errorCallback = () => { },
    setLoading = () => { },
    setError = () => { },
    doThrowError = true,
} ) => {
    return handleApiRequest( {
        method: 'put',
        url: `${ API_BASE_URL }/payment-methods/${ id }/default`,
        stateSetter: stateSetter,
        successCallback: ( res ) => {
            let paymentMethodData = res?.data?.data;
            toast( `Successfully set default payment method` );
            if ( successCallback ) successCallback( { data: paymentMethodData, stateSetter, doToast: true } );
        },
        errorCallback: ( message ) => {
            toast( `Error: Failed to set default payment method: ${ JSON.stringify( message ) }` );
            if ( errorCallback ) errorCallback( message );
        },
        setLoading: setLoading,
        setError: setError,
        handleError: ( err ) => ( handleError( { err, setLoading, setError, doThrow: doThrowError } ) ),
    } );
};

// Utility functions for subscription management

/**
 * Get formatted subscription status
 * @param {Object} subscription - Subscription object
 * @returns {Object} Formatted status information
 */
export const getSubscriptionStatus = ( subscription ) => {
    if ( !subscription ) return { status: 'none', message: 'No subscription' };

    const now = new Date();
    const endDate = new Date( subscription.currentPeriodEnd );

    if ( subscription.status === 'active' && endDate > now ) {
        return {
            status: 'active',
            message: 'Active',
            daysRemaining: Math.ceil( ( endDate - now ) / ( 1000 * 60 * 60 * 24 ) )
        };
    }

    if ( subscription.status === 'trialing' ) {
        const trialEnd = new Date( subscription.trialEnd );
        return {
            status: 'trial',
            message: 'Trial',
            daysRemaining: Math.ceil( ( trialEnd - now ) / ( 1000 * 60 * 60 * 24 ) )
        };
    }

    if ( subscription.cancelAtPeriodEnd ) {
        return {
            status: 'canceling',
            message: 'Canceling at period end',
            daysRemaining: Math.ceil( ( endDate - now ) / ( 1000 * 60 * 60 * 24 ) )
        };
    }

    return {
        status: subscription.status,
        message: subscription.status.charAt( 0 ).toUpperCase() + subscription.status.slice( 1 )
    };
};

/**
 * Format currency amount
 * @param {Number} amount - Amount in cents
 * @param {String} currency - Currency code
 * @returns {String} Formatted currency string
 */
export const formatCurrency = ( amount, currency = 'USD' ) => {
    return new Intl.NumberFormat( 'en-US', {
        style: 'currency',
        currency: currency,
    } ).format( amount / 100 );
};

/**
 * Get plan features
 * @param {String} planId - Plan identifier
 * @returns {Object} Plan features and limits
 */
export const getPlanFeatures = ( planId ) => {
    const plans = {
        free: {
            name: 'Free Plan',
            price: 0,
            features: [
                '3 Projects',
                '1GB Storage',
                '1,000 API Calls/month',
                'Basic Support'
            ],
            limits: {
                projects: 3,
                storage: 1073741824, // 1GB in bytes
                apiCalls: 1000,
                users: 1
            }
        },
        pro: {
            name: 'Premium Plan',
            price: 1999, // $19.99 in cents
            features: [
                'Unlimited Projects',
                'Unlimited Storage',
                'Unlimited API Calls',
                '10 Team Members',
                'Priority Support',
                'Advanced Analytics'
            ],
            limits: {
                projects: -1, // unlimited
                storage: -1,
                apiCalls: -1,
                users: 10
            }
        },
        supporter: {
            name: 'Supporter Plan',
            price: 4999, // $49.99 in cents
            features: [
                'Everything in Pro',
                'Unlimited Team Members',
                'Custom Integrations',
                'Dedicated Support',
                'SLA Guarantee',
                'Advanced Security'
            ],
            limits: {
                projects: -1,
                storage: -1,
                apiCalls: -1,
                users: -1,
                customIntegrations: -1,
                APIAccess: -1,
            }
        }
    };

    return plans[ planId ] || plans.free;
};

export default {
    fetchCurrentSubscription,
    createOrUpdateSubscription,
    cancelSubscription,
    fetchBillingHistory,
    processPayment,
    fetchUsageAnalytics,
    fetchPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    getSubscriptionStatus,
    formatCurrency,
    getPlanFeatures
};