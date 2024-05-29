import '../theme/mathlive.css';
import mathliveIcon from '../theme/icons/mathlive.svg';
import MathliveEditing from './mathliveediting';
import { ClickObserver } from 'ckeditor5/src/engine';
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
	public static get requires() {
		return [ MathliveEditing ] as const;
	}

	public static get pluginName() {
		return 'MathliveUI' as const;
	}

	public mathPanelRoot: ( HTMLElement & pluginScopeType ) | null = null;
	public mathPanelRootUnmount: ( () => void ) | undefined = undefined;

	public init(): void {
		const editor = this.editor;
		editor.editing.view.addObserver( ClickObserver );

		this._createToolbarMathButton();

		this._createMathPanelRoot();

		this._enableUserPopupsInteractions();

		this._listenEditorEvents();
	}

	public _showUI(): void {
		if ( !this.mathPanelRoot ) {
			return;
		}

		const panelCommand = this.mathPanelRoot[ pluginScopeName ].panelCommand;

		panelCommand.execute( this.mathPanelRoot );
	}

	public _hideUI(): void {
		if ( !this.mathPanelRoot ) {
			return;
		}

		const panelCommand = this.mathPanelRoot[ pluginScopeName ].panelCommand;

		panelCommand.fire( 'close' );
	}

	private _createToolbarMathButton() {
		const editor = this.editor;
		const mathliveCommand = editor.commands.get( 'mathlive' );
		if ( !mathliveCommand ) {
			/**
			 * Mathlive command not found
			 * @error plugin-load
			 */
			// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
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

	private _enableUserPopupsInteractions() {
		const editor = this.editor;
		const mathliveConfig = editor.config.get( 'mathlive' )!;
		const viewDocument = editor.editing.view.document;
		this.listenTo( viewDocument, 'click', () => {
			const mathliveCommand = editor.commands.get( 'mathlive' );
			if ( mathliveConfig.openPanelWhenTexSelected && mathliveCommand?.isEnabled && mathliveCommand.value ) {
				this._showUI();
			}
		} );
	}

	private _listenEditorEvents() {
		const editor = this.editor;

		editor.on( 'change:isReadOnly', ( evt, propertyName, isReadOnly ) => {
			if ( isReadOnly ) {
				this._hideUI();
			}
		} );

		editor.on( 'destroy', () => {
			this._hideUI();
		} );
	}
}
