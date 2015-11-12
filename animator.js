var Eases      = require('eases')
var Lerp       = require('lerp')
var ToPath     = require('./src/to-path')

var _ = require('lodash')

var Reduce      = _.reduce
var Map         = _.map
var Find        = _.find
var IsString    = _.isString
var IsFunction  = _.isFunction
var IsArray     = _.isArray
var IsNumber    = _.isNumber
var IsObject    = _.isObject
var Last        = _.last
var Assign      = _.assign

// var Reduce      = require('lodash.reduce')
// var Map         = require('lodash.map')
// var Find        = require('lodash.find')
// var IsString    = require('lodash.isstring')
// var IsFunction  = require('lodash.isfunction')
// var IsArray     = require('lodash.isarray')
// var IsNumber    = require('lodash.isnumber')
// var IsObject    = require('lodash.isobject')
// var Last        = require('lodash.last')
// var Assign      = require('lodash.assign')

function _updateObjectValue( elapsed, prevElapsed, keyframe, action ) {
	
	var t = ( elapsed - keyframe.start ) / keyframe.duration
	
	action.obj[action.key] = Lerp(
		action.values[0]
	  , action.values[1]
	  , keyframe.easing(t)
	)
}

function _updateFunctionValue( elapsed, prevElapsed, keyframe, action ) {
	
	var t = ( elapsed - keyframe.start ) / keyframe.duration
	
	action.obj[action.key]( Lerp(
		action.values[0]
	  , action.values[1]
	  , keyframe.easing(t)
	))
}

function _canUpdateOnce( keyframe, elapsed, prevElapsed) {
	return keyframe.start > prevElapsed && keyframe.start <= elapsed
}

function _updateObjectValueOnce( elapsed, prevElapsed, keyframe, action ) {
	
	if( _canUpdateOnce( keyframe, elapsed, prevElapsed) ) {
		action.obj[action.key] = action.values
	}
}

function _updateFunctionOnce( elapsed, prevElapsed, keyframe, action ) {
	
	if( _canUpdateOnce( keyframe, elapsed, prevElapsed) ) {
		action.obj[action.key]( action.values )
	}
}

function _updateFn( keyframes, maxTime ) {
	
	var prevElapsed = -1
	
	return function( elapsedMilliseconds ) {
		
		var elapsed = (elapsedMilliseconds / 1000) % maxTime
		
		for( var i=0; i < keyframes.length; i++ ) {
			var keyframe = keyframes[i]
			
			//Time is in range
			if( elapsed >= keyframe.start && elapsed < keyframe.end ) {
				
				for( var j=0; j < keyframe.actions.length; j++ ) {
					
					var action = keyframe.actions[j]
					action.update( elapsed, prevElapsed, keyframe, action )
				}
			}
		}
		
		prevElapsed = elapsed
	}
}

function _easingFn( easingProp ) {
	
	var easingName, easingFn
	
	if( !easingProp || IsString( easingProp ) ) {
		
		easingName = easingProp || "linear"
		easingFn = Eases[ easingName ]
	}
	
	if( IsFunction( easingProp ) ) {
		
		easingFn = easingProp
		
		var epsilon = 0.001
		
		if( Math.abs( easingFn(0) ) > epsilon || Math.abs( 1 - easingFn(1) ) > epsilon ) {
			throw new Error(
				"animator received an easing function that didn't return a 0 and 1: ("
				+ easingFn(0) + ", " + easingFn(1) + ")"
			)
		}
	}
	
	if( !IsFunction( easingFn ) ) {
		throw new Error( "animator was not able to find the easing function " + easingProp )
	}
	return easingFn
	
}

function _createAction( graph, action ) {
	
	// example action: [ "camera.object.position.x", [0, 10] ]
	
	var keyParts = ToPath(action[0])
	var path = keyParts.slice(0,keyParts.length - 1)
	var key = Last(keyParts)
	var values = action[1]
	
	var obj = Reduce( path, function( memo, pathPart ) {
		
		var nextRef = memo[pathPart]
		if( !IsObject( nextRef ) ) {
			throw new Error( "animator was not able to create a reference", action )
		}
		return nextRef
	}, graph)
	
	var update
	
	if( IsFunction( obj[key] ) ) {
		update = IsArray( values ) ? _updateFunctionValue : _updateFunctionOnce
	} else {
		//Either update the value with transitions, or just once
		update = IsArray( values ) ? _updateObjectValue : _updateObjectValueOnce
	}
	
	return {
		obj : obj,
		key : key,
		values: values,
		update : update
	}
}

function _calculateStartEndFn() {
	
	var lastEnd = 0
	
	return function( keyframe ) {
		
		var start, end
		
		if( IsNumber( keyframe.start ) ) {
			start = keyframe.start
			end = start + keyframe.duration
		} else {
			start = lastEnd
			end = start + keyframe.duration
			lastEnd = end
		}
		
		return {
			start: start,
			end: end
		}
	}		
}

function _isolateFilter( keyframes ) {
	
	var isolate = Find( keyframes, function( keyframe ) {
		return keyframe.isolate
	})
	
	if( isolate ) {
		return [isolate]
	} else {
		return keyframes
	}
}

function _startHereFilter( keyframes ) {
	
	var startHere = Find( keyframes, function( keyframe ) {
		return keyframe.startHere
	})
	
	if( !startHere ) {
		return keyframes
	}
	
	var index = keyframes.indexOf( startHere )
	
	return keyframes.slice(index)
	
}

function _processKeyframeConfig( graph, unfilteredKeyframes ) {
	
	var startEndCalculator = _calculateStartEndFn()
	
	var keyframes = _isolateFilter( _startHereFilter( unfilteredKeyframes ) )
	
	return Map( keyframes, function( keyframe ) {
		
		var timing = startEndCalculator( keyframe )
		
		return {
			start       : timing.start
		  , end			: timing.end
		  , duration    : keyframe.duration
		  , easing      : _easingFn( keyframe.easing )
		  , actions     : Map( keyframe.actions, _createAction.bind(null, graph ) )
		}
	})
}

function _calcMaxTime( keyframes, runOnce ) {
	
	if( runOnce ) {
		return Infinity
	} else {
		return Reduce( keyframes, function( memo, keyframe ) {
			return Math.max( memo, keyframe.end )
		}, 0)
	}
}

module.exports = function( graph, keyframes, runOnce ) {
	
	var keyframes = _processKeyframeConfig( graph, keyframes )
	var maxTime = _calcMaxTime( keyframes, runOnce )
	
	return _updateFn( keyframes, maxTime )
}