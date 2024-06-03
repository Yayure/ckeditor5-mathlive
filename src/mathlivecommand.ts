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

		this.isEnabled = true;

		const value = selectedEquation?.getAttribute( 'equation' );
		this.value = typeof value === 'string' ? value : undefined;
	}
}

/**
 * MathlivePanelCommand used to communicate and interact with the panel ui.
 */
export class MathlivePanelCommand extends Command {
	public override value: string | undefined = undefined;
	public declare isOpen: boolean;
	public declare isMounted: boolean;

	public override destroy(): void {}

	constructor( editor: Editor ) {
		super( editor );

		this.set( 'isOpen', false );
		this.set( 'isMounted', false );
	}

	public override execute( mathPanelRoot: HTMLElement ): void {
		const editor = this.editor;
		const mathliveCommand = editor.commands.get( 'mathlive' ) as MathliveCommand;
		const mathliveConfig = editor.config.get( 'mathlive' )!;
		const body = global.document.body;

		if ( !mathliveConfig.renderMathPanel ) {
			console.warn( 'Please add the renderMathPanel configuration.' );
			return;
		}

		this.value = mathliveCommand?.value;

		const close = () => {
			body.removeChild( mathPanelRoot );
			this.isOpen = false;
			editor.editing.view.focus();

			if ( mathliveConfig.mathPanelDestroyOnClose ) {
				this.destroy();
				this.isMounted = false;
			}
		};

		if ( !this.isMounted ) {
			// Mount panel.
			const mathPanelRootDestroy = mathliveConfig.renderMathPanel( mathPanelRoot );

			// The panel has been mounted, and the listening panel inserts the formula.
			this.on( 'insert', ( eventInfo, equation = '' ) => {
				inesertEquationModal( editor, equation );
				close();
			} );

			// The panel has been mounted, monitoring the closing event operation.
			this.on( 'close', close );

			// Register Destroy.
			this.destroy = () => {
				this.stopListening();
				mathPanelRootDestroy?.();

				if ( body.contains( mathPanelRoot ) ) {
					body.removeChild( mathPanelRoot );
				}
			};

			this.isMounted = true;
			this.fire( 'mounted' );
		}

		if ( this.isOpen ) {
			// The panel has been mounted, and the panel is notified to update the value.
			this.fire( 'refocus', this.value );
		} else {
			// Open Panel.
			global.document.body.appendChild( mathPanelRoot );

			this.isOpen = true;

			this.fire( 'reopen', this.value );
		}
	}
}
