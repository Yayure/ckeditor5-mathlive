import '../theme/mathlive.css';
import mathliveIcon from '../theme/icons/mathlive.svg';
import { ButtonView } from 'ckeditor5/src/ui';
import { Plugin } from 'ckeditor5/src/core';
import { CKEditorError, global } from 'ckeditor5/src/utils';
import { MathlivePanelCommand } from './mathlivecommand';

const mathKeystroke = 'Ctrl+M';
const pluginScopeName = '_ckeditor5Mathlive';

interface pluginScopeType {
	[pluginScopeName]: {
		panelCommand: MathlivePanelCommand;
	};
}

export default class MathliveUI extends Plugin {
	public mathPanelRoot: ( HTMLElement & pluginScopeType ) | null = null;
	public mathPanelRootUnmount: ( () => void ) | undefined = undefined;

	public static get pluginName() {
		return 'MathliveUI' as const;
	}

	public init(): void {
		this._createToolbarMathButton();
		this._createMathPanelRoot();
	}

	public _showUI(): void {
		if ( !this.mathPanelRoot ) {
			return;
		}

		const panelCommand = this.mathPanelRoot[ pluginScopeName ].panelCommand;

		panelCommand.execute( this.mathPanelRoot );
	}

	private _createToolbarMathButton() {
		const editor = this.editor;
		const mathliveCommand = editor.commands.get( 'mathlive' );
		if ( !mathliveCommand ) {
			/**
			 * Mathlive command not found
			 * @error plugin-load
			 */
			throw new CKEditorError( 'plugin-load', { pluginName: 'mathlive' } );
		}
		const t = editor.t;

		// Handle the `Ctrl+M` keystroke and show the panel.
		editor.keystrokes.set( mathKeystroke, ( _keyEvtData, cancel ) => {
			// Prevent focusing the search bar in FF and opening new tab in Edge. #153, #154.
			cancel();

			this._showUI();
		} );

		this.editor.ui.componentFactory.add( 'mathlive', locale => {
			const button = new ButtonView( locale );

			button.label = t( 'Insert math' );
			button.icon = mathliveIcon;
			button.keystroke = mathKeystroke;
			button.tooltip = true;
			button.isToggleable = true;

			this.listenTo( button, 'execute', () => {
				this._showUI();
			} );

			return button;
		} );
	}

	private _createMathPanelRoot() {
		const editor = this.editor;

		const panelRoot = global.document.createElement(
			'div'
		) as unknown as HTMLElement & pluginScopeType;
		panelRoot.className = 'ck-mathlive-panelhook';

		panelRoot[ pluginScopeName ] = {
			panelCommand: new MathlivePanelCommand( editor )
		};

		this.mathPanelRoot = panelRoot;
	}
}
