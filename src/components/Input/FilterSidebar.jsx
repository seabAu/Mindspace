// "use client"
// https://v0.dev/chat/contact-search-wl4JjJ0Uaa4 // 

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FilterSidebar () {
    const [ employeeHeadcountFilters, setEmployeeHeadcountFilters ] = useState( [ '1 - 10', '11 - 50' ] );

    const removeHeadcountFilter = ( filter ) => {
        setEmployeeHeadcountFilters( employeeHeadcountFilters.filter( f => f !== filter ) );
    };

    return (
        <div className="w-full border rounded-md p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="font-medium">Filters</span>
                    <Badge className="bg-gray-200 text-gray-800 rounded-md">(4)</Badge>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" className="text-blue-600 h-8 px-2 text-xs sm:text-sm">Clear filters</Button>
                    <Button variant="ghost" className="text-gray-800 h-8 px-2 text-xs sm:text-sm">Save search</Button>
                </div>
            </div>

            <div className="space-y-4">
                <Accordion type="multiple" defaultValue={ [ "industry" ] }>
                    {/* Industry */ }
                    <AccordionItem value="industry" className="border-b">
                        <AccordionTrigger className="py-2">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 21.25H2C1.59 21.25 1.25 20.91 1.25 20.5C1.25 20.09 1.59 19.75 2 19.75H22C22.41 19.75 22.75 20.09 22.75 20.5C22.75 20.91 22.41 21.25 22 21.25Z" fill="currentColor" />
                                    <path d="M3.7 21.25H2.7C2.29 21.25 1.95 20.91 1.95 20.5V16.5C1.95 16.09 2.29 15.75 2.7 15.75H3.7C4.11 15.75 4.45 16.09 4.45 16.5V20.5C4.45 20.91 4.11 21.25 3.7 21.25Z" fill="currentColor" />
                                    <path d="M7.7 21.25H6.7C6.29 21.25 5.95 20.91 5.95 20.5V12.5C5.95 12.09 6.29 11.75 6.7 11.75H7.7C8.11 11.75 8.45 12.09 8.45 12.5V20.5C8.45 20.91 8.11 21.25 7.7 21.25Z" fill="currentColor" />
                                    <path d="M11.7 21.25H10.7C10.29 21.25 9.95 20.91 9.95 20.5V4.5C9.95 4.09 10.29 3.75 10.7 3.75H11.7C12.11 3.75 12.45 4.09 12.45 4.5V20.5C12.45 20.91 12.11 21.25 11.7 21.25Z" fill="currentColor" />
                                    <path d="M15.7 21.25H14.7C14.29 21.25 13.95 20.91 13.95 20.5V8.5C13.95 8.09 14.29 7.75 14.7 7.75H15.7C16.11 7.75 16.45 8.09 16.45 8.5V20.5C16.45 20.91 16.11 21.25 15.7 21.25Z" fill="currentColor" />
                                    <path d="M19.7 21.25H18.7C18.29 21.25 17.95 20.91 17.95 20.5V10.5C17.95 10.09 18.29 9.75 18.7 9.75H19.7C20.11 9.75 20.45 10.09 20.45 10.5V20.5C20.45 20.91 20.11 21.25 19.7 21.25Z" fill="currentColor" />
                                </svg>
                                <span className="font-medium">Industry</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="py-2 space-y-2">
                                <div className="flex items-center">
                                    <Input placeholder="Search industries" className="text-sm" />
                                </div>
                                <div className="space-y-1">
                                    { [ 'Technology', 'Healthcare', 'Finance', 'Education', 'Retail' ].map( ( industry ) => (
                                        <div key={ industry } className="flex items-center">
                                            <input type="checkbox" id={ `industry-${ industry }` } className="mr-2" />
                                            <label htmlFor={ `industry-${ industry }` } className="text-sm">{ industry }</label>
                                        </div>
                                    ) ) }
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Employee headcount */ }
                    <AccordionItem value="employee-headcount" className="border-b">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.16 10.87C9.06 10.86 8.94 10.86 8.83 10.87C6.45 10.79 4.56 8.84 4.56 6.44C4.56 3.99 6.54 2 9 2C11.45 2 13.44 3.99 13.44 6.44C13.43 8.84 11.54 10.79 9.16 10.87Z" fill="currentColor" />
                                    <path d="M16.41 4C18.35 4 19.91 5.57 19.91 7.5C19.91 9.39 18.41 10.93 16.54 11C16.46 10.99 16.37 10.99 16.28 11" fill="currentColor" fillOpacity="0.4" />
                                    <path d="M4.16 14.56C1.74 16.18 1.74 18.82 4.16 20.43C6.91 22.27 11.42 22.27 14.17 20.43C16.59 18.81 16.59 16.17 14.17 14.56C11.43 12.73 6.92 12.73 4.16 14.56Z" fill="currentColor" />
                                    <path d="M18.34 20C19.06 19.85 19.74 19.56 20.3 19.13C21.86 17.96 21.86 16.03 20.3 14.86C19.75 14.44 19.08 14.16 18.37 14" fill="currentColor" fillOpacity="0.4" />
                                </svg>
                                <span className="font-medium">Employee headcount</span>
                            </div>
                            <div className="flex items-center gap-2">
                                { employeeHeadcountFilters.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        className="text-blue-600 h-6 px-2 py-0 text-xs"
                                        onClick={ () => setEmployeeHeadcountFilters( [] ) }
                                    >
                                        Clear
                                    </Button>
                                ) }
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1 mb-3">
                            { employeeHeadcountFilters.map( ( filter ) => (
                                <Badge
                                    key={ filter }
                                    className="bg-gray-100 text-gray-800 rounded-md px-2 py-1 flex items-center gap-1"
                                >
                                    { filter }
                                    <button
                                        className="text-gray-500 hover:text-gray-700"
                                        onClick={ () => removeHeadcountFilter( filter ) }
                                    >
                                        ×
                                    </button>
                                </Badge>
                            ) ) }
                        </div>
                        <div className="pb-2">
                            <div className="space-y-1">
                                { [ '1 - 10', '11 - 50', '51 - 200', '201 - 500', '501 - 1,000', '1,001 - 5,000', '5,001 - 10,000', '10,001+' ].map( ( size ) => (
                                    <div key={ size } className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={ `size-${ size }` }
                                            className="mr-2"
                                            checked={ employeeHeadcountFilters.includes( size ) }
                                            onChange={ ( e ) => {
                                                if ( e.target.checked ) {
                                                    setEmployeeHeadcountFilters( [ ...employeeHeadcountFilters, size ] );
                                                } else {
                                                    removeHeadcountFilter( size );
                                                }
                                            } }
                                        />
                                        <label htmlFor={ `size-${ size }` } className="text-sm">{ size }</label>
                                    </div>
                                ) ) }
                            </div>
                        </div>
                    </AccordionItem>

                    {/* Revenue */ }
                    <AccordionItem value="revenue" className="border-b">
                        <AccordionTrigger className="py-2">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z" fill="currentColor" />
                                    <path d="M15.5 15.25H8.5C8.09 15.25 7.75 14.91 7.75 14.5C7.75 14.09 8.09 13.75 8.5 13.75H15.5C15.91 13.75 16.25 14.09 16.25 14.5C16.25 14.91 15.91 15.25 15.5 15.25Z" fill="currentColor" />
                                    <path d="M12 18.25C11.59 18.25 11.25 17.91 11.25 17.5V11.5C11.25 11.09 11.59 10.75 12 10.75C12.41 10.75 12.75 11.09 12.75 11.5V17.5C12.75 17.91 12.41 18.25 12 18.25Z" fill="currentColor" />
                                    <path d="M12 8.25C11.59 8.25 11.25 7.91 11.25 7.5V6.5C11.25 6.09 11.59 5.75 12 5.75C12.41 5.75 12.75 6.09 12.75 6.5V7.5C12.75 7.91 12.41 8.25 12 8.25Z" fill="currentColor" />
                                </svg>
                                <span className="font-medium">Revenue</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="py-2 space-y-2">
                                <div className="space-y-1">
                                    { [ '$0 - $1M', '$1M - $10M', '$10M - $50M', '$50M - $100M', '$100M - $500M', '$500M - $1B', '$1B+' ].map( ( revenue ) => (
                                        <div key={ revenue } className="flex items-center">
                                            <input type="checkbox" id={ `revenue-${ revenue }` } className="mr-2" />
                                            <label htmlFor={ `revenue-${ revenue }` } className="text-sm">{ revenue }</label>
                                        </div>
                                    ) ) }
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Funding */ }
                    <AccordionItem value="funding" className="border-b">
                        <AccordionTrigger className="py-2">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z" fill="currentColor" />
                                    <path d="M12 14.75C9.66 14.75 7.75 12.84 7.75 10.5C7.75 8.16 9.66 6.25 12 6.25C14.34 6.25 16.25 8.16 16.25 10.5C16.25 12.84 14.34 14.75 12 14.75ZM12 7.75C10.48 7.75 9.25 8.98 9.25 10.5C9.25 12.02 10.48 13.25 12 13.25C13.52 13.25 14.75 12.02 14.75 10.5C14.75 8.98 13.52 7.75 12 7.75Z" fill="currentColor" />
                                    <path d="M8.42 18.75C8.01 18.75 7.67 18.41 7.67 18V17.5C7.67 16.42 8.54 15.55 9.62 15.55H14.37C15.45 15.55 16.32 16.42 16.32 17.5V18C16.32 18.41 15.98 18.75 15.57 18.75C15.16 18.75 14.82 18.41 14.82 18V17.5C14.82 17.25 14.62 17.05 14.37 17.05H9.62C9.37 17.05 9.17 17.25 9.17 17.5V18C9.17 18.41 8.84 18.75 8.42 18.75Z" fill="currentColor" />
                                </svg>
                                <span className="font-medium">Funding</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="py-2 space-y-2">
                                <div className="space-y-1">
                                    { [ 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Private Equity', 'IPO', 'Acquired' ].map( ( funding ) => (
                                        <div key={ funding } className="flex items-center">
                                            <input type="checkbox" id={ `funding-${ funding }` } className="mr-2" />
                                            <label htmlFor={ `funding-${ funding }` } className="text-sm">{ funding }</label>
                                        </div>
                                    ) ) }
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Technology */ }
                    <AccordionItem value="technology" className="border-b">
                        <AccordionTrigger className="py-2">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 16.5C9.93 16.5 8.25 14.82 8.25 12.75V11.25C8.25 9.18 9.93 7.5 12 7.5C14.07 7.5 15.75 9.18 15.75 11.25V12.75C15.75 14.82 14.07 16.5 12 16.5ZM12 9C10.76 9 9.75 10.01 9.75 11.25V12.75C9.75 13.99 10.76 15 12 15C13.24 15 14.25 13.99 14.25 12.75V11.25C14.25 10.01 13.24 9 12 9Z" fill="currentColor" />
                                    <path d="M15.21 21.75C14.97 21.75 14.72 21.68 14.51 21.54L12.01 19.91L9.51 21.54C9.11 21.8 8.61 21.83 8.17 21.6C7.74 21.38 7.46 20.95 7.46 20.46V16.45C7.14 16.26 6.84 16.04 6.56 15.78C5.47 14.76 4.85 13.38 4.85 11.91V11.25C4.85 10.84 5.19 10.5 5.6 10.5C6.01 10.5 6.35 10.84 6.35 11.25V11.91C6.35 12.96 6.79 13.93 7.59 14.68C7.85 14.92 8.14 15.11 8.45 15.25C8.82 15.42 9.05 15.79 9.05 16.2V19.59L10.99 18.33C11.29 18.14 11.66 18.14 11.96 18.33L13.9 19.59V16.2C13.9 15.79 14.13 15.42 14.5 15.25C14.81 15.11 15.1 14.92 15.36 14.68C16.16 13.93 16.6 12.96 16.6 11.91V11.25C16.6 10.84 16.94 10.5 17.35 10.5C17.76 10.5 18.1 10.84 18.1 11.25V11.91C18.1 13.38 17.48 14.76 16.39 15.78C16.11 16.04 15.81 16.26 15.49 16." fill="currentColor" />
                                </svg>
                            </div>
                        </AccordionTrigger>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}
