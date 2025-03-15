## SVG games using XQuery Update Facility from xfontopath

SVG games using a XQuery Update Facility game engine based on [xfontopath](https://github.com/FontoXML/fontoxpath). Starting with an SVG template, it loads and XML level e.g. `chainlevel1.xml` and using an XQuery Update Facility query it appends SVG nodes based on the level to the SVG document.

### game function
    game.game(moduleImports, level, levelnr, load_xq, loaded_xq)
    // moduleImports: prefix and URI of XQuery module
    // level: URL of game level
    // levelnr: level number
    // load_qx: XQuery to load and initialize the game
    // loaded_qx: XQuery to do post-loading initialization, normally to add event listeners

### Example
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


 The games are based on [clickmaze](https://clickmazes.com/)'s [chainreaction](https://clickmazes.com/chain/new-chain.htm) and [BoxUp](https://clickmazes.com/boxup/new-boxup.htm) games.
 
 ## Build for deployment
     node build.js
