import * as game from './game';

const
    levelnr = game.getQueryVariable("level", "1")
    , level = "chain-level" + levelnr + ".xml"
    ;

game.game(
	{ chain: "http://mansoft.nl/chain" },
	level,
	levelnr,
	'chain:load-svg()',
	'chain:add-listeners()',
);

