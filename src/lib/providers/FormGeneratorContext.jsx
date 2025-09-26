import { createContext, useContext, useEffect, useState } from "react";
import useFormStore from "@/store/form.store";
import useGlobalStore from "@/store/global.store";
import * as utils from 'akashatools';


const FormGeneratorContext = createContext();

const FormGeneratorProvider = ( { children }, props ) => {
    // const [ isMounted, setIsMounted ] = useState( false );
    // const [ isOpen, setIsOpen ] = useState( false );
    // const value = {
    //     isMounted, setIsMounted,
    //     isOpen, setIsOpen,
    // };

    const {
        formConfigs, setFormConfigs,
        setDataOfFormConfig,
        addFormConfig,
        updateFormConfig,
        deleteFormConfig,
        formConfigExists,
        getFormConfig,
    } = useFormStore();

    const getSchema = useGlobalStore( ( state ) => state.getSchema );
    const data = useGlobalStore( ( state ) => state.data );
    const getData = useGlobalStore( ( state ) => state.getData );
    const getDataOfType = useGlobalStore( ( state ) => state.getDataOfType );
    const setDataOfType = useGlobalStore( ( state ) => state.setDataOfType );
    const reloadData = useGlobalStore( ( state ) => state.reloadData );

    const [ formData, setFormData ] = useState( {} );
    const [ formModel, setFormModel ] = useState( {} );
    const [ formSchema, setFormSchema ] = useState( {} );

    const saveFormConfig = ( dataType, cfg ) => {
        console.log( "FormGeneratorContext :: saveFormConfig :: dataType = ", dataType, " :: ", "cfg = ", cfg );
        if ( dataType && utils.val.isObject( cfg ) ) {
            // Check if a config for this type exists already. If so, replace it. Else, append it. 
            if ( formConfigExists( dataType ) ) {
                let currentCfg = getFormConfig( dataType );
                updateFormConfig( dataType, {
                    ...( currentCfg ? currentCfg : {} ),
                    ...cfg
                } );
            }
            else {
                addFormConfig( dataType, cfg );
            }
        }
    };

    const fetchFormConfig = ( dataType, initialData ) => {
        console.log( "FormGeneratorContext :: fetchFormConfig :: dataType = ", dataType, " :: ", "initialData = ", initialData );
        // IF given initialData, splice in the values replacing whatever is stored in the form config.
        if ( dataType && formConfigExists( dataType ) ) {
            let cfg = getFormConfig( dataType );
            if ( cfg ) {
                if ( initialData && utils.val.isObject( initialData ) ) {
                    return {
                        ...cfg,
                        data: initialData
                    };
                }

                return cfg;
            }
        }

        return null;
    };

    const value = {
        // Locally stored data.
        formData, setFormData,
        formModel, setFormModel,
        formSchema, setFormSchema,

        // Data store values and functions routed through.
        formConfigs, setFormConfigs,
        setDataOfFormConfig,
        addFormConfig,
        updateFormConfig,
        deleteFormConfig,
        formConfigExists,
        getFormConfig,
        saveFormConfig,
        fetchFormConfig,

        // Current global data. Replaces refData being called independently in-component. 
        refData: getData(),
    };

    return (
        <FormGeneratorContext.Provider { ...props } value={ value }>
            { children }
        </FormGeneratorContext.Provider>
    );
};

export const useFormGenerator = () => {
    const context = useContext( FormGeneratorContext );

    if ( context === undefined )
        throw new Error( "useFormGenerator must be used within a FormGeneratorProvider" );

    return context;
};

export default FormGeneratorProvider;
