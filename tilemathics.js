import * as game from './game';

const
    levelnr = game.getQueryVariable("level", "1")
    , level = "map" + levelnr + ".xml"
    ;

game.load_sounds(
    [
        { name: "move", href: "move.wav"},
        { name: "lock", href: "lock.wav"},
        { name: "wrong", href: "wrong.wav"},
        { name: "tick", href: "tick.wav"},
        { name: "winner", href: "winner.wav"}
    ]
);
game.game(
	{ tm: "http://mansoft.nl/tilemathics" },
	level,
	levelnr,
	'tm:load-svg()',
	'tm:add-listeners()'
);
