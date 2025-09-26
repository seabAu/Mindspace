import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ColorPicker = ( { color, onChange } ) => {
    const [ currentColor, setCurrentColor ] = useState( color );

    const handleColorChange = ( e ) => {
        setCurrentColor( e.target.value );
        onChange( e.target.value );
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-[80px] h-[30px] p-0"
                    style={ { backgroundColor: currentColor } }
                />
            </PopoverTrigger>
            <PopoverContent className="w-[200px]">
                <div className="flex flex-col space-y-2">
                    <Label htmlFor="color-input">Select Color</Label>
                    <div className="flex space-x-2">
                        <Input
                            id="color-input"
                            type="color"
                            value={ currentColor }
                            onChange={ handleColorChange }
                            className="w-full h-[40px] cursor-pointer"
                        />
                        <Input
                            type="text"
                            value={ currentColor }
                            onChange={ handleColorChange }
                            className="w-[100px]"
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ColorPicker

