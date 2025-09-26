import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Plus, Search, X } from "lucide-react";
import * as utils from 'akashatools';
import { useReflectContext } from "@/features/Reflect/context/ReflectProvider";

const DataKeyDropdown = ( { isFilter = false, value, onChange, onBlur, error } ) => {
    const { getAllUniqueDataKeys } = useReflectContext();
    const [ isOpen, setIsOpen ] = useState( false );
    const [ searchTerm, setSearchTerm ] = useState( "" );
    const [ newKeyValue, setNewKeyValue ] = useState( "" );
    const [ newKeyError, setNewKeyError ] = useState( "" );
    const [ uniqueKeys, setUniqueKeys ] = useState( [] );
    const dropdownRef = useRef( null );
    const searchInputRef = useRef( null );
    const newKeyInputRef = useRef( null );

    // Load unique keys from the data store
    useEffect( () => {
        let uniqueKeys = getAllUniqueDataKeys();
        if ( isFilter ) setUniqueKeys( [ "all", ...( utils.val.isValidArray( uniqueKeys, true ) ? uniqueKeys : [] ) ] );
        else setUniqueKeys( uniqueKeys );
    }, [ getAllUniqueDataKeys ] );

    // Handle click outside to close dropdown
    useEffect( () => {
        const handleClickOutside = ( event ) => {
            if ( dropdownRef.current && !dropdownRef.current.contains( event.target ) ) {
                setIsOpen( false );
            }
        };

        if ( isOpen ) {
            document.addEventListener( "mousedown", handleClickOutside );
        }

        return () => {
            document.removeEventListener( "mousedown", handleClickOutside );
        };
    }, [ isOpen ] );

    // Focus search input when dropdown opens
    useEffect( () => {
        if ( isOpen && searchInputRef.current ) {
            setTimeout( () => {
                searchInputRef.current.focus();
            }, 10 );
        }
    }, [ isOpen ] );

    const handleToggleDropdown = () => {
        setIsOpen( !isOpen );
        setSearchTerm( "" );
        setNewKeyValue( "" );
        setNewKeyError( "" );
    };

    const handleSelectKey = ( key ) => {
        onChange( key );
        setIsOpen( false );
    };

    const handleAddNewKey = () => {
        if ( !newKeyValue.trim() ) {
            setNewKeyError( "Data key cannot be empty" );
            return;
        }

        // Check if key already exists
        if ( uniqueKeys.includes( newKeyValue ) ) {
            setNewKeyError( "The data key must be unique" );
            return;
        }

        // Add new key and select it
        onChange( newKeyValue );
        setIsOpen( false );
        setNewKeyValue( "" );
        setNewKeyError( "" );
    };

    const handleNewKeyKeyDown = ( e ) => {
        if ( e.key === "Enter" ) {
            e.preventDefault();
            handleAddNewKey();
        }
    };

    // Filter keys based on search term
    const filteredKeys = uniqueKeys.filter( ( key ) => key.toLowerCase().includes( searchTerm.toLowerCase() ) );

    return (
        <div className="relative w-full" ref={ dropdownRef }>
            {/* Dropdown trigger */ }
            <div
                className={ `flex items-center justify-between p-2 border ${ error ? "border-red-500" : "border-neutral-800"
                    } rounded-md text-white h-8 text-sm cursor-pointer` }
                onClick={ handleToggleDropdown }
            >
                <div className="truncate">{ value || "Select data key" }</div>
                <div className="text-neutral-400">
                    { isOpen ? (
                        <X className="h-3 w-3" />
                    ) : (
                        <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    ) }
                </div>
            </div>

            {/* Dropdown menu */ }
            { isOpen && (
                <div className="absolute z-[2000] w-full min-w-[16rem] mt-1 bg-background border border-neutral-900 rounded-md shadow-lg max-h-auto overflow-hidden">
                    {/* Search bar */ }
                    <div className="p-2 border-b border-neutral-900 sticky top-0 bg-background z-10">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-neutral-400" />
                            <Input
                                ref={ searchInputRef }
                                type="text"
                                placeholder="Search data keys..."
                                value={ searchTerm }
                                onChange={ ( e ) => setSearchTerm( e.target.value ) }
                                className="pl-7 pr-2 py-1 border-neutral-800 text-white h-7 text-xs w-full"
                            />
                        </div>
                    </div>

                    {/* New key input */ }
                    <div className="p-2 border-b border-neutral-900">
                        <div className="flex items-center space-x-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-neutral-400 hover:text-white"
                                onClick={ handleAddNewKey }
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                            <Input
                                ref={ newKeyInputRef }
                                type="text"
                                placeholder="Add new data key..."
                                value={ newKeyValue }
                                onChange={ ( e ) => {
                                    setNewKeyValue( e.target.value );
                                    setNewKeyError( "" );
                                } }
                                onKeyDown={ handleNewKeyKeyDown }
                                className="border-neutral-800 text-white h-7 text-xs flex-1"
                            />
                        </div>
                        { newKeyError && <div className="text-red-500 text-xs mt-1">{ newKeyError }</div> }
                    </div>

                    {/* Key options */ }
                    <div className={ `overflow-y-auto h-[32rem]` }>
                        { filteredKeys.length > 0 ? (
                            filteredKeys.map( ( key ) => (
                                <div
                                    key={ key }
                                    className={ `flex items-center px-1.5 py-1.5 hover:cursor-pointer hover:bg-primary-purple-900/20 ${ key === value ? "bg-primary-purple-600/20" : ""
                                        }` }
                                    onClick={ () => handleSelectKey( key ) }
                                >
                                    <div className="w-5 flex-shrink-0">
                                        { key === value && <Check className="h-3 w-3 text-blue-500" /> }
                                    </div>
                                    <div className="text-sm text-white truncate">{ key }</div>
                                </div>
                            ) )
                        ) : (
                            <div className="px-1.5 py-1.5 text-sm text-neutral-400">
                                { searchTerm ? "No matching data keys" : "No data keys available" }
                            </div>
                        ) }
                    </div>
                </div>
            ) }
        </div>
    );
};

export default DataKeyDropdown;
