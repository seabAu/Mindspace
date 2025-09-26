import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command as CommandPrimitive } from "cmdk";
/* 
type Option = {
    value: string;
    label: string;
};

type MultiSelectProps = {
    options: Option[];
    selected: string[];
    onChange: ( selected: string[] ) => void;
    placeholder?: string;
};
 */
export function MultiSelect ( { options, selected, onChange, placeholder } ) {
    const inputRef = React.useRef( null );
    const [ open, setOpen ] = React.useState( false );
    const [ inputValue, setInputValue ] = React.useState( "" );

    const handleUnselect = ( option ) => {
        onChange( selected.filter( ( s ) => s !== option.value ) );
    };

    const handleKeyDown = ( e ) => {
        const input = inputRef.current;
        if ( input ) {
            if ( e.key === "Delete" || e.key === "Backspace" ) {
                if ( input.value === "" ) {
                    const newSelected = [ ...selected ];
                    newSelected.pop();
                    onChange( newSelected );
                }
            }
            if ( e.key === "Escape" ) {
                input.blur();
            }
        }
    };

    const selectables = options.filter( ( option ) => !selected.includes( option.value ) );

    return (
        <CommandPrimitive onKeyDown={ handleKeyDown } className="overflow-visible bg-transparent">
            <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex gap-1 flex-wrap">
                    { selected.map( ( selectedValue ) => {
                        const option = options.find( ( o ) => o.value === selectedValue );
                        if ( !option ) return null;
                        return (
                            <Badge key={ option.value } variant="secondary">
                                { option.label }
                                <button
                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onKeyDown={ ( e ) => {
                                        if ( e.key === "Enter" ) {
                                            handleUnselect( option );
                                        }
                                    } }
                                    onMouseDown={ ( e ) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    } }
                                    onClick={ () => handleUnselect( option ) }
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                            </Badge>
                        );
                    } ) }
                    <CommandPrimitive.Input
                        ref={ inputRef }
                        value={ inputValue }
                        onValueChange={ setInputValue }
                        onBlur={ () => setOpen( false ) }
                        onFocus={ () => setOpen( true ) }
                        placeholder={ placeholder }
                        className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
                    />
                </div>
            </div>
            <div className="relative mt-2">
                { open && selectables.length > 0 ? (
                    <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                        <CommandPrimitive.Group className="h-full overflow-auto">
                            { selectables.map( ( option ) => {
                                return (
                                    <CommandPrimitive.Item
                                        key={ option.value }
                                        onMouseDown={ ( e ) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        } }
                                        onSelect={ () => {
                                            setInputValue( "" );
                                            onChange( [ ...selected, option.value ] );
                                        } }
                                        className={ "cursor-pointer p-2 hover:bg-accent hover:text-accent-foreground" }
                                    >
                                        { option.label }
                                    </CommandPrimitive.Item>
                                );
                            } ) }
                        </CommandPrimitive.Group>
                    </div>
                ) : null }
            </div>
        </CommandPrimitive>
    );
}

