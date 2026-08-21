"use strict";

import * as fontoxpath from 'fontoxpath';

// async script, executed after DOMContentLoaded
const
	ctx = new AudioContext()
	, sounds = {}
	, xqm = document.getElementById('xquery-module').textContent
	, moduleImports = fontoxpath.registerXQueryModule(xqm)
	, ns_xqib = 'http://mansoft.nl/xqib'
	, URI_BY_PREFIX = {
			b: ns_xqib,
			xmlns: "http://www.w3.org/1999/xhtml"
	}
	, evaluateUpdatingExpression = (xquery, contextNode, variables) => {
		const result = fontoxpath.evaluateUpdatingExpressionSync(
			xquery
			, contextNode
			, null
			, variables
			, {
				//namespaceResolver: (prefix) => URI_BY_PREFIX[prefix],
				moduleImports: moduleImports
			}
		);
		fontoxpath.executePendingUpdateList(result.pendingUpdateList);
	}
	, eventHandler = (e) => {
		//console.log('event', e);
		e.preventDefault();
		const eventElement = document.createElement("event");
		eventElement.data = e;
		evaluateUpdatingExpression(e.currentTarget.xqueries[e.type], document, {
			"event": eventElement,
		});
	}
	, nz = (x) => x ? x : null
	;
	
// Register a function called 'play-sound' in the 'b' namespace:
fontoxpath.registerCustomXPathFunction(
	{
		namespaceURI: ns_xqib,
		localName: 'play-sound'
	}
	, ['xs:string']
	, 'xs:string'
	, async (_, sound) => {
		const buffer = sounds[sound];
		if (!buffer) return;
		const src = ctx.createBufferSource();
		src.buffer = buffer;
		src.connect(ctx.destination);
		src.start();
		return ""
	}
);
// Register a function called 'dom' in the 'b' namespace:
fontoxpath.registerCustomXPathFunction(
	{
		namespaceURI: ns_xqib,
		localName: 'dom'
	}
	, [ ]
	, 'document-node()'
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
		if (!where.xqueries) {
			where.xqueries = {};
		}
		where.xqueries[kind] = listener;
		where.addEventListener(kind, eventHandler, false);
		return "";
	}
);
fontoxpath.registerCustomXPathFunction(
	{
		namespaceURI: ns_xqib,
		localName: 'addEventListener1'
	}
	, [ 'element()', 'xs:string', 'function(*)' ]
	, 'xs:string'
	, (_, where, kind, listener) => {
		if (!where.xqueries) {
			where.xqueries = {};
		}
		where.xqueries[kind] = listener;
		where.addEventListener(kind, eventHandler, false);
		return "";
	}
);
fontoxpath.registerCustomXPathFunction(
	{
		namespaceURI: ns_xqib,
		localName: 'doc'
	}
	, [ 'xs:string' ]
	, 'document-node()'
	, (_, url) => {
		const req = new XMLHttpRequest()
		req.open("GET", url, false);
		req.send();		
		return req.responseXML;
	}
);			
fontoxpath.registerCustomXPathFunction(
	{
		namespaceURI: ns_xqib,
		localName: 'location'
	}
	, [ 'xs:string' ]
	, 'xs:string'
	, (_, property) => {
		return window.location[property];
	}
);			
fontoxpath.registerCustomXPathFunction(
	{
		namespaceURI: ns_xqib,
		localName: 'navigate-to'
	}
	, [ 'xs:string' ]
	, 'xs:string'
	, (_, url) => {
		window.location.assign(url); return "";
	}
);			
fontoxpath.registerCustomXPathFunction(
	{
		namespaceURI: ns_xqib,
		localName: 'get'
	}
	, [ 'item()', 'xs:string' ]
	, 'item()?'
	, (_, obj, prop) => {
		//console.log(obj.data);
		//console.log(prop);
		return obj.data ? nz(obj.data[prop]) : null;
	}
);			
fontoxpath.registerCustomXPathFunction(
	{
		namespaceURI: ns_xqib,
		localName: 'set'
	}
	, [ 'item()', 'xs:string', 'item()' ]
	, 'item()'
	, (_, obj, prop, value) => {
		if (!obj.data) {
			obj.data = {};
		}
		return obj.data[prop] = value;
	}
);			
fontoxpath.registerCustomXPathFunction(
	{
		namespaceURI: ns_xqib,
		localName: 'call'
	}
	, [ 'item()', 'xs:string' ]
	, 'element()'
	, (_, obj, prop) => {
		//console.log(obj);
		//console.log(prop);
		const callElement = document.createElement("call");
		callElement.data = obj[prop]();
		return callElement;
	}
);			
fontoxpath.registerCustomXPathFunction(
	{
		namespaceURI: ns_xqib,
		localName: 'getSVGcoordinates'
	}
	, [ 'item()', 'node()' ]
	, 'element()'
	, (_, eventElement, node) => {
		const event = eventElement.data;
		//console.log(event);
		//console.log(node.localName);
		event.preventDefault();
		const p = document.documentElement.createSVGPoint();

		if (event.touches) {
			p.x = event.touches[0].clientX;
			p.y = event.touches[0].clientY
		} else {
			p.x = event.clientX;
			p.y = event.clientY
		}
		const p2 = p.matrixTransform(node.getScreenCTM().inverse());
		//console.log(p2.x);
		//console.log(p2.y);
		const coordinatesElement = document.createElement("coordinates");
		coordinatesElement.setAttribute("x", p2.x);
		coordinatesElement.setAttribute("y", p2.y);
		return coordinatesElement;
	}
);			

fontoxpath.registerCustomXPathFunction(
	{
		namespaceURI: ns_xqib,
		localName: 'getMatrix'
	}
	, [ 'node()' ]
	, 'element()'
	, (_, svgElement) => {

		const matrixElement = document.createElement("matrix");
		matrixElement.data = svgElement.transform.baseVal.getItem(0).matrix;
		return matrixElement;
	}
);			

let
	current_xq_id = "xquery-main";

// Preload and decode all <xhtml:audio> elements
document.querySelectorAll("audio").forEach(el => {
  const id = el.id
  const src = el.getAttribute("src");
  if (!src || !id) return;

  fetch(new URL(src, document.baseURI).href)
    .then(r => r.arrayBuffer())
    .then(b => ctx.decodeAudioData(b))
    .then(buffer => {
      sounds[id] = buffer;
      console.log(`Loaded ${id}`);
    })
    .catch(err => console.error(`Error loading ${id}:`, err));
});

do {
	const
		current_xq_script = document.getElementById(current_xq_id)
		, xq = current_xq_script.textContent
		;
	evaluateUpdatingExpression(xq, document, null);
	current_xq_id = current_xq_script.getAttribute("after-update");
} while (current_xq_id);
