import { useMemo } from 'react';
import { filterItems } from '../utils/dataUtils';

/**
 * Custom hook for filtering data items
 * @param {Array} items - The data items to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered items
 */
export function useFilteredData ( items, filters ) {
  const filteredItems = useMemo(
    () => filterItems( items, filters ),
    [ items, filters ],
  );

  return filteredItems;
}
