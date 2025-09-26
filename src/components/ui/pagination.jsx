"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";

const Pagination = ( {
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange,
    onItemsPerPageChange,
    itemsPerPageOptions = [ 10, 25, 50, 100 ],
} ) => {
    const [ pageInput, setPageInput ] = useState( currentPage.toString() );
    const [ totalPages, setTotalPages ] = useState( Math.ceil( totalItems / itemsPerPage ) );

    useEffect( () => {
        setTotalPages( Math.ceil( totalItems / itemsPerPage ) );
    }, [ totalItems, itemsPerPage ] );

    useEffect( () => {
        setPageInput( currentPage.toString() );
    }, [ currentPage ] );

    const handlePageInputChange = ( e ) => {
        setPageInput( e.target.value );
    };

    const handlePageInputSubmit = ( e ) => {
        e.preventDefault();
        const page = Number.parseInt( pageInput, 10 );
        if ( !isNaN( page ) && page >= 1 && page <= totalPages ) {
            onPageChange( page );
        } else {
            setPageInput( currentPage.toString() );
        }
    };

    const goToPage = ( page ) => {
        if ( page >= 1 && page <= totalPages ) {
            onPageChange( page );
        }
    };

    const renderPageButtons = () => {
        const pageButtons = [];

        if ( totalPages <= 7 ) {
            // Show all page buttons if there are 7 or fewer pages
            for ( let i = 1; i <= totalPages; i++ ) {
                pageButtons.push(
                    <Button
                        key={ i }
                        variant={ currentPage === i ? "default" : "outline" }
                        size="sm"
                        className={ `h-8 w-8 p-0 ${ currentPage === i ? "bg-blue-600" : "bg-sextary-800 border-neutral-700" }` }
                        onClick={ () => goToPage( i ) }
                    >
                        { i }
                    </Button>,
                );
            }
        } else {
            // Always show first two pages
            for ( let i = 1; i <= 2; i++ ) {
                pageButtons.push(
                    <Button
                        key={ i }
                        variant={ currentPage === i ? "default" : "outline" }
                        size="sm"
                        className={ `h-8 w-8 p-0 ${ currentPage === i ? "bg-blue-600" : "bg-sextary-800 border-neutral-700" }` }
                        onClick={ () => goToPage( i ) }
                    >
                        { i }
                    </Button>,
                );
            }

            // Add ellipsis with dropdown if needed
            if ( currentPage > 4 ) {
                pageButtons.push(
                    <Popover key="ellipsis-start">
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-sextary-800 border-neutral-700">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2 bg-sextary-800 border-neutral-700">
                            <form onSubmit={ handlePageInputSubmit } className="mb-2">
                                <div className="flex space-x-2">
                                    <Input
                                        type="number"
                                        min={ 1 }
                                        max={ totalPages }
                                        value={ pageInput }
                                        onChange={ handlePageInputChange }
                                        className="h-8 bg-sextary-700 border-neutral-600 text-white"
                                    />
                                    <Button type="submit" size="sm" className="h-8 bg-blue-600">
                                        Go
                                    </Button>
                                </div>
                            </form>
                            <div className="max-h-48 overflow-y-auto grid grid-cols-3 gap-1">
                                { Array.from( { length: totalPages }, ( _, i ) => i + 1 )
                                    .filter( ( page ) => page > 2 && page < totalPages - 1 )
                                    .map( ( page ) => (
                                        <Button
                                            key={ page }
                                            variant={ currentPage === page ? "default" : "outline" }
                                            size="sm"
                                            className={ `h-8 w-full p-0 ${ currentPage === page ? "bg-blue-600" : "bg-sextary-700 border-neutral-600" }` }
                                            onClick={ () => goToPage( page ) }
                                        >
                                            { page }
                                        </Button>
                                    ) ) }
                            </div>
                        </PopoverContent>
                    </Popover>,
                );
            }

            // Show current page and surrounding pages
            if ( currentPage > 3 && currentPage < totalPages - 2 ) {
                pageButtons.push(
                    <Button key={ currentPage } variant="default" size="sm" className="h-8 w-8 p-0 bg-blue-600">
                        { currentPage }
                    </Button>,
                );
            }

            // Add ellipsis with dropdown if needed
            if ( currentPage < totalPages - 3 ) {
                pageButtons.push(
                    <Popover key="ellipsis-end">
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-sextary-800 border-neutral-700">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2 bg-sextary-800 border-neutral-700">
                            <form onSubmit={ handlePageInputSubmit } className="mb-2">
                                <div className="flex space-x-2">
                                    <Input
                                        type="number"
                                        min={ 1 }
                                        max={ totalPages }
                                        value={ pageInput }
                                        onChange={ handlePageInputChange }
                                        className="h-8 bg-sextary-700 border-neutral-600 text-white"
                                    />
                                    <Button type="submit" size="sm" className="h-8 bg-blue-600">
                                        Go
                                    </Button>
                                </div>
                            </form>
                            <div className="max-h-48 overflow-y-auto grid grid-cols-3 gap-1">
                                { Array.from( { length: totalPages }, ( _, i ) => i + 1 )
                                    .filter( ( page ) => page > 2 && page < totalPages - 1 )
                                    .map( ( page ) => (
                                        <Button
                                            key={ page }
                                            variant={ currentPage === page ? "default" : "outline" }
                                            size="sm"
                                            className={ `h-8 w-full p-0 ${ currentPage === page ? "bg-blue-600" : "bg-sextary-700 border-neutral-600" }` }
                                            onClick={ () => goToPage( page ) }
                                        >
                                            { page }
                                        </Button>
                                    ) ) }
                            </div>
                        </PopoverContent>
                    </Popover>,
                );
            }

            // Always show last two pages
            for ( let i = totalPages - 1; i <= totalPages; i++ ) {
                pageButtons.push(
                    <Button
                        key={ i }
                        variant={ currentPage === i ? "default" : "outline" }
                        size="sm"
                        className={ `h-8 w-8 p-0 ${ currentPage === i ? "bg-blue-600" : "bg-sextary-800 border-neutral-700" }` }
                        onClick={ () => goToPage( i ) }
                    >
                        { i }
                    </Button>,
                );
            }
        }

        return pageButtons;
    };

    // Calculate the range of items being displayed
    const startItem = ( currentPage - 1 ) * itemsPerPage + 1;
    const endItem = Math.min( currentPage * itemsPerPage, totalItems );

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
                <Select
                    value={ itemsPerPage.toString() }
                    onValueChange={ ( value ) => onItemsPerPageChange( Number.parseInt( value, 10 ) ) }
                >
                    <SelectTrigger className="w-20 h-8 bg-sextary-800 border-neutral-700 text-white text-xs">
                        <SelectValue placeholder="Per page" />
                    </SelectTrigger>
                    <SelectContent className="bg-sextary-800 border-neutral-700 text-white">
                        { itemsPerPageOptions.map( ( option ) => (
                            <SelectItem key={ option } value={ option.toString() }>
                                { option }
                            </SelectItem>
                        ) ) }
                    </SelectContent>
                </Select>

                <div className="text-xs text-neutral-400">
                    Page { currentPage } of { totalPages } | Showing { startItem }-{ endItem } of { totalItems } items
                </div>
            </div>

            <div className="flex items-center space-x-1">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-sextary-800 border-neutral-700"
                    onClick={ () => goToPage( 1 ) }
                    disabled={ currentPage === 1 }
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-sextary-800 border-neutral-700"
                    onClick={ () => goToPage( currentPage - 1 ) }
                    disabled={ currentPage === 1 }
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center space-x-1 mx-1">{ renderPageButtons() }</div>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-sextary-800 border-neutral-700"
                    onClick={ () => goToPage( currentPage + 1 ) }
                    disabled={ currentPage === totalPages }
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-sextary-800 border-neutral-700"
                    onClick={ () => goToPage( totalPages ) }
                    disabled={ currentPage === totalPages }
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default Pagination



/*  import * as React from "react";
    import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

    import { cn } from "@/lib/utils";
    import { buttonVariants } from "@/components/ui/button";

    const Pagination = ( {
        className,
        ...props
    } ) => (
        <nav
            role="navigation"
            aria-label="pagination"
            className={ cn( "mx-auto flex w-full justify-center", className ) }
            { ...props } />
    );
    Pagination.displayName = "Pagination";

    const PaginationContent = React.forwardRef( ( { className, ...props }, ref ) => (
        <ul
            ref={ ref }
            className={ cn( "flex flex-row items-center gap-1", className ) }
            { ...props } />
    ) );
    PaginationContent.displayName = "PaginationContent";

    const PaginationItem = React.forwardRef( ( { className, ...props }, ref ) => (
        <li ref={ ref } className={ cn( "", className ) } { ...props } />
    ) );
    PaginationItem.displayName = "PaginationItem";

    const PaginationLink = ( {
        className,
        isActive,
        size = "icon",
        ...props
    } ) => (
        <a
            aria-current={ isActive ? "page" : undefined }
            className={ cn( buttonVariants( {
                variant: isActive ? "outline" : "ghost",
                size,
            } ), className ) }
            { ...props } />
    );
    PaginationLink.displayName = "PaginationLink";

    const PaginationPrevious = ( {
        className,
        ...props
    } ) => (
        <PaginationLink
            aria-label="Go to previous page"
            size="default"
            className={ cn( "gap-1 pl-2.5", className ) }
            { ...props }>
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
        </PaginationLink>
    );
    PaginationPrevious.displayName = "PaginationPrevious";

    const PaginationNext = ( {
        className,
        ...props
    } ) => (
        <PaginationLink
            aria-label="Go to next page"
            size="default"
            className={ cn( "gap-1 pr-2.5", className ) }
            { ...props }>
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
        </PaginationLink>
    );
    PaginationNext.displayName = "PaginationNext";

    const PaginationEllipsis = ( {
        className,
        ...props
    } ) => (
        <span
            aria-hidden
            className={ cn( "flex h-9 w-9 items-center justify-center", className ) }
            { ...props }>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More pages</span>
        </span>
    );
    PaginationEllipsis.displayName = "PaginationEllipsis";

    export {
        Pagination,
        PaginationContent,
        PaginationEllipsis,
        PaginationItem,
        PaginationLink,
        PaginationNext,
        PaginationPrevious,
    };

*/
