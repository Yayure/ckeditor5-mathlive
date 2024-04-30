import type { Editor } from 'ckeditor5/src/core';
import type {
	Element as CKElement,
	DocumentSelection
} from 'ckeditor5/src/engine';

export function inesertEquationModal(
	editor: Editor,
	equation: string
): void {
	const model = editor.model;
	const selection = model.document.selection;
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && selectedElement.is( 'element', 'mathlive-mathtex' ) ) {
		model.change( writer => {
			const selectionAttributes = selection.getAttributes();
			const newAttributes: { [key: string]: string } = { equation };
			for ( const item of selectionAttributes ) {
				const [ key, value ] = item as [string, string];
				newAttributes[ key ] = value;
			}
			const mathtex = writer.createElement( 'mathlive-mathtex', newAttributes );
			model.insertContent( mathtex );
		} );
	} else {
		model.change( writer => {
			const mathtex = writer.createElement( 'mathlive-mathtex', { equation } );
			model.insertContent( mathtex );
		} );
	}
}

export function getSelectedMathModelWidget(
	selection: DocumentSelection
): null | CKElement {
	const selectedElement = selection.getSelectedElement();

	if (
		selectedElement &&
		selectedElement.is( 'element', 'mathlive-mathtex' )
	) {
		return selectedElement;
	}

	return null;
}

// Check if equation has delimiters.
export function hasDelimiters( text: string ): RegExpMatchArray | null {
	return text.match( /^(\\\[.*?\\\]|\\\(.*?\\\))$/ );
}

// Find delimiters count
export function delimitersCounts( text: string ): number | undefined {
	return text.match( /(\\\[|\\\]|\\\(|\\\))/g )?.length;
}

// Extract delimiters for the model
export function extractDelimiters( equation: string ): {
	equation: string;
} {
	equation = equation.trim();

	// Remove delimiters (e.g. \( \) or \[ \])
	const hasInlineDelimiters =
		equation.includes( '\\(' ) && equation.includes( '\\)' );
	const hasDisplayDelimiters =
		equation.includes( '\\[' ) && equation.includes( '\\]' );
	if ( hasInlineDelimiters || hasDisplayDelimiters ) {
		equation = equation.substring( 2, equation.length - 2 ).trim();
	}

	return {
		equation
	};
}

export function styleObjectToCssString( style: Partial<CSSStyleDeclaration> ): string {
	return Object.keys( style ).reduce( ( acc, key ) => (
		acc + key.split( /(?=[A-Z])/ ).join( '-' ).toLowerCase() + ':' + ( style as { [key: string]: string } )[ key ] + ';'
	), '' );
}
