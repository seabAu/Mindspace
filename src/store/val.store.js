import { create } from "zustand";

/* interface ValState {
  // Define your state shape here
  someValue: string
  anotherValue: number
  // ... other values

  // Define your actions here
  setSomeValue: (value: string) => void
  setAnotherValue: (value: number) => void
  // ... other setters

  // Add a method for bulk updates
  updateMultipleValues: (updates: Partial<ValState>) => void
} */

export const useValStore = create( ( set ) => ( {
    // Initial state
    someValue: "",
    anotherValue: 0,
    // ... other initial values

    // Setters
    setSomeValue: ( value ) =>
        set( ( state ) => ( {
            ...state,
            someValue: value,
        } ) ),
    setAnotherValue: ( value ) =>
        set( ( state ) => ( {
            ...state,
            anotherValue: value,
        } ) ),
    // ... other setters

    // Method for bulk updates
    updateMultipleValues: ( updates ) =>
        set( ( state ) => {
            const newState = { ...state };
            Object.entries( updates ).forEach( ( [ key, value ] ) => {
                if ( key in state ) {
                    ; ( newState )[ key ] = value;
                }
            } );
            return newState;
        } ),
} ) );
