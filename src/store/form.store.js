import { ZUSTAND_FORM_STORE_STORAGE_NAME } from '@/lib/config/constants';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import * as utils from 'akashatools';

const useFormStore = create(
    devtools(
        persist(
            ( set, get ) => ( {

                formConfigs: null,
                setFormConfigs: ( formConfigs ) => set( { formConfigs } ),

                addFormConfig: ( key, cfg ) =>
                    set( ( state ) => ( {
                        formConfigs: { ...state.formConfigs, [ key ]: cfg }
                    } ) ),

                setDataOfFormConfig: ( key, data ) =>
                    set( ( state ) => ( {
                        formConfigs: {
                            ...state.formConfigs,
                            [ key ]: {
                                ...state?.formConfigs?.[ key ],
                                data: data
                            }
                        }
                    } ) ),

                updateFormConfig: ( key, updates ) =>
                    set( ( state ) => ( {
                        formConfigs: {
                            ...state.formConfigs,
                            [ key ]: {
                                ...state?.formConfigs?.[ key ],
                                ...updates
                            }
                        }
                    } ) ),

                deleteFormConfig: ( key ) => {
                    const { formConfigs } = get();
                    let updatedConfigs = { ...formConfigs };
                    delete updatedConfigs[ key ];
                    set( { formConfigs: formConfigs } );
                },

                formConfigExists: ( type ) => {
                    const { formConfigs } = get();

                    if ( !type ) {
                        console.error( `Error checking if form config exists: No type provided.` );
                        return null;
                    }

                    if (
                        formConfigs
                        && utils.val.isObject( formConfigs )
                        && utils.val.isValidArray( Object.keys( formConfigs ), true )
                    ) {
                        // return (
                        //     Object.keys( formConfigs )?.find( ( cfgKey ) => ( type === cfgKey ) )
                        //         ? true
                        //         : false
                        // );
                        return (
                            utils.val.isDefined( Object.keys( formConfigs )?.find( ( cfgKey ) => ( type === cfgKey ) ) )
                        );
                    }
                },

                getFormConfig: ( type ) => {
                    const { formConfigs } = get();
                    console.log( 'form.store.js :: getFormConfig :: type = ', type, ' :: ', "formConfigs = ", formConfigs );
                    if ( !type ) {
                        console.error( `Error fetching form config: No type provided.` );
                        return null;
                    }

                    if ( !formConfigs || !utils.val.isObject( formConfigs ) ) {
                        console.error( `Error fetching form config for type: \"${ String( type ) }\": No form configs available to fetch.` );
                        return null;
                    }

                    if ( utils.val.isValidArray( Object.keys( formConfigs ), true ) ) {
                        if ( formConfigs?.hasOwnProperty( type ) && formConfigs?.[ type ] ) {
                            return formConfigs?.[ type ];
                        }
                        // let cfg = Object.keys( formConfigs ).find( ( cfgKey ) => ( type === cfgKey ) );
                        // if ( cfg ) {
                        //     // return formConfigs?.[ cfgKey ];
                        // }
                    }

                    // Fallback if all else fails. 
                    return null;
                },
            } ),
            {
                name: [ ZUSTAND_FORM_STORE_STORAGE_NAME ],
                partialize: ( state ) => ( {
                    formConfigs: state.formConfigs,
                } ),
                getStorage: () => localStorage
            },
            // {
            //     name: ZUSTAND_FORM_STORE_STORAGE_NAME.join( '_' ),
            //     getStorage: () => localStorage,
            // },
        ),
    ),
);

export default useFormStore;




/*  import { ZUSTAND_FORM_STORE_STORAGE_NAME } from '@/lib/config/constants';
    import create from 'zustand';
    import { devtools, persist } from 'zustand/middleware';
    import * as utils from 'akashatools';

    const useFormStore = create(
        devtools(
            persist(
                ( set, get ) => ( {

                    formConfigs: null,
                    setFormConfigs: ( formConfigs ) => set( { formConfigs } ),

                    addFormConfig: ( key, cfg ) =>
                        set( ( state ) => ( {
                            formConfigs: [ ...state.formConfigs, cfg ],
                        } ) ),

                    setDataOfFormConfig: ( id, data ) =>
                        set( ( state ) => ( {
                            formConfigs: state.formConfigs.map( ( c ) =>
                                c._id === id ? { ...c, data: data } : c,
                            ),
                        } ) ),

                    updateFormConfig: ( id, updates ) =>
                        set( ( state ) => ( {
                            formConfigs: state.formConfigs.map( ( c ) =>
                                c._id === id ? { ...c, ...updates } : c,
                            ),
                        } ) ),

                    deleteFormConfig: ( id ) =>
                        set( ( state ) => ( {
                            formConfigs: state.formConfigs.filter(
                                ( c ) => c._id !== id,
                            ),
                        } ) ),

                    formConfigExists: ( type ) => {
                        const { formConfigs } = get();

                        if ( !type ) {
                            console.error( `Error checking if form config exists: No type provided.` );
                            return null;
                        }

                        if (
                            formConfigs
                            && utils.val.isObject( formConfigs )
                            && utils.val.isValidArray( Object.keys( formConfigs ), true )
                        ) {
                            // return (
                            //     Object.keys( formConfigs )?.find( ( cfgKey ) => ( type === cfgKey ) )
                            //         ? true
                            //         : false
                            // );
                            return (
                                utils.val.isDefined( Object.keys( formConfigs )?.find( ( cfgKey ) => ( type === cfgKey ) ) )
                            );
                        }
                    },

                    getFormConfig: ( type ) => {
                        const { formConfigs } = get();
                        if ( !type ) {
                            console.error( `Error fetching form config: No type provided.` );
                            return null;
                        }

                        if ( !formConfigs || !utils.val.isObject( formConfigs ) ) {
                            console.error( `Error fetching form config for type: \"${ String( type ) }\": No form configs available to fetch.` );
                            return null;
                        }

                        if ( utils.val.isValidArray( Object.keys( formConfigs ), true ) ) {
                            let cfg = Object.keys( formConfigs ).find( ( cfgKey ) => ( type === cfgKey ) );
                            if ( cfg ) {
                                return cfg;
                            }
                        }

                        // Fallback if all else fails. 
                        return null;
                    },
                } ),
                {
                    name: [ ZUSTAND_FORM_STORE_STORAGE_NAME ],
                    partialize: ( state ) => ( {
                        formConfigs: state.formConfigs,
                    } ),
                    getStorage: () => localStorage
                },
                // {
                //     name: ZUSTAND_FORM_STORE_STORAGE_NAME.join( '_' ),
                //     getStorage: () => localStorage,
                // },
            ),
        ),
    );

    export default useFormStore;
*/