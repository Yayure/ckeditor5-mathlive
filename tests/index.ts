import { expect } from 'chai';
import { Mathlive as MathliveDll, icons } from '../src';
import Mathlive from '../src/mathlive';

import ckeditor from './../theme/icons/ckeditor.svg';

describe( 'CKEditor5 Mathlive DLL', () => {
	it( 'exports Mathlive', () => {
		expect( MathliveDll ).to.equal( Mathlive );
	} );

	describe( 'icons', () => {
		it( 'exports the "ckeditor" icon', () => {
			expect( icons.ckeditor ).to.equal( ckeditor );
		} );
	} );
} );
