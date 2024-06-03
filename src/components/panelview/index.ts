/**
 * Based on mathlive,see more: https://cortexjs.io/mathlive/
 */
import type { MathfieldElement as MathfieldElementType } from 'mathlive';
import '../../../theme/panelview.css';
import latexIconMarkupMap from './latexmarkupmap';

interface PanelCommand {
	editor: {
		t: ( text: string ) => string;
	};
	value: string | undefined;
	off: ( event: 'mounted' | 'refocus' | 'reopen' ) => void;
	on( event: 'mounted', callback: () => void ): void;
	on( event: 'refocus' | 'reopen', callback: ( _: unknown, equation: string ) => void ): void;
	fire( event: 'close' ): void;
	fire( event: 'insert', equation: string ): void;
}

const pluginScopeName = '_ckeditor5Mathlive';

export default class PanelView {
	constructor() {
		this.setMathfieldElementConfig();
	}

	public equation = '';
	public destroy: () => void = () => {};

	public mount( hookContainer: HTMLElement ): void {
		// Get ckeditor5Mathlive panelCommand.
		const panelCommand = ( hookContainer as ( HTMLElement & { _ckeditor5Mathlive: { panelCommand: PanelCommand } } ) )[
			pluginScopeName
		].panelCommand;

		const translate = panelCommand.editor.t;

		this.equation = panelCommand.value || '';

		const container = this.render( translate );

		// Register draggable panel.
		const handle = container.querySelector( '.ck-mathlive-panel-handle' ) as HTMLDivElement;
		registerDragElement( container, handle );

		// Add interaction to the math-field element.
		const mathField = container.querySelector( '.ck-mathlive-panel-input math-field' ) as MathfieldElementType;

		mathField?.addEventListener( 'input', e => {
			this.equation = ( e.target as { value?: string } )?.value || '';
		} );
		mathField.setValue( this.equation );
		setTimeout( () => {
			mathField.focus();
		} );

		// Add interaction to confirm.
		const confirmButton = container.querySelector( '.ck-mathlive-panel-submit-confirm' ) as HTMLButtonElement;
		confirmButton.addEventListener( 'click', () => {
			panelCommand.fire( 'insert', this.equation );
		} );

		// Add interaction to cancel.
		const cancelButton = container.querySelector( '.ck-mathlive-panel-submit-cancel' ) as HTMLButtonElement;
		const closeButton = container.querySelector( '.ck-mathlive-panel-header-close' ) as HTMLDivElement;
		const onClose = () => {
			panelCommand.fire( 'close' );
		};
		cancelButton.addEventListener( 'click', onClose );
		closeButton.addEventListener( 'click', onClose );

		// Add FormulaView.
		const formulaContainer = container.querySelector( '.ck-mathlive-panel-formula' ) as HTMLDivElement;
		const formulaView = new FormulaView( {
			onMathTexClick: async ( equation, { before, after, customInsert } = {} ) => {
				try {
					await before?.( mathField );

					if ( customInsert ) {
						customInsert?.( mathField );
					} else {
						mathField.executeCommand( [ 'insert', equation ] );
					}

					after?.( mathField );
				} catch ( error ) {
					console.warn( error );
				}
			}
		} );
		formulaView.mount( formulaContainer );

		hookContainer?.appendChild( container );

		panelCommand.on( 'refocus', ( _, equation = '' ) => {
			this.equation = equation;
			mathField.setValue( equation );
			mathField.focus();
		} );

		panelCommand.on( 'reopen', ( _, equation = '' ) => {
			this.equation = equation;
			mathField.setValue( equation );
			mathField.focus();
		} );

		this.destroy = () => {
			formulaView.destroy();
			panelCommand.off( 'refocus' );
			panelCommand.off( 'reopen' );
			hookContainer?.removeChild( container );
		};
	}

	public render( translate: PanelCommand['editor']['t'] ): HTMLElement {
		const container = document.createElement( 'div' );
		container.className = 'ck-mathlive-panel';
		const html = `
			<div class="ck-mathlive-panel-header">
				<div class="ck-mathlive-panel-header-label ck-mathlive-panel-handle"></div>
				<div class="ck-mathlive-panel-header-actions">
					<div class="ck-mathlive-panel-header-close"></div>
				</div>
			</div>
			<div class="ck-mathlive-panel-content">
				<div class="ck-mathlive-panel-formula"></div>
				<div class="ck-mathlive-panel-input">
					<math-field></math-field>
				</div>
				<div class="ck-mathlive-panel-submit">
					<button class="ck-mathlive-panel-submit-confirm">${ translate( 'Insert' ) }</button>
					<button class="ck-mathlive-panel-submit-cancel">${ translate( 'Cancel' ) }</button>
				</div>
			</div>
		`;
		container.innerHTML = html.trim();
		return container;
	}

	public setMathfieldElementConfig(): void {
		if ( typeof window.MathfieldElement !== 'undefined' ) {
			// Disabled sounds of mathField.
			window.MathfieldElement.soundsDirectory = null;
		}
	}
}

export class FormulaView {
	constructor( props?: FormulaView['props'] ) {
		this.props = props;
	}

	public destroy: () => void = () => {};
	public hookContainer: HTMLElement | null = null;
	public props?: {
		onMathTexClick?: (
			equation: string,
			interceptor?: {
				before?: ( mathField: MathfieldElementType ) => Promise<void>;
				after?: ( mathField: MathfieldElementType ) => Promise<void>;
				customInsert?: ( mathField: MathfieldElementType ) => void;
			}
		) => void;
	} = undefined;
	public activeTabKey = 'SUPAndSUB-fraction-radical';
	public formulaTabs = [ {
		key: 'SUPAndSUB-fraction-radical',
		latexIcons: [ 'e^x', '\\frac{x}{y}', '\\sqrt[n]{x}' ]
	}, {
		key: 'integral-largeOperator',
		latexIcons: [ '\\int_{-x}^x\\nolimits', '\\sum_{i=0}^n\\displaylimits' ]
	}, {
		key: 'function-limitAndlogarithm',
		latexIcons: [ '\\sin{\\theta}', ' \\lim_{n\\rightarrow\\infty}' ]
	}, {
		key: 'matrix',
		latexIcons: [ '\\(\\begin{bmatrix}1 & 0\\\\0 & 1\\end{bmatrix}\\)' ]
	}, {
		key: 'bracket',
		latexIcons: [ '\\lbrace\\lparen\\rparen\\rbrace' ]
	}, {
		key: 'labelSymbol-operator',
		latexIcons: [ '\\ddot{a}', '≜' ]
	}, {
		key: 'specificSymbol',
		latexIcons: [ '\\Omega' ]
	}, {
		key: 'chemistry',
		latexIcons: [ '\\ce{H2O}' ]
	} ];
	public formulaMap: { [key: string]: Array<Array<string>> } = {
		'SUPAndSUB-fraction-radical': [
			[
				'#0^#0', '#0_#0', '#0_#0^#0', '{_#0^#0}{#0}', 'x_{y^2}', 'e^{-i\\omega t}', 'x^2', '{_1^n}Y',
				'a^2+b^2=c^2'
			],
			[
				'\\frac{#0}{#0}', '\\tfrac{#0}{#0}', '#0/#0', '\\frac{\\pi}{2}', '\\frac{dy}{dx}', '\\frac{\\Delta y}{\\Delta x}',
				'\\frac{\\partial y}{\\partial x}', '\\frac{\\delta y}{\\delta x}', '\\frac{1}{x^2 + 1}'
			],
			[
				'\\sqrt{#0}', '\\sqrt[#0]{#0}', '\\sqrt[2]{#0}', '\\sqrt[3]{#0}', '\\sqrt{a^2+b^2}',
				'\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}'
			]
		],
		'integral-largeOperator': [
			[
				'\\int #0', '\\int_{#0}^{#0} #0', '\\int_{#0}^{#0}\\displaylimits #0', '\\iint #0', '\\iint_{#0}^{#0} #0',
				'\\iint_{#0}^{#0}\\displaylimits #0', '\\iiint #0', '\\iiint_{#0}^{#0} #0', '\\iiint_{#0}^{#0}\\displaylimits #0',
				'\\oint #0', '\\oint_{#0}^{#0} #0', '\\oint_{#0}^{#0}\\displaylimits #0', '\\oiint #0', '\\oiint_{#0}^{#0} #0',
				'\\oiint_{#0}^{#0}\\displaylimits #0', '\\oiiint #0', '\\oiiint_{#0}^{#0} #0',
				'\\oiiint_{#0}^{#0}\\displaylimits #0'
			],
			[
				'\\sum #0', '\\sum_{#0}^{#0} #0', '\\sum_{#0}^{#0}\\nolimits #0', '\\sum_{#0} #0', '\\sum_{#0}\\nolimits #0',
				'\\prod #0', '\\prod_{#0}^{#0} #0', '\\prod_{#0}^{#0}\\nolimits #0', '\\prod_{#0} #0', '\\prod_{#0}\\nolimits #0',
				'\\coprod #0', '\\coprod_{#0}^{#0} #0', '\\coprod_{#0}^{#0}\\nolimits #0', '\\coprod_{#0} #0',
				'\\coprod_{#0}\\nolimits #0', '\\bigcup #0', '\\bigcup_{#0}^{#0} #0', '\\bigcup_{#0}^{#0}\\nolimits #0',
				'\\bigcup_{#0} #0', '\\bigcup_{#0}\\nolimits #0', '\\bigcap #0', '\\bigcap_{#0}^{#0} #0',
				'\\bigcap_{#0}^{#0}\\nolimits #0', '\\bigcap_{#0} #0', '\\bigcap_{#0}\\nolimits #0', '\\bigvee #0',
				'\\bigvee_{#0}^{#0} #0', '\\bigvee_{#0}^{#0}\\nolimits #0', '\\bigvee_{#0} #0', '\\bigvee_{#0}\\nolimits #0',
				'\\bigwedge #0', '\\bigwedge_{#0}^{#0} #0', '\\bigwedge_{#0}^{#0}\\nolimits #0', '\\bigwedge_{#0} #0',
				'\\bigwedge_{#0}\\nolimits #0', '\\sum_{k}\\binom{n}{k}', '\\sum_{i=0}^{n} #0',
				'\\sum_{0\\le i \\le m \\atop 0 < j < n}P\\left(i,j\\right)', '\\prod_{k=1}^{n}A_k',
				'\\bigcup_{n=1}^{m}\\left(X_n\\cap Y_n\\right)'
			]
		],
		'function-limitAndlogarithm': [
			[
				'\\sin{#0}', '\\cos{#0}', '\\tan{#0}', '\\csc{#0}', '\\sec{#0}', '\\cot{#0}', '\\sin^{-1}{#0}', '\\cos^{-1}{#0}',
				'\\tan^{-1}{#0}', '\\csc^{-1}{#0}', '\\sec^{-1}{#0}', '\\cot^{-1}{#0}', '\\sinh{#0}', '\\cosh{#0}', '\\tanh{#0}',
				'\\coth{#0}', '\\sinh^{-1}{#0}', '\\cosh^{-1}{#0}', '\\tanh^{-1}{#0}', '\\coth^{-1}{#0}', '\\sin{\\theta}',
				'\\cos{2x}', '\\tan{\\theta}=\\frac{\\sin{\\theta}}{\\cos{\\theta}}'
			],
			[
				'\\log_#0{#0}', '\\log{#0}', '\\lim_{#0}{#0}', '\\min_{#0}{#0}', '\\max_{#0}{#0}', '\\ln{#0}',
				'\\lim_{n\\rightarrow\\infty}{\\left(1+\\frac{1}{n}\\right)^n}', '\\max_{0\\le x\\le 1}{xe^{-x^2}}'
			]
		],
		'matrix': [
			[
				'\\begin{matrix} #0 & #0 \\\\ \\end{matrix}', '\\begin{matrix} #0 \\\\ #0 \\\\ \\end{matrix}',
				'\\begin{matrix} #0 & #0 & #0 \\\\ \\end{matrix}', '\\begin{matrix} #0 \\\\ #0 \\\\ #0 \\\\ \\end{matrix}',
				'\\begin{matrix} #0 & #0 \\\\ #0 & #0 \\\\ \\end{matrix}',
				'\\begin{matrix} #0 & #0 & #0 \\\\ #0 & #0 & #0 \\\\ \\end{matrix}',
				'\\begin{matrix} #0 & #0 \\\\ #0 & #0 \\\\ #0 & #0 \\\\ \\end{matrix}',
				'\\begin{matrix} #0 & #0 & #0 \\\\ #0 & #0 & #0 \\\\ #0 & #0 & #0 \\\\ \\end{matrix}',
				'\\cdots', '\\ldots', '\\vdots', '\\ddots', '\\begin{matrix} 1 & 0 \\\\ 0 & 1 \\\\ \\end{matrix}',
				'\\begin{matrix} 1 & #0 \\\\ #0 & 1 \\\\ \\end{matrix}',
				'\\begin{matrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\\\ \\end{matrix}',
				'\\begin{matrix} 1 & #0 & #0 \\\\ #0 & 1 & #0 \\\\ #0 & #0 & 1 \\\\ \\end{matrix}',
				'\\left(\\begin{matrix} #0 & #0 \\\\ #0 & #0 \\\\ \\end{matrix}\\right)',
				'\\left[\\begin{matrix} #0 & #0 \\\\ #0 & #0 \\\\ \\end{matrix}\\right]',
				'\\left|\\begin{matrix} #0 & #0 \\\\ #0 & #0 \\\\ \\end{matrix}\\right|',
				'\\left\\Vert \\begin{matrix} #0 & #0 \\\\ #0 & #0 \\\\ \\end{matrix} \\right\\Vert',
				// eslint-disable-next-line max-len
				'\\left(\\begin{matrix} #0 & \\cdots & #0 \\\\ \\vdots & \\ddots & \\vdots \\\\ #0 & \\cdots & #0 \\\\ \\end{matrix}\\right)',
				// eslint-disable-next-line max-len
				'\\left[\\begin{matrix} #0 & \\cdots & #0 \\\\ \\vdots & \\ddots & \\vdots \\\\ #0 & \\cdots & #0 \\\\ \\end{matrix}\\right]'
			]
		],
		'bracket': [
			[
				'\\left( #0\\right)', '\\left[ #0\\right]', '\\left\\{ #0\\right\\}', '\\langle #0\\rangle',
				'\\left\\lfloor #0\\right\\rfloor', '\\left\\lceil #0\\right\\rceil', '\\left| #0\\right|', '\\left\\Vert #0\\right\\Vert',
				'\\left[ #0\\right[', '\\left] #0\\right]', '\\left] #0\\right[', '〚 #0〛', '\\left( #0\\middle| #0\\right)',
				'\\left\\{ #0\\middle| #0\\right\\}', '\\left\\langle #0\\middle| #0\\right\\rangle',
				'\\left\\langle #0\\middle| #0\\middle| #0\\right\\rangle', '\\left( #0\\right.', '\\left. #0\\right)',
				'\\left[ #0\\right.', '\\left. #0\\right]', '\\left\\{ #0\\right.', '\\left. #0\\right\\}',
				'\\left\\langle #0\\right.', '\\left. #0\\rangle\\right', '\\left\\lfloor #0\\right.', '\\left. #0\\right\\rfloor',
				'\\left\\lceil #0\\right.', '\\left. #0\\right\\rceil', '\\left| #0\\right.', '\\left. #0\\right|',
				'\\left\\Vert #0\\right.', '\\left. #0\\right\\Vert', '〚 #0', ' #0〛', '\\left\\{{{#0}\\atop{#0}}\\right.',
				'\\begin{cases}#0\\\\#0\\\\#0\\end{cases}', '#0 \\atop #0', '#0 \\choose #0', 'n \\choose k',
				'\\left\\langle{n\\atop k}\\right\\rangle', 'f\\left(x\\right)=\\left\\{{{-x,x<0}\\atop{\\enspace x,x\\geq0}}\\right.'
			]
		],
		'labelSymbol-operator': [
			[
				'\\dot{#0}', '\\ddot{#0}', '\\mathring{#0}', '\\hat{#0}', '\\check{#0}', '\\acute{#0}', '\\grave{#0}', '\\breve{#0}',
				'\\widetilde{#0}', '\\bar{#0}', '\\bar{\\bar{#0}}', '\\vec{#0}', '\\overbrace{#0}', '\\underbrace{#0}', '\\boxed{#0}',
				'\\boxed{a^2+b^2=c^2}', '\\overline{#0}', '\\overline{#0}', '\\underline{#0}', '\\overline{A}', '\\overline{ABC}',
				'\\overline{x\\oplus y}'
			],
			[
				'\\colon=', '==', '+=', '-=', '\\measeq', '\\eqdef', '≜', '\\overleftarrow{#0}', '\\overrightarrow{#0}',
				'\\underleftarrow{#0}', '\\underrightarrow{#0}', '\\overleftrightarrow{#0}', '\\underleftrightarrow{#0}',
				'\\Overrightarrow{#0}', '\\overleftharpoon{#0}', '\\overrightharpoon{#0}', '\\overlinesegment{#0}',
				'\\underlinesegment{#0}', '\\overgroup{#0}', '\\underrightarrow{yields}', '\\underrightarrow{∆}'
			]
		],
		'specificSymbol': [
			[
				'\\pm', '\\infty', '=', '\\neq', '\\thicksim', '\\times', '\\div', '!', '\\propto', '<', '\\ll', '>', '\\gg', '\\le',
				'\\geq', '\\mp', '\\cong', '\\approx', '\\equiv', '\\forall', '\\complement', '\\partial', '\\sqrt', '\\cup', '\\cap',
				'\\emptyset', '\\%', '°', '°F', '°C', '∆', '\\nabla', '\\exists', '\\nexists', '\\in', '\\ni', '\\gets', '\\uparrow',
				'\\rightarrow', '\\downarrow', '\\leftrightarrow', '\\therefore', '+', '-', '\\lnot', '\\alpha', '\\beta', '\\gamma',
				'\\delta', '\\varepsilon', '\\epsilon', '\\theta', '\\vartheta', '\\mu', '\\pi', '\\rho', '\\sigma', '\\tau',
				'\\varphi', '\\omega', '\\ast', '\\bullet', '\\vdots', '\\cdots', '⋰', '\\ddots', '\\aleph', '\\beth', '\\blacksquare'
			]
		],
		'chemistry': [
			[
				'\\ce{#0}', '\\overset{#0}{#0}', '#0_{#0}', '#0^{#0}', '#0_{#0}^{#0}', '[#0_{#0}]^{#0}', '^{#0}_{#0}#0^{#0}', '#0_{#0}#0',
				'#0^{#0}#0', '#0_{#0}#0_{#0}', '#0 #0_{#0}#0', '\\tfrac{#0}{#0} #0_{#0}#0', '\\ #0 \\ = \\ #0 \\ + \\ #0',
				'#0 \\ + \\ #0 \\ \\xlongequal[#0]{#0} \\ #0 \\ + \\ #0', '#0 \\ + \\ #0 \\ \\longrightarrow[#0]{#0} \\ #0 \\ + \\ #0',
				'#0 \\ + \\ #0 \\ \\xtofrom[#0]{#0} \\ #0 \\ + \\ #0', '#0 \\ + \\ #0 \\ \\xrightleftharpoons[#0]{#0} \\ #0 \\ + \\ #0',
				'\\overset{+4}{Mn}', 'MnO_{2}', 'H_{2}O', 'Sb_{2}O_{3}', 'Y^{99+}', '[AgCl_{2}]^{-}', 'CrO_{4}^{2-}', 'n H_{2}O',
				'\\tfrac{1}{2} H_{2}O', 'H^{3}HO', '^{227}_{90}Th^{+}'
			]
		]
	};

	public insertInterceptors: Array<{
		equations: Array<string>;
		before?: ( mathField: MathfieldElementType ) => Promise<void>;
		after?: ( mathField: MathfieldElementType ) => Promise<void>;
		customInsert?: ( mathField: MathfieldElementType ) => void;
	}> = [
		{
			equations: [ '\\dot{#0}', '\\ddot{#0}', '\\mathring{#0}', '\\hat{#0}', '\\check{#0}', '\\acute{#0}', '\\grave{#0}',
				'\\breve{#0}', '\\widetilde{#0}', '\\bar{#0}', '\\bar{\\bar{#0}}', '\\vec{#0}' ],
			before: ( mathField: MathfieldElementType ): Promise<void> => {
				if ( mathField.selectionIsCollapsed ) {
					mathField.executeCommand( 'extendSelectionBackward' );

					if ( !mathField.getValue( mathField.selection ) ) {
						return Promise.reject( 'Please select content.' );
					} else {
						setTimeout( () => {
							mathField.executeCommand( 'extendSelectionBackward' );
						} );
					}
				}

				return Promise.resolve();
			}
		},
		{
			equations: [ '\\ce{#0}' ],
			before: ( mathField: MathfieldElementType ): Promise<void> => {
				if ( mathField.selectionIsCollapsed ) {
					mathField.executeCommand( 'extendToGroupStart' );

					if ( !mathField.getValue( mathField.selection ) ) {
						return Promise.reject( 'Please select content.' );
					} else {
						setTimeout( () => {
							mathField.executeCommand( 'extendToGroupStart' );
						} );
					}
				}

				return Promise.resolve();
			}
		}
	];

	public mount( hookContainer: FormulaView['hookContainer'] ): void {
		this.hookContainer = hookContainer;

		const props = this.props;
		const container = this.render();

		const tabElements = container.querySelectorAll( '.ck-mathlive-formula-tab' );
		tabElements.forEach( element => {
			element.addEventListener( 'click', e => {
				const key = ( e.target as HTMLDivElement )?.getAttribute( 'key' ) || '';
				this.activeTabKey = key;
				this.remount();
			} );
		} );

		const texElements = container.querySelectorAll( '.ck-mathlive-formula-tex' );
		const insertInterceptors = this.insertInterceptors;
		texElements.forEach( element => {
			element.addEventListener( 'click', e => {
				const equation = ( e.target as HTMLDivElement )?.getAttribute( 'equation' ) || '';
				const { before, after, customInsert } = insertInterceptors
					.find( ( { equations } ) => equations.indexOf( equation ) > -1 ) || {};
				props?.onMathTexClick?.( equation, { before, after, customInsert } );
			} );
		} );

		hookContainer?.appendChild( container );

		this.destroy = () => {
			hookContainer?.removeChild( container );
		};
	}

	public remount(): void {
		this.destroy();

		this.mount( this.hookContainer );
	}

	public render(): HTMLElement {
		const container = document.createElement( 'div' );
		container.className = 'ck-mathlive-formula';
		const formulaTabs = this.formulaTabs;
		const activeTabKey = this.activeTabKey;
		const formulaRows = this.formulaMap[ activeTabKey ];
		const latexIconMarkupMap = this.getLatexIconMarkupMap();

		const html = `
			<div class="ck-mathlive-formula-toolbar">
				${ latexIconMarkupMap ? formulaTabs.map( ( { key, latexIcons } ) => `<div
				class="ck-mathlive-formula-tab ${ key } ${ activeTabKey === key ? 'active' : '' }" key="${ key }">
					${ latexIcons.map( equation => `<div class="ck-mathlive-latex-markup">
						${ ( latexIconMarkupMap as { [key: string]: string } )[ equation ] }
					</div>` ).join( '' ) }
				</div>` ).join( '' ) : '' }
			</div>
			<div class="ck-mathlive-formula-content">
				${ latexIconMarkupMap ? formulaRows.map( equations => `<div class="ck-mathlive-formula-row">
					${ equations.map( equation => `<div class="ck-mathlive-formula-tex ${ activeTabKey }" equation="${ equation }">
						<div class="ck-mathlive-latex-markup">${ ( latexIconMarkupMap as { [key: string]: string } )[ equation ] }</div>
					</div>` ).join( '' ) }
				</div>` ).join( '' ) : '' }
			</div>
		`;
		container.innerHTML = html.trim();
		return container;
	}

	public latexIconMarkupMap: { [key: string]: string } | undefined = undefined;

	public getLatexIconMarkupMap(): FormulaView['latexIconMarkupMap'] {
		if ( this.latexIconMarkupMap ) {
			return this.latexIconMarkupMap;
		}

		const latexIconConvertInterceptorMap = this.latexIconConvertInterceptorMap;

		this.latexIconMarkupMap = Object.entries( latexIconMarkupMap ).reduce( ( result, [ latex, markup ] ) => {
			const { after: latexConvertAfter } = latexIconConvertInterceptorMap[ latex ] ||
				latexIconConvertInterceptorMap._default || {};
			if ( latexConvertAfter ) {
				return {
					...result,
					[ latex ]: latexConvertAfter( markup )
				};
			}
			return {
				...result,
				[ latex ]: markup
			};
		}, {} );

		return this.latexIconMarkupMap;
	}

	public latexIconConvertInterceptorMap: {
		[key: string]: {
			before?: ( latex: string ) => string;
			after?: ( markup: string ) => string;
		};
	} = {
		'\\ce{#0}': {
			before: () => {
				return '\\boxed{\\ce{▢}}';
			},
			after: markup => {
				return markup.replace( '▢', '&emsp;&emsp;&emsp;&emsp;' );
			}
		},
		_default: {
			before: latex => {
				return latex.replace( /#0/g, '▢' );
			}
		}
	};

	public getConvertToIconMarkupLatex(): Array<{
		latex: string;
		iconLatex: string;
	}> {
		const latexIconConvertInterceptorMap = this.latexIconConvertInterceptorMap;

		const tabIconsLatex = this.formulaTabs.map( ( { latexIcons } ) => latexIcons ).flat();
		const formulaIconsLatex = Array.from( Object.entries( this.formulaMap ) )
			.map( ( [ _, value ] ) => value.flat() ).flat();

		const latexIconLatex = [ ...tabIconsLatex, ...formulaIconsLatex ].map( latex => {
			const { before: latexConvertBefore } = latexIconConvertInterceptorMap[ latex ] ||
				latexIconConvertInterceptorMap._default || {};
			if ( latexConvertBefore ) {
				return {
					latex,
					iconLatex: latexConvertBefore( latex )
				};
			}
			return {
				latex,
				iconLatex: latex
			};
		} );

		return latexIconLatex;
	}
}

function registerDragElement( container: HTMLElement, handle: HTMLElement ) {
	let startClientX = 0;
	let startClientY = 0;
	let offsetX = 0;
	let offsetY = 0;

	const onHandleMousemove = ( e: MouseEvent ) => {
		const movingClientX = e.clientX;
		const movingClientY = e.clientY;
		offsetX = movingClientX - startClientX;
		offsetY = movingClientY - startClientY;

		if ( container ) {
			container.style.transform = `translate(${ offsetX }px, ${ offsetY }px)`;
		}
	};

	const onHandleMouseup = () => {
		const { right: containerStyleRight, bottom: containerStyleBottom } = window.getComputedStyle( container );
		container.style.transform = '';
		container.style.right = ( parseInt( containerStyleRight ) - offsetX ) + 'px';
		container.style.bottom = ( parseInt( containerStyleBottom ) - offsetY ) + 'px';

		document.removeEventListener( 'mouseup', onHandleMouseup );
		document.removeEventListener( 'mousemove', onHandleMousemove );
	};

	const onHandleMousedown = ( e: MouseEvent ) => {
		startClientX = e.clientX;
		startClientY = e.clientY;

		document.addEventListener( 'mouseup', onHandleMouseup );
		document.addEventListener( 'mousemove', onHandleMousemove );
	};

	handle.addEventListener( 'mousedown', onHandleMousedown );
}
