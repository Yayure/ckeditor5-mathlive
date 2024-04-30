import MathliveCommand from './mathlivecommand';
import { type Editor, Plugin } from 'ckeditor5/src/core';
import {
	toWidget,
	Widget,
	viewToModelPositionOutsideModelElement
} from 'ckeditor5/src/widget';
import { extractDelimiters, styleObjectToCssString } from './utils';
import type { DowncastWriter, Element } from 'ckeditor5/src/engine';
import { CKEditorError, global } from 'ckeditor5/src/utils';
import MathlivePanelView from './ui/panel/index.mathlive';

export default class MathliveEditing extends Plugin {
	public static get requires() {
		return [ Widget ] as const;
	}

	public static get pluginName() {
		return 'MathliveEditing' as const;
	}

	constructor( editor: Editor ) {
		super( editor );
		editor.config.define( 'mathlive', {
			renderMathPanel: element => {
				let panelView: MathlivePanelView | null = new MathlivePanelView();

				panelView.mount( element );

				return () => {
					panelView?.unmount();
					panelView = null;
				};
			},
			renderMathTex: ( equation, element ) => {
				const config = this.editor.config.get( 'mathlive' );

				const document = global.document;
				const mathFieldWrapper = document.createElement( 'span' );
				mathFieldWrapper.className = 'ck-math-field';
				const mathField = document.createElement( 'math-field' );
				mathField.setAttribute( 'read-only', '' );
				const inlineStyle = config?.mathFieldStyle ? styleObjectToCssString( config.mathFieldStyle ) : '';
				mathField.setAttribute( 'style', inlineStyle );

				mathField.innerText = equation;
				mathFieldWrapper.appendChild( mathField );
				element.appendChild( mathFieldWrapper );
			},
			engine: 'mathlive',
			mathFieldStyle: {
				display: 'inline-block',
				padding: '0',
				border: 'none',
				color: 'inherit',
				backgroundColor: 'inherit'
			},
			className: 'ck-mathlive-tex'
		} );
	}

	public init(): void {
		const editor = this.editor;
		editor.commands.add( 'mathlive', new MathliveCommand( editor ) );

		this._defineSchema();
		this._defineConverters();

		editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement(
				editor.model,
				viewElement => viewElement.hasClass( 'math' )
			)
		);
	}

	private _defineSchema() {
		const schema = this.editor.model.schema;
		schema.register( 'mathlive-mathtex', {
			allowWhere: '$text',
			isInline: true,
			isObject: true,
			allowAttributes: [ 'alignment', 'fontSize', 'fontColor', 'fontBackgroundColor', 'equation', 'engine' ]
		} );
	}

	private _defineConverters() {
		const conversion = this.editor.conversion;
		const mathliveConfig = this.editor.config.get( 'mathlive' )!;

		// View -> Model
		conversion
			.for( 'upcast' )
			// (e.g. <span class="ck-mathlive-tex">\( \sqrt{\frac{a}{b}} \)</span>)
			.elementToElement( {
				view: {
					name: 'span',
					classes: [ mathliveConfig.className! ]
				},
				model: ( viewElement, { writer } ) => {
					const child = viewElement.getChild( 0 );
					if ( child?.is( '$text' ) ) {
						const equation = child.data.trim();

						const params = Object.assign( extractDelimiters( equation ), {
							engine: mathliveConfig.engine
						} );

						return writer.createElement(
							'mathlive-mathtex',
							params
						);
					}

					return null;
				}
			} );

		// Model -> View (element)
		conversion
			.for( 'editingDowncast' )
			.elementToElement( {
				model: 'mathlive-mathtex',
				view: ( modelItem, { writer } ) => {
					const widgetElement = createMathtexEditingView(
						modelItem,
						writer
					);
					return toWidget( widgetElement, writer );
				}
			} );

		// Model -> Data
		conversion
			.for( 'dataDowncast' )
			.elementToElement( {
				model: 'mathlive-mathtex',
				view: createMathtexView
			} );

		// Create view for editor
		function createMathtexEditingView(
			modelItem: Element,
			writer: DowncastWriter
		) {
			const equation = String( modelItem.getAttribute( 'equation' ) );

			const mathtexView = writer.createContainerElement(
				'span',
				{
					style: 'display: inline-block;',
					class: 'ck-mathlive-tex'
				}
			);

			const uiElement = writer.createUIElement(
				'div',
				null,
				function( domDocument ) {
					const domElement = this.toDomElement( domDocument );

					mathliveConfig.renderMathTex?.( equation, domElement );

					return domElement;
				}
			);

			writer.insert( writer.createPositionAt( mathtexView, 0 ), uiElement );

			return mathtexView;
		}

		// Create view for data
		function createMathtexView(
			modelItem: Element,
			{ writer }: { writer: DowncastWriter }
		) {
			const equation = modelItem.getAttribute( 'equation' );
			if ( typeof equation != 'string' ) {
				/**
				* Couldn't find equation on current element
				* @error missing-equation
				*/
				throw new CKEditorError( 'missing-equation', { pluginName: 'math' } );
			}

			const { className, engine, mathFieldStyle } = mathliveConfig;
			const mathFieldInlineStyle = mathFieldStyle ? styleObjectToCssString( mathFieldStyle ) : '';
			const mathtexView = writer.createContainerElement( 'span', {
				class: className,
				engine,
				...( engine === 'mathlive' && mathFieldInlineStyle ? {
					'math-field-style': mathFieldInlineStyle
				} : {} )
			} );

			writer.insert(
				writer.createPositionAt( mathtexView, 0 ),
				writer.createText( '\\(' + equation + '\\)' )
			);

			return mathtexView;
		}
	}
}
