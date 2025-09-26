import React from "react";
import { mkConfig, generateCsv, download } from "export-to-csv";
import * as utils from 'akashatools';
import Button from "../Button";

function TableDownload ( { dataName, tableData, downloadFileType, debug = false } ) {
	const options = {
		filename: `Portfolio_Data__${ dataName }`,
		fieldSeparator: ",",
		quoteStrings: '"',
		decimalSeparator: ".",
		showLabels: true,
		showTitle: true,
		title: `Portfolio_Data__${ dataName }`,
		useTextFile: false,
		useBom: true,
		useKeysAsHeaders: true,
		// headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
	};

	const download = ( data, filetype ) => {
		//// const flattenedData = utils.ao.flattenObjArray(data);
		//// const csvExporter = new ExportToCsv(options);
		//// csvExporter.generateCsv(flattenedData);
		// if ( debug ) console.log(
		//     "TableDownload: ",
		//     "\nData = ",
		//     data,
		//     "\nData has ",
		//     data.length,
		//     "elements.",
		//     "\nFlattenedData = ",
		//     flattenedData,
		//     "\nFlattenedData has ",
		//     flattenedData.length,
		//     "elements.",
		// );

		// Flatten the data to be usable, in the case of deep-nested object arrays.
		const flattenedData = utils.ao.flattenObjArray( data );

		// mkConfig merges your options with the defaults
		// and returns WithDefaults<ConfigOptions>
		const csvConfig = mkConfig( options );

		// Converts your Array<Object> to a CsvOutput string based on the configs
		const csv = generateCsv( csvConfig )( flattenedData );

		// Add a click handler that will run the `download` function.
		// `download` takes `csvConfig` and the generated `CsvOutput`
		// from `generateCsv`.
		download( csvConfig )( csv );

	};

	return (
		<div className="table-download-container">
			<Button
				classes="button"
				appearance={ 'control' }
				label={ "Download Results (CSV)" }
				onClick={ () => {
					download( tableData, downloadFileType );
				} } />
		</div>
	);
}

export default TableDownload;
