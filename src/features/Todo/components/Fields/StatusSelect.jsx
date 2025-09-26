import { useId } from "react";
import * as utils from 'akashatools';
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { stringAsColor, stringToColor } from "@/lib/utilities/color";
import { caseCamelToSentence } from "@/lib/utilities/string";
import { twMerge } from "tailwind-merge";

function StatusDot ( { fill = "currentColor", stroke = 2, height = 12, width = 12, viewportHeight = 8, viewportWidth = 8, className } ) {
    return (
        <svg
            stroke={ stroke ?? 2 }
            width={ width }
            height={ height }
            fill={ fill }
            viewBox={ `0 0 ${ viewportHeight } ${ viewportWidth }` }
            xmlns="http://www.w3.org/2000/svg"
            className={ className }
            aria-hidden="true"
        >
            <circle cx={ 4 } cy={ 4 } r={ 4 } />
        </svg>
    );
}

function StatusSelect ( {
    layoutType = "overlap",
    placeholder,
    options,
    fieldName = "status",
    selected,
    onSelect = () => { },
    className = '',
} ) {
    const id = useId();
    return (
        <div className={ twMerge(
            `items-center justify-center min-w-[10rem] w-[10rem]`,
            layoutType === 'overlap' && 'group relative',
            layoutType === 'grid' && 'grid grid-cols-4 gap-2',
            className,
        ) }>
            <Label
                htmlFor={ id }
                className={ twMerge(
                    // `col-span-1 !flex !items-center !justify-start px-2 w-auto min-w-min`,
                    layoutType === 'overlap' && 'absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-[:disabled]:opacity-50'
                ) }
            >
                { caseCamelToSentence( fieldName ) }
            </Label>
            <Select
                name={ fieldName }
                placeholder={ placeholder }
                defaultValue={ selected ?? 'none' }
                onValueChange={ ( value ) => {
                    if ( onSelect && utils.val.isDefined( value ) ) { onSelect( fieldName, value ); }
                } }
            >
                <SelectTrigger
                    id={ id }
                    key={ id }
                    className={ twMerge(
                        layoutType === `grid` && 'col-span-3',
                        layoutType === `overlap` && 'col-span-1',
                        `[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 px-2 py-0`,
                    ) }
                >
                    <SelectValue className={ `px-0 py-0 h-full` } placeholder={ placeholder } />
                </SelectTrigger>
                <SelectContent
                    position="popper"
                    className={ twMerge(
                        layoutType === `grid` && 'col-span-3',
                        `[&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span]:end-2 z-[3000] [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-4 [&_*[role=option]]:ps-2`,
                    ) }
                >
                    { utils.val.isValidArray( options, true ) ? (
                        <SelectGroup>
                            {
                                options.map( ( opt, index ) => {
                                    let color;
                                    if ( utils.val.isObject( opt ) && opt?.hasOwnProperty( 'color' ) ) { color = opt?.color; }
                                    else { color = stringAsColor( opt, 50, 50 ); }
                                    return (
                                        <SelectItem
                                            id={ `select-item-${ index }-${ String( opt ) }` }
                                            key={ `select-item-${ String( opt ) }` }
                                            value={ String( opt ) }
                                            // style={ { backgroundColor: `${ color }` } }
                                            className={ `cursor-pointer rounded-md bg-transparent hover:bg-[${ color }] transition-colors duration-200 ease-in-out hover:text-[${ color }] ` }
                                        >
                                            <StatusDot fill={ color } />
                                            <SelectLabel className="truncate">{ caseCamelToSentence( String( opt ) ) }</SelectLabel>
                                        </SelectItem>
                                    );
                                } ) }
                        </SelectGroup>
                    ) : (
                        <>
                            <SelectItem value="1">
                                <span className="flex items-center gap-2">
                                    <StatusDot className="text-emerald-600" />
                                    <span className="truncate">Completed</span>
                                </span>
                            </SelectItem>
                            <SelectItem value="2">
                                <span className="flex items-center gap-2">
                                    <StatusDot className="text-blue-500" />
                                    <span className="truncate">In Progress</span>
                                </span>
                            </SelectItem>
                            <SelectItem value="3">
                                <span className="flex items-center gap-2">
                                    <StatusDot className="text-amber-500" />
                                    <span className="truncate">Pending</span>
                                </span>
                            </SelectItem>
                            <SelectItem value="4">
                                <span className="flex items-center gap-2">
                                    <StatusDot className="text-gray-500" />
                                    <span className="truncate">Cancelled</span>
                                </span>
                            </SelectItem>
                            <SelectItem value="5">
                                <span className="flex items-center gap-2">
                                    <StatusDot className="text-red-500" />
                                    <span className="truncate">Failed</span>
                                </span>
                            </SelectItem>
                        </>
                    ) }
                </SelectContent>
            </Select>
        </div>
    );
}

export { StatusSelect, StatusDot };
