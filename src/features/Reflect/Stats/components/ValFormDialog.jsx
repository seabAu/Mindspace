
import React from "react";

import { useState } from "react";
import { useVal } from "../hooks/useVal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ValFormDialog () {
  const [ isOpen, setIsOpen ] = useState( false );
  const { someValue, anotherValue, setSomeValue, setAnotherValue, updateMultipleValues } = useVal();

  const [ formState, setFormState ] = useState( {
    someValue,
    anotherValue,
  } );

  const handleInputChange = ( e ) => {
    const { name, value } = e.target;
    setFormState( ( prev ) => ( { ...prev, [ name ]: value } ) );
  };

  const handleSubmit = () => {
    updateMultipleValues( formState );
    setIsOpen( false );
  };

  return (
    <>
      <Button onClick={ () => setIsOpen( true ) }>Open Form</Button>
      <Dialog open={ isOpen } onOpenChange={ setIsOpen }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Values</DialogTitle>
          </DialogHeader>
          <form onSubmit={ ( e ) => e.preventDefault() }>
            <div className="space-y-4">
              <div>
                <label htmlFor="someValue" className="block text-sm font-medium text-gray-700">
                  Some Value
                </label>
                <Input
                  type="text"
                  name="someValue"
                  id="someValue"
                  value={ formState.someValue }
                  onChange={ handleInputChange }
                />
              </div>
              <div>
                <label htmlFor="anotherValue" className="block text-sm font-medium text-gray-700">
                  Another Value
                </label>
                <Input
                  type="number"
                  name="anotherValue"
                  id="anotherValue"
                  value={ formState.anotherValue }
                  onChange={ handleInputChange }
                />
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button onClick={ handleSubmit }>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
