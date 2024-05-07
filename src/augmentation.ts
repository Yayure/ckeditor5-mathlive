import type { Mathlive } from './index';
import type { DowncastWriter } from 'ckeditor5/src/engine';

type ElementAttributes = Parameters<DowncastWriter['createContainerElement']>[1];

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Mathlive.pluginName ]: Mathlive;
	}

	interface EditorConfig {
		mathlive?: {

			/**
			 * Customize your formula panel.
			 */
			renderMathPanel?: ( element: HTMLElement ) => ( () => void ) | undefined;

			/**
			 * A string used as a regular expression of class names of elements whose content will be scanned for delimiters.
			 * e.g. <span class="tex2jax_process">\( \sqrt{\frac{a}{b}} \)</span>
			 */
			processClass?: string;

			/**
			 * <script> tags with this type will be processed as LaTeX.
			 * e.g. <script type="math/tex">\( \sqrt{\frac{a}{b}} \)</script>
			 */
			processScriptType?: string;

			/**
			 * Output the element of html data.
			 * e.g.
			 * { type: 'script', attributes: { type: 'math/tex' } } => <script type="math/tex">\( \sqrt{\frac{a}{b}} \)</script>
			 * { type: 'span', attributes: { class: 'tex2jax_process' } } => <span class="tex2jax_process">\( \sqrt{\frac{a}{b}} \)</span>
			 */
			output?: {
				type: string;
				attributes?: ElementAttributes;
			};
		};
	}
}
