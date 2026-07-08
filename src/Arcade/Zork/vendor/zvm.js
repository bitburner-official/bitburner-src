(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ZVM = f()}})(function(){var define,module,exports;return (function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
/*

Abstract syntax trees for IF VMs
================================

Copyright (c) 2017 The ifvms.js team
BSD licenced
http://github.com/curiousdannii/ifvms.js

*/

'use strict';

/*

All AST nodes must use these functions, even constants
(An exception is made for branch addresses and text literals which remain as primitives)
toString() functions are used to generate JIT code

Aside from Variable is currently generic and could be used for Glulx too

TODO:
	Use strict mode for new Function()?
	When we can run through a whole game, test whether using common_func is faster (if its slower then not worth the file size saving)
	Can we eliminate the Operand class?
	Subclass Operand/Variable from Number?
	Replace calls to args() with arguments.join()?

*/

var utils = require( '../common/utils.js' ),
Class = utils.Class,
U2S = utils.U2S16,
//S2U = utils.S2U16;

// Generic/constant operand
// Value is a constant
Operand = Class.subClass({
	init: function( engine, value )
	{
		this.e = engine;
		this.v = value;
	},
	toString: function()
	{
		return this.v;
	},

	// Convert an Operand into a signed operand
	U2S: function()
	{
		return U2S( this.v );
	},
}),

// Variable operand
// Value is the variable number
// TODO: unrolling is needed -> retain immediate returns if optimisations are disabled
Variable = Operand.subClass({
	// Get a value
	toString: function()
	{
		var variable = this.v;

		// Indirect
		if ( this.indirect )
		{
			return 'e.indirect(' + variable + ')';
		}

		// Stack
		if ( variable === 0 )
		{
			// If we've been passed a value we're setting a variable
			return 's[--e.sp]';
		}
		// Locals
		if ( --variable < 15 )
		{
			return 'l[' + variable + ']';
		}
		// Globals
		return 'e.m.getUint16(' + ( this.e.globals + ( variable - 15 ) * 2 ) + ')';
	},

	// Store a value
	store: function( value )
	{
		var variable = this.v;

		// Indirect variable
		if ( this.indirect )
		{
			return 'e.indirect(' + variable + ',' + value + ')';
		}

		// BrancherStorers need the value
		if ( this.returnval )
		{
			return 'e.variable(' + variable + ',' + value + ')';
		}

		// Stack
		if ( variable === 0 )
		{
			// If we've been passed a value we're setting a variable
			return 't=' + value + ';s[e.sp++]=t';
		}
		// Locals
		if ( --variable < 15 )
		{
			return 'l[' + variable + ']=' + value;
		}
		// Globals
		return 'e.ram.setUint16(' + ( this.e.globals + ( variable - 15 ) * 2 ) + ',' + value + ')';
	},

	// Convert an Operand into a signed operand
	U2S: function()
	{
		return 'e.U2S(' + this + ')';
	},
}),

// Generic opcode
// .func() must be set, which returns what .write() will actually return; it is passed the operands as its arguments
Opcode = Class.subClass({
	init: function( engine, context, code, pc, next, operands )
	{
		this.e = engine;
		this.context = context;
		this.code = code;
		this.pc = pc;
		this.labels = [ this.pc + '/' + this.code ];
		this.next = next;
		this.operands = operands;

		// Post-init function (so that they don't all have to call _super)
		if ( this.post )
		{
			this.post();
		}
	},

	// Write out the opcode, passing .operands to .func(), with a JS comment of the pc/opcode
	toString: function()
	{
		return this.label() + ( this.func ? this.func.apply( this, this.operands ) : '' );
	},

	// Return a string of the operands separated by commas
	args: function( joiner )
	{
		return this.operands.join( joiner );
	},

	// Generate a comment of the pc and code, possibly for more than one opcode
	label: function()
	{
		return '/* ' + this.labels.join() + ' */ ';
	},
}),

// Stopping opcodes
Stopper = Opcode.subClass({
	stopper: 1,
}),

// Pausing opcodes (ie, set the pc at the end of the context)
Pauser = Stopper.subClass({
	post: function()
	{
		this.origfunc = this.func;
		this.func = this.newfunc;
	},

	newfunc: function()
	{
		return 'e.stop=1;e.pc=' + this.next + ';' + this.origfunc.apply( this, arguments );
	},
}),

PauserStorer = Pauser.subClass({
	storer: 1,

	post: function()
	{
		this.storer = this.operands.pop();
		this.origfunc = this.func;
		this.func = this.newfunc;
	},
}),

// Join multiple branchers together with varying logic conditions
BrancherLogic = Class.subClass({
	init: function( ops, code )
	{
		this.ops = ops || [];
		this.code = code || '||';
	},

	toString: function()
	{
		var i = 0,
		ops = [],
		op;
		while ( i < this.ops.length )
		{
			op = this.ops[i++];
			// Accept either Opcodes or further BrancherLogics
			ops.push(
				op.func ?
					( op.iftrue ? '' : '!(' ) + op.func.apply( op, op.operands ) + ( op.iftrue ? '' : ')' ) :
					op
			);
		}
		return ( this.invert ? '(!(' : '(' ) + ops.join( this.code ) + ( this.invert ? '))' : ')' );
	},
}),

// Branching opcodes
Brancher = Opcode.subClass({
	// Flag for the disassembler
	brancher: 1,

	keyword: 'if',

	// Process the branch result now
	post: function()
	{
		var result,
		prev,

		// Calculate the offset
		brancher = this.operands.pop(),
		offset = brancher[1];
		this.iftrue = brancher[0];

		// Process the offset
		if ( offset === 0 || offset === 1 )
		{
			result = 'e.ret(' + offset + ')';
		}
		else
		{
			offset += this.next - 2;

			// Add this target to this context's list
			this.context.targets.push( offset );
			result = 'e.pc=' + offset;
		}

		this.result = result + ';return';
		this.offset = offset;
		this.cond = new BrancherLogic( [this] );

		// TODO: re-enable
		/*if ( this.e.options.debug )
		{
			// Stop if we must
			if ( debugflags.noidioms )
			{
				return;
			}
		}*/

		// Compare with previous statement
		if ( this.context.ops.length )
		{
			prev = this.context.ops.pop();
			// As long as no other opcodes have an offset property we can skip the instanceof check
			if ( /* prev instanceof Brancher && */ prev.offset === offset )
			{
				// Goes to same offset so reuse the Brancher arrays
				this.cond.ops.unshift( prev.cond );
				this.labels = prev.labels;
				this.labels.push( this.pc + '/' + this.code );
			}
			else
			{
				this.context.ops.push( prev );
			}
		}
	},

	// Write out the brancher
	toString: function()
	{
		var result = this.result;

		// Account for Contexts
		if ( result instanceof Context )
		{
			// Update the context to be a child of this context
			if ( this.e.options.debug )
			{
				result.context = this.context;
			}

			result = result + ( result.stopper ? '; return' : '' );

			// Extra line breaks for multi-op results
			if ( this.result.ops.length > 1 )
			{
				result = '\n' + result + '\n';
				if ( this.e.options.debug )
				{
					result += this.context.spacer;
				}
			}
		}

		// Print out a label for all included branches and the branch itself
		return this.label() + this.keyword + this.cond + ' {' + result + '}';
	},
}),

// Brancher + Storer
BrancherStorer = Brancher.subClass({
	storer: 1,

	// Set aside the storer operand
	post: function()
	{
		BrancherStorer.super.post.call( this );
		this.storer = this.operands.pop();
		this.storer.returnval = 1;

		// Replace the func
		this.origfunc = this.func;
		this.func = this.newfunc;
	},

	newfunc: function()
	{
		return this.storer.store( this.origfunc.apply( this, arguments ) );
	},
}),

// Storing opcodes
Storer = Opcode.subClass({
	// Flag for the disassembler
	storer: 1,

	// Set aside the storer operand
	post: function()
	{
		this.storer = this.operands.pop();
	},

	// Write out the opcode, passing it to the storer (if there still is one)
	toString: function()
	{
		var data = Storer.super.toString.call( this );

		// If we still have a storer operand, use it
		// Otherwise (if it's been removed due to optimisations) just return func()
		return this.storer ? this.storer.store( data ) : data;
	},
}),

// Routine calling opcodes
Caller = Stopper.subClass({
	// Fake a result variable
	result: { v: -1 },

	// Write out the opcode
	toString: function()
	{
		// TODO: Debug: include label if possible
		return this.label() + 'e.call(' + this.operands.shift() + ',' + this.result.v + ',' + this.next + ',[' + this.args() + '])';
	},
}),

// Routine calling opcodes, storing the result
CallerStorer = Caller.subClass({
	// Flag for the disassembler
	storer: 1,

	post: function()
	{
		// We can't let the storer be optimised away here
		this.result = this.operands.pop();
	},
}),

// A generic context (a routine, loop body etc)
Context = Class.subClass({
	init: function( engine, pc )
	{
		this.e = engine;
		this.pc = pc;
		this.pre = [];
		this.ops = [];
		this.post = [];
		this.targets = []; // Branch targets
		if ( engine.options.debug )
		{
			this.spacer = '';
		}
	},

	toString: function()
	{
		if ( this.e.options.debug )
		{
			// Indent the spacer further if needed
			if ( this.context )
			{
				this.spacer = this.context.spacer + '  ';
			}
			// DEBUG: Pretty print!
			return this.pre.join( '' ) + ( this.ops.length > 1 ? this.spacer : '' ) + this.ops.join( ';\n' + this.spacer ) + this.post.join( '' );

		}
		else
		{
			// Return the code
			return this.pre.join( '' ) + this.ops.join( ';' ) + this.post.join( '' );
		}
	},
}),

// A routine body
RoutineContext = Context.subClass({
	toString: function()
	{
		// TODO: Debug: If we have routine names, find this one's name

		// Add in some extra vars and return
		this.pre.unshift( 'var l=e.l,s=e.s,t=0;\n' );
		return RoutineContext.super.toString.call( this );
	},
});

// Opcode builder
// Easily build a new opcode from a class
function opcode_builder( Class, func, flags )
{
	flags = flags || {};
	if ( func )
	{
		/*if ( func.pop )
		{
			flags.str = func;
			flags.func = common_func;
		}
		else
		{*/
		flags.func = func;
		//}
	}
	return Class.subClass( flags );
}

module.exports = {
	Operand: Operand,
	Variable: Variable,
	Opcode: Opcode,
	Stopper: Stopper,
	Pauser: Pauser,
	PauserStorer: PauserStorer,
	BrancherLogic: BrancherLogic,
	Brancher: Brancher,
	BrancherStorer: BrancherStorer,
	Storer: Storer,
	Caller: Caller,
	CallerStorer: CallerStorer,
	Context: Context,
	RoutineContext: RoutineContext,
	opcode_builder: opcode_builder,
};

},{"../common/utils.js":3}],2:[function(require,module,exports){
/*

File classes
============

Copyright (c) 2016 The ifvms.js team
BSD licenced
http://github.com/curiousdannii/ifvms.js

*/

'use strict';

var utils = require( './utils.js' ),
MemoryView = utils.MemoryView,

// A basic IFF file, to be extended later
// Currently supports buffer data
IFF = utils.Class.subClass({
	init: function( data )
	{
		this.type = '';
		this.chunks = [];
		
		if ( data )
		{
			var view = MemoryView( data ),
			i = 12, length, chunk_length;
			
			// Check that it is actually an IFF file
			if ( view.getFourCC( 0 ) !== 'FORM' )
			{
				throw new Error( 'Not an IFF file' );
			}

			// Parse the file
			this.type = view.getFourCC( 8 );
			length = view.getUint32( 4 ) + 8;

			while ( i < length )
			{
				chunk_length = view.getUint32( i + 4 );

				if ( chunk_length < 0 || ( chunk_length + i ) > length )
				{
					throw new Error( 'IFF chunk out of range' );
				}

				this.chunks.push({
					type: view.getFourCC( i ),
					offset: i,
					data: view.getUint8Array( i + 8, chunk_length ),
				});

				i += 8 + chunk_length;
				if ( chunk_length % 2 )
				{
					i++;
				}
			}
		}
	},

	write: function()
	{
		// Start with the IFF type
		var buffer_len = 12, i = 0, index = 12,
		out, chunk;

		// First calculate the required buffer length
		while ( i < this.chunks.length )
		{
			// Replace typed arrays or dataviews with their buffers
			if ( this.chunks[i].data.buffer )
			{
				this.chunks[i].data = this.chunks[i].data.buffer;
			}
			this.chunks[i].length = this.chunks[i].data.byteLength || this.chunks[i].data.length;
			buffer_len += 8 + this.chunks[i++].length;
			if ( buffer_len % 2 )
			{
				buffer_len++;
			}
		}
		
		out = MemoryView( buffer_len );
		out.setFourCC( 0, 'FORM' );
		out.setUint32( 4, buffer_len - 8 );
		out.setFourCC( 8, this.type );
		
		// Go through the chunks and write them out
		i = 0;
		while ( i < this.chunks.length )
		{
			chunk = this.chunks[i++];
			out.setFourCC( index, chunk.type );
			out.setUint32( index + 4, chunk.length );
			out.setUint8Array( index + 8, chunk.data );
			index += 8 + chunk.length;
			if ( index % 2 )
			{
				index++;
			}
		}

		return out.buffer;
	},
}),

Blorb = IFF.subClass({
	init: function( data )
	{
		this.super.init.call( this, data );
		if ( data )
		{
			if ( this.type !== 'IFRS' )
			{
				throw new Error( 'Not a Blorb file' );
			}
			
			// Process the RIdx chunk to find the main exec chunk
			if ( this.chunks[0].type !== 'RIdx' )
			{
				throw new Error( 'Malformed Blorb: chunk 1 is not RIdx' );
			}
			var view = MemoryView( this.chunks[0].data ),
			i = 4;
			while ( i < this.chunks[0].data.length )
			{
				if ( view.getFourCC( i ) === 'Exec' && view.getUint32( i + 4 ) === 0 )
				{
					this.exec = this.chunks.filter( function( chunk )
					{
						return chunk.offset === view.getUint32( i + 8 );
					})[0];
					return;
				}
				i += 12;
			}
		}
	},
}),

Quetzal = IFF.subClass({
	// Parse a Quetzal savefile, or make a blank one
	init: function( data )
	{
		this.super.init.call( this, data );
		if ( data )
		{
			// Check this is a Quetzal savefile
			if ( this.type !== 'IFZS' )
			{
				throw new Error( 'Not a Quetzal savefile' );
			}

			// Go through the chunks and extract the useful ones
			var i = 0,
			type, chunk_data, view;
			
			while ( i < this.chunks.length )
			{
				type = this.chunks[i].type;
				chunk_data = this.chunks[i++].data;

				// Memory and stack chunks
				if ( type === 'CMem' || type === 'UMem' )
				{
					this.memory = chunk_data;
					this.compressed = ( type === 'CMem' );
				}
				else if ( type === 'Stks' )
				{
					this.stacks = chunk_data;
				}

				// Story file data
				else if ( type === 'IFhd' )
				{
					view = MemoryView( chunk_data.buffer );
					this.release = view.getUint16( 0 );
					this.serial = view.getUint8Array( 2, 6 );
					// The checksum isn't used, but if we throw it away we can't round-trip
					this.checksum = view.getUint16( 8 );
					// The pc is only a Uint24, but there's no function for that, so grab an extra byte and then discard it
					this.pc = view.getUint32( 9 ) & 0xFFFFFF;
				}
			}
		}
	},

	// Write out a savefile
	write: function()
	{
		// Reset the IFF type
		this.type = 'IFZS';

		// Format the IFhd chunk correctly
		var ifhd = MemoryView( 13 );
		ifhd.setUint16( 0, this.release );
		ifhd.setUint8Array( 2, this.serial );
		ifhd.setUint32( 9, this.pc );
		ifhd.setUint16( 8, this.checksum );

		// Add the chunks
		this.chunks = [
			{ type: 'IFhd', data: ifhd },
			{ type: ( this.compressed ? 'CMem' : 'UMem' ), data: this.memory },
			{ type: 'Stks', data: this.stacks },
		];

		// Return the byte array
		return this.super.write.call( this );
	},
});

// Inspect a file and identify its format and version number
function identify( buffer )
{
	var view = MemoryView( buffer ),
	blorb,
	format,
	version;
	
	// Blorb
	if ( view.getFourCC( 0 ) === 'FORM' && view.getFourCC( 8 ) === 'IFRS' )
	{
		blorb = new Blorb( buffer );
		if ( blorb.exec )
		{
			format = blorb.exec.type;
			buffer = blorb.exec.data;
			if ( format === 'GLUL' )
			{
				view = MemoryView( buffer );
				version = view.getUint32( 4 );
			}
			if ( format === 'ZCOD' )
			{
				version = buffer[0];
			}
		}
	}
	// Glulx
	else if ( view.getFourCC( 0 ) === 'Glul' )
	{
		format = 'GLUL';
		version = view.getUint32( 4 );
	}
	// Z-Code
	else
	{
		version = view.getUint8( 0 );
		if ( version > 0 && version < 9 )
		{
			format = 'ZCOD';
		}
	}
	
	if ( format && version )
	{
		return {
			format: format,
			version: version,
			data: buffer,
		};
	}
}

module.exports = {
	IFF: IFF,
	Blorb: Blorb,
	Quetzal: Quetzal,
	identify: identify,
};

},{"./utils.js":3}],3:[function(require,module,exports){
/*

Common untility functions
=========================

Copyright (c) 2016 The ifvms.js team
BSD licenced
http://github.com/curiousdannii/ifvms.js

*/

'use strict';

// Utility to extend objects
function extend()
{
	var old = arguments[0], i = 1, add, name;
	while ( i < arguments.length )
	{
		add = arguments[i++];
		for ( name in add )
		{
			old[name] = add[name];
		}
	}
	return old;
}

// Simple classes
// Inspired by John Resig's class implementation
// http://ejohn.org/blog/simple-javascript-inheritance/

function Class()
{}

Class.subClass = function( props )
{
	function newClass()
	{
		if ( this.init )
		{
			this.init.apply( this, arguments );
		}
	}
	newClass.prototype = extend( Object.create( this.prototype ), props );
	newClass.subClass = this.subClass;
	newClass.super = newClass.prototype.super = this.prototype;
	return newClass;
};

// An enhanced DataView
// Accepts an ArrayBuffer, another view (MemoryView / DataView / TypedArray), or a length number
function MemoryView( buffer, byteOffset, byteLength )
{
	// Length number
	if ( typeof buffer === 'number' )
	{
		buffer = new ArrayBuffer( buffer );
	}

	// MemoryView / DataView / TypedArray
	else if ( buffer.buffer )
	{
		// If unspecified, byteOffset defaults at the beginning of the given view.  Note
		// that We will adjust 'byteOffset' after using the initial value to calculate
		// the default byteLength below.
		byteOffset |= 0;

		// A view may be a subset of a potentially larger array buffer.  Before extracting
		// the underlying buffer, map the given 'byteLength' and byteOffset' to the underlying
		// array buffer from which we will construct the DataView.

		// A specified 'byteLength' does not need to be adjusted, but if no byteLength was
		// given, we need to ensure that the resulting MemoryView does not extend past the
		// end of the typed array (see above).
		if ( typeof byteLength === 'undefined' )
		{
			byteLength = buffer.byteLength - byteOffset;
		}

		// Map the 'byteOffset', which is currently relative to the typed array, to the same
		// location in the underlying array buffer.
		byteOffset += buffer.byteOffset;

		// Finally, extract the underlying array buffer.
		buffer = buffer.buffer;
	}
	// Else already an ArrayBuffer. No adjustments to 'byteOffset'/'byteLength' necessary.
	
	return extend( new DataView( buffer, byteOffset, byteLength ), {
		getUint8Array: function( start, length )
		{
			// Note that start/length are non-optional, so we only need to adjust the start to
			// the byteOffset of the view.  (See MemoryView ctor comments.)
			start += this.byteOffset;

			return new Uint8Array( this.buffer.slice( start, start + length ) );
		},
		getUint16Array: function( start, length )
		{
			// Note that start/length are non-optional, so we only need to adjust the start to
			// the byteOffset of the view.  (See MemoryView ctor comments.)
			start += this.byteOffset;

			// We cannot simply return a Uint16Array as most systems are little-endian
			return Uint8toUint16Array( new Uint8Array( this.buffer, start, length * 2 ) );
		},
		setUint8Array: function( start, data )
		{
			if ( data instanceof ArrayBuffer )
			{
				data = new Uint8Array( data );
			}
			( new Uint8Array( this.buffer, this.byteOffset, this.byteLength ) ).set( data, start );
		},
		//setBuffer16 NOTE: if we implement this we cannot simply set a Uint16Array as most systems are little-endian
		
		// For use with IFF files
		getFourCC: function( index )
		{
			return String.fromCharCode( this.getUint8( index ), this.getUint8( index + 1 ), this.getUint8( index + 2 ), this.getUint8( index + 3 ) );
		},
		setFourCC: function( index, text )
		{
			this.setUint8( index, text.charCodeAt( 0 ) );
			this.setUint8( index + 1, text.charCodeAt( 1 ) );
			this.setUint8( index + 2, text.charCodeAt( 2 ) );
			this.setUint8( index + 3, text.charCodeAt( 3 ) );
		},
	} );
}

// Utilities for 16-bit signed arithmetic
function U2S16( value )
{
	return value << 16 >> 16;
}
function S2U16 ( value )
{
	return value & 0xFFFF;
}

// Utility to convert from byte arrays to word arrays
function Uint8toUint16Array( array )
{
	var i = 0, l = array.length,
	result = new Uint16Array( l / 2 );
	while ( i < l )
	{
		result[i / 2] = array[i++] << 8 | array[i++];
	}
	return result;
}

module.exports = {
	extend: extend,
	Class: Class,
	MemoryView: MemoryView,
	U2S16: U2S16,
	S2U16: S2U16,
	Uint8toUint16Array: Uint8toUint16Array,
};
},{}],4:[function(require,module,exports){
/*

ZVM - the ifvms.js Z-Machine (versions 3-5, 8)
==============================================

Copyright (c) 2017 The ifvms.js team
MIT licenced
https://github.com/curiousdannii/ifvms.js

*/

/*

This file is the public API of ZVM, which is based on the API of Quixe:
https://github.com/erkyrath/quixe/wiki/Quixe-Without-GlkOte#quixes-api

ZVM willfully ignores the standard in these ways:
	Non-buffered output is not supported
	Saving tables is not supported (yet?)
	No interpreter number or version is set

Any other non-standard behaviour should be considered a bug

*/

'use strict';

var utils = require( './common/utils.js' ),
file = require( './common/file.js' ),

default_options = {
	stack_len: 100 * 1000,
	undo_len: 1000 * 1000,
},

api = {

	init: function()
	{
		// Create this here so that it won't be cleared on restart
		this.jit = {};
		
		// The Quixe API expects the start function to be named init
		this.init = this.start;
	},

	prepare: function( storydata, options )
	{
		// If we are not given a glk option then we cannot continue
		if ( !options.Glk )
		{
			throw new Error( 'A reference to Glk is required' );
		}
		this.Glk = options.Glk;
		this.data = storydata;
		this.options = utils.extend( {}, default_options, options );
	},

	start: function()
	{
		var Glk = this.Glk,
		data;
		try
		{
			// Identify the format and version number of the data file we were given
			data = file.identify( this.data );
			delete this.data;
			if ( !data || data.format !== 'ZCOD' )
			{
				throw new Error( 'This is not a Z-Code file' );
			}
			if ( [ 3, 4, 5, 8 ].indexOf( data.version ) < 0 )
			{
				throw new Error( 'Unsupported Z-Machine version: ' + data.version );
			}
			
			// Load the storyfile we are given into our MemoryView (an enhanced DataView)
			this.m = utils.MemoryView( data.data );
			
			// Make a seperate MemoryView for the ram, and store the original ram
			this.staticmem = this.m.getUint16( 0x0E );
			this.ram = utils.MemoryView( this.m, 0, this.staticmem );
			this.origram = this.m.getUint8Array( 0, this.staticmem );

			// Cache the game signature
			let signature = ''
			let i = 0
			while ( i < 0x1E )
			{
				signature += ( this.origram[i] < 0x10 ? '0' : '' ) + this.origram[i++].toString( 16 )
			}
			this.signature = signature

			// Handle loading and clearing autosaves
			let autorestored
			const Dialog = this.options.Dialog
			if ( Dialog )
			{
				if ( this.options.clear_vm_autosave )
				{
					Dialog.autosave_write( signature, null )
				}
				else if ( this.options.do_vm_autosave )
				{
					try
					{
						const snapshot = Dialog.autosave_read( signature )
						if ( snapshot )
						{
							this.do_autorestore( snapshot )
							autorestored = 1
						}
					}
					catch (ex)
					{
						this.log('Autorestore failed, deleting it: ' + ex)
						Dialog.autosave_write( signature, null )
					}
				}
			}

			// Initiate the engine, run, and wait for our first Glk event
			if ( !autorestored )
			{
				this.restart();
				this.run();
			}
			if ( !this.quit )
			{
				this.glk_event = new Glk.RefStruct();
				if ( !this.glk_blocking_call )
				{
					Glk.glk_select( this.glk_event );
				}
				else
				{
					this.glk_event.push_field( this.glk_blocking_call );
				}
			}
			Glk.update()
		}
		catch ( e )
		{
			Glk.fatal_error( e );
			console.log( e );
		}
	},

	resume: function( resumearg )
	{
		var Glk = this.Glk,
		glk_event = this.glk_event,
		event_type,
		run;
		
		try
		{
			event_type = glk_event.get_field( 0 );
			
			// Process the event
			if ( event_type === 2 )
			{
				this.handle_char_input( glk_event.get_field( 2 ) );
				run = 1;
			}
			if ( event_type === 3 )
			{
				this.handle_line_input( glk_event.get_field( 2 ), glk_event.get_field( 3 ) );
				run = 1;
			}

			// Arrange events
			if ( event_type === 5 )
			{
				this.update_screen_size()
			}

			// glk_fileref_create_by_prompt handler
			if ( event_type === 'fileref_create_by_prompt' )
			{
				run = this.handle_create_fileref( resumearg );
			}
			
			this.glk_blocking_call = null;
			if ( run )
			{
				this.run();
			}
			
			// Wait for another event
			if ( !this.quit )
			{
				this.glk_event = new Glk.RefStruct();
				if ( !this.glk_blocking_call )
				{
					Glk.glk_select( this.glk_event );
				}
				else
				{
					this.glk_event.push_field( this.glk_blocking_call );
				}
			}
			Glk.update()
		}
		catch ( e )
		{
			Glk.fatal_error( e );
			console.log( e );
		}
	},
	
	get_signature: function()
	{
		return this.signature
	},

	// Run
	run: function()
	{
		var pc,
		result;

		// Stop when ordered to
		this.stop = 0;
		while ( !this.stop )
		{
			pc = this.pc;
			if ( !this.jit[pc] )
			{
				this.compile();
			}
			result = this.jit[pc]( this );

			// Return from a VM func if the JIT function returned a result
			if ( !isNaN( result ) )
			{
				this.ret( result );
			}
		}
	},

	// Compile a JIT routine
	compile: function()
	{
		var context = this.disassemble();
		
		// Compile the routine with new Function()
		this.jit[context.pc] = new Function( 'e', '' + context );

		if ( context.pc < this.staticmem )
		{
			this.log( 'Caching a JIT function in dynamic memory: ' + context.pc );
		}
	},

},

VM = utils.Class.subClass( utils.extend(
	api,
	require( './zvm/runtime.js' ),
	require( './zvm/text.js' ),
	require( './zvm/io.js' ),
	require( './zvm/disassembler.js' )
) );

module.exports = VM;

},{"./common/file.js":2,"./common/utils.js":3,"./zvm/disassembler.js":5,"./zvm/io.js":6,"./zvm/runtime.js":8,"./zvm/text.js":9}],5:[function(require,module,exports){
/*

Z-Machine disassembler - disassembles zcode into an AST
=======================================================

Copyright (c) 2011 The ifvms.js team
BSD licenced
http://github.com/curiousdannii/ifvms.js

*/

/*

Note:
	Nothing is done to check whether an instruction actually has a valid number of operands. Extras will usually be ignored while missing operands may throw errors at either the code building stage or when the JIT code is called.

TODO:
	If we diassessemble part of what we already have before, can we just copy/slice the context?

*/

var AST = require( '../common/ast.js' );

module.exports.disassemble = function()
{
	var pc, offset, // Set in the loop below
	memory = this.m,
	opcodes = this.opcodes,
	temp,
	code,
	opcode_class,
	operands_type, // The types of the operands, or -1 for var instructions
	operands,

	// Create the context for this code fragment
	context = new AST.RoutineContext( this, this.pc );

	// Utility function to unpack the variable form operand types byte
	function get_var_operand_types( operands_byte, operands_type )
	{
		for ( var i = 0; i < 4; i++ )
		{
			operands_type.push( (operands_byte & 0xC0) >> 6 );
			operands_byte <<= 2;
		}
	}

	// Set the context's root context to be itself, and add it to the list of subcontexts
	//context.root = context;
	//context.contexts[0] = context;

	// Run through until we can no more
	while ( 1 )
	{
		// This instruction
		offset = pc = this.pc;
		code = memory.getUint8( pc++ );

		// Extended instructions
		if ( code === 190 )
		{
			operands_type = -1;
			code = memory.getUint8( pc++ ) + 1000;
		}

		else if ( code & 0x80 )
		{
			// Variable form instructions
			if ( code & 0x40 )
			{
				operands_type = -1;
				// 2OP instruction with VAR parameters
				if ( !(code & 0x20) )
				{
					code &= 0x1F;
				}
			}

			// Short form instructions
			else
			{
				operands_type = [ (code & 0x30) >> 4 ];
				// Clear the operand type if 1OP, keep for 0OPs
				if ( operands_type[0] < 3 )
				{
					code &= 0xCF;
				}
			}
		}

		// Long form instructions
		else
		{
			operands_type = [ code & 0x40 ? 2 : 1, code & 0x20 ? 2 : 1 ];
			code &= 0x1F;
		}

		// Check for missing opcodes
		if ( !opcodes[code] )
		{
			this.log( '' + context );
			this.stop = 1;
			throw new Error( 'Unknown opcode #' + code + ' at pc=' + offset );
		}

		// Variable for quicker access to the opcode flags
		opcode_class = opcodes[code].prototype;

		// Variable form operand types
		if ( operands_type === -1 )
		{
			operands_type = [];
			get_var_operand_types( memory.getUint8(pc++), operands_type );

			// VAR_LONG opcodes have two operand type bytes
			if ( code === 236 || code === 250 )
			{
				get_var_operand_types( memory.getUint8(pc++), operands_type );
			}
		}

		// Load the operands
		operands = [];
		temp = 0;
		while ( temp < operands_type.length )
		{
			// Large constant
			if ( operands_type[temp] === 0 )
			{
				operands.push( new AST.Operand( this, memory.getUint16(pc) ) );
				pc += 2;
			}

			// Small constant
			if ( operands_type[temp] === 1 )
			{
				operands.push( new AST.Operand( this, memory.getUint8(pc++) ) );
			}

			// Variable operand
			if ( operands_type[temp++] === 2 )
			{
				operands.push( new AST.Variable( this, memory.getUint8(pc++) ) );
			}
		}

		// Check for a store variable
		if ( opcode_class.storer )
		{
			operands.push( new AST.Variable( this, memory.getUint8(pc++) ) );
		}

		// Check for a branch address
		// If we don't calculate the offset now we won't be able to tell the difference between 0x40 and 0x0040
		if ( opcode_class.brancher )
		{
			temp = memory.getUint8( pc++ );
			operands.push( [
				temp & 0x80, // iftrue
				temp & 0x40 ?
					// single byte address
					temp & 0x3F :
					// word address, but first get the second byte of it
					( temp << 8 | memory.getUint8( pc++ ) ) << 18 >> 18,
			] );
		}

		// Check for a text literal
		if ( opcode_class.printer )
		{
			// Just use the address as an operand, the text will be decoded at run time
			operands.push( pc );

			// Continue until we reach the stop bit
			// (or the end of the file, which will stop memory access errors, even though it must be a malformed storyfile)
			while ( pc < this.eof )
			{
				temp = memory.getUint8( pc );
				pc += 2;

				// Stop bit
				if ( temp & 0x80 )
				{
					break;
				}
			}
		}

		// Update the engine's pc
		this.pc = pc;

		// Create the instruction
		context.ops.push( new opcodes[code]( this, context, code, offset, pc, operands ) );

		// Check for the end of a large if block
		temp = 0;
		/*if ( context.targets.indexOf( pc ) >= 0 )
		{
			if ( DEBUG )
			{
				// Skip if we must
				if ( !debugflags.noidioms )
				{
					temp = idiom_if_block( context, pc );
				}
			}
			else
			{
				temp = idiom_if_block( context, pc );
			}
		}*/

		// We can't go any further if we have a final stopper :(
		if ( opcode_class.stopper && !temp )
		{
			break;
		}
	}

	return context;
};

},{"../common/ast.js":1}],6:[function(require,module,exports){
/*

Z-Machine IO
============

Copyright (c) 2020 The ifvms.js team
MIT licenced
https://github.com/curiousdannii/ifvms.js

*/

'use strict';

/*

TODO:

 - pre-existing line input
 - timed input
 - mouse input
 - write colours into header

*/

const utils = require('../common/utils.js')
const U2S = utils.U2S16
//S2U = utils.S2U16

// Glulx key codes accepted by the Z-Machine
const ZSCII_keyCodes = (function()
{
	var codes = {
		0xfffffff9: 8, // delete/backspace
		0xfffffffa: 13, // enter
		0xfffffff8: 27, // escape
		0xfffffffc: 129, // up
		0xfffffffb: 130, // down
		0xfffffffe: 131, // left
		0xfffffffd: 132, // right
		0xfffffff3: 146, // End / key pad 1
		0xfffffff5: 148, // PgDn / key pad 3
		0xfffffff4: 152, // Home / key pad 7
		0xfffffff6: 154, // PgUp / key pad 9
	},
	i = 0;
	while ( i < 12 )
	{
		codes[ 0xffffffef - i ] = 133 + i++; // function keys
	}
	return codes;
})()

// Style mappings
// The index bits are (lowest to highest): mono, italic, bold
const style_mappings = [0, 2, 1, 10, 4, 9, 5, 6]

// Convert a 15 bit colour to RGB
function convert_true_colour(colour)
{
	const from5to8 = [0, 8, 16, 25, 33, 41, 49, 58, 66, 74, 82, 90, 99, 107, 115, 123, 132,
		140, 148, 156, 165, 173, 181, 189, 197, 206, 214, 222, 230, 239, 247, 255]

	// Stretch the five bits per colour out to 8 bits
	return (from5to8[colour & 0x1F] << 16) | (from5to8[(colour & 0x03E0) >> 5] << 8) | (from5to8[(colour & 0x7C00) >> 10])
}

// The standard 15 bit colour values
const zcolours = [
	0xFFFE, // Current
	0xFFFF, // Default
	0x0000, // Black
	0x001D, // Red
	0x0340, // Green
	0x03BD, // Yellow
	0x59A0, // Blue
	0x7C1F, // Magenta
	0x77A0, // Cyan
	0x7FFF, // White
	0x5AD6, // Light grey
	0x4631, // Medium grey
	0x2D6B,	 // Dark grey
]

module.exports = {

	init_io: function()
	{
		this.io = {
			reverse: 0,
			bold: 0,
			italic: 0,
			bg: -1,
			fg: -1,
			
			// A variable for whether we are outputing in a monospaced font. If non-zero then we are
			// Bit 0 is for @set_style, bit 1 for the header, and bit 2 for @set_font
			mono: this.m.getUint8( 0x11 ) & 0x02,

			// A variable for checking whether the transcript bit has been changed
			transcript: this.m.getUint8( 0x11 ) & 0x01,

			// Index 0 is input stream 1, the output streams follow
			streams: [ 0, 1, {}, [], {} ],

			currentwin: 0,
			
			// Use Zarf's algorithm for the upper window
			// http://eblong.com/zarf/glk/quote-box.html
			// Implemented in fix_upper_window() and split_window()
			height: 0, // What the VM thinks the height is
			glkheight: 0, // Actual height of the Glk window
			maxheight: 0, // Height including quote boxes etc
			seenheight: 0, // Last height the player saw
			width: 0,
			row: 0,
			col: 0,
		};

		//this.process_colours();

		// Construct the windows if they do not already exist
		this.open_windows()
	},

	erase_line: function( value )
	{
		if ( value === 1 )
		{
			var io = this.io,
			row = io.row,
			col = io.col;
			this._print( Array( io.width - io.col + 1 ).join( ' ' ) );
			this.set_cursor( row, col );
		}
	},

	erase_window: function(window)
	{
		if (window < 1)
		{
			this.Glk.glk_window_clear(this.mainwin)
			if (this.io.bg >= 0)
			{
				this.Glk.glk_stylehint_set(3, 0, 8, this.io.bg)
			}
			else if (this.io.bg === -1)
			{
				this.Glk.glk_stylehint_clear(3, 0, 8)
			}
		}
		if (window !== 0)
		{
			if (window === -1)
			{
				this.split_window(0)
			}
			if (this.upperwin)
			{
				this.Glk.glk_window_clear(this.upperwin)
				this.set_cursor(0, 0)
			}
		}
	},

	fileref_create_by_prompt: function( data )
	{
		if ( typeof data.run === 'undefined' )
		{
			data.run = 1;
		}
		this.fileref_data = data;
		this.glk_blocking_call = 'fileref_create_by_prompt';
		this.Glk.glk_fileref_create_by_prompt( data.usage, data.mode, data.rock || 0 );
	},

	// Fix the upper window height before an input event
	fix_upper_window: function()
	{
		var Glk = this.Glk,
		io = this.io;

		// If we have seen the entire window, shrink it to what it should be
		if (io.seenheight >= io.maxheight)
		{
			io.maxheight = io.height;
		}
		if ( this.upperwin )
		{
			if ( io.maxheight === 0 )
			{
				Glk.glk_window_close( this.upperwin );
				this.upperwin = null;
			}
			else if (io.maxheight !== io.glkheight)
			{
				Glk.glk_window_set_arrangement( Glk.glk_window_get_parent( this.upperwin ), 0x12, io.maxheight, null );
			}
			io.glkheight = io.maxheight
		}
		io.seenheight = io.maxheight;
		io.maxheight = io.height;
	},

	format: function()
	{
		this.Glk.glk_set_style(style_mappings[!!this.io.mono | this.io.italic | this.io.bold])
		if (this.Glk.glk_gestalt(0x1100, 0))
		{
			this.Glk.garglk_set_reversevideo(this.io.reverse)
		}
	},

	get_cursor: function( array )
	{
		this.ram.setUint16( array, this.io.row + 1 );
		this.ram.setUint16( array + 2, this.io.col + 1 );
	},

	// Handle char input
	handle_char_input: function( charcode )
	{
		var stream4 = this.io.streams[4],
		code = ZSCII_keyCodes[ charcode ] || this.reverse_unicode_table[ charcode ] || 63;
		this.variable( this.read_data.storer, code );

		// Echo to the commands log
		if ( stream4.mode === 1 )
		{
			stream4.cache += code;
		}
		if ( stream4.mode === 2 )
		{
			this.Glk.glk_put_char_stream_uni( stream4.str, code );
		}
	},

	// Handle the result of glk_fileref_create_by_prompt()
	handle_create_fileref: function( fref )
	{
		var Glk = this.Glk,
		data = this.fileref_data,
		str;

		if ( fref )
		{
			if ( data.unicode )
			{
				str = Glk.glk_stream_open_file_uni( fref, data.mode, data.rock || 0 );
			}
			else
			{
				str = Glk.glk_stream_open_file( fref, data.mode, data.rock || 0 );
			}
			Glk.glk_fileref_destroy( fref );
		}
		if ( data.func === 'restore' || data.func === 'save' )
		{
			this.save_restore_handler( str );
		}
		if ( data.func === 'input_stream' )
		{
			this.io.streams[0] = str;
		}
		if ( data.func === 'output_stream' )
		{
			this.output_stream_handler( str );
		}

		// Signal to resume() to call run() if required
		return data.run;
	},

	// Handle line input
	handle_line_input: function( len, terminator )
	{
		var ram = this.ram,
		options = this.read_data,
		streams = this.io.streams,
		
		// Cut the response to len, convert to a lower case string, and then to a ZSCII array
		command = String.fromCharCode.apply( null, options.buffer.slice( 0, len ) ) + '\n',
		response = this.text_to_zscii( command.slice( 0, -1 ).toLowerCase() );
		
		// 7.1.1.1: The response must be echoed, Glk will handle this
		
		// But we do have to echo to the transcripts
		if ( streams[2].mode === 1 )
		{
			streams[2].cache += command;
		}
		if ( streams[2].mode === 2 )
		{
			this.Glk.glk_put_jstring_stream( streams[2].str, command );
		}
		
		if ( streams[4].mode === 1 )
		{
			streams[4].cache += command;
		}
		if ( streams[4].mode === 2 )
		{
			this.Glk.glk_put_jstring_stream( streams[4].str, command );
		}

		// Store the response
		if ( this.version < 5 )
		{
			// Append zero terminator
			response.push( 0 );

			// Store the response in the buffer
			ram.setUint8Array( options.bufaddr + 1, response );
		}
		else
		{
			// Store the response length
			ram.setUint8( options.bufaddr + 1, len );

			// Store the response in the buffer
			ram.setUint8Array( options.bufaddr + 2, response );

			// Store the terminator
			this.variable( options.storer, isNaN( terminator ) ? 13 : terminator );
		}

		if ( options.parseaddr )
		{
			// Tokenise the response
			this.tokenise( options.bufaddr, options.parseaddr );
		}
	},

	input_stream: function( stream )
	{
		var io = this.io;
		if ( stream && !io.streams[0] )
		{
			this.fileref_create_by_prompt({
				func: 'input_stream',
				mode: 0x02,
				rock: 212,
				unicode: 1,
				usage: 0x103,
			});
		}
		if ( !stream && io.streams[0] )
		{
			this.Glk.glk_stream_close( io.streams[0] );
			io.streams[0] = 0;
		}
	},

	// Open windows
	open_windows: function()
	{
		const Glk = this.Glk

		if (!this.mainwin)
		{
			// We will borrow the general approach of Bocfel to implement the Z-Machine's formatting model in Glk
			// https://github.com/garglk/garglk/blob/master/terps/bocfel/screen.c

			// Reset some Glk stylehints just in case
			const styles_to_reset = [1, 2, 4, 5, 6, 9, 10]
			for (let i = 0; i < 7; i++)
			{
				// Reset the size, weight, and obliqueness
				Glk.glk_stylehint_set(0, styles_to_reset[i], 3, 0)
				Glk.glk_stylehint_set(0, styles_to_reset[i], 4, 0)
				Glk.glk_stylehint_set(0, styles_to_reset[i], 5, 0)
				// And force proportional font
				Glk.glk_stylehint_set(0, styles_to_reset[i], 6, 1)
			}

			// Now set the style hints we will use

			// Bold will use subheader
			Glk.glk_stylehint_set(0, 4, 4, 1)
			// Italic will use emphasised
			Glk.glk_stylehint_set(0, 1, 5, 1)
			// Bold+italic will use alert
			Glk.glk_stylehint_set(0, 5, 4, 1)
			Glk.glk_stylehint_set(0, 5, 5, 1)
			// Fixed will use preformated
			Glk.glk_stylehint_set(0, 2, 6, 0)
			// Bold+fixed will use user1
			Glk.glk_stylehint_set(0, 9, 4, 1)
			Glk.glk_stylehint_set(0, 9, 6, 0)
			// Italic+fixed will use user2
			Glk.glk_stylehint_set(0, 10, 5, 1)
			Glk.glk_stylehint_set(0, 10, 6, 0)
			// Bold+italic+fixed will use note
			Glk.glk_stylehint_set(0, 6, 4, 1)
			Glk.glk_stylehint_set(0, 6, 5, 1)
			Glk.glk_stylehint_set(0, 6, 6, 0)

			this.mainwin = Glk.glk_window_open(0, 0, 0, 3, 201)
			Glk.glk_set_window(this.mainwin)
			if (this.version3)
			{
				this.statuswin = Glk.glk_window_open(this.mainwin, 0x12, 1, 4, 202)
				if (this.statuswin && this.Glk.glk_gestalt(0x1100, 0))
				{
					Glk.garglk_set_reversevideo_stream(Glk.glk_window_get_stream(this.statuswin), 1)
				}
			}
		}
		else
		{
			// Clean up after restarting
			Glk.glk_stylehint_clear(0, 0, 8)
			if (this.Glk.glk_gestalt(0x1100, 0))
			{
				Glk.garglk_set_zcolors_stream(this.mainwin.str, this.io.fg, this.io.bg)
			}
			Glk.glk_window_clear(this.mainwin)
			if (this.upperwin)
			{
				Glk.glk_window_close(this.upperwin)
				this.upperwin = null
			}
		}
	},

	// Manage output streams
	output_stream: function( stream, addr, called_from_print )
	{
		var ram = this.ram,
		streams = this.io.streams,
		data, text;
		stream = U2S( stream );

		// The screen
		if ( stream === 1 )
		{
			streams[1] = 1;
		}
		if ( stream === -1 )
		{
			streams[1] = 0;
		}

		// Transcript
		if ( stream === 2 && !streams[2].mode )
		{
			this.fileref_create_by_prompt({
				func: 'output_stream',
				mode: 0x05,
				rock: 210,
				run: !called_from_print,
				str: 2,
				unicode: 1,
				usage: 0x102,
			});
			streams[2].cache = '';
			streams[2].mode = 1;
			if ( !called_from_print )
			{
				this.stop = 1;
			}
		}
		if ( stream === -2 )
		{
			ram.setUint8( 0x11, ( ram.getUint8( 0x11 ) & 0xFE ) );
			if ( streams[2].mode === 2 )
			{
				this.Glk.glk_stream_close( streams[2].str );
			}
			streams[2].mode = this.io.transcript = 0;
		}

		// Memory
		if ( stream === 3 )
		{
			streams[3].unshift( [ addr, '' ] );
		}
		if ( stream === -3 )
		{
			data = streams[3].shift();
			text = this.text_to_zscii( data[1] );
			ram.setUint16( data[0], text.length );
			ram.setUint8Array( data[0] + 2, text );
		}

		// Command list
		if ( stream === 4 && !streams[4].mode )
		{
			this.fileref_create_by_prompt({
				func: 'output_stream',
				mode: 0x05,
				rock: 211,
				str: 4,
				unicode: 1,
				usage: 0x103,
			});
			streams[4].cache = '';
			streams[4].mode = 1;
			this.stop = 1;
		}
		if ( stream === -4 )
		{
			if ( streams[4].mode === 2 )
			{
				this.Glk.glk_stream_close( streams[4].str );
			}
			streams[4].mode = 0;
		}
	},
	
	output_stream_handler: function( str )
	{
		var ram = this.ram,
		streams = this.io.streams,
		data = this.fileref_data;

		if ( data.str === 2 )
		{
			ram.setUint8( 0x11, ( ram.getUint8( 0x11 ) & 0xFE ) | ( str ? 1 : 0 ) );
			if ( str )
			{
				streams[2].mode = 2;
				streams[2].str = str;
				this.io.transcript = 1;
				if ( streams[2].cache )
				{
					this.Glk.glk_put_jstring_stream( streams[2].str, streams[2].cache );
				}
			}
			else
			{
				streams[2].mode = this.io.transcript = 0;
			}
		}

		if ( data.str === 4 )
		{
			if ( str )
			{
				streams[4].mode = 2;
				streams[4].str = str;
				if ( streams[4].cache )
				{
					this.Glk.glk_put_jstring_stream( streams[4].str, streams[4].cache );
				}
			}
			else
			{
				streams[4].mode = 0;
			}
		}
	},

	// Print text!
	_print: function( text )
	{
		var Glk = this.Glk,
		io = this.io,
		i = 0;
		
		// Stream 3 gets the text first
		if ( io.streams[3].length )
		{
			io.streams[3][0][1] += text;
		}
		else
		{
			// Convert CR into LF
			text = text.replace( /\r/g, '\n' );
			
			// Check the transcript bit
			// Because it might need to prompt for a file name, we return here, and will print again in the handler
			if ( ( this.m.getUint8( 0x11 ) & 0x01 ) !== io.transcript )
			{
				this.output_stream( io.transcript ? -2 : 2, 0, 1 );
			}
			
			// Check if the monospace font bit has changed
			// Unfortunately, even now Inform changes this bit for the font statement, even though the 1.1 standard depreciated it :(
			if ( ( this.m.getUint8( 0x11 ) & 0x02 ) !== ( io.mono & 0x02 ) )
			{
				io.mono ^= 0x02;
				this.format();
			}
			
			// For the upper window we print each character individually so that we can track the cursor position
			if ( io.currentwin && this.upperwin )
			{
				// Don't automatically increase the size of the window
				// If we confirm that games do need this then we can implement it later
				while ( i < text.length && io.row < io.height )
				{
					Glk.glk_put_jstring( text[i++] );
					io.col++;
					if ( io.col === io.width )
					{
						io.col = 0;
						io.row++;
					}
				}
			}
			else if ( !io.currentwin )
			{
				if ( io.streams[1] )
				{
					Glk.glk_put_jstring( text );
				}
				// Transcript
				if ( io.streams[2].mode === 1 )
				{
					io.streams[2].cache += text;
				}
				if ( io.streams[2].mode === 2 )
				{
					Glk.glk_put_jstring_stream( io.streams[2].str, text );
				}
			}
		}
	},

	// Print many things
	print: function( type, val )
	{
		var proptable, result;
		
		// Number
		if ( type === 0 )
		{
			result = val;
		}
		// Unicode
		if ( type === 1 )
		{
			result = String.fromCharCode( val );
		}
		// Text from address
		if ( type === 2 )
		{
			result = this.jit[ val ] || this.decode( val );
		}
		// Object
		if ( type === 3 )
		{
			proptable = this.m.getUint16( this.objects + ( this.version3 ? 9 : 14 ) * val + ( this.version3 ? 7 : 12 ) );
			result = this.decode( proptable + 1, this.m.getUint8( proptable ) * 2 );
		}
		// ZSCII
		if ( type === 4 )
		{
			if ( !this.unicode_table[ val ] )
			{
				return;
			}
			result = this.unicode_table[ val ];
		}
		this._print( '' + result );
	},

	print_table: function( zscii, width, height, skip )
	{
		height = height || 1;
		skip = skip || 0;
		var i = 0;
		while ( i++ < height )
		{
			this._print( this.zscii_to_text( this.m.getUint8Array( zscii, width ) ) + ( i < height ? '\r' : '' ) );
			zscii += width + skip;
		}
	},

	// Process CSS default colours
	/*process_colours: function()
	{
		// Convert RGB to a Z-Machine true colour
		// RGB is a css colour code. rgb(), #000000 and #000 formats are supported.
		function convert_RGB( code )
		{
			var round = Math.round,
			data = /(\d+),\s*(\d+),\s*(\d+)|#(\w{1,2})(\w{1,2})(\w{1,2})/.exec( code ),
			result;

			// Nice rgb() code
			if ( data[1] )
			{
				result =  [ data[1], data[2], data[3] ];
			}
			else
			{
				// Messy CSS colour code
				result = [ parseInt( data[4], 16 ), parseInt( data[5], 16 ), parseInt( data[6], 16 ) ];
				// Stretch out compact #000 codes to their full size
				if ( code.length === 4 )
				{
					result = [ result[0] << 4 | result[0], result[1] << 4 | result[1], result[2] << 4 | result[2] ];
				}
			}

			// Convert to a 15bit colour
			return round( result[2] / 8.226 ) << 10 | round( result[1] / 8.226 ) << 5 | round( result[0] / 8.226 );
		}

		// Standard colours
		var colours = [
			0xFFFE, // Current
			0xFFFF, // Default
			0x0000, // Black
			0x001D, // Red
			0x0340, // Green
			0x03BD, // Yellow
			0x59A0, // Blue
			0x7C1F, // Magenta
			0x77A0, // Cyan
			0x7FFF, // White
			0x5AD6, // Light grey
			0x4631, // Medium grey
			0x2D6B,	 // Dark grey
		],

		// Start with CSS colours provided by the runner
		fg_css = this.options.fgcolour,
		bg_css = this.options.bgcolour,
		// Convert to true colour for storing in the header
		fg_true = fg_css ? convert_RGB( fg_css ) : 0xFFFF,
		bg_true = bg_css ? convert_RGB( bg_css ) : 0xFFFF,
		// Search the list of standard colours
		fg = colours.indexOf( fg_true ),
		bg = colours.indexOf( bg_true );
		// ZVMUI must have colours for reversing text, even if we don't write them to the header
		// So use the given colours or assume black on white
		if ( fg < 2 )
		{
			fg = fg_css || 2;
		}
		if ( bg < 2 )
		{
			bg = bg_css || 9;
		}

		utils.extend( this.options, {
			fg: fg,
			bg: bg,
			fg_true: fg_true,
			bg_true: bg_true,
		});
	},*/

	// Request line input
	read: function( storer, text, parse, time, routine )
	{
		var len = this.m.getUint8( text ),
		initiallen = 0,
		buffer,
		input_stream1_len;

		if ( this.version3 )
		{
			this.v3_status();
		}
		// The spec is badly phrased; the buffer capacity includes the zero terminator
		// See https://github.com/DFillmore/Z-Machine-Standard/issues/76
		if (this.version < 5)
		{
			len--
		}
		//else
		//{
		//initiallen = this.m.getUint8( text + 1 );
		//}

		buffer = Array( len );
		buffer.fill( 0 )
		this.read_data = {
			buffer: buffer,
			bufaddr: text, // text-buffer
			parseaddr: parse, // parse-buffer
			routine: routine,
			storer: storer,
			time: time,
		};
		
		// Input stream 1
		if ( this.io.streams[0] )
		{
			input_stream1_len = this.Glk.glk_get_line_stream_uni( this.io.streams[0], buffer );

			// Check for a newline character
			if ( buffer[input_stream1_len - 1] === 0x0A )
			{
				input_stream1_len--;
			}
			if ( input_stream1_len )
			{
				this._print( String.fromCharCode.apply( null, buffer.slice( 0, input_stream1_len ) ) + '\n' );
				this.handle_line_input( input_stream1_len );
				return this.stop = 0;
			}
			else
			{
				this.input_stream( 0 );
			}
		}

		// TODO: pre-existing input
		this.Glk.glk_request_line_event_uni( this.io.currentwin ? this.upperwin : this.mainwin, buffer, initiallen );
		this.fix_upper_window();
	},

	// Request character input
	read_char: function( storer, one, time, routine )
	{
		// Input stream 1
		if ( this.io.streams[0] )
		{
			var code = this.Glk.glk_get_char_stream_uni( this.io.streams[0] );
			// Check for EOF
			if ( code === -1 )
			{
				this.input_stream( 0 );
			}
			else
			{
				this.variable( storer, code );
				return this.stop = 0;
			}
		}

		this.read_data = {
			routine: routine,
			storer: storer,
			time: time,
		};
		this.Glk.glk_request_char_event_uni( this.io.currentwin ? this.upperwin : this.mainwin );
		this.fix_upper_window();
	},

	set_colour: function(foreground, background)
	{
		this.set_true_colour(zcolours[foreground], zcolours[background])
	},

	// Note that row and col must be decremented in JIT code
	set_cursor: function( row, col )
	{
		var io = this.io;

		// 8.7.2.3: do nothing if the lower window is selected
		if ( !io.currentwin )
		{
			return
		}

		if ( row >= io.height )
		{
			// Moving the cursor to a row forces the upper window
			// to open enough for that line to exist
			this.split_window( row + 1 );
		}
		if ( this.upperwin && row >= 0 && col >= 0 && col < io.width )
		{
			this.Glk.glk_window_move_cursor( this.upperwin, col, row );
			io.row = row;
			io.col = col;
		}
	},

	set_font: function( font )
	{
		var returnval = this.io.mono & 0x04 ? 4 : 1;
		if ( font === 0 )
		{
			return returnval;
		}
		// We only support fonts 1 and 4
		if ( font !== 1 && font !== 4 )
		{
			return 0;
		}
		if ( font !== returnval )
		{
			this.io.mono ^= 0x04;
			this.format();
		}
		return returnval;
	},

	// Set styles
	set_style: function( stylebyte )
	{
		var io = this.io;

		// Setting the style to Roman will clear the others
		if ( stylebyte === 0 )
		{
			io.reverse = io.bold = io.italic = 0;
			io.mono &= 0xFE;
		}
		if ( stylebyte & 0x01 )
		{
			io.reverse = 1;
		}
		if ( stylebyte & 0x02 )
		{
			io.bold = 0x04;
		}
		if ( stylebyte & 0x04 )
		{
			io.italic = 0x02;
		}
		if ( stylebyte & 0x08 )
		{
			io.mono |= 0x01;
		}
		this.format();
	},

	// Set true colours
	set_true_colour: function(foreground, background)
	{
		const Glk = this.Glk
		if (Glk.glk_gestalt(0x1100, 0))
		{
			let fg, bg
			if (foreground === 0xFFFE)
			{
				fg = -2
			}
			else
			{
				if (foreground === 0xFFFF)
				{
					fg = -1
				}
				else
				{
					fg = convert_true_colour(foreground)
				}
				this.io.fg = fg
			}

			if (background === 0xFFFE)
			{
				bg = -2
			}
			else
			{
				if (background === 0xFFFF)
				{
					bg = -1
				}
				else
				{
					bg = convert_true_colour(background)
				}
				this.io.bg = bg
			}

			// Set the colours for each open window
			Glk.garglk_set_zcolors_stream(this.mainwin.str, fg, bg)
			if (this.upperwin)
			{
				Glk.garglk_set_zcolors_stream(this.upperwin.str, fg, bg)
			}
		}
	},

	set_window: function( window )
	{
		this.io.currentwin = window;
		
		// Focusing the upper window resets the cursor to the top left;
		// it also opens the upper window if it's not open
		if ( window )
		{
			this.set_cursor( 0, 0 );
		}

		this.Glk.glk_set_window( this.upperwin && window ? this.upperwin : this.mainwin );
		this.format();
	},

	split_window: function( lines )
	{
		var Glk = this.Glk,
		io = this.io,
		row = io.row, col = io.col,
		oldheight = io.height,
		str;
		io.height = lines;

		// Erase existing lines if we are expanding into existing rows
		if ( this.upperwin && lines > oldheight )
		{
			str = Glk.glk_window_get_stream( this.upperwin );
			while ( oldheight < lines )
			{
				Glk.glk_window_move_cursor( this.upperwin, 0, oldheight++ );
				Glk.glk_put_jstring_stream( str, Array( io.width + 1 ).join( ' ' ) );
			}
			Glk.glk_window_move_cursor( this.upperwin, col, row );
		}

		// Don't decrease the height of the window yet, only increase
		if ( lines > io.maxheight )
		{
			io.maxheight = lines;

			// Set the height of the window
			// Create the window if it doesn't exist
			if ( !this.upperwin )
			{
				if (this.io.bg >= 0)
				{
					Glk.glk_stylehint_set(4, 0, 8, this.io.bg)
				}
				this.upperwin = Glk.glk_window_open( this.mainwin, 0x12, io.maxheight, 4, 203 );
				if (this.Glk.glk_gestalt(0x1100, 0))
				{
					Glk.garglk_set_zcolors_stream(this.upperwin.str, this.io.fg, this.io.bg)
				}
				Glk.glk_stylehint_clear(4, 0, 8)
			}
			else
			{
				Glk.glk_window_set_arrangement( Glk.glk_window_get_parent( this.upperwin ), 0x12, io.maxheight, null );
			}
			io.glkheight = io.maxheight
		}

		if ( lines )
		{
			// Reset the cursor if it is now outside the window
			if ( io.row >= lines )
			{
				this.set_cursor( 0, 0 );
			}
			// 8.6.1.1.2: In version three the upper window is always cleared
			if ( this.version3 )
			{
				Glk.glk_window_clear( this.upperwin );
			}
		}
	},

	// Update the header after restarting or restoring
	update_header: function()
	{
		var ram = this.ram;

		// Reset the Xorshift seed
		this.xorshift_seed = 0;

		// Update the screen size variables - in version 3 does not actually set the header variables
		this.update_screen_size()

		// For version 3 we only set Flags 1
		if ( this.version3 )
		{
			return ram.setUint8( 0x01,
				( ram.getUint8( 0x01 ) & 0x8F ) // Keep all except bits 4-6
				| ( this.statuswin ? 0x20 : 0x10 ) // If status win is available then set 0x20 for the upper win also being available, otherwise 0x10 for the status win itself
				| 0x40 // Variable pitch font is default - Or can we tell from options if the font is fixed pitch?
			);
		}
		
		// Flags 1
		ram.setUint8( 0x01,
			(this.Glk.glk_gestalt(0x1100, 0) ? 1 : 0) // Check if colour is supported
			| 0x1C // Bold, italic and mono are supported
			| 0x00 // Timed input not supported yet
		);
		
		// Flags 2: Clear bits 3, 5, 7: no character graphics, mouse or sound effects
		// This is really a word, but we only care about the lower byte
		ram.setUint8( 0x11, ram.getUint8( 0x11 ) & 0x57 );
		
		// Font height/width in "units"
		if ( this.version > 4 )
		{
			ram.setUint16( 0x26, 0x0101 )
		}
		
		// Colours
		//ram.setUint8( 0x2C, isNaN( this.options.bg ) ? 1 : this.options.bg );
		//ram.setUint8( 0x2D, isNaN( this.options.fg ) ? 1 : this.options.fg );
		//this.extension_table( 5, this.options.fg_true );
		//this.extension_table( 6, this.options.bg_true );
		
		// Z Machine Spec revision
		ram.setUint16( 0x32, 0x0102 );
		
		// Clear flags three, we don't support any of that stuff
		this.extension_table( 4, 0 );
	},

	update_screen_size: function()
	{
		const Glk = this.Glk
		const height_box = new Glk.RefBox()
		const width_box = new Glk.RefBox()
		const tempwin = Glk.glk_window_open( this.mainwin, 0x12, 0, 4, 0 )
		let height = 0
		let width = 0

		// The main window is proportional, so its width may not be accurate
		// If the upper or status window is present, use its width, or else try to make a temp window
		// The height is the total of all windows

		Glk.glk_window_get_size( this.mainwin, width_box, height_box )
		height = height_box.get_value()

		if ( this.upperwin )
		{
			Glk.glk_window_get_size( this.upperwin, width_box, height_box )
			height += height_box.get_value()
		}
		if ( this.statuswin )
		{
			Glk.glk_window_get_size( this.statuswin, width_box, height_box )
			height += height_box.get_value()
		}
		if ( tempwin )
		{
			Glk.glk_window_get_size( tempwin, width_box, 0 )
			Glk.glk_window_close( tempwin )
		}

		// Use whichever width was available
		width = width_box.get_value()

		// Cap the dimensions
		// Height is capped to 254 as 255 means infinite, which breaks some games
		height = Math.min( height, 254 )
		width = this.io.width = Math.min( width, 255 )

		// Update the header
		if ( this.version > 3 )
		{
			this.ram.setUint8( 0x20, height )
			this.ram.setUint8( 0x21, width )
		}
		if ( this.version > 4 )
		{
			this.ram.setUint16( 0x22, width )
			this.ram.setUint16( 0x24, height )
		}

		// Fix the cursor if it is outside the window
		if ( this.io.col >= width )
		{
			this.io.col = width - 1
		}
	},
	
	// Output the version 3 status line
	v3_status: function()
	{
		if ( !this.statuswin )
		{
			return;
		}

		var Glk = this.Glk,
		str = Glk.glk_window_get_stream( this.statuswin ),
		memory = this.m,
		width = this.io.width,
		hours_score = memory.getUint16( this.globals + 2 ),
		mins_turns = memory.getUint16( this.globals + 4 ),
		proptable = memory.getUint16( this.objects + 9 * memory.getUint16( this.globals ) + 7 ),
		shortname = '' + this.decode( proptable + 1, memory.getUint8( proptable ) * 2 ),
		rhs;

		// Handle the turns/score or time
		if ( memory.getUint8( 0x01 ) & 0x02 )
		{
			rhs = 'Time: ' + ( hours_score % 12 === 0 ? 12 : hours_score % 12 ) + ':' + ( mins_turns < 10 ? '0' : '' ) + mins_turns + ' ' + ( hours_score > 11 ? 'PM' : 'AM' );
		}
		else
		{
			rhs = 'Score: ' + hours_score + '  Turns: ' + mins_turns;
		}

		// Print a blank line in reverse
		Glk.glk_window_move_cursor( this.statuswin, 0, 0 );
		Glk.glk_put_jstring_stream( str, Array( width + 1 ).join( ' ' ) );

		// Trim the shortname if necessary
		Glk.glk_window_move_cursor( this.statuswin, 0, 0 );
		Glk.glk_put_jstring_stream( str, ' ' + shortname.slice( 0, width - rhs.length - 4 ) );

		// Print the right hand side
		Glk.glk_window_move_cursor( this.statuswin, width - rhs.length - 1, 0 );
		Glk.glk_put_jstring_stream( str, rhs );
	},

};

},{"../common/utils.js":3}],7:[function(require,module,exports){
/*

Z-Machine opcodes
=================

Copyright (c) 2017 The ifvms.js team
MIT licenced
https://github.com/curiousdannii/ifvms.js

*/

'use strict';

/*

TODO:
	Abstract out the signed conversions such that they can be eliminated if possible
	don't access memory directly

*/

var AST = require( '../common/ast.js' ),
Variable = AST.Variable,
Opcode = AST.Opcode,
Stopper = AST.Stopper,
Pauser = AST.Pauser,
PauserStorer = AST.PauserStorer,
Brancher = AST.Brancher,
BrancherStorer = AST.BrancherStorer,
Storer = AST.Storer,
Caller = AST.Caller,
CallerStorer = AST.CallerStorer,
opcode_builder = AST.opcode_builder,

// Common functions, variables and opcodes
simple_func = function( a ) { return '' + a; },
stack_var = new Variable( this.e, 0 ),
alwaysbranch = opcode_builder( Brancher, function() { return 1; } ),
not = opcode_builder( Storer, function( a ) { return 'e.S2U(~' + a + ')'; } ),

// Indirect storer opcodes - rather non-generic I'm afraid
// Not used for inc/dec
// @load (variable) -> (result)
// @pull (variable)
// @store (variable) value
Indirect = Storer.subClass({
	storer: 0,

	post: function()
	{
		var operands = this.operands,
		op0 = operands[0],
		op0isVar = op0 instanceof Variable;

		// Replace the indirect operand with a Variable, and set .indirect if needed
		operands[0] = new Variable( this.e, op0isVar ? op0 : op0.v );
		if ( op0isVar || op0.v === 0 )
		{
			operands[0].indirect = 1;
		}

		// Get the storer
		this.storer = this.code === 142 ? operands.pop() : operands.shift();

		// @pull needs an added stack. If for some reason it was compiled with two operands this will break!
		if ( operands.length === 0 )
		{
			operands.push( stack_var );
		}
	},

	func: simple_func,
}),

Incdec = Opcode.subClass({
	func: function( variable )
	{
		var varnum = variable.v - 1,
		operator = this.code % 2 ? 1 : -1;

		// Fallback to the runtime function if our variable is a variable operand itself
		// Or, if it's a global
		if ( variable instanceof Variable || varnum > 14 )
		{
			return 'e.incdec(' + variable + ',' + operator + ')';
		}

		return ( varnum < 0 ? 'e.s[e.sp-1]' : 'e.l[' + varnum + ']' ) + ( operator === 1 ? '++' : '--' );
	},
}),

// Version 3 @save/restore branch instead of store
V3SaveRestore = Stopper.subClass({
	brancher: 1,

	toString: function()
	{
		return 'e.stop=1;e.' + ( this.code === 181 ? 'save' : 'restore' ) + '(' + ( this.pc + 1 ) + ')';
	},
}),

V45Restore = opcode_builder( PauserStorer, function() { return 'e.restore(' + ( this.next - 1 ) + ')'; } ),
V45Save = opcode_builder( PauserStorer, function() { return 'e.save(' + ( this.next - 1 ) + ')'; } );

/*eslint brace-style: "off" */
/*eslint indent: "off" */

module.exports = function( version )
{

return {

/* je */ 1: opcode_builder( Brancher, function() { return arguments.length === 2 ? this.args( '===' ) : 'e.jeq(' + this.args() + ')'; } ),
/* jl */ 2: opcode_builder( Brancher, function( a, b ) { return a.U2S() + '<' + b.U2S(); } ),
/* jg */ 3: opcode_builder( Brancher, function( a, b ) { return a.U2S() + '>' + b.U2S(); } ),
// Too many U2S/S2U for these...
/* dec_chk */ 4: opcode_builder( Brancher, function( variable, value ) { return 'e.U2S(e.incdec(' + variable + ',-1))<' + value.U2S(); } ),
/* inc_chk */ 5: opcode_builder( Brancher, function( variable, value ) { return 'e.U2S(e.incdec(' + variable + ',1))>' + value.U2S(); } ),
/* jin */ 6: opcode_builder( Brancher, function() { return 'e.jin(' + this.args() + ')'; } ),
/* test */ 7: opcode_builder( Brancher, function() { return 'e.test(' + this.args() + ')'; } ),
/* or */ 8: opcode_builder( Storer, function() { return this.args( '|' ); } ),
/* and */ 9: opcode_builder( Storer, function() { return this.args( '&' ); } ),
/* test_attr */ 10: opcode_builder( Brancher, function() { return 'e.test_attr(' + this.args() + ')'; } ),
/* set_attr */ 11: opcode_builder( Opcode, function() { return 'e.set_attr(' + this.args() + ')'; } ),
/* clear_attr */ 12: opcode_builder( Opcode, function() { return 'e.clear_attr(' + this.args() + ')'; } ),
/* store */ 13: Indirect,
/* insert_obj */ 14: opcode_builder( Opcode, function() { return 'e.insert_obj(' + this.args() + ')'; } ),
/* loadw */ 15: opcode_builder( Storer, function( array, index ) { return 'e.m.getUint16(e.S2U(' + array + '+2*' + index.U2S() + '))'; } ),
/* loadb */ 16: opcode_builder( Storer, function( array, index ) { return 'e.m.getUint8(e.S2U(' + array + '+' + index.U2S() + '))'; } ),
/* get_prop */ 17: opcode_builder( Storer, function() { return 'e.get_prop(' + this.args() + ')'; } ),
/* get_prop_addr */ 18: opcode_builder( Storer, function() { return 'e.find_prop(' + this.args() + ')'; } ),
/* get_next_prop */ 19: opcode_builder( Storer, function() { return 'e.find_prop(' + this.args( ',0,' ) + ')'; } ),
/* add */ 20: opcode_builder( Storer, function() { return 'e.S2U(' + this.args( '+' ) + ')'; } ),
/* sub */ 21: opcode_builder( Storer, function() { return 'e.S2U(' + this.args( '-' ) + ')'; } ),
/* mul */ 22: opcode_builder( Storer, function() { return 'e.S2U(' + this.args( '*' ) + ')'; } ),
/* div */ 23: opcode_builder( Storer, function( a, b ) { return 'e.S2U(parseInt(' + a.U2S() + '/' + b.U2S() + '))'; } ),
/* mod */ 24: opcode_builder( Storer, function( a, b ) { return 'e.S2U(' + a.U2S() + '%' + b.U2S() + ')'; } ),
/* call_2s */ 25: CallerStorer,
/* call_2n */ 26: Caller,
/* set_colour */ 27: opcode_builder( Opcode, function() { return 'e.set_colour(' + this.args() + ')'; } ),
/* throw */ 28: opcode_builder( Stopper, function( value, cookie ) { return 'while(e.frames.length+1>' + cookie + '){e.frameptr=e.frames.pop()}return ' + value; } ),
/* jz */ 128: opcode_builder( Brancher, function( a ) { return a + '===0'; } ),
/* get_sibling */ 129: opcode_builder( BrancherStorer, function( obj ) { return 'e.get_sibling(' + obj + ')'; } ),
/* get_child */ 130: opcode_builder( BrancherStorer, function( obj ) { return 'e.get_child(' + obj + ')'; } ),
/* get_parent */ 131: opcode_builder( Storer, function( obj ) { return 'e.get_parent(' + obj + ')'; } ),
/* get_prop_length */ 132: opcode_builder( Storer, function( a ) { return 'e.get_prop_len(' + a + ')'; } ),
/* inc */ 133: Incdec,
/* dec */ 134: Incdec,
/* print_addr */ 135: opcode_builder( Opcode, function( addr ) { return 'e.print(2,' + addr + ')'; } ),
/* call_1s */ 136: CallerStorer,
/* remove_obj */ 137: opcode_builder( Opcode, function( obj ) { return 'e.remove_obj(' + obj + ')'; } ),
/* print_obj */ 138: opcode_builder( Opcode, function( obj ) { return 'e.print(3,' + obj + ')'; } ),
/* ret */ 139: opcode_builder( Stopper, function( a ) { return 'return ' + a; } ),
/* jump */ 140: opcode_builder( Stopper, function( a ) { return 'e.pc=' + a.U2S() + '+' + ( this.next - 2 ); } ),
/* print_paddr */ 141: opcode_builder( Opcode, function( addr ) { return 'e.print(2,' + addr + '*' + this.e.addr_multipler + ')'; } ),
/* load */ 142: Indirect.subClass( { storer: 1 } ),
143: version < 5 ?
	/* not (v3/4) */ not :
	/* call_1n (v5/8) */ Caller,
/* rtrue */ 176: opcode_builder( Stopper, function() { return 'return 1'; } ),
/* rfalse */ 177: opcode_builder( Stopper, function() { return 'return 0'; } ),
// Reconsider a generalised class for @print/@print_ret?
/* print */ 178: opcode_builder( Opcode, function( text ) { return 'e.print(2,' + text + ')'; }, { printer: 1 } ),
/* print_ret */ 179: opcode_builder( Stopper, function( text ) { return 'e.print(2,' + text + ');e.print(1,13);return 1'; }, { printer: 1 } ),
/* nop */ 180: Opcode,
/* save (v3/4) */ 181: version < 4 ?
	V3SaveRestore :
	V45Save,
/* restore(v3/4) */ 182: version < 4 ?
	V3SaveRestore :
	V45Restore,
/* restart */ 183: opcode_builder( Stopper, function() { return 'e.restart()'; } ),
/* ret_popped */ 184: opcode_builder( Stopper, function( a ) { return 'return ' + a; }, { post: function() { this.operands.push( stack_var ); } } ),
185: version < 5 ?
	/* pop (v3/4) */ opcode_builder( Opcode, function() { return 's[--e.sp]'; } ) :
	/* catch (v5/8) */ opcode_builder( Storer, function() { return 'e.frames.length+1'; } ),
/* quit */ 186: opcode_builder( Pauser, function() { return 'e.quit=1;e.Glk.glk_exit()'; } ),
/* new_line */ 187: opcode_builder( Opcode, function() { return 'e.print(1,13)'; } ),
188: version < 4 ?
	/* show_status (v3) */ opcode_builder( Stopper, function() { return 'e.pc=' + this.next + ';e.v3_status()'; } ) :
	/* act as a nop in later versions */ Opcode,
/* verify */ 189: alwaysbranch, // Actually check??
/* piracy */ 191: alwaysbranch,
/* call_vs */ 224: CallerStorer,
/* storew */ 225: opcode_builder( Opcode, function( array, index, value ) { return 'e.ram.setUint16(e.S2U(' + array + '+2*' + index.U2S() + '),' + value + ')'; } ),
/* storeb */ 226: opcode_builder( Opcode, function( array, index, value ) { return 'e.ram.setUint8(e.S2U(' + array + '+' + index.U2S() + '),' + value + ')'; } ),
/* put_prop */ 227: opcode_builder( Opcode, function() { return 'e.put_prop(' + this.args() + ')'; } ),
/* read */ 228: version < 5 ?
	opcode_builder( Pauser, function() { return 'e.read(0,' + this.args() + ')'; } ) :
	opcode_builder( PauserStorer, function() { return 'e.read(' + this.storer.v + ',' + this.args() + ')'; } ),
/* print_char */ 229: opcode_builder( Opcode, function( a ) { return 'e.print(4,' + a + ')'; } ),
/* print_num */ 230: opcode_builder( Opcode, function( a ) { return 'e.print(0,' + a.U2S() + ')'; } ),
/* random */ 231: opcode_builder( Storer, function( a ) { return 'e.random(' + a.U2S() + ')'; } ),
/* push */ 232: opcode_builder( Storer, simple_func, { post: function() { this.storer = stack_var; }, storer: 0 } ),
/* pull */ 233: Indirect,
/* split_window */ 234: opcode_builder( Opcode, function( lines ) { return 'e.split_window(' + lines + ')'; } ),
/* set_window */ 235: opcode_builder( Opcode, function( wind ) { return 'e.set_window(' + wind + ')'; } ),
/* call_vs2 */ 236: CallerStorer,
/* erase_window */ 237: opcode_builder( Opcode, function( win ) { return 'e.erase_window(' + win.U2S() + ')'; } ),
/* erase_line */ 238: opcode_builder( Opcode, function( a ) { return 'e.erase_line(' + a + ')'; } ),
/* set_cursor */ 239: opcode_builder( Opcode, function( row, col ) { return 'e.set_cursor(' + row + '-1,' + col + '-1)'; } ),
/* get_cursor */ 240: opcode_builder( Opcode, function( addr ) { return 'e.get_cursor(' + addr + ')'; } ),
/* set_text_style */ 241: opcode_builder( Opcode, function( stylebyte ) { return 'e.set_style(' + stylebyte + ')'; } ),
/* buffer_mode */ 242: Opcode, // We don't support non-buffered output
/* output_stream */ 243: opcode_builder( Stopper, function() { return 'e.pc=' + this.next + ';e.output_stream(' + this.args() + ')'; } ),
/* input_stream */ 244: opcode_builder( Pauser, function() { return 'e.input_stream(' + this.args() + ')'; } ),
/* sound_effect */ 245: Opcode, // We don't support sounds
/* read_char */ 246: opcode_builder( PauserStorer, function() { return 'e.read_char(' + this.storer.v + ',' + ( this.args() || '1' ) + ')'; } ),
/* scan_table */ 247: opcode_builder( BrancherStorer, function() { return 'e.scan_table(' + this.args() + ')'; } ),
/* not (v5/8) */ 248: not,
/* call_vn */ 249: Caller,
/* call_vn2 */ 250: Caller,
/* tokenise */ 251: opcode_builder( Opcode, function() { return 'e.tokenise(' + this.args() + ')'; } ),
/* encode_text */ 252: opcode_builder( Opcode, function() { return 'e.encode_text(' + this.args() + ')'; } ),
/* copy_table */ 253: opcode_builder( Opcode, function() { return 'e.copy_table(' + this.args() + ')'; } ),
/* print_table */ 254: opcode_builder( Opcode, function() { return 'e.print_table(' + this.args() + ')'; } ),
/* check_arg_count */ 255: opcode_builder( Brancher, function( arg ) { return 'e.stack.getUint8(e.frameptr+5)&(1<<(' + arg + '-1))'; } ),
/* save */ 1000: V45Save,
/* restore */ 1001: V45Restore,
/* log_shift */ 1002: opcode_builder( Storer, function( a, b ) { return 'e.S2U(e.log_shift(' + a + ',' + b.U2S() + '))'; } ),
/* art_shift */ 1003: opcode_builder( Storer, function( a, b ) { return 'e.S2U(e.art_shift(' + a.U2S() + ',' + b.U2S() + '))'; } ),
/* set_font */ 1004: opcode_builder( Storer, function( font ) { return 'e.set_font(' + font + ')'; } ),
/* save_undo */ 1009: opcode_builder( Storer, function() { return 'e.save_undo(' + this.next + ',' + this.storer.v + ')'; } ),
// As the standard says calling this without a save point is illegal, we don't need to actually store anything (but it must still be disassembled)
/* restore_undo */ 1010: opcode_builder( Opcode, function() { return 'if(e.restore_undo())return'; }, { storer: 1 } ),
/* print_unicode */ 1011: opcode_builder( Opcode, function( a ) { return 'e.print(1,' + a + ')'; } ),
// Assume we can print and read all unicode characters rather than actually testing
/* check_unicode */ 1012: opcode_builder( Storer, function() { return 3; } ),
/* set_true_colour */ 1013: opcode_builder( Opcode, function() { return 'e.set_true_colour(' + this.args() + ')'; } ),
/* sound_data */ 1014: Opcode.subClass( { brancher: 1 } ), // We don't support sounds (but disassemble the branch address)
/* gestalt */ 1030: opcode_builder( Storer, function() { return 'e.gestalt(' + this.args() + ')'; } ),
/* parchment */ //1031: opcode_builder( Storer, function() { return 'e.op_parchment(' + this.args() + ')'; } ),

};

};

},{"../common/ast.js":1}],8:[function(require,module,exports){
/*

Z-Machine runtime functions
===========================

Copyright (c) 2020 The ifvms.js team
MIT licenced
https://github.com/curiousdannii/ifvms.js

*/

'use strict';

/*

TODO:
	Save/restore: table, name, prompt support

*/

const file = require( '../common/file.js' )
const utils = require( '../common/utils.js' )
const extend = utils.extend
const U2S = utils.U2S16
const S2U = utils.S2U16

// A clone function which ignores the properties we don't want to serialise
function clone( obj )
{
	const recurse = obj => typeof obj === 'object' ? clone( obj ) : obj
	const newobj = {}

	if ( Array.isArray( obj ) )
	{
		return obj.map( recurse )
	}

	for ( let prop in obj )
	{
		if ( prop !== 'buffer' && prop !== 'str' )
		{
			newobj[prop] = recurse( obj[prop] )
		}
	}
	return newobj
}

// Test whether we are running on a littleEndian system
const littleEndian = (function()
{
	var testUint8Array = new Uint8Array( 2 ),
	testUint16Array = new Uint16Array( testUint8Array.buffer );
	testUint16Array[0] = 1;
	return testUint8Array[0] === 1;
})()

function fix_stack_endianness( view, start, end, auto )
{
	if ( littleEndian && !auto )
	{
		while ( start < end )
		{
			view.setUint16( start, view.getUint16( start, 1 ) );
			start += 2;
		}
	}
}

module.exports = {

	art_shift: function( number, places )
	{
		return places > 0 ? number << places : number >> -places;
	},

	// Call a routine
	call: function( addr, storer, next, args )
	{
		// 6.4.3: Calls to 0 instead just store 0
		if ( addr === 0 )
		{
			if ( storer >= 0 )
			{
				this.variable( storer, 0 );
			}
			return this.pc = next;
		}

		// Get the number of locals and advance the pc
		this.pc = addr * this.addr_multipler;
		var locals_count = this.m.getUint8( this.pc++ ),

		stack = this.stack,
		i = 0,

		// Write the current stack use
		frameptr = this.frameptr;
		stack.setUint16( frameptr + 6, this.sp );
		this.frames.push( frameptr );

		// Create a new frame
		frameptr = this.frameptr = this.s.byteOffset + this.sp * 2;
		// Return address
		stack.setUint32( frameptr, next << 8 );
		// Flags
		stack.setUint8( frameptr + 3, ( storer >= 0 ? 0 : 0x10 ) | locals_count );
		// Storer
		stack.setUint8( frameptr + 4, storer >= 0 ? storer : 0 );
		// Supplied arguments
		stack.setUint8( frameptr + 5, ( 1 << args.length ) - 1 );

		// Create the locals and stack
		this.make_stacks();
		this.sp = 0;
		while ( i < locals_count )
		{
			this.l[i] = i < args.length ? args[i] : ( this.version < 5 ? this.m.getUint16( this.pc + i * 2 ) : 0 );
			i++;
		}
		if ( this.version < 5 )
		{
			this.pc += locals_count * 2;
		}
	},

	clear_attr: function( object, attribute )
	{
		var addr = this.objects + ( this.version3 ? 9 : 14 ) * object + ( attribute / 8 ) | 0;
		this.ram.setUint8( addr, this.m.getUint8( addr ) & ~( 0x80 >> attribute % 8 ) );
	},

	copy_table: function( first, second, size )
	{
		size = U2S( size );
		var ram = this.ram,
		i = 0,
		allowcorrupt = size < 0;
		size = Math.abs( size );

		// Simple case, zeroes
		if ( second === 0 )
		{
			while ( i < size )
			{
				ram.setUint8( first + i++, 0 );
			}
			return;
		}

		if ( allowcorrupt )
		{
			while ( i < size )
			{
				ram.setUint8( second + i, this.m.getUint8( first + i++ ) );
			}
		}
		else
		{
			ram.setUint8Array( second, this.m.getUint8Array( first, size ) );
		}
	},

	do_autorestore: function( snapshot )
	{
		const Glk = this.Glk

		// Restore Glk
		Glk.restore_allstate( snapshot.glk )

		// Get references to our Glk objects
		this.io = snapshot.io
		const RockBox = new Glk.RefBox()
		let obj
		while ( obj = Glk.glk_window_iterate( obj, RockBox ) )
		{
			if ( RockBox.value === 201 )
			{
				this.mainwin = obj
				if ( obj.linebuf )
				{
					snapshot.read_data.buffer = obj.linebuf
				}
			}
			if ( RockBox.value === 202 )
			{
				this.statuswin = obj
			}
			if ( RockBox.value === 203 )
			{
				this.upperwin = obj
			}
		}
		obj = null
		while ( obj = Glk.glk_stream_iterate( obj, RockBox ) )
		{
			if ( RockBox.value === 210 )
			{
				this.io.streams[2].str = obj
			}
			if ( RockBox.value === 211 )
			{
				this.io.streams[4].str = obj
			}
		}

		// Restart and restore the RAM and stacks
		this.restart(1)
		this.restore_file(this.options.Dialog.streaming ? new Uint8Array(snapshot.ram) : Uint8Array.from(snapshot.ram), 1)

		// Set remaining data from the snapshot
		this.read_data = snapshot.read_data
		this.xorshift_seed = snapshot.xorshift_seed
	},

	do_autosave: function( save )
	{
		if ( !this.options.Dialog )
		{
			throw new Error( 'A reference to Dialog is required' )
		}

		let snapshot = null
		if ( ( save || 0 ) >= 0 )
		{
			const ram = this.save_file(this.pc, 1)
			snapshot = {
				glk: this.Glk.save_allstate(),
				io: clone( this.io ),
				ram: this.options.Dialog.streaming ? ram : Array.from(new Uint8Array(ram)),
				read_data: clone( this.read_data ),
				xorshift_seed: this.xorshift_seed,
			}
		}

		this.options.Dialog.autosave_write( this.signature, snapshot )
	},

	encode_text: function( zscii, length, from, target )
	{
		this.ram.setUint8Array( target, this.encode( this.m.getUint8Array( zscii + from, length ) ) );
	},

	// Access the extension table
	extension_table: function( word, value )
	{
		var addr = this.extension;
		if ( !addr || word > this.extension_count )
		{
			return 0;
		}
		addr += 2 * word;
		if ( value === undefined )
		{
			return this.m.getUint16( addr );
		}
		this.ram.setUint16( addr, value );
	},

	// Find the address of a property, or given the previous property, the number of the next
	find_prop: function( object, property, prev )
	{
		var memory = this.m,
		version3 = this.version3,

		this_property_byte, this_property,
		last_property = 0,

		// Get this property table
		properties = memory.getUint16( this.objects + ( version3 ? 9 : 14 ) * object + ( version3 ? 7 : 12 ) );

		// Skip over the object's short name
		properties += memory.getUint8( properties ) * 2 + 1;

		// Run through the properties
		while ( 1 )
		{
			this_property_byte = memory.getUint8( properties );
			this_property = this_property_byte & ( version3 ? 0x1F : 0x3F );

			// Found the previous property, so return this one's number
			if ( last_property === prev )
			{
				return this_property;
			}
			// Found the property! Return its address
			if ( this_property === property )
			{
				// Must include the offset
				return properties + ( !version3 && this_property_byte & 0x80 ? 2 : 1 );
			}
			// Gone past the property
			if ( this_property < property )
			{
				return 0;
			}

			// Go to next property
			last_property = this_property;

			// Calculate the size of this property and skip to the next
			if ( version3 )
			{
				properties += ( this_property_byte >> 5 ) + 2;
			}
			else
			{
				if ( this_property_byte & 0x80 )
				{
					this_property = memory.getUint8( properties + 1 ) & 0x3F;
					properties += this_property ? this_property + 2 : 66;
				}
				else
				{
					properties += this_property_byte & 0x40 ? 3 : 2;
				}
			}
		}
	},

	// 1.2 spec @gestalt
	gestalt: function( id /*, arg*/ )
	{
		switch ( id )
		{
			case 1:
				return 0x0102;
		}
		return 0;
	},

	// Get the first child of an object
	get_child: function( obj )
	{
		if ( this.version3 )
		{
			return this.m.getUint8( this.objects + 9 * obj + 6 );
		}
		else
		{
			return this.m.getUint16( this.objects + 14 * obj + 10 );
		}
	},

	get_sibling: function( obj )
	{
		if ( this.version3 )
		{
			return this.m.getUint8( this.objects + 9 * obj + 5 );
		}
		else
		{
			return this.m.getUint16( this.objects + 14 * obj + 8 );
		}
	},

	get_parent: function( obj )
	{
		if ( this.version3 )
		{
			return this.m.getUint8( this.objects + 9 * obj + 4 );
		}
		else
		{
			return this.m.getUint16( this.objects + 14 * obj + 6 );
		}
	},

	get_prop: function( object, property )
	{
		var memory = this.m,

		// Try to find the property
		addr = this.find_prop( object, property ),
		len;

		// If we have the property
		if ( addr )
		{
			len = memory.getUint8( addr - 1 );
			// Assume we're being called for a valid short property
			return memory[ ( this.version3 ? len >> 5 : len & 0x40 ) ? 'getUint16' : 'getUint8' ]( addr );
		}

		// Use the default properties table
		// Remember that properties are 1-indexed
		return memory.getUint16( this.properties + 2 * ( property - 1 ) );
	},

	// Get the length of a property
	// This opcode expects the address of the property data, not a property block
	get_prop_len: function( addr )
	{
		// Spec 1.1
		if ( addr === 0 )
		{
			return 0;
		}

		var value = this.m.getUint8( addr - 1 );

		// Version 3
		if ( this.version3 )
		{
			return ( value >> 5 ) + 1;
		}

		// Two size/number bytes
		if ( value & 0x80 )
		{
			value &= 0x3F;
			return value === 0 ? 64 : value;
		}
		// One byte size/number
		return value & 0x40 ? 2 : 1;
	},

	// Quick hack for @inc/@dec/@inc_chk/@dec_chk
	incdec: function( varnum, change )
	{
		if ( varnum === 0 )
		{
			this.s[this.sp - 1] += change;
			return this.s[this.sp - 1];
		}
		if ( --varnum < 15 )
		{
			this.l[varnum] += change;
			return this.l[varnum];
		}
		else
		{
			var offset = this.globals + ( varnum - 15 ) * 2;
			this.ram.setUint16( offset, this.m.getUint16( offset ) + change );
			return this.ram.getUint16( offset );
		}
	},

	// Indirect variables
	indirect: function( variable, value )
	{
		if ( variable === 0 )
		{
			if ( arguments.length > 1 )
			{
				return this.s[this.sp - 1] = value;
			}
			else
			{
				return this.s[this.sp - 1];
			}
		}
		return this.variable( variable, value );
	},

	insert_obj: function( obj, dest )
	{
		// First remove the obj from wherever it was
		this.remove_obj( obj );
		// Now add it to the destination
		this.set_family( obj, dest, dest, obj, obj, this.get_child( dest ) );
	},

	// @jeq
	jeq: function()
	{
		var i = 1;

		// Account for many arguments
		while ( i < arguments.length )
		{
			if ( arguments[i++] === arguments[0] )
			{
				return 1;
			}
		}
	},

	jin: function( child, parent )
	{
		return this.get_parent( child ) === parent;
	},

	log: function( message )
	{
		if ( this.options.GlkOte )
		{
			this.options.GlkOte.log( message );
		}
	},

	log_shift: function( number, places )
	{
		return places > 0 ? number << places : number >>> -places;
	},

	make_stacks: function()
	{
		var locals_count = this.stack.getUint8( this.frameptr + 3 ) & 0x0F;
		this.l = new Uint16Array( this.stack.buffer, this.frameptr + 8, locals_count );
		this.s = new Uint16Array( this.stack.buffer, this.frameptr + 8 + locals_count * 2 );
	},

	put_prop: function( object, property, value )
	{
		// Try to find the property
		var addr = this.find_prop( object, property ),
		len;

		if ( addr )
		{
			len = this.m.getUint8( addr - 1 );

			// Assume we're being called for a valid short property
			this.ram[ ( this.version3 ? len >> 5 : len & 0x40 ) ? 'setUint16' : 'setUint8' ]( addr, value );
		}
	},

	random: function( range )
	{
		var seed = this.xorshift_seed;

		// Switch to the Xorshift RNG (or switch off if range == 0)
		if ( range < 1 )
		{
			this.xorshift_seed = range;
			return 0;
		}

		// Pure randomness
		if ( seed === 0 )
		{
			return 1 + ( Math.random() * range ) | 0;
		}

		// Based on the discussions in this forum topic, we will not implement the sequential mode recommended in the standard
		// http://www.intfiction.org/forum/viewtopic.php?f=38&t=16023

		// Instead implement a 32 bit Xorshift generator
		seed ^= ( seed << 13 );
		seed ^= ( seed >> 17 );
		this.xorshift_seed = ( seed ^= ( seed << 5 ) );
		return 1 + ( ( seed & 0x7FFF ) % range );
	},

	remove_obj: function( obj )
	{
		var parent = this.get_parent( obj ),
		older_sibling,
		younger_sibling,
		temp_younger;

		// No parent, do nothing
		if ( parent === 0 )
		{
			return;
		}

		older_sibling = this.get_child( parent );
		younger_sibling = this.get_sibling( obj );

		// obj is first child
		if ( older_sibling === obj )
		{
			this.set_family( obj, 0, parent, younger_sibling );
		}
		// obj isn't first child, so fix the older sibling
		else
		{
			// Go through the tree until we find the older sibling
			while ( 1 )
			{
				temp_younger = this.get_sibling( older_sibling );
				if ( temp_younger === obj )
				{
					break;
				}
				older_sibling = temp_younger;
			}
			this.set_family( obj, 0, 0, 0, older_sibling, younger_sibling );
		}
	},

	// (Re)start the VM
	restart: function(autorestoring)
	{
		var ram = this.ram,
		version = ram.getUint8( 0x00 ),
		version3 = version === 3,
		addr_multipler = version3 ? 2 : ( version === 8 ? 8 : 4 ),
		flags2 = ram.getUint8( 0x11 ),
		property_defaults = ram.getUint16( 0x0A ),
		extension = ( version > 4 ) ? ram.getUint16( 0x36 ) : 0,
		stack = utils.MemoryView( this.options.stack_len );

		// Reset the RAM, but preserve flags 2
		ram.setUint8Array( 0, this.origram );
		ram.setUint8( 0x11, flags2 );

		extend( this, {

			// Locals and stacks of various kinds
			stack: stack,
			frameptr: 0,
			frames: [],
			s: new Uint16Array( stack.buffer, 8 ),
			sp: 0,
			l: [],
			undo: [],
			undo_len: 0,
			
			glk_blocking_call: null,

			// Get some header variables
			version: version,
			version3: version3,
			pc: ram.getUint16( 0x06 ),
			properties: property_defaults,
			objects: property_defaults + ( version3 ? 53 : 112 ), // 62-9 or 126-14 - if we take this now then we won't need to always decrement the object number
			globals: ram.getUint16( 0x0C ),
			// staticmem: set in prepare()
			eof: ( ram.getUint16( 0x1A ) || 65536 ) * addr_multipler,
			extension: extension,
			extension_count: extension ? ram.getUint16( extension ) : 0,

			// Routine and string multiplier
			addr_multipler: addr_multipler,

			// Opcodes for this version of the Z-Machine
			opcodes: require( './opcodes.js' )( version ),

		});

		this.init_text();
		if (!autorestoring)
		{
			this.init_io()
		}

		// Update the header
		this.update_header();
	},

	// Request a restore
	restore: function( pc )
	{
		this.pc = pc;
		this.fileref_create_by_prompt({
			func: 'restore',
			mode: 0x02,
			usage: 0x01,
		});
	},

	restore_file: function( data, autorestoring )
	{
		var ram = this.ram,
		quetzal = new file.Quetzal( data ),
		qmem = quetzal.memory,
		stack = this.stack,
		flags2 = ram.getUint8( 0x11 ),
		temp,
		i = 0, j = 0;
		
		// Check this is a savefile for this story
		if ( ram.getUint16( 0x02 ) !== quetzal.release || ram.getUint16( 0x1C ) !== quetzal.checksum )
		{
			return 0;
		}
		while ( i < 6 )
		{
			if ( ram.getUint8( 0x12 + i ) !== quetzal.serial[i++] )
			{
				return 0;
			}
		}
		i = 0;

		// Memory chunk
		// Reset the RAM
		ram.setUint8Array( 0, this.origram );
		if ( quetzal.compressed )
		{
			while ( i < qmem.length )
			{
				temp = qmem[i++];
				// Same memory
				if ( temp === 0 )
				{
					j += 1 + qmem[i++];
				}
				else
				{
					ram.setUint8( j, temp ^ this.origram[j++] );
				}
			}
		}
		else
		{
			ram.setUint8Array( 0, qmem );
		}
		// Preserve flags 2
		ram.setUint8( 0x11, flags2 );

		// Stacks
		stack.setUint8Array( 0, quetzal.stacks );
		this.frames = [];
		i = 0;
		while ( i < quetzal.stacks.byteLength )
		{
			this.frameptr = i;
			this.frames.push( i );
			// Swap the bytes of the locals and stacks
			fix_stack_endianness( stack, j = i + 8, j += ( stack.getUint8( i + 3 ) & 0x0F ) * 2, autorestoring )
			fix_stack_endianness( stack, j, j += stack.getUint16( i + 6 ) * 2, autorestoring )
			i = j;
		}
		this.frames.pop();
		this.sp = stack.getUint16( this.frameptr + 6 );
		this.make_stacks();

		this.pc = quetzal.pc;
		this.update_header();

		// Collapse the upper window (8.6.1.3)
		if ( this.version3 )
		{
			this.split_window( 0 );
		}

		return 2;
	},

	restore_undo: function()
	{
		if ( this.undo.length === 0 )
		{
			return 0;
		}

		var state = this.undo.pop();
		this.frameptr = state.frameptr;
		this.pc = state.pc;
		this.undo_len -= ( state.ram.byteLength + state.stack.byteLength );

		// Replace the ram, preserving flags 2
		state.ram[0x11] = this.m.getUint8( 0x11 );
		this.ram.setUint8Array( 0, state.ram );

		// Fix up the stack
		this.frames = state.frames;
		this.sp = state.sp;
		this.stack.setUint8Array( 0, state.stack );
		this.make_stacks();

		this.variable( state.var, 2 );
		return 1;
	},

	// Return from a routine
	ret: function( result )
	{
		var stack = this.stack,

		// Get the storer and return pc from this frame
		frameptr = this.frameptr,
		storer = stack.getUint8( frameptr + 3 ) & 0x10 ? -1 : stack.getUint8( frameptr + 4 );
		this.pc = stack.getUint32( frameptr ) >> 8;

		// Recreate the locals and stacks from the previous frame
		frameptr = this.frameptr = this.frames.pop();
		this.make_stacks();
		this.sp = stack.getUint16( frameptr + 6 );

		// Store the result if there is one
		if ( storer >= 0 )
		{
			this.variable( storer, result || 0 );
		}
	},

	// pc is the address of the storer operand (or branch in v3)
	save: function( pc )
	{
		this.pc = pc;
		this.fileref_create_by_prompt({
			func: 'save',
			mode: 0x01,
			usage: 0x01,
		});
	},
	
	save_file: function( pc, autosaving )
	{
		var memory = this.m,
		quetzal = new file.Quetzal(),
		stack = utils.MemoryView( this.stack.buffer.slice() ),
		zeroes = 0,
		i, j,
		frameptr = this.frameptr,
		abyte;

		// IFhd chunk
		quetzal.release = memory.getUint16( 0x02 );
		quetzal.serial = memory.getUint8Array( 0x12, 6 );
		quetzal.checksum = memory.getUint16( 0x1C );
		quetzal.pc = pc;

		// Memory chunk
		if ( autosaving )
		{
			quetzal.memory = this.m.getUint8Array( 0, this.staticmem )
		}
		else
		{
			const compressed_mem = []
			quetzal.compressed = 1;
			for ( i = 0; i < this.staticmem; i++ )
			{
				abyte = memory.getUint8( i ) ^ this.origram[i];
				if ( abyte === 0 )
				{
					if ( ++zeroes === 256 )
					{
						compressed_mem.push( 0, 255 );
						zeroes = 0;
					}
				}
				else
				{
					if ( zeroes )
					{
						compressed_mem.push( 0, zeroes - 1 );
						zeroes = 0;
					}
					compressed_mem.push( abyte );
				}
			}
			quetzal.memory = compressed_mem;
		}

		// Stacks
		// Set the current sp
		stack.setUint16( frameptr + 6, this.sp );

		// Swap the bytes of the locals and stacks
		if ( littleEndian && !autosaving )
		{
			const frames = this.frames.slice()
			frames.push( frameptr )
			for ( i = 0; i < frames.length; i++ )
			{
				frameptr = frames[i];
				fix_stack_endianness( stack, j = frameptr + 8, j += ( stack.getUint8( frameptr + 3 ) & 0x0F ) * 2 );
				fix_stack_endianness( stack, j, j += stack.getUint16( frameptr + 6 ) * 2 );
			}
		}
		quetzal.stacks = stack.getUint8Array( 0, this.frameptr + 8 + ( stack.getUint8( frameptr + 3 ) & 0x0F ) * 2 + this.sp * 2 );

		return quetzal.write();
	},
	
	save_restore_handler: function( str )
	{
		var memory = this.m,
		Glk = this.Glk,
		result = 0,
		buffer = [],
		temp, iftrue, offset;
		
		if ( str )
		{
			// Save
			if ( this.fileref_data.func === 'save' )
			{
				Glk.glk_put_buffer_stream( str, new Uint8Array( this.save_file( this.pc ) ) );
				result = 1;
			}
			// Restore
			else
			{
				buffer = new Uint8Array( 128 * 1024 );
				Glk.glk_get_buffer_stream( str, buffer );
				result = this.restore_file( buffer.buffer );
			}
			Glk.glk_stream_close( str );
		}
		
		// Store the result / branch in z3
		if ( this.version3 )
		{
			// Calculate the branch
			temp = memory.getUint8( this.pc++ );
			iftrue = temp & 0x80;
			offset = temp & 0x40 ?
				// single byte address
				temp & 0x3F :
				// word address, but first get the second byte of it
				( temp << 8 | memory.getUint8( this.pc++ ) ) << 18 >> 18;

			if ( !result === !iftrue )
			{
				if ( offset === 0 || offset === 1 )
				{
					this.ret( offset );
				}
				else
				{
					this.pc += offset - 2;
				}
			}
		}
		else
		{
			this.variable( memory.getUint8( this.pc++ ), result );
		}
	},

	save_undo: function( pc, variable )
	{
		// Drop an old undo state if we've reached the limit, but always save at least one state
		var state
		if ( this.undo_len > this.options.undo_len )
		{
			state = this.undo.shift()
			this.undo_len -= ( state.ram.byteLength + state.stack.byteLength )
		}
		state = {
			frameptr: this.frameptr,
			frames: this.frames.slice(),
			pc: pc,
			ram: this.m.getUint8Array( 0, this.staticmem ),
			sp: this.sp,
			stack: this.stack.getUint8Array( 0, this.s.byteOffset + this.sp * 2 ),
			var: variable,
		}
		this.undo_len += ( state.ram.byteLength + state.stack.byteLength )
		this.undo.push( state )
		return 1
	},

	scan_table: function( key, addr, length, form )
	{
		form = form || 0x82;
		var memoryfunc = form & 0x80 ? 'getUint16' : 'getUint8';
		form &= 0x7F;
		length = addr + length * form;

		while ( addr < length )
		{
			if ( this.m[memoryfunc]( addr ) === key )
			{
				return addr;
			}
			addr += form;
		}
		return 0;
	},

	set_attr: function( object, attribute )
	{
		var addr = this.objects + ( this.version3 ? 9 : 14 ) * object + ( attribute / 8 ) | 0;
		this.ram.setUint8( addr, this.m.getUint8( addr ) | 0x80 >> attribute % 8 );
	},

	set_family: function( obj, newparent, parent, child, bigsis, lilsis )
	{
		var ram = this.ram,
		objects = this.objects;

		if ( this.version3 )
		{
			// Set the new parent of the obj
			ram.setUint8( objects + 9 * obj + 4, newparent );
			// Update the parent's first child if needed
			if ( parent )
			{
				ram.setUint8( objects + 9 * parent + 6, child );
			}
			// Update the little sister of a big sister
			if ( bigsis )
			{
				ram.setUint8( objects + 9 * bigsis + 5, lilsis );
			}
		}
		else
		{
			// Set the new parent of the obj
			ram.setUint16( objects + 14 * obj + 6, newparent );
			// Update the parent's first child if needed
			if ( parent )
			{
				ram.setUint16( objects + 14 * parent + 10, child );
			}
			// Update the little sister of a big sister
			if ( bigsis )
			{
				ram.setUint16( objects + 14 * bigsis + 8, lilsis );
			}
		}
	},

	test: function( bitmap, flag )
	{
		return ( bitmap & flag ) === flag;
	},

	test_attr: function( object, attribute )
	{
		return ( this.m.getUint8( this.objects + ( this.version3 ? 9 : 14 ) * object + ( attribute / 8 ) | 0 ) << attribute % 8 ) & 0x80;
	},

	// Read or write a variable
	variable: function( variable, value )
	{
		var havevalue = value !== undefined,
		offset;
		if ( variable === 0 )
		{
			if ( havevalue )
			{
				this.s[this.sp++] = value;
			}
			else
			{
				return this.s[--this.sp];
			}
		}
		else if ( --variable < 15 )
		{
			if ( havevalue )
			{
				this.l[variable] = value;
			}
			else
			{
				return this.l[variable];
			}
		}
		else
		{
			offset = this.globals + ( variable - 15 ) * 2;
			if ( havevalue )
			{
				this.ram.setUint16( offset, value );
			}
			else
			{
				return this.m.getUint16( offset );
			}
		}
		return value;
	},

	// Utilities for signed arithmetic
	U2S: U2S,
	S2U: S2U,

};

},{"../common/file.js":2,"../common/utils.js":3,"./opcodes.js":7}],9:[function(require,module,exports){
/*

Z-Machine text functions
========================

Copyright (c) 2017 The ifvms.js team
MIT licenced
https://github.com/curiousdannii/ifvms.js

*/

/*

TODO:
	Consider quote suggestions from 1.1 spec

*/

module.exports = {

	init_text: function()
	{
		var self = this,
		memory = this.m,

		alphabet_addr = ( this.version > 4 ) && memory.getUint16( 0x34 ),
		unicode_addr = this.extension_table( 3 ),
		unicode_len = unicode_addr && memory.getUint8( unicode_addr++ );

		this.abbr_addr = memory.getUint16( 0x18 );

		// Generate alphabets
		function make_alphabet( data )
		{
			var alphabets = [[], [], []],
			i = 0;
			while ( i < 78 )
			{
				alphabets[( i / 26 ) | 0][i % 26] = data[ i++ ];
			}
			// A2->7 is always a newline
			alphabets[2][1] = 13;
			self.alphabets = alphabets;
		}

		// Make the unicode tables
		function make_unicode( data )
		{
			var table = { 13: '\r' }, // New line conversion
			reverse = { 13: 13 },
			i = 0;
			while ( i < data.length )
			{
				table[155 + i] = String.fromCharCode( data[i] );
				reverse[data[i]] = 155 + i++;
			}
			i = 32;
			while ( i < 127 )
			{
				table[i] = String.fromCharCode( i );
				reverse[i] = i++;
			}
			self.unicode_table = table;
			self.reverse_unicode_table = reverse;
		}

		// Check for custom alphabets
		make_alphabet( alphabet_addr ? memory.getUint8Array( alphabet_addr, 78 )
			// Or use the standard alphabet
			: this.text_to_zscii( 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ \r0123456789.,!?_#\'"/\\-:()', 1 ) );

		// Check for a custom unicode table
		make_unicode( unicode_addr ? memory.getUint16Array( unicode_addr, unicode_len )
			// Or use the default
			: this.text_to_zscii( unescape( '%E4%F6%FC%C4%D6%DC%DF%BB%AB%EB%EF%FF%CB%CF%E1%E9%ED%F3%FA%FD%C1%C9%CD%D3%DA%DD%E0%E8%EC%F2%F9%C0%C8%CC%D2%D9%E2%EA%EE%F4%FB%C2%CA%CE%D4%DB%E5%C5%F8%D8%E3%F1%F5%C3%D1%D5%E6%C6%E7%C7%FE%F0%DE%D0%A3%u0153%u0152%A1%BF' ), 1 ) );

		// Parse the standard dictionary
		this.dictionaries = {};
		this.dict = memory.getUint16( 0x08 );
		this.parse_dict( this.dict );

		// Optimise our own functions
		/*if ( DEBUG )
		{
			if ( !debugflags.nooptimise )
			optimise_obj( this, 'TEXT' );
		}*/
	},

	// Decode Z-chars into ZSCII and then Unicode
	decode: function( addr, length )
	{
		var memory = this.m,

		start_addr = addr,
		temp,
		buffer = [],
		i = 0,
		zchar,
		alphabet = 0,
		result = [],
		resulttexts = [],
		usesabbr,
		unicodecount = 0;

		// Check if this one's been cached already
		if ( this.jit[addr] )
		{
			return this.jit[addr];
		}

		// If we've been given a length, then use it as the finaladdr,
		// Otherwise don't go past the end of the file
		length = length ? length + addr : this.eof;

		// Go through until we've reached the end of the text or a stop bit
		while ( addr < length )
		{
			temp = memory.getUint16( addr );
			addr += 2;

			buffer.push( temp >> 10 & 0x1F, temp >> 5 & 0x1F, temp & 0x1F );

			// Stop bit
			if ( temp & 0x8000 )
			{
				break;
			}
		}

		// Process the Z-chars
		while ( i < buffer.length )
		{
			zchar = buffer[i++];

			// Special chars
			// Space
			if ( zchar === 0 )
			{
				result.push( 32 );
			}
			// Abbreviations
			else if ( zchar < 4 )
			{
				usesabbr = 1;
				result.push( -1 );
				resulttexts.push( '\uE000+this.abbr(' + ( 32 * ( zchar - 1 ) + buffer[i++] ) + ')+\uE000' );
			}
			// Shift characters
			else if ( zchar < 6 )
			{
				alphabet = zchar;
			}
			// Check for a 10 bit ZSCII character
			else if ( alphabet === 2 && zchar === 6 )
			{
				// Check we have enough Z-chars left.
				if ( i + 1 < buffer.length )
				{
					result.push( buffer[i++] << 5 | buffer[i++] )
				}
			}
			// Regular characters
			else if ( zchar < 0x20 )
			{
				result.push( this.alphabets[alphabet][ zchar - 6 ] );
			}

			// Reset the alphabet
			alphabet = alphabet < 4 ? 0 : alphabet - 3;

			// Add to the index if we've had raw unicode
			if ( ( i % 3 ) === 0 )
			{
				i += unicodecount;
				unicodecount = 0;
			}
		}

		result = this.zscii_to_text( result, resulttexts );
		// Abbreviations must be extracted at run time, so return a function instead
		if ( usesabbr )
		{
			result = {
				toString: ( Function( 'return"' + result.replace( /\\/g, '\\\\' ).replace( /"/g, '\\"' ).replace( /\r/g, '\\r' ).replace( /\uE000/g, '"' ) + '"' ) ).bind( this ),
			};
		}
		// Cache and return
		if ( start_addr >= this.staticmem )
		{
			this.jit[start_addr] = result;
		}
		return result;
	},

	// Encode ZSCII into Z-chars
	encode: function( zscii )
	{
		var alphabets = this.alphabets,
		zchars = [],
		word_len = this.version3 ? 6 : 9,
		i = 0,
		achar,
		temp,
		result = [];

		// Encode the Z-chars
		while ( zchars.length < word_len )
		{
			achar = zscii[i++];
			// Space
			if ( achar === 32 )
			{
				zchars.push( 0 );
			}
			// Alphabets
			else if ( ( temp = alphabets[0].indexOf( achar ) ) >= 0 )
			{
				zchars.push( temp + 6 );
			}
			else if ( ( temp = alphabets[1].indexOf( achar ) ) >= 0 )
			{
				zchars.push( 4, temp + 6 );
			}
			else if ( ( temp = alphabets[2].indexOf( achar ) ) >= 0 )
			{
				zchars.push( 5, temp + 6 );
			}
			// Pad character
			else if ( achar === undefined )
			{
				zchars.push( 5 );
			}
			// 10-bit ZSCII
			else
			{
				zchars.push( 5, 6, achar >> 5, achar & 0x1F )
			}
		}
		zchars.length = word_len;

		// Encode to bytes
		i = 0;
		while ( i < word_len )
		{
			result.push( zchars[i++] << 2 | zchars[i] >> 3, ( zchars[i++] & 0x07 ) << 5 | zchars[i++] );
		}
		result[ result.length - 2 ] |= 0x80;
		return result;
	},

	// In these two functions zscii means an array of ZSCII codes and text means a regular Javascript unicode string
	zscii_to_text: function( zscii, texts )
	{
		var i = 0, l = zscii.length,
		charr,
		j = 0,
		result = '';

		while ( i < l )
		{
			charr = zscii[i++];
			// Text substitution from abbreviations or 1.1 unicode
			if ( charr === -1 )
			{
				result += texts[j++];
			}
			// Regular characters
			if ( ( charr = this.unicode_table[charr] ) )
			{
				result += charr;
			}
		}
		return result;
	},

	// If the second argument is set then don't use the unicode table
	text_to_zscii: function( text, notable )
	{
		var array = [], i = 0, l = text.length, charr;
		while ( i < l )
		{
			charr = text.charCodeAt( i++ );
			// Check the unicode table
			if ( !notable )
			{
				charr = this.reverse_unicode_table[charr] || 63;
			}
			array.push( charr );
		}
		return array;
	},

	// Parse and cache a dictionary
	parse_dict: function( addr )
	{
		var memory = this.m,

		addr_start = addr,
		dict = {},
		entry_len,
		endaddr,

		// Get the word separators
		seperators_len = memory.getUint8( addr++ );

		// Support: IE, Safari, Firefox<38, Chrome<45, Opera<32, Node<4
		// These browsers don't support Uint8Array.indexOf() so convert to a normal array
		dict.separators = Array.prototype.slice.call( memory.getUint8Array( addr, seperators_len ) );

		addr += seperators_len;

		// Go through the dictionary and cache its entries
		entry_len = memory.getUint8( addr++ );
		endaddr = addr + 2 + entry_len * memory.getUint16( addr );
		addr += 2;
		while ( addr < endaddr )
		{
			dict[ Array.prototype.toString.call( memory.getUint8Array( addr, this.version3 ? 4 : 6 ) ) ] = addr;
			addr += entry_len;
		}
		this.dictionaries[addr_start] = dict;

		return dict;
	},

	// Print an abbreviation
	abbr: function( abbrnum )
	{
		return this.decode( this.m.getUint16( this.abbr_addr + 2 * abbrnum ) * 2 );
	},

	// Tokenise a text
	tokenise: function( bufaddr, parseaddr, dictionary, flag )
	{
		// Use the default dictionary if one wasn't provided
		dictionary = dictionary || this.dict;

		// Parse the dictionary if needed
		dictionary = this.dictionaries[dictionary] || this.parse_dict( dictionary );

		var memory = this.m,
		ram = this.ram,
		bufferlength = 1e3,
		i = 1,
		letter,
		separators = dictionary.separators,
		word,
		words = [],
		max_words,
		dictword,
		wordcount = 0;

		// In versions 5 and 8 we can get the actual buffer length
		if ( this.version > 4 )
		{
			bufferlength = memory.getUint8( bufaddr + i++ ) + 2;
		}

		// Find the words, separated by the separators, but as well as the separators themselves
		while ( i < bufferlength )
		{
			letter = memory.getUint8( bufaddr + i );
			if ( letter === 0 )
			{
				break;
			}
			else if ( letter === 32 || separators.indexOf( letter ) >= 0 )
			{
				if ( letter !== 32 )
				{
					words.push( [ [letter], i ] );
				}
				word = null;
			}
			else
			{
				if ( !word )
				{
					words.push( [ [], i ] );
					word = words[ words.length - 1 ][0];
				}
				word.push( letter );
			}
			i++;
		}

		// Go through the text until we either have reached the max number of words, or we're out of words
		max_words = Math.min( words.length, memory.getUint8( parseaddr ) );
		while ( wordcount < max_words )
		{
			dictword = dictionary['' + this.encode( words[wordcount][0] )];

			// If the flag is set then don't overwrite words which weren't found
			if ( !flag || dictword )
			{
				// Fill out the buffer
				ram.setUint16( parseaddr + 2 + wordcount * 4, dictword || 0 );
				ram.setUint8( parseaddr + 4 + wordcount * 4, words[wordcount][0].length );
				ram.setUint8( parseaddr + 5 + wordcount * 4, words[wordcount][1] );
			}
			wordcount++;
		}

		// Update the number of found words
		ram.setUint8( parseaddr + 1, wordcount );
	},

};

},{}]},{},[4])(4)
});
