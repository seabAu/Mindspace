import React from "react";
import TablePagination from "./TablePagination";
// This will contain the table's pagination and stuff.
function TableFoot ( props ) {
    const {
        children,
        show = true,
        showChildren = false,
        tableID,
        tableHeadings,
        numEntries,
        entriesPerPage,
        pageNum,
        changePage,
        debug = false,
    } = props;
    return ( show ? (
        <tfoot className={ `tablefoot-scrollable` }>
            <tr colSpan={ `${ tableHeadings.length }` }>
                <td
                    colSpan={ `${ tableHeadings.length }` }
                    key={ `table-${ tableID }-footer` }
                    id={ `table-${ tableID }-footer` }
                    className={ `` }>
                    { numEntries > 0 && (
                        <TablePagination
                            tableID={ tableID }
                            numEntries={ numEntries }
                            entriesPerPage={ parseInt( entriesPerPage ) }
                            pageNum={ parseInt( pageNum ) }
                            changePage={ changePage }
                            debug={ debug }
                        />
                    ) }
                    {
                        showChildren && children ? children : <></>
                    }
                </td>
            </tr>
        </tfoot> ) : ( <></> )
    );
}

export default TableFoot;
