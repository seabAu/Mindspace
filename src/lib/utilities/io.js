// Import and export helper functions. 


export const convertToCSV = ( data ) => {
    const array = typeof data !== 'object' ? JSON.parse( data ) : data;
    let str = '';

    for ( let i = 0; i < array.length; i++ ) {
        let line = '';
        for ( let index in array[ i ] ) {
            if ( line !== '' ) line += ',';
            line += array[ i ][ index ];
        }
        str += line + '\r\n';
    }
    return str;
};

export const downloadCSV = ( {
    headers,
    data,
    fileName,
    options
} ) => {
    // Convert the data array into a CSV string
    const csvString = [
        headers, // Specify your headers here
        ...data.map( item => (
            // Map your data fields accordingly.
            Object.keys( item ).map( ( k, i ) => ( item?.[ k ] ) )
            // [ item.field1, item.field2, item.field3 ]
        ) )
    ]
        .map( row => row.join( "," ) )
        .join( "\n" );

    // Create a Blob from the CSV string
    const blob = new Blob( [ csvString ], { type: 'text/csv' } );

    // Generate a download link and initiate the download
    const url = URL.createObjectURL( blob );
    const link = document.createElement( 'a' );
    link.href = url;
    link.download = fileName ? `${ fileName }.csv` : 'download.csv';
    document.body.appendChild( link );
    link.click();
    document.body.removeChild( link );
    URL.revokeObjectURL( url );
};

export const csvFileToArray = string => {
    const csvHeader = string.slice( 0, string.indexOf( "\n" ) ).split( "," );
    const csvRows = string.slice( string.indexOf( "\n" ) + 1 ).split( "\n" );

    const array = csvRows.map( i => {
        const values = i.split( "," );
        const obj = csvHeader.reduce( ( object, header, index ) => {
            object[ header ] = values[ index ];
            return object;
        }, {} );
        return obj;
    } );

    return array;
};

export const downloadJSON = ( { data, fileName } ) => {
    const jsonData = new Blob( [ JSON.stringify( data ) ], { type: 'application/json' } );
    const jsonURL = URL.createObjectURL( jsonData );
    const link = document.createElement( 'a' );
    link.href = jsonURL;
    link.download = fileName ? `${ fileName }.json` : 'download.json';
    document.body.appendChild( link );
    link.click();
    document.body.removeChild( link );
};