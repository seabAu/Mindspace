import React, { useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Pagination from "@/components/ui/pagination";
import { usePagination } from "@/features/Reflect/Stats/hooks/usePagination";
import { Checkbox } from "@/components/ui/checkbox";
import IndeterminateCheckbox from "@/components/Input/IndeterminateCheckbox";
import { twMerge } from "tailwind-merge";
import useReflect from "@/lib/hooks/useReflect";
// import useReflectStore from "@/store/reflect.store";
import useStatsStore from "@/store/stats.store";
import { useReflectContext } from "@/features/Reflect/context/ReflectProvider";
import { invalid } from "@/lib/utilities/data";

const DataTable = ( {
    data = [],
    columns = [],
    actionBar = <></>,
    renderRow,
    onRowSelect,
    selectedRows = [],
    itemsPerPageOptions = [ 5, 10, 25, 50, 75, 100, 200 ],
    initialItemsPerPage = 25,
    className = "",
    emptyMessage = "No data available",
    isLoading = false,
    loadingMessage = "Loading data...",
    onDragStart,
    onDragEnd,
    onDragOver,
    enableDragAndDrop = false,
    sortConfig = {},
    handleSort = () => { },
} ) => {
    const {
        totalPages,
        currentPage, setCurrentPage,
        itemsPerPage, setItemsPerPage,
        paginatedItems,
        paginationInfo,
    } = usePagination( {
        items: data,
        initialPage: 1,
        initialItemsPerPage: initialItemsPerPage,
    } );

    const {
        statsData, setStatsData,
        activeStatsData, setActiveStatsData,
        addStats, updateStats, deleteStats,
    } = useReflectContext();

    const {
        dialogType, setDialogType,
        dialogData, setDialogData,
        dataSchema, setDataSchema,
        statsSchema, setStatsSchema,
        selectedData, setSelectedData,
        dialogDataType, setDialogDataType,
        dialogDataSchema, setDialogDataSchema,
        dialogInitialData, setDialogInitialData,

        buildDialog,
        handleGetSchemas,
        handleFetchAllStats,
        getSchemaForDataType,
        handleFetchStatsById,
        handleCloneStats,
        handleCreateStats,
        handleUpdateStats,
        handleDeleteStats,
    } = useReflect();

    const handleSelectAll = useCallback(
        ( checked ) => {
            if ( onRowSelect ) {
                if ( checked ) {
                    onRowSelect(
                        paginatedItems.map( ( item ) => item._id ),
                        true,
                    );
                } else {
                    onRowSelect(
                        paginatedItems.map( ( item ) => item._id ),
                        false,
                    );
                }
            }
        },
        [ paginatedItems, onRowSelect ],
    );

    const allSelected = paginatedItems.length > 0 && paginatedItems.every( ( item ) => selectedRows.includes( item._id ) );

    const someSelected =
        selectedRows.length > 0 && paginatedItems.some( ( item ) => selectedRows.includes( item._id ) ) && !allSelected;

    return (
        <div className={ `flex flex-col h-full overflow-hidden gap-2 p-2 w-full max-w-full min-w-full flex-1 border border-sextary-400 rounded-lg min-h-0 ${ className }` }>
            {/* Table header */ }
            <div className={ `flex flex-row flex-nowrap p-0 text-xs font-semibold text-primary-200` }>
                { onRowSelect && (
                    <div className={ `flex items-center justify-center py-2 px-2.5` }>
                        <IndeterminateCheckbox
                            checked={ allSelected }
                            indeterminate={ someSelected }
                            onCheckedChange={ handleSelectAll }
                            className={ `h-4 w-4` }
                        />
                    </div>
                ) }
                <div className={ `grid grid-cols-12 p-0 text-xs font-semibold text-primary-200 w-full` }>

                    { columns.map( ( column, index ) => (
                        // Headers
                        <div
                            key={ index }
                            className={ twMerge(
                                `flex justify-start items-center h-full w-full`,
                                column?.className ? column?.className : ( column?.span ? `col-span-${ String( column?.span ) }` : `col-span-2` ),
                                column?.headerClassName && column?.headerClassName,
                                `transition-all duration-300 ease-in-out hover:bg-washed-blue-900/10 hover:border-primary-300/20 border-transparent border-x-[0.125rem]`
                            ) }
                            onClick={ () => {
                                if ( column?.value !== null ) {
                                    handleSort( column?.value );
                                }
                            } }
                        >
                            { column?.header } { sortConfig.key === column?.value && ( sortConfig.direction === "asc" ? "↑" : "↓" ) }
                        </div>
                    ) ) }
                </div>
            </div>

            {/* Table body */ }
            <div className="flex-1 overflow-hidden rounded-lg flex flex-col min-h-0">
                <ScrollArea className={ `h-full` }>
                    {/* <div className={ `gap-2` }> */ }
                    { isLoading ? (
                        <div className={ `text-center py-4 text-primary-400` }>{ loadingMessage }</div>
                    ) : paginatedItems.length === 0 ? (
                        <div className={ `text-center py-4 text-primary-400` }>{ emptyMessage }</div>
                    ) : (
                        paginatedItems.map( ( item, index ) => (
                            (
                                item?._id !== null
                                && item?._id !== undefined
                                && typeof item?._id !== undefined
                                && String( !item?._id ).trim()
                            ) && (
                                <div
                                    id={ String( item?._id ) }
                                    key={ String( item?._id ) }
                                    className={ `flex items-center` }
                                    draggable={ enableDragAndDrop }
                                    onDragStart={ enableDragAndDrop ? ( e ) => onDragStart?.( e, index ) : undefined }
                                    onDragEnd={ enableDragAndDrop ? () => onDragEnd?.() : undefined }
                                    onDragOver={
                                        enableDragAndDrop
                                            ? ( e ) => {
                                                e.preventDefault();
                                                onDragOver?.( index );
                                            }
                                            : undefined
                                    }
                                >
                                    { onRowSelect && (
                                        <div className={ `w-8 min-h-8 flex justify-center items-center` } onClick={ () => { onRowSelect( [ item._id ], !selectedRows.includes( item._id ) ); } }>
                                            <Checkbox
                                                checked={ selectedRows.includes( item._id ) }
                                                onCheckedChange={ ( checked ) => onRowSelect( [ item._id ], checked ) }
                                                className={ `!h-4 !w-4` }
                                            />
                                        </div>
                                    ) }
                                    <div className={ `flex-1 rounded-xl px-[0.1rem] py-[0.1rem]` }>
                                        { renderRow( item, index ) }
                                    </div>
                                </div>
                            ) ) )
                    ) }
                    {/* </div> */ }
                </ScrollArea>

                {/* Pagination */ }
                <div className={ `px-2 py-2 bottom-0 shrink-0` }>
                    {/* { actionBar ? actionBar : <></> } */ }
                    {/* { data.length > 0 && ( */ }
                    <Pagination
                        totalItems={ paginationInfo.totalItems }
                        itemsPerPage={ itemsPerPage }
                        currentPage={ currentPage }
                        onPageChange={ setCurrentPage }
                        onItemsPerPageChange={ setItemsPerPage }
                        itemsPerPageOptions={ itemsPerPageOptions }
                    />
                    {/* ) } */ }
                </div>
            </div>
        </div>
    );
};

export default React.memo( DataTable )

