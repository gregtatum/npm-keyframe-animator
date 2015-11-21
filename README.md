# Keyframe Animator

[![build status][travis-image]][travis-url]
[![stability][stability-image]][stability-url]
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][downloads-url]

[stability-image]: https://img.shields.io/badge/stability-stable-brightgreen.svg?style=flat-square
[stability-url]: https://nodejs.org/api/documentation.html#documentation_stability_index
[npm-image]: https://img.shields.io/npm/v/keyframe-animator.svg?style=flat-square
[npm-url]: https://npmjs.org/package/keyframe-animator
[travis-image]: https://img.shields.io/travis/TatumCreative/npm-keyframe-animator/master.svg?style=flat-square
[travis-url]: http://travis-ci.org/TatumCreative/npm-keyframe-animator
[downloads-image]: http://img.shields.io/npm/dm/keyframe-animator.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/keyframe-animator

Create keyframe animations programmatically with a list of actions, timings, and easings.

# Live Example

<a href='https://tatumcreative.github.io/npm-keyframe-animator/'>
	![Keyframe Animator Example](https://tatumcreative.github.io/npm-keyframe-animator/screenshot.jpg)
</a>

[Pentagons keyframe animated](https://tatumcreative.github.io/npm-keyframe-animator)

## Creating the Animator

	var animator = require('keyframe-animator')
	var update = animator( sceneGraph, keyframes, runOnce )
	update( elapsedMilliseconds )

### `sceneGraph`

The scene graph can be any type of object that represents your scene. The individual properties on this graph are accessed in the scene graph using "key.path[0]" syntax.

### `keyframes`

Keyframes are a list of keyframe objects as defined below.

### `runOnce` (optional)

Set to true if the animation should only run through once.

## Keyframe Object

	{
		duration:  <float in seconds>,
		easing:    <string|function>,
		actions:  [
			[ "path.in.object", [<start>, <end>] ],
			[ "path.in.object", <value> ],
			[ "path.in.object" ],
		],
		
		// Relative frames
		subframes: [ keyframe, keyframe, ... ],
		
		//Debug parameters:
		isolate:   <true|false>,
		startHere: <true|false>,
	},

### `duration`

The length in seconds of the keyframe.

### `easing` (optional)

Either the easing function name or a custom function. See the available functions in the [eases package](https://npmjs.com/packages/eases).

### `isolate` (optional)

A flag on whether or to only play this keyframe. Useful for debugging and live-reloading.

### `startHere` (optional)

Ignores all of the keyframes before this one. Useful for debugging and live-reloading.

### `actions`

An array of actions to perform. Each action is composed of a keypath into the main scene graph object, and the values of the action. The keypath can include dot separated values like `"key.path.position.x"` and array values like `"key.path.position[0]"`. The value at the keypath can either be a value or a function. If it's a value then the actions will be applied like `scene.key.path = value`. If the keypath points to a function then it will invoked with the value like `scene.key.path(value)`.

#### `[ 'key.path', [valueStart, valueEnd] ]`

If the action value is an array, then the start and end values will be run through an easing function based on the elapsed time. So for instance if the action was equal to `['key.path', [0, 10]]`, then the `scene.key.path` would be eased between 0 and 10 based on the elapsed time.

#### `[ 'key.path', value ]`

If the action is a single value or undefined, then for the first frame that the keyframe is in range, the property will be set to that value, or the function will be invoked with that value.

## Example usage

	var animator = require('animator')
	var drawScene = require('./draw-scene')
	
	var scene = {
		square : new Square()
	}
	
	var keyframes = [
		{
			duration : 2,
			easing : "elastic-in",
			actions : {
				[ "square.position.x", [ 0, 100 ] ],
				[ "square.position.y", [ 0, 100 ] ],
				[ "square.opacity", [ 0, 1 ] ],
			},
		},
		{
			duration : 2,
			easing : "elastic-out",
			actions : {
				[ "square.color[0]", [ 0, 1 ] ],
				[ "square.color[1]", [ 1, 0 ] ],
				[ "square.addStroke" ],
				[ "square.setTextContents", "I'm trapped in a box!" ],
			},
		}
	]
	
	var update = animator( sceneGraph, keyframes, runOnce )
	
	var start = Date.now()
	function loop() {
		update( Date.now() - start )
		requestAnimationFrame(loop)
	}
	loop()
