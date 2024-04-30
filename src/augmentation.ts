import type { Mathlive } from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Mathlive.pluginName ]: Mathlive;
	}

	interface EditorConfig {
		mathlive?: {

			/**  Customize your formula panel */
			renderMathPanel?: ( element: HTMLElement ) => ( () => void ) | undefined;

			/**  Customize rendering formulas by your engine */
			renderMathTex?: ( equation: string, element: HTMLElement ) => void;

			/**  Rendering formula engine, registered externally through your project */
			engine?: 'mathlive' & string;

			/**
			 * math-field style passed when engine is mathlive,
			 * see more: https://cortexjs.io/mathlive/guides/static/#read-only-mathfield
			 * */
			mathFieldStyle?: Partial<CSSStyleDeclaration>;

			/**  Output the className of html data (e.g. <span class="ck-mathlive-tex">\( \sqrt{\frac{a}{b}} \)</span>) */
			className?: string;
		};
	}
}
