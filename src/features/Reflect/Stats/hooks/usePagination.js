import { useState, useEffect, useMemo } from "react";

export function usePagination ( { items = [], initialPage = 1, initialItemsPerPage = 10 } ) {
  const [ currentPage, setCurrentPage ] = useState( initialPage );
  const [ itemsPerPage, setItemsPerPage ] = useState( initialItemsPerPage );

  // Reset to first page when items change
  useEffect( () => {
    setCurrentPage( 1 );
  }, [ items.length ] );

  const totalPages = useMemo( () => Math.max( 1, Math.ceil( items.length / itemsPerPage ) ), [ items.length, itemsPerPage ] );

  // Ensure current page is valid
  useEffect( () => {
    if ( currentPage > totalPages && totalPages > 0 ) {
      setCurrentPage( totalPages );
    }
  }, [ currentPage, totalPages ] );

  // Calculate paginated items
  const paginatedItems = useMemo( () => {
    const startIndex = ( currentPage - 1 ) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice( startIndex, endIndex );
  }, [ items, currentPage, itemsPerPage ] );

  // Calculate pagination info
  const paginationInfo = useMemo( () => {
    const startItem = items.length === 0 ? 0 : ( currentPage - 1 ) * itemsPerPage + 1;
    const endItem = Math.min( currentPage * itemsPerPage, items.length );

    return {
      startItem,
      endItem,
      totalItems: items.length,
      totalPages,
    };
  }, [ items.length, currentPage, itemsPerPage, totalPages ] );

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    paginatedItems,
    paginationInfo,
    totalPages,
  };
}
