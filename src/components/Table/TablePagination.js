import React from "react";

function TablePagination ( props )
{
    const {
        numEntries,
        entriesPerPage,
        pageNum,
        changePage,
        tableID,
        debug = false,
    } = props;
    
    const getPageButtons = (dataLen, page, numPerPage) => {
        // if (debug) console.log("getPageButtons(): ", dataLen, page, numPerPage);
        let buttons = [];
        const numButtons = Math.ceil(dataLen / numPerPage);
        buttons.push(
            <li
                className=""
                id={`table-${tableID}-pagination-container-back`}
                key={`table-${tableID}-pagination-container-back`}>
                <button
                    id={`table-${tableID}-pagination-button-back`}
                    key={`table-${tableID}-pagination-button-back`}
                    className={`pagination-button`}
                    onClick={() => {
                        changePage(dataLen, +page - 1, numPerPage);
                    }}>
                    {`<<`}
                </button>
            </li>,
        );
        for (let i = 0; i < numButtons; i++) {
            if (Math.abs(i - page) < 3 || i === 0 || i === numButtons - 1) {
                buttons.push(
                    <li
                        className=""
                        id={`table-${tableID}-pagination-container-${i}`}
                        key={`table-${tableID}-pagination-container-${i}`}>
                        <button
                            id={`table-${tableID}-pagination-button-${i}`}
                            key={`table-${tableID}-pagination-button-${i}`}
                            className={`pagination-button ${
                                i === page ? "current-page-button" : ""
                            }`}
                            onClick={(event) => {
                                changePage(
                                    dataLen,
                                    i,
                                    numPerPage,
                                );
                            }}>
                            {i}
                        </button>
                    </li>,
                );
            }
        }
        buttons.push(
            <li
                className=""
                id={`table-${tableID}-pagination-container-next`}
                key={`table-${tableID}-pagination-container-next`}>
                <button
                    id={`table-${tableID}-pagination-button-next`}
                    key={`table-${tableID}-pagination-button-next`}
                    className={`pagination-button`}
                    onClick={() => {
                        changePage(dataLen, +page + 1, numPerPage);
                    }}>
                    {`>>`}
                </button>
            </li>,
        );
        return buttons;
    };

    return (
        <div className="table-pagination-container">
            {
                <ul className="table-pagination">
                    {getPageButtons(numEntries, pageNum, entriesPerPage)}
                </ul>
            }
            {
                <p className="table-pagination-info">
                    {`Viewing ${pageNum * entriesPerPage} to ${
                        pageNum * entriesPerPage + entriesPerPage - 1 >
                        numEntries
                            ? numEntries
                            : pageNum * entriesPerPage + entriesPerPage - 1
                    } of ${numEntries} entries found.`}
                </p>
            }
        </div>
    );
}

export default TablePagination;
