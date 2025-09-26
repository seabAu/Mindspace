// This Takes JSON data and represents it in a variety of ways.
// Currently available:
// Table
// Droplist
// Card grid
// Form

// Yes, this is showing off just a little bit.

import React, { useState, useEffect } from "react";
import * as utils from 'akashatools';
import {
    /// Form,
    // Input,
    /// Button,
    // Checkbox,
    message,
} from "antd";

// Redux state management
import { useDispatch, useSelector } from "react-redux";
import { SetDebug, SetLoading, SetPortfolioData, SetBlogData, ReloadData } from "../../redux/rootSlice";
import axios from "axios";
import API from "../../api/api.js";
import Input from "../../components/Form/Input.js";
import FormList from "antd/es/form/FormList.js";
import { Form } from "../../components/Form/index.js";
import Tabs from "../../components/Tabs";

import {
    FaRegEdit,
    FaExpand,
    FaExpandArrowsAlt,
    FaFilter,
    FaEllipsisH,
    FaEllipsisV,
    // Icons for adding content
    FaPlusSquare,
    FaPlusCircle,
    FaPlus,
    // Icons for removing content
    FaWindowClose,
    FaTimesCircle,
    FaTimes,
    FaRedoAlt,
    // Icons for adjusting index
    FaSortDown,
    FaSortUp,
    FaSort,
    FaEdit,
    FaReadme,
    FaBookOpen,
    FaBook,
    FaRegWindowClose,
    FaWindowMaximize,
    FaWindowMinimize,
    FaThList,
    FaThLarge,
    FaTh,
    FaWpforms,
    FaTable,
} from "react-icons/fa";
import Button from "../../components/Button/index.js";
import Table from "../../components/Table/Table.js";
import Droplist from "../../components/Droplist/index.js";
import Section from "../Section/index.js";

// Testing ground for creating dynamic reactive forms.
/*
    These forms will replace all the ones used in the admin dashboard.
    They will accept a JSON object as their model, and construct a form based on that. 
        For each key-value pair: 
            If the value is a scalar, render a regular input based on the data type.
            If the value is an array of scalars,
            If the value is an array of objects, 
    The form component will keep track of the data entered into it in a global state array.
    Updating the data in the form triggers a search in the global dataset for that specific input's specific key and updating just that value. 
*/

function Dataviewer ( props ) {
    const {
        show = true,
        showChildren = true,
        children,
        datalabel,
        data = [],
        datamodel = [],
        datatype = "",
        layout = "grid",
        view = "list",
        config = {
            table: {},
            list: {}, // drolistplist: {},
            form: {},
            cardgrid: {},
        },
        styles,
        classes,
        debug = false,
    } = props;

    const displayOptions = [
        {
            layout: "list",
        },
        {
            layout: "table",
        },
        {
            layout: "cards",
        },
        {
            layout: "form",
        },
    ];

    const layoutOptions = [
        {
            layout: "list",
        },
        {
            layout: "flex",
        },
        {
            layout: "grid",
        },
        {
            layout: "mosaic",
        },
    ];

    const [ localLoading, setLocalLoading ] = React.useState( false );
    const [ renderData, setRenderData ] = React.useState( null );
    const [ dataView, setDataView ] = React.useState( view );
    const [ dataLayout, setDataLayout ] = React.useState( layout );

    // Initialize formData as a duplicate of formModel, and fill in each value.
    const [ loadForm, setLoadForm ] = React.useState( false );
    const [ formData, setFormData ] = React.useState( {} );

    useEffect( () => {
        // On initial mount, fetch posts.

        if ( debug ) console.log( "DataViewer.js :: data: ", data );
        setRenderData( data );
    }, [ data ] );

    useEffect( () => {
        if ( debug ) console.log( "DataViewer.js :: FormData is now = ", formData );
    }, [ formData ] );

    const dataViewerControls = [
        {
            name: "displayCards",
            label: "Cards",
            icon: <FaTable />,
            classes: ``,
            onClick: ( e ) => {
                setDataView( "cards" );
            },
        },
        {
            name: "displayForm",
            label: "Form",
            icon: <FaWpforms />,
            classes: ``,
            onClick: ( e ) => {
                setDataView( "form" );
            },
        },
        {
            name: "displayTable",
            label: "Table",
            icon: <FaTable />,
            classes: ``,
            onClick: ( e ) => {
                setDataView( "table" );
            },
        },
        {
            name: "displayGrid",
            label: "Grid",
            icon: <FaTh />,
            classes: `${ `` }`,
            onClick: ( e ) => {
                setDataLayout( "grid" );
            },
        },
        {
            name: "displayList",
            label: "List",
            icon: <FaThList />,
            classes: ``,
            onClick: ( e ) => {
                setDataLayout( "list" );
            },
        },
        {
            name: "displayFlex",
            label: "Flex",
            icon: <FaThLarge />, //FaJira
            classes: ``,
            onClick: ( e ) => {
                setDataLayout( "flex" );
            },
        },
        // {
        //     name: "postExpandBehavior",
        //     label: `${dataLayout === "Fill" ? "Overlay" : "Fill"}`,
        //     icon: dataLayout ? <FaWindowMaximize /> : <FaWindowMinimize />,
        //     classes: ``,
        //     onClick:(e) => {
        //         setDataLayout(dataLayout === "Fill" ? "Overlay" : "Fill");
        //     },
        // },
    ];

    const buildForm = ( initialData, onSubmitFunc ) => {
        return (
            <Form
                // initialData={portfolioData.about}
                // initialData={portfolioData.projects[0]}
                initialData={ initialData }
                onSubmit={ ( values ) => {
                    onSubmit( values );
                } }
                layout={ `block` }
                showViewport={ true }></Form>
        );
    };

    const buildFormComponents = ( input ) => {
        return utils.val.isObject( input ) ? (
            buildForm( input, ( values ) => {
                onSubmit( values );
            } )
        ) : utils.val.isArray( input ) ? (
            input.map( ( item, index ) => {
                return buildForm( item, ( values ) => {
                    onSubmit( values );
                } );
            } )
        ) : (
            <></>
        );
    };

    const buildTableComponents = ( input, rowActions, rowOnClick, cellOnClick, inputProps ) => {
        const buildTable = ( input, title, rowActions, rowOnClick, cellOnClick, inputProps ) => {
            if ( debug ) console.log( "DataViewer.js :: buildTable :: ", input, rowActions, rowOnClick, cellOnClick, inputProps );
            return (
                <Table
                    // isVisible={showTable}
                    // tableData={utils.val.isValidArray(input, true) ? input : [input]}
                    tableData={ input }
                    isFetching={ localLoading }
                    isFilterable={ true }
                    isSortable={ true }
                    dataName={ `Portfolio Database :: ${ title }` }
                    // setShowSidePanel={setShowSidePanel}
                    // setSidePanelID={setSidePanelID}
                    rowActions={
                        [
                            // {
                            //     name: `delete`,
                            //     type: `text`,
                            //     onClick: (rowIndex) => {
                            //         // nDelete(rowIndex);
                            //     },
                            // },
                        ]
                    }
                    { ...{
                        ...( cellOnClick ? { cellOnClick: cellOnClick } : {} ),
                    } }
                    { ...{
                        ...( rowOnClick ? { rowOnClick: rowOnClick } : {} ),
                    } }
                // cellOnClick={(cellIndex, cellData) => { cellOnClick(cellIndex, cellData); }}
                // rowOnClick={(rowIndex, rowData) => { console.log("Rowonclick triggered :: ", rowIndex, rowData); rowOnClick(rowIndex, rowData); }}
                />
            );
        };

        return utils.val.isObject( input ) ? (
            Object.keys( input ).map( ( key, index ) => {
                return buildTable( input[ key ], key, rowActions, rowOnClick, cellOnClick, inputProps );
            } )
        ) : utils.val.isValidArray( input, true ) ? (
            input.map( ( item, index ) => {
                return buildTable( item, index, rowActions, rowOnClick, cellOnClick, inputProps );
            } )
        ) : (
            <></>
        );
    };

    const buildDataViewer = ( input ) => {
        let viewer = [];

        return utils.val.isAO( input ) ? (
            <div className="data-viewer-container">
                <div className={ `button-controls` }>
                    <Button.Controls
                        show={ true }
                        controls={ dataViewerControls }
                    />
                </div>
                <div className={ `data-viewer` }>
                    { dataLayout === "list" ? (
                        <Droplist
                            label={ `${ `Data Viewer` }` }
                            data={ input }
                            showControls={ true }
                            expandable={ true }
                        />
                    ) : dataLayout === "table" ? (
                        buildTableComponents( input )
                    ) : dataLayout === "cards" ? (
                        buildFormComponents(
                            input,
                            [],
                            ( cellIndex, cellData ) => {
                                // console.log("Cellonclick triggered :: ", cellIndex, cellData);
                            },
                            ( rowIndex, rowData ) => {
                                // console.log("Rowonclick triggered :: ", rowIndex, rowData);
                            },
                        )
                    ) : dataLayout === "form" ? (
                        buildFormComponents(
                            input,
                            [],
                            ( cellIndex, cellData ) => {
                                // console.log("Cellonclick triggered :: ", cellIndex, cellData);
                            },
                            ( rowIndex, rowData ) => {
                                // console.log("Rowonclick triggered :: ", rowIndex, rowData);
                            },
                        )
                    ) : (
                        <></>
                    ) }
                </div>
            </div>
        ) : (
            <></>
        );
    };

    return (
        <Section
        // classes={`panel-form-container`}
        // onSubmit={onSubmit}
        // layout="vertical"
        // initialValues={{
        //     ...portfolioData.about,
        //     skills: portfolioData.about.skills.join(", "),
        // }}
        >
            { renderData && utils.val.isValidArray( renderData, true ) && (
                <div
                    className={ `data-viewer-container` }
                    label="Data Viewer"
                    key="9"
                    enabled={ true }
                    access={ "admin" }
                    style={ {
                        /* max-width: 100%; */
                        padding: `${ `0.25rem` }`,
                        margin: `${ `0 !important` }`,
                        display: `${ `flex` }`,
                        flexDirection: `${ `column` }`,
                        justifyContent: `${ `flex-start` }`,
                        alignItems: `${ `center` }`,
                        flex: `${ `1 1 auto` }`,
                    } }>
                    { buildDataViewer( data ) }
                </div>
            ) }
        </Section>
    );
}

export default Dataviewer;
