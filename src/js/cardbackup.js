function Card(cardContainer, location, width,height) {
    this.id = generateGuid();
    this.title = "";
    this.src_components = [];
    this.gui_components = [];
    this.gridCursor = {};
    this.viewerW = width;
    this.viewerH = height;
    this.baseContainer;
    this.mask;
    this.titleBar;
    this.cardLabel;
    this.scrollbar;
    this.cardContainer = cardContainer;
    this.location = location;
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
    this.cardContainer.removeChild(this.scrollbar);
    this.gui_components = [];
}

Card.prototype.createCard = function() {
    this.gridCursor.columns = 1;
    this.gridCursor.columnWidth = smartInstructions.DEFAULT_WIDTH;
    var scrollW = 10;

    zim.OPTIMIZE = true;
    var tabHeight = 50;

    this.titleBar = new zim.Rectangle({
        width:this.viewerW, 
        height:tabHeight, 
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
    this.cardContainer.addChild(this.cardLabel);           
 
    this.mask = new zim.Rectangle({width:this.viewerW-5,        
                height:this.viewerH+tabHeight,
                color:smartInstructions.DEFAULT_BACKGROUND_COLOR,
                borderColor: "#FFFFFF",
                borderWidth: 5,
                corner:10,
                flatBottom: true});
    this.cardContainer.addChild(this.mask);
    this.mask.x = this.location.x+5;
    this.mask.y = this.location.y+20;
  
    this.baseContainer = new zim.Container({width:smartInstructions.DEFAULT_WIDTH, height:smartInstructions.DEFAULT_HEIGHT});
    for (var i=0; i<this.gui_components.length; i++) {
        this.gui_components[i].addTo(this.baseContainer);
    }   
    this.cardContainer.addChild(this.baseContainer);
    this.baseContainer.x = this.mask.x;
    this.baseContainer.y = this.mask.y;
    this.baseContainer.setMask(this.mask);
            
    var button = new zim.Button({
        width:scrollW,
        height:this.viewerH/smartInstructions.DEFAULT_HEIGHT*this.viewerH, 
        label:"",
        color:"#BBBBBB",
        rollColor:frame.grey,
        corner:0
    })

    this.scrollbar = new zim.Slider({
        min:0,
        max:-(smartInstructions.DEFAULT_HEIGHT-this.viewerH),
        step:0,
        button:button,
        barLength:this.viewerH,
        barWidth:scrollW,
        barColor:"#DDDDDD",
        vertical:true,
        inside:true
    });

    zim.expand(this.scrollbar.button); // helps on mobile
    this.cardContainer.addChild(this.scrollbar);
    this.scrollbar.x = this.baseContainer.x + this.viewerW;
    this.scrollbar.y = this.baseContainer.y;
   
    (function(card) {
        card.scrollbar.on("change", function() {
           card.baseContainer.y = card.mask.y + card.scrollbar.currentValue;
           frame.stage.update(); 
       });
    })(this);
    frame.stage.update();

}

Card.prototype.generateLayout = function() {
    this.resetEnv();
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

    var source = zid ("video1");
    var video = new zim.Bitmap(source);
    video.scaleX=block.scaleX;
    video.scaleY=block.scaleY;
    player.addChild(video);

    var controls = new zim.Container();
    controls.x = player.x;

    var playButton = makeButton("pause",0, "play");
    playButton.width = 50;
    playButton.height = 50;
    playButton.x = 150;
    controls.addChild(playButton);

    var restartButton = makeButton("restart");
    restartButton.x = 220;
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
    controls.y = 275;
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
    var instructions = new zim.Label({
        text:block.text,
        font:"Nunito",
        color: color,
        size: font_size,
        fontOptions: style,
        lineWidth: boundsX
    });
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


Card.prototype.generateLinkBlock = function (boundsX, block) {
    var component;
    if (block.linkType=="Text") {
        block.font_size=15;
        block.color = "#FF0000";
        block.style=smartInstructions.StyleEnum.Bold;
        component = this.generateTextBlock (boundsX, block, false);
    } else {
        component = this.generateImageBlock (boundsX, block, false);
    }
    component.cursor = "pointer";
    this.gui_components.push(component);

    component.on("click", function() {
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
    var photoChallenge = new PhotoChallenge(location, boundsX, false, block.category, block.title, block.icon);
    this.gridCursor.cellHeight = smartInstructions.DEFAULT_THUMBNAIL_SIZE+smartInstructions.DEFAULT_TAB_HEIGHT+100;
    this.gui_components.push(photoChallenge.createUploadWidget());
}
