import { Command, type Editor } from 'ckeditor5/src/core';
import { getSelectedMathModelWidget, inesertEquationModal } from './utils';
import { global } from 'ckeditor5/src/utils';

export default class MathliveCommand extends Command {
	public override value: string | undefined = undefined;

	public override execute(
		equation: string
	): void {
		const editor = this.editor;
		inesertEquationModal( editor, equation );
	}

	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;

		const selectedEquation = getSelectedMathModelWidget( selection );
		const value = selectedEquation?.getAttribute( 'equation' );
		this.value = typeof value === 'string' ? value : undefined;
	}
}

export class MathlivePanelCommand extends Command {
	public override value: string | undefined = undefined;
	public declare isOpen: boolean;

	constructor( editor: Editor ) {
		super( editor );

		this.set( 'isOpen', false );
	}

	public override execute( mathPanelRoot: HTMLElement ): void {
		const editor = this.editor;
		const mathliveCommand = editor.commands.get( 'mathlive' ) as MathliveCommand;
		const mathliveConfig = editor.config.get( 'mathlive' )!;
		let mathPanelRootUnmount: ( () => void ) | undefined = undefined;

		this.value = mathliveCommand?.value;

		if ( this.isOpen ) {
			this.fire( 'reopen', this.value );
		} else {
			global.document.body.appendChild( mathPanelRoot );

			mathPanelRootUnmount = mathliveConfig.renderMathPanel?.( mathPanelRoot );

			this.isOpen = true;
			this.stopListening();

			const onClose = () => {
				mathPanelRootUnmount?.();
				global.document.body.removeChild( mathPanelRoot );
				this.isOpen = false;
				editor.editing.view.focus();
			};

			this.on( 'insert', ( eventInfo, equation = '' ) => {
				inesertEquationModal( editor, equation );
				onClose();
			} );

			this.on( 'close', onClose );
		}
	}
}
