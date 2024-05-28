import { expect } from 'chai';
import { Mathlive as MathliveDll } from '../src';
import Mathlive from '../src/mathlive';

describe( 'CKEditor5 Mathlive DLL', () => {
	it( 'exports Mathlive', () => {
		expect( MathliveDll ).to.equal( Mathlive );
	} );
} );
