"use strict";

import * as fontoxpath from 'fontoxpath';

function BufferLoader(sounds) {
    if (sounds.length > 0) {
        this.context = new window.AudioContext;
        this.sounds = sounds;
        for (const sound of sounds) {
            this.loadBuffer(sound);
		}
    }
	return this;
}

BufferLoader.prototype.loadBuffer = function(sound) {
    // Load buffer asynchronously
    const
		request = new XMLHttpRequest()
		, loader = this
		;
		
    request.responseType = "arraybuffer";
    request.onload = () => {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
			request.response,
			function(buffer) {
				if (!buffer) {
					alert('error decoding file data: ' + sound.href);
					return;
				}
				loader.sounds[sound.name] = buffer;
			}
        );
    };
    request.onerror = function() {
        alert('BufferLoader: XHR error');
    };
    request.open("GET", sound.href, true);
    request.send();
};

BufferLoader.prototype.playSound = function(name) {
	const bs = this.context.createBufferSource();
	bs.buffer = this.sounds[name];
	bs.connect(this.context.destination);
	bs.start();
};

let webaudios;

export const
	getQueryVariable = (name, defval) => {
		const
			query = window.location.search.substring(1)
			, variables = query.split('&')
			;
		
		for (const variable of variables) {
			const pair = variable.split('=');
			if (decodeURIComponent(pair[0]) == name) {
				return decodeURIComponent(pair[1]);
			}
		}
		return decodeURIComponent(defval);
	}
	, load_sounds = (sounds) => {
		webaudios = new BufferLoader(sounds)
	}
	, play_sound = (name) => {
		webaudios.playSound(name);
	}
	, game = (moduleImports, level, levelnr, load_xq, loaded_xq) => {
		addEventListener("DOMContentLoaded", (e) => {
			e.preventDefault();
			let
				leveldoc
				;
			const
				xqm = document.getElementById('xquery-module').textContent
				, ns_xqib = 'http://mansoft.nl/xqib'
				, URI_BY_PREFIX = {
					 b: ns_xqib
				}
				, evaluateUpdatingExpression = (xquery, contextNode, variables) => {
					const result = fontoxpath.evaluateUpdatingExpressionSync(
						xquery
						, contextNode
						, null
						, variables
						, {
							namespaceResolver: (prefix) => URI_BY_PREFIX[prefix],
							moduleImports: moduleImports
						}
					);
					fontoxpath.executePendingUpdateList(result.pendingUpdateList);
				}
				, evaluateUpdatingExpressionInit = (xquery) => {
					evaluateUpdatingExpression(xquery, document, {
							leveldoc: leveldoc,
							levelnr: levelnr						
					});
				}
				, req = new XMLHttpRequest()
				, reqListener = (e) => {
					fontoxpath.registerXQueryModule(xqm);					
					leveldoc = e.target.responseXML;
					evaluateUpdatingExpressionInit(load_xq);
					evaluateUpdatingExpressionInit(loaded_xq);
				}	
				;
				
			// Register a function called 'dom' in the 'b' namespace:
			fontoxpath.registerCustomXPathFunction(
				{
					namespaceURI: ns_xqib,
					localName: 'dom'
				}
				, [ ]
				, 'node()'
				, (_) => { return document; }
			);
			// Register a function called 'alert' in the 'b' namespace:
			fontoxpath.registerCustomXPathFunction(
				{
					namespaceURI: ns_xqib,
					localName: 'alert'
				}
				, [ 'xs:string' ]
				, 'xs:string'
				, (_, str) => { alert(str); return str }
			);
			// Register a function called 'addEventListener' in the 'b' namespace:
			fontoxpath.registerCustomXPathFunction(
				{
					namespaceURI: ns_xqib,
					localName: 'addEventListener'
				}
				, [ 'element()', 'xs:string', 'xs:string' ]
				, 'xs:string'
				, (_, where, kind, listener) => {
					where.addEventListener(kind, (e) => {
						const
							getEventXML = (e) => {
								const
									eventdata = {
										click : [],
										mousedown : [],
										mouseup : [],
										pointerdown : [],
										pointerup : [],
										pointerenter : [ 'buttons' ],
										touchstart : [],
										touchend : [],
										keydown: [ 'key' ]
									}
									, eventElement = document.createElement("event")
									;
								for (const data of eventdata[e.type]) {
									eventElement.setAttribute(data, e[data]);
								}
								return eventElement;
							}
							;
							
						console.log(e.type);
						console.log(e.target);
						evaluateUpdatingExpression(listener, e.target, {
							leveldoc: leveldoc,
							event: getEventXML(e)
						});
					}, false);
					return "";
				}
			);
			// Register a function called 'play-sound' in the 'b' namespace:
			fontoxpath.registerCustomXPathFunction(
				{
					namespaceURI: ns_xqib,
					localName: 'play-sound'
				}
				, ['xs:string']
				, 'xs:string'
				, (_, sound) => { play_sound(sound); return sound }
			);

			req.addEventListener("load", reqListener);
			req.open("GET", level);
			req.send();
		}, false);
	}
	;
