import { FormulaView } from '../src/components/panelview';
import { convertLatexToMarkup } from 'mathlive';
import * as fs from 'fs';
import * as path from 'path';

const formulaView = new FormulaView();

const latexMarkupMap = formulaView.getConvertToIconMarkupLatex().reduce( ( result, { latex, iconLatex } ) => ( {
	...result,
	[ latex ]: convertLatexToMarkup( iconLatex )
} ), {} );

const filePath = path.resolve( __dirname, '../src/components/panelview/latexmarkupmap.ts' );

writeFile( filePath, latexMarkupMap );

async function writeFile( filename: string, writedata: { [ key: string ]: string } ) {
	try {
		await fs.promises.writeFile( filename, `export default ${
			JSON.stringify( writedata, null, 4 )
		};`, 'utf8' );
		console.log( 'latexmarkupmap.ts was successfully generated' );
	} catch ( err ) {
		console.log( 'not able to write data in the file ' );
	}
}
