import type { Mathlive } from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Mathlive.pluginName ]: Mathlive;
	}
}
