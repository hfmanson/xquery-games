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
	, game = (level, levelnr, load_xq, events) => {
		addEventListener("DOMContentLoaded", (e) => {
			const
				ns_xqib = 'http://mansoft.nl/xqib'
				, URI_BY_PREFIX = {
					 b: ns_xqib
				}
				, getEventXML = (e) => {
					const
						eventdata = {
							click : [],
							keydown: [ 'key' ]
						}
						, eventElement = document.createElement("event")
						;
					for (const data of eventdata[e.type]) {
						eventElement.setAttribute(data, e[data]);
					}
					return eventElement;
				}
				, req = new XMLHttpRequest()
				, reqListener = (e) => {
					const leveldoc = e.target.responseXML;
					const result = fontoxpath.evaluateUpdatingExpressionSync(
						load_xq
						, document
						, null
						, {
							webdoc: document,
							leveldoc: leveldoc,
							levelnr: levelnr
						}
						,
						{
							namespaceResolver: (prefix) => URI_BY_PREFIX[prefix]
						}
					);
					fontoxpath.executePendingUpdateList(result.pendingUpdateList);
					const xqueryx = {};
					for (const [key, value] of Object.entries(events)) {
						console.log(`${key}: ${value}`);
						xqueryx[key] = fontoxpath.parseScript(
							value,
							{
								language: fontoxpath.evaluateXPath.XQUERY_3_1_LANGUAGE,
							},
							document
						);
						document.documentElement.addEventListener(key, (e) => {
							const result = fontoxpath.evaluateUpdatingExpressionSync(
								xqueryx[e.type]
								, e.target
								, null
								,
								{
									webdoc: document,
									leveldoc: leveldoc,
									event: getEventXML(e)
								}
								,
								{
									namespaceResolver: (prefix) => URI_BY_PREFIX[prefix]
								}
							);
							fontoxpath.executePendingUpdateList(result.pendingUpdateList);
						}, false);
					}
				}	
				;
				
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
