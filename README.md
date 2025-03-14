## SVG games using XQuery Update Facility from xfontopath

SVG games using a XQuery Update Facility game engine based on [xfontopath](https://github.com/FontoXML/fontoxpath). Starting with an SVG template, it loads and XML level e.g. `chainlevel1.xml` and using an XQuery Update Facility query it appends SVG nodes based on the level to the SVG document. The second argument to `game.game` is an object, keys is are event types e.g. `click`  and the values are XQUF query to be executed when an event is triggered.

    import * as game from './game';

    const
        // get levelnr from URL query string
        levelnr = game.getQueryVariable("level", "1")
        // convert level number to URL containing an XML game level
        , level = "chain-level" + levelnr + ".xml"
        // get XQuery module from script text node
        , xqm = document.getElementById('xquery-module').textContent
        ;

    game.game(
        xqm,
        // module imports
        { chain: "http://mansoft.nl/chain" },
        level,
        levelnr,
        'chain:load-svg()',
        {
            click: 'chain:click-svg(.)'
        }
    );


 The games are based on [clickmaze](https://clickmazes.com/)'s [chainreaction](https://clickmazes.com/chain/new-chain.htm) and [BoxUp](https://clickmazes.com/boxup/new-boxup.htm) games.
 
 ## Build for deployment
     node build.js
