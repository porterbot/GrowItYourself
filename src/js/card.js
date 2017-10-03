function Card(cardflow, cardContainer, location, width,height, title) {
    this.id = generateGuid();
    this.title = title;
    this.src_components = [];
    this.gui_components = [];
    this.gridCursor = {};
    this.viewerW = width;
    this.viewerH = height;
    this.baseContainer;
    this.mask;
    this.cardContainer = cardContainer;
    this.location = location;
    this.cardflow = cardflow;
    this.titleBar;
    this.homeButton;
    this.prevButton;
    this.nextButton;
    this.statusBox;
}

Card.prototype.resetEnv = function() {
    this.gridCursor.x = smartInstructions.DEFAULT_MARGIN;
    this.gridCursor.y = smartInstructions.DEFAULT_MARGIN;
    this.gridCursor.columns = smartInstructions.DEFAULT_COLUMNS;
    this.gridCursor.columnWidth = smartInstructions.DEFAULT_WIDTH/this.gridCursor.columns;
    this.gridCursor.cellX = 1;
    this.gridCursor.cellY = 1;
    this.cellHeightMax = 0;
    this.cardContainer.removeChild(this.baseContainer);
    this.cardContainer.removeChild(this.mask);
    this.cardContainer.removeChild(this.prevButton);
    this.cardContainer.removeChild(this.homeButton);
    this.cardContainer.removeChild(this.nextButton);
    this.cardContainer.removeChild(this.statusBox);
    this.gui_components = [];
    zim.Ticker.removeAll();
}

Card.prototype.createCard = function() {
    this.gridCursor.columns = 1;
    this.gridCursor.columnWidth = smartInstructions.DEFAULT_WIDTH;
    var scrollW = 10;
    var cardflow = this.cardflow;

    zim.OPTIMIZE = true;
    var tabHeight = 55;

    this.titleBar = new zim.Rectangle({
        width:600, 
        height:55, 
        color:"#FFFFFF", 
        corner:10,
        flatBottom: true});
    this.titleBar.x = this.location.x;
    this.titleBar.y = this.location.y;
    this.cardContainer.addChild(this.titleBar);

    this.cardLabel = new zim.Label({
        text: this.title,
        size: 16,
        color: "#000000",
        font:"Nunito"
    });
    this.cardLabel.x = (this.viewerW+10-this.cardLabel.getBounds().width)/2;
    this.cardLabel.y = tabHeight/2-10;
    this.titleBar.addChild(this.cardLabel);    
    this.cardContainer.addChild(cardflow.statusLabel);      
 
    this.mask = new zim.Rectangle({width:this.viewerW-7,        
                height:this.viewerH+tabHeight,
                color:"#CBE7C8",
                borderColor: "#FFFFFF",
                borderWidth: 10,
                corner:10,
                flatBottom: true});
    this.cardContainer.addChild(this.mask);
    this.mask.x = this.location.x+2;
    this.mask.y = this.location.y+tabHeight-10;
  
    this.baseContainer = new zim.Container({width:smartInstructions.DEFAULT_WIDTH, height:smartInstructions.DEFAULT_HEIGHT});
    for (var i=0; i<this.gui_components.length; i++) {
        this.gui_components[i].addTo(this.baseContainer);
    }   
    this.cardContainer.addChild(this.baseContainer);
    this.baseContainer.x = this.mask.x;
    this.baseContainer.y = this.mask.y;
    this.baseContainer.setMask(this.mask);

    var homeButton = makeButton("home");
    homeButton.addEventListener("click", function() {
        zgo("http://mygardengame.com/gardenmap-2");
    }, false);
    homeButton.x = 10;
    homeButton.y = 30;
    this.cardContainer.addChild(homeButton);

    if (this.cardflow.currentCardIndex>0) {
        var prevButton = makeButton("arrow", 180);
        prevButton.x = 500;
        prevButton.y = 30;
        prevButton.addEventListener("click", function() {
            cardflow.previousCard();
        }, false);
        this.cardContainer.addChild(prevButton);
    } 

    if (this.cardflow.currentCardIndex<this.cardflow.cards.length-1) {
        var nextButton = makeButton("arrow");
        nextButton.x = 550;
        nextButton.y = 30;
        nextButton.addEventListener("click", function() {
            cardflow.nextCard();
        }, false);
         
        this.cardContainer.addChild(nextButton);
    } 

    frame.stage.update();

}

Card.prototype.prepLayout = function() {
    // preload all images and video so createjs references work
    this.resetEnv();
    // need to add generators instead of annoying callbacks
    this.generateLayout();
}

Card.prototype.loadMedia = function() {
    var card = this;
    var imgList = [];
    for (var i=0; i<this.src_components.length; i++) {
        var block = this.src_components[i];
        if (block.type=="imageBlock" || (block.type=="linkBlock" && block.linkType=="Image") 
            || block.type=="photoChallengeBlock") {
            imgList.push(block.icon);
        }
        if (block.type=="videoBlock") {
            imgList.push(block.url);
        }
    }

    frame.loadAssets(imgList, smartInstructions.DEFAULT_URL, false, 500);
    frame.on("complete", new function() {
        card.generateLayout();  
    });
}

Card.prototype.generateLayout = function() {

    for (var i=0; i<this.src_components.length; i++) {
        var block = this.src_components[i];
        if (block.type=="textBlock") {
            this.generateTextBlock(this.gridCursor.columnWidth, block, true);
        } else if (block.type=="imageBlock") {
            this.generateImageBlock(this.gridCursor.columnWidth, block, true);
        } else if (block.type=="videoBlock") {
            this.generateVideoBlock(this.gridCursor.columnWidth, block);
        } else if (block.type=="photoChallengeBlock") {
            this.generatePhotoChallenge(this.gridCursor.columnWidth, block);
        } else if (block.type=="linkBlock") {
            this.generateLinkBlock(this.gridCursor.columnWidth, block);
        }  else if (block.type=="bulletBlock") {
            this.generateBulletBlock(this.gridCursor.columnWidth, block);
        } else if (block.type=="jumpToCardBlock") {
            this.generateJumpToCardBlock(this.gridCursor.columnWidth, block);
        } 

        if (this.gridCursor.cellHeight>this.cellHeightMax) {
            this.cellHeightMax = this.gridCursor.cellHeight;
        }

        // calculate x and y offsets based off table columns
        if (this.gridCursor.cellX < this.gridCursor.columns) {
            this.gridCursor.cellX++;
            this.gridCursor.x = this.gridCursor.x + this.gridCursor.columnWidth;
        } else if (this.gridCursor.cellX == this.gridCursor.columns) {
            this.gridCursor.cellX = 1;
            this.gridCursor.cellY++;
            this.gridCursor.x = smartInstructions.DEFAULT_MARGIN;
            this.gridCursor.y = this.cellHeightMax;
        }
        if (block.type=="beginSplitBlock") {
            this.gridCursor.columns = block.columns;
            this.gridCursor.columnWidth = smartInstructions.DEFAULT_WIDTH/this.gridCursor.columns;
            this.gridCursor.x = smartInstructions.DEFAULT_MARGIN;
        } else if (block.type=="endSplitBlock") {
            this.gridCursor.columns = 1;
            this.gridCursor.columnWidth = smartInstructions.DEFAULT_WIDTH;
        }
                
    }
    this.createCard();
}

Card.prototype.addComponentToLayout = function (component) {
    this.src_components.push(component);
}

Card.prototype.generateImageBlock = function(boundsX, block, push) {
    // assume already loaded
    var bitmap = frame.asset(block.icon);
    bitmap.width = block.width;
    bitmap.height = block.height;
    bitmap.y = this.gridCursor.y+10;
    bitmap.x = this.gridCursor.x + (boundsX-bitmap.width)/2;
    this.gridCursor.cellHeight = bitmap.height + this.gridCursor.y + 20;
    if (push) {
        this.gui_components.push(bitmap);
    } else {
        return bitmap;
    }

}

Card.prototype.generateVideoBlock = function (boundsX, block) {
    // lets dynamically add a video element
    var player = new zim.Container();
    player.y = this.gridCursor.y;

    var source = zid (block.url);
    var video = new zim.Bitmap(source);
    video.scaleX=block.scaleX;
    video.scaleY=block.scaleY;
    player.addChild(video);

    var controls = new zim.Container();
    controls.x = player.x;

    var playButton = makeButton("pause",0, "play");
    playButton.width = 50;
    playButton.height = 50;
    playButton.x = 250;
    controls.addChild(playButton);

    var restartButton = makeButton("restart");
    restartButton.x = 320;
    restartButton.width = 50;
    restartButton.height = 50;
    controls.addChild(restartButton);

    playButton.on("click", 
        function togglePlayVideo() {
            if (playButton.toggled) {
                source.pause();
            } else {
                source.play();
            }
        }
    );

    restartButton.on("click", 
        function restartVideo() {
            source.currentTime = 0;
            source.play();
            playButton.toggle(false);
        }
    );
    player.addChild(controls);

    this.gui_components.push(player);
    frame.stage.addChild(player); 
    this.gridCursor.cellHeight = player.height + this.gridCursor.y + 20;
    controls.y = 335;
    playButton.toggle(true);
    zim.Ticker.add(function() {frame.stage.update()}, frame.stage);    

}

Card.prototype.generateTextBlock = function (boundsX, block, push) {
    var style = ""
    if ((block.style!=undefined) && (block.style==smartInstructions.StyleEnum.Bold)) {
        style += "bold ";
    } else if (block.style==smartInstructions.StyleEnum.Italic) {
        style += "italic ";
    }

    var color = smartInstructions.DEFAULT_STROKE_COLOR;
    if (block.color!=undefined) {
         color = block.color;
    }

    var font_size = smartInstructions.DEFAULT_FONT_WEIGHT;
    if (block.font_size!=undefined) {
        font_size = block.font_size;
    }
    var instructions;
    if (!iOS()) {
       instructions  = new zim.Label({
        text:block.text,
        font:"Nunito",
        color: color,
        fontOptions: style,
        size: font_size,
        lineWidth: boundsX 
        });
    } else {
        instructions  = new zim.Label({
        text:block.text,
        font:"Nunito",
        color: color,
        size: font_size,
        lineWidth: boundsX
        });
    }
    instructions.x = this.gridCursor.x;
    if (block.layout!=undefined) {
        if (block.layout==smartInstructions.AlignEnum.Center) {
            instructions.x = this.gridCursor.x + boundsX/2 - instructions.getBounds().width/2;
        } else if (block.layout==smartInstructions.AlignEnum.Right) {
            instructions.x = this.gridCursor.x + boundsX - instructions.getBounds().width - 20;
        }
    } 
    instructions.y = this.gridCursor.y;
    this.gridCursor.cellHeight = instructions.getBounds().height + this.gridCursor.y+20;

    if (push) {
        this.gui_components.push(instructions);
    } else {
        return instructions;
    }
}

Card.prototype.generateJumpToCardBlock = function (boundsX, block) {
    var component;
    if (block.linkType=="Text") {
        block.font_size=15;
        block.color = "#FF0000";
        block.style=smartInstructions.StyleEnum.Bold;
        component = this.generateTextBlock (boundsX, block, false);
    } else {
        block.width = 100;
        block.height = 100;
        component = this.generateImageBlock (boundsX, block, false);
    }
    component.cursor = "pointer";
    this.gui_components.push(component);

    (function (cardflow) {
        component.on("click", function() {
            cardflow.selectCard(cardflow.cards[block.slideNo]);
        });
    })(this.cardflow);
}

Card.prototype.generateLinkBlock = function (boundsX, block) {
    var component;
    if (block.linkType=="Text") {
        block.font_size=15;
        block.color = "#FF0000";
        block.style=smartInstructions.StyleEnum.Bold;
        component = this.generateTextBlock (boundsX, block, false);
    } else {
        block.width = 100;
        block.height = 100;
        component = this.generateImageBlock (boundsX, block, false);
    }
    component.cursor = "pointer";
    this.gui_components.push(component);

    component.on("click", function() {
        if (block.required) {
            var today = new Date();
            // make sure there isn't an existing item like this.
            var duplicate = false;
            for (var i=0; i<gameState.pointsHistory.length; i++) {
                 var pointHistory = gameState.pointsHistory[i];
                 if (pointHistory.category==block.category && pointHistory.section==cardflow.world
                          && pointHistory.module==cardflow.module) {
                     duplicate = true;
                 }
            }

            if (!duplicate) {
                // updated game state and save
                gameState.pointsHistory.push({
                    category: block.category,
                    title: "Required Link",
                    date: (today.getMonth()+1)+'/'+today.getDate() + '/' +today.getFullYear(),
                    module: cardflow.module,
                    section: cardflow.world,
                    points: 5});
                saveGameState(cardflow.updateGameState, cardflow);
            }
        }
        zgo(block.url, "_blank", false);
    })
}



Card.prototype.generateBulletBlock = function (boundsX, block) {
    var bulletContainer = new zim.Container();
    bulletContainer.x = this.gridCursor.x;
    bulletContainer.y = this.gridCursor.y;

    var bullet = new zim.Circle(block.font_size/4, smartInstructions.DEFAULT_STROKE_COLOR);
    bullet.x = block.indent;
    bullet.y = block.font_size/2;
    bulletContainer.addChild(bullet);

    var textElement = this.generateTextBlock(boundsX, block, false);
    textElement.x = parseInt(block.indent) + 20;
    textElement.y = 0;
    bulletContainer.addChild(textElement);
    this.gui_components.push(bulletContainer);
}

Card.prototype.generatePhotoChallenge = function (boundsX, block) {
    var location = {x: this.gridCursor.x, y: this.gridCursor.y};
console.log(this.cardflow);
    var photoChallenge = new PhotoChallenge(location, boundsX, false, this.cardflow.world, this.cardflow.module, block.category, block.title, block.startDate, block.icon, this.cardflow);
    this.gridCursor.cellHeight = smartInstructions.DEFAULT_THUMBNAIL_SIZE+smartInstructions.DEFAULT_TAB_HEIGHT+100;
    this.gui_components.push(photoChallenge.createUploadWidget());
}
