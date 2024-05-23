import { FormulaView } from '../index.mathlive';
import { convertLatexToMarkup } from 'mathlive';
import * as fs from 'fs';
import * as path from 'path';

const placeholderRegexp = /#0/g;
const formulaView = new FormulaView();
const tabIconsLatex = formulaView.formulaTabs.map( ( { latexIcons } ) => latexIcons ).flat();
const formulaIconsLatex = Array.from( Object.entries( formulaView.formulaMap ) )
	.map( ( [ _, value ] ) => value.flat() ).flat();

const latexMarkupMap = [ ...tabIconsLatex, ...formulaIconsLatex ].reduce( ( result, latex ) => ( {
	...result,
	[ latex ]: convertLatexToMarkup( latex.replace( placeholderRegexp, '▢' ) )
} ), {} );

const filePath = path.resolve( __dirname, 'latexMarkupMap.ts' );

writeFile( filePath, latexMarkupMap );

async function writeFile( filename: any, writedata: any ) {
	try {
		await fs.promises.writeFile( filename, `export default ${
			JSON.stringify( writedata, null, 4 )
		};`, 'utf8' );
		console.log( 'latexMarkupMap.ts was successfully generated' );
	} catch ( err ) {
		console.log( 'not able to write data in the file ' );
	}
}
