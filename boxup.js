import * as game from './game';

const
    levelnr = game.getQueryVariable("level", "1")
	, level = "level" + levelnr + ".xml"
	, xqm = document.getElementById('xquery-module').textContent
    ;

game.game(
	xqm,
	{ boxup: "http://mansoft.nl/boxup" },
	level,
	levelnr,
	'boxup:load-svg()',
	{
		keydown: 'boxup:keydown-svg()'
	}
);
