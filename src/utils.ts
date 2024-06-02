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
