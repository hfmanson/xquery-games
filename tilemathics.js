import * as game from './game';

const
    levelnr = game.getQueryVariable("level", "1")
    , level = "map" + levelnr + ".xml"
    ;

game.game(
	{ tm: "http://mansoft.nl/tilemathics" },
	level,
	levelnr,
	'tm:load-svg()',
	'tm:add-listeners()'
);
