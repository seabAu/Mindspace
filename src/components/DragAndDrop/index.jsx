import React, { useEffect, useId, useState } from 'react';
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import * as utils from 'akashatools';
// import './Task.css';
import { DeleteIcon, Edit, Menu, Save, Trash, X } from 'lucide-react';
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';

const Draggable = ( props ) => {
    const {
        type = '',
        items = [], // Tasks provided by calling component. 
        setItems, // Func to call after changing the order of the provided items
        layout,
        options,
        children,
    } = props;

    const [ itemList, setItemList ] = useState( [] );

    useEffect( () => {
        setItemList( items );
    }, [ items ] );

    const moveItem = ( fromIndex, toIndex ) => {
        let updatedTasks = [ ...itemList ];
        let [ moved ] = updated.splice( fromIndex, 1 );

        // TODO :: Run through the updatedTasks list and update the index of all items. 
        moved.index = toIndex;
        updated.splice( toIndex, 0, moved );
        setItemList( updated );
        // Optionally, call an API to persist the updated order
    };

    // const buildTaskList = ( ts ) => {
    //     let elements = [];
    //     console.log( "TaskList :: buildTaskList :: ts = ", ts );
    //     if ( utils.val.isValidArray( ts, true ) ) {
    //         // We have an array of tasks to render.  
    //         ts.forEach( ( t, index ) => {
    //             // console.log( "TaskList :: buildTaskList :: ts = ", ts, " :: ", "t = ", t );
    //             if ( utils.val.isObject( t ) ) {
    //                 // Valid object. 
    //                 // The <Task /> component will do all the checking for required data points. 
    //                 elements.push(
    //                     <Tasks.Item
    //                         key={ t?._id }
    //                         index={ index }
    //                         task={ t }
    //                         moveTask={ moveTask }
    //                     />
    //                 );
    //             }
    //         } );
    //     }
    //     return (
    //         <div className={ `task-list h-full w-full mx-auto min-h-full max-h-full rounded-xl m-2 px-1 py-1 bg-quinaryAlt gap-2` }>
    //             { elements }
    //         </div>
    //     );
    // };

    return (
        <div className={ `list-container draggable-container` }>
            <DndProvider
                backend={ HTML5Backend }
            >
                {
                    utils.val.isValidArray( items, true ) && (
                        items.map( ( item, index ) => {
                            return (
                                <DraggableItem
                                    index={ index }
                                    moveItem={ moveItem }
                                    item={ {
                                        type: 'item',
                                        id: useId(),
                                        index: index,
                                        component: item,
                                    } }
                                />
                            );
                        } )
                    )
                    // children ? children : <></>
                }
            </DndProvider>
        </div>
    );
};

const DraggableItem = ( props ) => {
    const {
        item = {
            type: 'item',
            id: null,
            index: null,
            component: null,
            setItem: setItems
        },
        index = 0,
        options,
        moveItem, // Handler for drag and drop events.
    } = props;

    // DRAG AND DROP FUNCTIONALITY // 
    // Drag configuration
    const [ , dragRef ] = useDrag( {
        type: item?.type,
        item: {
            id: item?._id,
            index: item?.index
        },
    } );

    // Drop configuration
    const [ , dropRef ] = useDrop( {
        accept: item?.type,
        hover: ( draggedItem ) => {
            // console.log( "Task.Item :: useDrop :: draggedItem = ", draggedItem, " :: ", "index = ", index, " :: ", "draggedItem.index = ", draggedItem.index );
            if ( draggedItem?.index !== index ) {
                moveItem( draggedItem?.index, index );
                draggedItem?.index = index;
            }
        },
    } );

    return (
        <div className={ `item-container p-0 m-0` }>
            { item && utils.ao.has( item, 'component' )
                ? ( item?.component )
                : ( <></> )
            }
        </div>
    );
};

Draggable.DraggableItem = DraggableItem;

export default Draggable;
