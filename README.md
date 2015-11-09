# Animator

Create keyframe animations programmatically with a list of actions, timings, and easings.

	var update = animator( sceneGraph, keyframes, runOnce )
	update( elapsedMilliseconds )

### `sceneGraph`

The scene graph can be any type of object that represents your scene. The individual properties on this graph are accessed in the scene graph using "key.path" syntax.

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

An array of actions to perform. Each action is composed of a dot-separated keypath into the main scene graph object, and the values of the action. The keypath can either point to a value or a function. If it's a value then the actions will be applied like `scene.key.path = value`. If the keypath points to a function then it will invoked with the value like `scene.key.path(value)`.

#### `[ 'key.path', [valueStart, valueEnd] ]`

If the action value is an array, then the start and end values will be run through an easing function based on the elapsed time. So for instance if the action was equal to `['key.path', [0, 10]]`, then the `scene.key.path` would be eased between 0 and 10 based on the elapsed time.

#### `[ 'key.path', value ]`

If the action is a single value, then every frame that the keyframe is in range, the property will be set to that value, or the function will be invoked with that value.

## Example initiation

	var animator = require('animator')
	var sceneGraph = require('./sceneGraph')
	var keyframes = require('./keyframes')
	
	var update = animator( sceneGraph, keyframes, runOnce )
	
	var start = Date.now()
	function loop() {
		update( Date.now() - start() )
		requestAnimationFrame(loop)
	}
	loop()
