import { Plugin } from 'ckeditor5/src/core';
import { Widget } from 'ckeditor5/src/widget';

import MathliveUI from './mathliveui';
import MathliveEditing from './mathliveediting';

export default class Mathlive extends Plugin {
	public static get requires() {
		return [ MathliveEditing, MathliveUI, Widget ] as const;
	}

	public static get pluginName() {
		return 'Mathlive' as const;
	}
}
