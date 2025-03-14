import * as game from './game';

const
    levelnr = game.getQueryVariable("level", "1")
    , level = "chain-level" + levelnr + ".xml"
	, xqm = document.getElementById('xquery-module').textContent
    ;

game.game(
	xqm,
	{ chain: "http://mansoft.nl/chain" },
	level,
	levelnr,
	'chain:load-svg()',
	{
		click: 'chain:click-svg(.)'
	}
);

