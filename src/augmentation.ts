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
			 * Mount the formula panel.
			 */
			renderMathPanel?: ( element: HTMLElement ) => ( () => void ) | undefined;

			/**
			 * Whether to destroy the math formula panel when it is closed.
			 */
			mathPanelDestroyOnClose?: boolean;

			/**
			 * Whether to open the panel when a equation is selected.
			 */
			openPanelWhenEquationSelected?: boolean;

			/**
			 * Convert elements containing this class name into visual formula displays.
			 * e.g. <span class="tex2jax_process">\sqrt{\frac{a}{b}}</span>
			 */
			processClass?: string;

			/**
			 * Convert the <script> with attribute type set to this value into visual formula displays.
			 * e.g. <script type="math/tex">\sqrt{\frac{a}{b}}</script>
			 */
			processScriptType?: string;

			/**
			 * Visual formula output html data in CKEditor.
			 * e.g.
			 * { type: 'script', attributes: { type: 'math/tex' } } => <script type="math/tex">\sqrt{\frac{a}{b}}</script>
			 * { type: 'span', attributes: { class: 'tex2jax_process' } } => <span class="tex2jax_process">\sqrt{\frac{a}{b}}</span>
			 */
			output?: {
				type: string;
				attributes?: ElementAttributes;
			};
		};
	}
}
