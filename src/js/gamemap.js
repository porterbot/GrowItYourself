function GameMap() {
    this.currentWorld = "";
    this.currentModule = "";
    this.preload = "";
    this.backgrounds = [
        {src: "paths.png", locations: [{x:-0, y:0}]}
    ]
    this.worlds = [
          {"name":"Home",
         "map":"homebase.png",
         "background":"homebase_background.jpg", 
         "location": {x:300, 
                      y:200}, 
         "modules": [
              {
                "name":"Plant Guide",
                "icon":"plantguide.png",
                "dependencies":[]
              },
              {
                "name":"Strategy",
                "icon":"seedstrategy.png",
                "dependencies":[]
              },
              {
                "name":"Seed Starting",
                "icon":"seed_start.png",
                "dependencies":[]
              },
              {
                "name":"Transplanting",
                "icon":"transplanting.png",
                "dependencies":["Seed Starting"]
              },
         ],
         "dependencies":[]},
        {"name":"Square Foot Garden",
         "map":"square_foot_garden2.png", 
         "background":"square_foot_garden_background.png", 
         "location": {x:550, 
                      y:225},         
         "modules": [
              {
                "name":"Installation",
                "icon":"installation.jpg",
                "dependencies":[]
              },
              {
                "name":"Soils",
                "icon":"soils.png",
                "required": false,
                "dependencies":["Installation"]
              },
              {
                "name":"Planner",
                "icon":"planner.png",
                "dependencies":['Installation']
              },
              {
                "name":"Garden Care",
                "icon":"maintenance.png",
                "dependencies":[]
              }],
         "dependencies":[]},
        {"name":"Kids Garden",
         "map":"outdoor_classroom2.png", 
         "background":"outdoor_classroom_background2.png", 
         "location": {x:500, 
                      y:400}, 
        "modules": [
              {
                "name":"Installation",
                "icon":"installation.jpg",
                "dependencies":[]
              },
              {
                "name":"Soils",
                "icon":"soils.png",
                "required": false,
                "dependencies":["Installation"]
              },
              {
                "name":"Planner",
                "icon":"planner.png",
                "dependencies":['Installation']
              },
              {
                "name":"Garden Care",
                "icon":"maintenance.png",
                "dependencies":["Maintenance"]
              }],
         "dependencies":[]},
        {"name":"Herb Spiral",
         "background":"herb_spiral_background.png", 
         "map":"herb_spiral2.png", 
         "location": {x:535, 
                      y:50}, 
        "modules": [
              {
                "name":"Installation",
                "icon":"installation.jpg",
                "dependencies":[]
              },
              {
                "name":"Soils",
                "icon":"soils.png",
                "required": false,
                "dependencies":["Installation"]
              },
              {
                "name":"Planner",
                "icon":"planner.png",
                "dependencies":['Installation']
              },
              {
                "name":"Garden Care",
                "icon":"maintenance.png",
                "dependencies":["Planner"]
              }],
         "dependencies":[]},
         {"name":"Compost",
         "status": "offline",
         "statusMsg": "The Compost section will be available\n on/after July 15th",
         "dependencies": ["Garden Warrior"],
         "map":"compost.png", 
         "location": {x:275, 
                      y:125}, 
        "modules": [
              {
                "name":"Introduction",
                "icon":"installation.jpg",
                "dependencies":[]
              },
              {
                "name":"Hot Bed Composting",
                "icon":"soils.png",
                "required": false,
                "dependencies":['Introduction']
              },
              {
                "name":"VermiComposting",
                "icon":"planner.png",
                "dependencies":['Hot Bed Composting']
              },
              {
                "name":"Bokashi",
                "icon":"maintenance.png",
                "dependencies":["VermiComposting"]
              }],
         "dependencies":[]},
         {"name":"Water Harvesting",
         "status": "offline",
         "statusMsg": "This mini-game is a summer challenge.\n Watch for announcements as the date\n draws nearer.",
         "map":"rainbarrel.png",
         "type": "mini-game", 
         "location": {x:275, 
                      y:250}, 
        "modules": [],
         "dependencies":[]},
         {"name":"Bug Hunt",
         "type": "mini-game",
         "url": "http://mygardengame.com/bughunt",
         "map":"bug_hunt.png", 
         "location": {x:40, 
                      y:300}, 
        "modules": [],
         "dependencies":[]},
         {"name":"Food Forest",
         "status": "offline",
         "statusMsg": "The Food Forest is coming in 2018.",
         "type": "mini-game",
         "map":"foodforest.png", 
         "location": {x:150, 
                      y:475}, 
        "modules": [],
         "dependencies":[]},
         {"name":"Weed ID",
         "type": "mini-game",
         "url": "http://mygardengame.com/weedidgame/",
         "map":"weed_id.png", 
         "location": {x:350, 
                      y:320}, 
        "modules": [],
         "dependencies":[]},
         {"name":"Pond",
         "status": "offline",
         "statusMsg": "Advanced water management\n is coming in 2018.",
         "type": "mini-game",
         "map":"pond.png", 
         "location": {x:60, 
                      y:100}, 
        "modules": [],
         "dependencies":[]}
         ];

}


GameMap.prototype.handleEvent = function(e) {
    this.closeWorld();
}

GameMap.prototype.closeWorld = function() {
    this.currentWorld = undefined;
    this.worldPane.hide();
}

GameMap.prototype.chooseTrack = function() {
   // display dialog with warning about choosing the track
   
   // display button for choosing

   // if choosing track, store current track in gameState
   
   
   // display button for cancelling
}


GameMap.prototype.drawWorld = function(world, mainMap) {
    if (world.status=="offline") {
        var warningLabel = new zim.Label(world.statusMsg, 20, "Nunito", "white");
        var warningPane = new zim.Pane({
            container:frame.stage, 
            width:450, 
            height:200, 
            label:warningLabel,
            backing:pizzazz.makeShape("roadside", smartInstructions.DEFAULT_STROKE_COLOR).scale(4)});
        warningPane.show();
        return;
    } else if (world.type=="mini-game") {
        zgo(world.url); 
    } else if (world.dependencies.length>0) {
        var complete = true;
        world.dependencies.forEach(function(dependency) {
            for (var i=0; i<mainMap.worlds.length; i++) {
                if (mainMap.worlds[i].name==dependency) {
                   var worldStatus = gameState.worldHistory[dependency];
                   if (worldStatus==undefined) {
                       complete = false;
                   } else {
                       mainMap.worlds[i].modules.forEach(function(module) {
                           var moduleName = module.name;
                           if (worldStatus[moduleName]==undefined || worldStatus[moduleName]!="completed") {
                               complete = false;
                           }
                       });
                   }
                }
            }
        });
        if (!complete) {
            var warningLabel = new zim.Label(world.dependencies[0] + " Section is not complete. \nPlease complete " + world.dependencies[0] + " to access.", 20, "Nunito", "white");
            var warningPane = new zim.Pane({
                container:frame.stage,
                width:450,
                height:200,
                label:warningLabel,
                backing:pizzazz.makeShape("roadside", smartInstructions.DEFAULT_STROKE_COLOR).scale(4)});
                warningPane.show();
            return;
        }
     } 

    this.currentWorld = world;
    var mainMap = this;
    this.worldPane = new zim.Pane({
        container:frame.stage, 
        width:600, 
        height:425, 
        color:"#FFF", 
        modal:false,
        displayClose: false, 
        fadeTime:1000});

    // draw background to world
    var background = frame.asset(world.background);
    background.x = -300;
    background.y = -160;
    this.worldPane.addChild(background);

    // draw arrow to return from world
    var returnButton = makeButton("arrow", 180);
    returnButton.x = -280;
    returnButton.y = -200;
    returnButton.addEventListener("click", this, false); 
    this.worldPane.addChild(returnButton);

    // draw module box
    var moduleBox = new zim.Container();
    moduleBox.x = -75;
    moduleBox.y = -100;
    var moduleBoxBackground = new zim.Rectangle({
        color: "white",
        height: 250,
        width: 325, 
        borderColor: "#000000",
        borderWidth: 2
    });
    moduleBox.addChild(moduleBoxBackground);
    
    // draw modules, show modules that have been completed
    for (var i=0; i<this.currentWorld.modules.length; i++) {
        var currentModule = this.currentWorld.modules[i];
        var offsetx = moduleBox.x + 145 + (i%3)*100;
        var offsety = moduleBox.y + 170 + Math.floor(i/3)*100;
        var moduleMask = new zim.Circle({
            radius: 30,
            color: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#000000"
        });
        moduleMask.x = offsetx;
        moduleMask.y = offsety;
        moduleBox.addChild(moduleMask);
        if (currentModule.icon) {
            var moduleIcon = frame.asset(currentModule.icon);
            moduleIcon.x = offsetx-30;
            moduleIcon.y = offsety-30;
            moduleBox.addChild(moduleIcon);
            moduleIcon.setMask(moduleMask);
        }

        var moduleLabel = new zim.Label({
            text: currentModule.name,
            size: 16,
            color: "#006600",
            font:"Nunito"
        });
        moduleLabel.x = offsetx - moduleLabel.getBounds().width/2;
        moduleLabel.y = offsety + 40;
        moduleBox.addChild(moduleLabel);

        // check the user's game state
        var worldState = gameState.worldHistory[this.currentWorld.name];
        if (!worldState) {
            worldState = {}; 
        }

        // if completed, add check-mark
        var disabled = false;
        var disabledMessage = ""; 
        if (worldState[currentModule.name]) {
            if (worldState[currentModule.name]=='completed') {
                // add check-mark
               var checkIcon = frame.asset("checkmark.png").clone();
               checkIcon.x = offsetx + 20;
               checkIcon.y = offsety - 45;
               moduleBox.addChild(checkIcon); 
            } 
         } else {
            // if not started, check to see if there are any dependencies
            if (currentModule.dependencies.length>0) {
console.log(currentModule);
                currentModule.dependencies.forEach(function(dependency) {
                   if (worldState[dependency]==undefined || worldState[dependency]!="completed") {
                       disabled = true;
                       disabledMessage = "You need to complete " + dependency + " to access";
                   }
                });
            }
        }
        // if the module is enabled, add clickHandler
        moduleIcon.cursor = "pointer";
        (function followLink(world, module) {
        if (!disabled) {
            moduleIcon.on("click", function() {
               zgo("http://mygardengame.com/cardflow?section=" + world.name + "&module=" + module.name);
            });
            moduleLabel.on("click", function() {
               zgo("http://mygardengame.com/cardflow?section=" + world.name + "&module=" + module.name);
            });
        } else {
            (function (disabledMessage) {
            moduleIcon.on("click", function() {
                var warningLabel = new zim.Label(disabledMessage, 20, "Nunito", "white");
                var warningPane = new zim.Pane({
                      container:frame.stage,
                      width:450,
                      height:200,
                      label:warningLabel,
                      backing:pizzazz.makeShape("roadside", smartInstructions.DEFAULT_STROKE_COLOR).scale(4)});
                warningPane.show();
            });
            })(disabledMessage);
        }
        })(this.currentWorld, currentModule);

    }
    this.worldPane.addChild(moduleBox);
    var modulesLabel = new zim.Label({
        text: "Modules",
        size: 16,
        color: "#006600",
        font:"Nunito"
    });
    modulesLabel.x = -50;
    modulesLabel.y = -90;
    this.worldPane.addChild(modulesLabel);

     // draw Title
    var titleLabel = new zim.Label({
        text: this.currentWorld.name,
        size: 22,
        color: "#000000",
        font:"Nunito"
    });
    titleLabel.x = -titleLabel.getBounds().width/2;
    titleLabel.y = -200;
    this.worldPane.addChild(titleLabel);

    this.worldPane.show();
 

    // gray out modules that can't be started yet
}

GameMap.prototype.drawMainMap = function(mainMap) {
            var hotspots = [];
            for (var i=0; i<mainMap.backgrounds.length; i++) {
                var background = mainMap.backgrounds[i];
                var img = frame.asset(background.src);
                for (var j=0; j<background.locations.length; j++) {
                    var clone = img.clone();
                    clone.x = background.locations[j].x;
                    clone.y = background.locations[j].y;
                    frame.stage.addChild(clone);
                }
            }

            // iterate through worlds, draw all worlds
            for (var i=0; i<mainMap.worlds.length; i++) {
                var world = mainMap.worlds[i];
                var img = frame.asset(world.map);
                img.x = world.location.x;
                img.y = world.location.y;
                frame.stage.addChild(img);
                (function(world) {
                    var hotspot = {
                        page: frame.stage,
                        rect: [img.x, img.y, img.width, img.height],
                        call: function() { mainMap.drawWorld(world, mainMap); }
                    };
                    hotspots.push(hotspot);
                })(world, mainMap);
            }
            // create hotspots
            var hs = new zim.HotSpots(hotspots);
            frame.stage.update();


    
    // draw mini-worlds

}

GameMap.prototype.initializeMap = function(mapWidth, mapHeight) {
    // suppress page title
    document.getElementsByClassName("entry-title")[0].style.display = "none";
    var mainMap = this;
    var scaling = "fit"; // fit scales to fit the browser window while keeping the aspect ratio
    var width = mapWidth; // can go higher...
    var height = mapHeight;
    var color = "#AACCAA";
    frame = new zim.Frame(scaling, width, height, color); // see docs for more options and info
    frame.on("ready", function() {
        var imgList = [];
        for (var i=0; i<mainMap.worlds.length; i++) {
            var world = mainMap.worlds[i];
            imgList.push(world.map);

            // if any backgrounds add to the preload
            if (world.background) {
                imgList.push(world.background);
            }

            for (var j=0; j<world.modules.length; j++) {
                if (world.modules[j].icon) {
                    imgList.push(world.modules[j].icon);
                }
            }
        }
        // add utility images
        imgList.push("checkmark.png");
        for (var i=0; i<mainMap.backgrounds.length; i++) {
            var background = mainMap.backgrounds[i];
            imgList.push(background.src);
        }
        frame.loadAssets(imgList, smartInstructions.DEFAULT_URL);
        document.getElementById('spares').appendChild(document.getElementById('myCanvas'));
        frame.on("complete", function() {
             // load user state
            loadGameState(mainMap.drawMainMap, mainMap);
        });
    }); 
}
