import MathliveCommand from './mathlivecommand';
import { type Editor, Plugin } from 'ckeditor5/src/core';
import {
	toWidget,
	Widget,
	viewToModelPositionOutsideModelElement
} from 'ckeditor5/src/widget';
import type { DowncastWriter, Element, ViewElement, Writer } from 'ckeditor5/src/engine';
import { CKEditorError } from 'ckeditor5/src/utils';

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
			mathPanelDestroyOnClose: false,
			openPanelWhenEquationSelected: false,
			processClass: 'tex2jax_process',
			processScriptType: 'math/tex',
			output: {
				type: 'script',
				attributes: {
					type: 'math/tex'
				}
			}
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
			allowAttributes: [ 'equation', 'alignment', 'fontSize', 'fontColor', 'fontBackgroundColor',
				'bold', 'linkHref', 'code' ]
		} );
	}

	private _defineConverters() {
		const conversion = this.editor.conversion;
		const mathliveConfig = this.editor.config.get( 'mathlive' )!;

		// View -> Model
		conversion
			.for( 'upcast' )
			// (e.g. <span class="tex2jax_process">\sqrt{\frac{a}{b}}</span>)
			.elementToElement( {
				view: {
					classes: [ mathliveConfig.processClass! ]
				},
				model: createMathtexModel
			} )
			// (e.g. <script type="math/tex">\sqrt{\frac{a}{b}}</script>)
			.elementToElement( {
				view: {
					name: 'script',
					attributes: {
						type: 'math/tex'
					}
				},
				model: createMathtexModel
			} );

		// Create view for Model
		function createMathtexModel(
			viewElement: ViewElement,
			{ writer }: { writer: Writer }
		) {
			const child = viewElement.getChild( 0 );
			if ( child?.is( '$text' ) ) {
				const equation = child.data.trim();

				return writer.createElement(
					'mathlive-mathtex',
					{
						equation
					}
				);
			}

			return null;
		}

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

			const mathFieldWrapper = writer.createContainerElement(
				'span',
				{
					class: 'ck-math-field'
				}
			);

			const mathField = writer.createContainerElement(
				'math-field',
				{
					'read-only': ''
				}
			);

			writer.insert(
				writer.createPositionAt( mathField, 0 ),
				writer.createText( equation )
			);

			writer.insert(
				writer.createPositionAt( mathFieldWrapper, 0 ),
				mathField
			);

			writer.insert(
				writer.createPositionAt( mathtexView, 0 ),
				mathFieldWrapper
			);

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
				// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
				throw new CKEditorError( 'missing-equation', { pluginName: 'mathlive' } );
			}

			const { output } = mathliveConfig;
			if ( output ) {
				const mathtexView = writer.createContainerElement( output.type, output.attributes );

				writer.insert(
					writer.createPositionAt( mathtexView, 0 ),
					writer.createText( equation )
				);

				return mathtexView;
			}
		}
	}
}
