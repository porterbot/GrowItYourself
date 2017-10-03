var frame;
function GardenElement () {
     this.type;
     this.meta;
     this.gui;
     this.location;
}

function GardenPlanner () {
    if (iOS()) {
       this.font = "Arial";
    } else {
       this.font = "Nunito";
    }
    this.mode;
    this.plantBox;
    this.selectTool;
    this.plantTool;
    this.borderTool;
    this.templateList = [];
    this.elements = {};
    this.newBorder;
    this.gridWidth = 75;
    this.gridHeight = 75;
    this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    this.plantInfo = {
       "corn": {"germinationTime": 7,
                "min": 45,
                "max": 100,
                "daysToHarvest": 80
       },
       "tomato": {"germinationTime": 28,
                "min": 50,
                "max": 95,
                "daysToHarvest": 80
       },
       "melon": {"germinationTime": 7,
                "min": 50,
                "max": 90,
                "daysToHarvest": 80
       },
       "sunflower": {"germinationTime": 10,
                "min": 50,
                "max": 100,
                "daysToHarvest": 100
       },
       "wintersquash": {"germinationTime": 7,
                "min": 50,
                "max": 100,
                "daysToHarvest": 100
       },
       "pepper": {"germinationTime": 35,
                "min": 50,
                "max": 95,
                "daysToHarvest": 75
       },
       "beans": {"germinationTime": 7,
                "min": 50,
                "max": 95,
                "daysToHarvest": 60
       },
       "swisschard": {"germinationTime": 35,
                "min": 30,
                "max": 90,
                "daysToHarvest": 90
       },
       "rosemary": {"germinationTime": 55,
                "min": 40,
                "max": 100,
                "daysToHarvest": 175
       },
       "sage": {"germinationTime": 35,
                "min": 30,
                "max": 90,
                "daysToHarvest": 100
       },
       "thyme": {"germinationTime": 55,
                "min": 40,
                "max": 90,
                "daysToHarvest": 175
       },
       "oregano": {"germinationTime": 45,
                "min": 40,
                "max": 90,
                "daysToHarvest": 150
       },
       "basil": {"germinationTime": 14,
                "min": 50,
                "max": 100,
                "daysToHarvest": 75
       },
       "dill": {"germinationTime": 30,
                "min": 45,
                "max": 85,
                "daysToHarvest": 80
       },
       "lavender": {"germinationTime": 50,
                "min": 40,
                "max": 100,
                "daysToHarvest": 130
       },
       "echinacea": {"germinationTime": 30,
                "min": 45,
                "max": 95,
                "daysToHarvest": 175
       },
       "yarrow": {"germinationTime": 40,
                "min": 40,
                "max": 90,
                "daysToHarvest": 175
       },
       "borage": {"germinationTime": 21,
                "min": 40,
                "max": 90,
                "daysToHarvest": 75 
       },
       "anisehyssop": {"germinationTime": 40,
                "min": 40,
                "max": 95,
                "daysToHarvest": 200
       },
       "calendula": {"germinationTime": 17,
                "min": 50,
                "max": 90,
                "daysToHarvest": 75 
       },
       "nasturtium": {"germinationTime": 21,
                "min": 50,
                "max": 90,
                "daysToHarvest": 75 
       }
    }
}

GardenPlanner.prototype.setMode = function (mode, tool) {
    // check current mode
    this.mode = mode;
    this.tool = tool;
}

GardenPlanner.prototype.generatePDF = function() {
    var doc = new jsPDF('p', 'pt', 'letter');
    doc.setFontSize(28);
    doc.setDrawColor(0); 

    // snapshot the main template area and add to first page
    doc.text(this.template.settings.templateName + " Design Layout", 25, 50);
    var image = this.snapshotImage(0,0,800,800,400,400);
    doc.addImage(image, 25, 75);
   
    // snapshot the average temperatures and add to first page
    doc.text("Average Temperatures for " + this.currentSettings.zipCode, 25, 420);
    var calendar = this.buildCalendar();
    frame.stage.addChild(calendar);
    frame.stage.update();
    image = this.snapshotImage(0,0,calendar.getBounds().width, calendar.getBounds().height);
    doc.addImage (image, 25, 450);
    frame.stage.removeChild(calendar);
    frame.stage.update();

    doc.addPage();
 
    // snapshot the planting calendar table and add to second page
    doc.text ("Planting Calendar", 25, 75);
    var reportTable = this.populatePlantingTable();
    frame.stage.addChild(reportTable);
    frame.stage.update();
    image = this.snapshotImage(0,0,reportTable.getBounds().width, reportTable.getBounds().height );
    doc.addImage(image, 25, 125);
    frame.stage.removeChild(reportTable);
    frame.stage.update();

    doc.save(this.template.settings.templateName + '.pdf');
}

GardenPlanner.prototype.snapshotImage = function(x, y, width, height, scaleWidth, scaleHeight) {
    var tgtWidth = scaleWidth;
    var tgtHeight = scaleHeight;
    if (!tgtWidth) {
        tgtWidth = width;
        tgtHeight = height;
    }
    var hiddencanvas = document.createElement('canvas');
    hiddencanvas.width = tgtWidth;
    hiddencanvas.height = tgtHeight;
    hiddencanvas.getContext('2d').drawImage(frame.canvas,x,y,width,height,0,0,tgtWidth,tgtHeight);
    return hiddencanvas.toDataURL("image/png");
}

GardenPlanner.prototype.buildPlantTiles = function(container) {
    var plantDim = 75;
    for (var i=0; i<7; i++) {
        for (var j=0; j<3; j++) {
            var index = 20+(i*3)+j+1;
            var plantTile = frame.asset(tools[index]);
            var plantName = tools[index].replace("planner_","");
            plantName = plantName.replace("_icon.png","");

            var plantButton = new zim.Button({
                width:75,
                height:75,
                corner: 0,
                color: "#CCC",
                rollColor: "#AAA",
                icon:plantTile
            });

            (function (plantName, gardenPlanner, plantButton, container) {
                plantButton.on("click", function() {
                    gardenPlanner.setMode("plant", plantName);
                });
                plantButton.on("mouseover", function() {
                    zim.timeout(100, function() {
                        gardenPlanner.displayTooltip (plantName, container, plantButton);
                        zim.timeout(750, function() {
                            container.removeChild(plantButton.tooltip);
                            plantButton.tooltip.dispose();
                            frame.stage.update();
                        });
                    });
                })
            })(plantName, this, plantButton, container)
            
            container.addChild(plantButton);
            plantTile.x = 0;
            plantTile.y = 0;
            plantButton.y = i * plantDim;
            plantButton.x = j * plantDim;
        }
    }
}

GardenPlanner.prototype.enterSelectionMode = function() {
  var planner = this;
  // iterate through the elements and enable drag on all of them
   for (elementKey in this.elements) {
        var element = this.elements[elementKey];
        element.asset.drag(new createjs.Rectangle(0,0,725,725));    
        element.asset.on("pressup", function() {
            planner.hotItem = this;
            planner.applySnap(element.asset);
            frame.stage.update();
        });
   }
}

GardenPlanner.prototype.applySnap = function (component) {
   if (component.x) {
       component.x = Math.round(component.x/this.gridWidth)*this.gridWidth;
       component.y = Math.round(component.y/this.gridHeight)*this.gridHeight;
   } else {
       return Math.round(component/this.gridWidth)*this.gridWidth;
   }
}

GardenPlanner.prototype.applyTool = function(x, y, event) {
    if (this.mode=="plant" && event=="mousedown") {
        var plantAsset = frame.asset("planner_" + this.tool + "_icon.png").clone();
        plantAsset.x = Math.round(x) - 37;
        plantAsset.y = Math.round(y) - 37;
        if (plantAsset.x<0) {
            plantAsset.x = 0;
        } 
        if (plantAsset.x>725) {
            plantAsset.x = 725;
        } 
        if (plantAsset.y<0) {
            plantAsset.y = 0;
        }
        if (plantAsset.y>725) {
            plantAsset.y = 725;
        } 
        if (this.currentSettings.grid == "On") {
            this.applySnap(plantAsset);
        }
        plantAsset.id = generateGuid();
        var plantElement = new GardenElement();
        plantElement.location = {x:plantAsset.x, y:plantAsset.y};
        plantElement.id = plantAsset.id;
        plantElement.asset = plantAsset;
        plantElement.type = "plant";
        plantElement.meta = this.tool;
        this.elements[plantElement.id] = plantElement;
        this.planBox.addChild(plantAsset);
        this.hotItem = plantAsset;
        frame.stage.update();

    } else if (this.mode=="border") {
        if (event=="mousedown") {
           // initialize shape 
            if (this.borderShapeStarted)
               return;
            this.startX = Math.round(x);
            this.startY = Math.round(y);
            if (this.currentSettings.grid == "On") {
                this.startX = this.applySnap(this.startX);
                this.startY = this.applySnap(this.startY);
            }
            if (this.tool=="rectangle") {
                this.borderShapeStarted = true;
                this.newBorder = new zim.Rectangle({width:10,
                  height:10,
                  color:"#EEE",
                  borderWidth:5,
                  borderColor:"black"});
                this.newBorder.x = this.startX;
                this.newBorder.y = this.startY;
                this.planBox.addChild(this.newBorder);
            } else if (this.tool=="circle") {
                this.borderShapeStarted = true;
                this.newBorder = new zim.Circle({radius:10,
                  color:"#EEE",
                  borderWidth:5,
                  borderColor:"black"});
                this.newBorder.x = this.startX;
                this.newBorder.y = this.startY;
                this.planBox.addChild(this.newBorder);
            } else if (this.tool == "line") {
               if (!this.lineStarted) {
                   this.newBorder = new zim.Shape();
                   this.newBorder.x = this.startX;
                   this.newBorder.y = this.startY;
                   this.planBox.addChild(this.newBorder);
                   this.lineStarted = true;
                   this.lineCommands = [];
               } else {
                   this.lineCommands.push({x:this.startX, y:this.startY});
                   this.newBorder.graphics.clear();
                   this.newBorder.graphics.s("black").ss(5).mt(0,0);
                   for (var i=0; i<this.lineCommands.length; i++) {
                        var lineCommand = this.lineCommands[i];
                        this.newBorder.graphics.lt(lineCommand.x-this.newBorder.x, lineCommand.y-this.newBorder.y);
                   }
               }
            }
            frame.stage.update();
        } else if (event=="mousemove") {
            var width = Math.round(x) - this.startX;
            var height = Math.round(y) - this.startY;
            if (this.currentSettings.grid == "On") {
                width = this.applySnap(width);
                height = this.applySnap(height);
            }
            if (this.tool=="rectangle") {
                this.planBox.removeChild(this.newBorder);
                this.newBorder = new zim.Rectangle({width:width,
                  height:height,
                  color:"#EEE",
                  borderWidth:5,
                  borderColor:"black"});
                this.newBorder.x = this.startX;
                this.newBorder.y = this.startY;
                this.planBox.addChild(this.newBorder);
            } else if (this.tool=="circle") {
                this.planBox.removeChild(this.newBorder);
                this.newBorder = new zim.Circle({radius:width/2,
                  color:"#EEE",
                  borderWidth:5,
                  borderColor:"black"});
                this.newBorder.x = this.startX;
                this.newBorder.y = this.startY;
                this.planBox.addChild(this.newBorder);
            }
            frame.stage.update();
        } else if (event=="mouseup") {
            if (this.tool == "line") 
               return;
            var borderElement = new GardenElement();
            borderElement.location = {x:this.newBorder.x, y:this.newBorder.y};
            borderElement.width = this.newBorder.width;
            borderElement.height = this.newBorder.height;
            this.newBorder.id = generateGuid();
            borderElement.id = this.newBorder.id;
            borderElement.type = "border";
            borderElement.meta = this.tool;
            borderElement.asset = this.newBorder;
            this.hotItem = this.newBorder;

            if (this.tool=="rectangle" || this.tool=="circle") {
                borderElement.width = this.newBorder.width;
                borderElement.height = this.newBorder.height;
                borderElement.asset = this.newBorder;
            }
            this.elements[borderElement.id] = borderElement;
            (function (gardenPlanner) {
                gardenPlanner.newBorder.on("mousedown", function(e) {
                    gardenPlanner.applyTool(e.stageX, e.stageY, "mousedown");
                })
            })(this)
            this.newBorder = undefined;
            this.borderShapeStarted = false;
            frame.stage.update();
        } else if (event=="complete") {
            var borderElement = new GardenElement();
            borderElement.location = {x:this.newBorder.x, y:this.newBorder.y};
            this.newBorder.id = generateGuid();
            borderElement.id = this.newBorder.id;
            borderElement.type = "border";
            borderElement.meta = this.tool;
            borderElement.asset = this.newBorder;
            borderElement.lineCommands = this.lineCommands;
            borderElement.asset.setBounds(100,100);
            this.elements[borderElement.id] = borderElement; 
            this.hotItem = this.newBorder;
            this.newBorder = undefined;
            this.borderShapeStarted = false;
            this.lineStarted = false;
            frame.stage.update();
         }
    }
}

GardenPlanner.prototype.drawBorderBox = function() {
    frame.stage.removeChild(this.plantBox);
    frame.stage.update();
    this.borderBox = new zim.Container();
    this.borderBox.x = 800;
    this.borderBox.y = 350;

    var borderBoxTileBar = new zim.Rectangle({
        color: "white",
        height: 20,
        width: 235
    });
    this.borderBox.addChild(borderBoxTileBar);

    var borderBoxLabel = new zim.Label({
        text: "Border/Edging",
        size: 16,
        color: "#006600",
        font:this.font,
    });
    borderBoxLabel.x = 20;
    this.borderBox.addChild(borderBoxLabel);

    var lineBorderIcon = frame.asset("planner_lineBorder.png");
    var lineBorderTool = new zim.Button({
        width:75,
        height:75,
        corner: 0,
        color: "#CCC",
        rollColor: "#AAA",
        icon:lineBorderIcon
    });
    lineBorderIcon.x = 0;
    lineBorderIcon.y = 0;
    lineBorderTool.y = 20;
    this.borderBox.addChild(lineBorderTool);
    (function(gardenPlanner) {
        lineBorderTool.on("click", function() {
           gardenPlanner.setMode("border", "line");
            var completeButtonLabel = new zim.Label({
                text:"Complete",
                size:14,
                color:"white"
            });
            var completeButton = new zim.Button({
                label:completeButtonLabel,
                width:50,
                height:40,
                color:"blue",
                gradient: 0.3,
                rollColor:"orange",
                corner:0
            });
            completeButton.y = 100;
            gardenPlanner.borderBox.addChild(completeButton);
            completeButton.on("click", function() {
                gardenPlanner.applyTool(0,0, "complete");
                gardenPlanner.borderBox.removeChild(this);
            });
       });
    })(this);

    var rectBorderIcon = frame.asset("planner_rectBorder.png");
    var rectBorderTool = new zim.Button({
        width:75,
        height:75,
        corner: 0,
        color: "#CCC",
        rollColor: "#AAA",
        icon:rectBorderIcon
    });
    rectBorderIcon.x = 0;
    rectBorderIcon.y = 0;
    rectBorderTool.x = 75;
    rectBorderTool.y = 20;
    this.borderBox.addChild(rectBorderTool);
    (function(gardenPlanner) {
        rectBorderTool.on("click", function() {
           gardenPlanner.setMode("border", "rectangle");
       });
    })(this);

    var circleBorderIcon = frame.asset("planner_circleBorder.png");
    var circleBorderTool = new zim.Button({
        width:75,
        height:75,
        corner: 0,
        color: "#CCC",
        rollColor: "#AAA",
        icon:circleBorderIcon
    });
    circleBorderIcon.x = 0;
    circleBorderIcon.y = 0;
    circleBorderTool.x = 150;
    circleBorderTool.y = 20;
    this.borderBox.addChild(circleBorderTool);
    (function(gardenPlanner) {
        circleBorderTool.on("click", function() {
           gardenPlanner.setMode("border", "circle");
       });
    })(this);

    frame.stage.addChild(this.borderBox);    
    frame.stage.update();
}

GardenPlanner.prototype.drawPlantBox = function() {
    frame.stage.removeChild(this.borderBox);
    frame.stage.update();

    this.plantBox = new zim.Container();
    this.plantBox.x = 800;
    this.plantBox.y = 350;

    var plantBoxTileBar = new zim.Rectangle({
        color: "white",
        height: 20,
        width: 235
    });
    this.plantBox.addChild(plantBoxTileBar);

    var plantBoxLabel = new zim.Label({
        text: "Plants",
        size: 16,
        color: "#006600",
        font:this.font,
    });
    plantBoxLabel.x = 20;
    this.plantBox.addChild(plantBoxLabel);

    var scrollW = 10;
    var viewerW = 225;
    var viewerH = 300;
            
    var mask = new zim.Rectangle({width:viewerW,height:viewerH, color:smartInstructions.DEFAULT_BACKGROUND_COLOR});
    this.plantBox.addChild(mask);
    mask.x = 0;
    mask.y = 20;

    var plantTiles = new zim.Container();
    this.buildPlantTiles(plantTiles);
    this.plantBox.addChild(plantTiles);
    plantTiles.x = mask.x;
    plantTiles.y = mask.y;
    plantTiles.setMask(mask);
            
    var button = new zim.Button({
        height:viewerH/1000*viewerH,
        width:scrollW, 
        label:"",
        color:"#BBBBBB",
        rollColor:frame.grey,
        corner:0
    })

    var scrollbar = new zim.Slider({
        min:525-viewerH,
        max:0,
        step:0,
        button:button,
        barLength:viewerH,
        barWidth:scrollW,
        barColor:"#DDDDDD",
        vertical:true,
        inside:true
    });

    zim.expand(scrollbar.button); // helps on mobile
    this.plantBox.addChild(scrollbar);
    scrollbar.x = plantTiles.x + viewerW;
    scrollbar.y = plantTiles.y;
   
    (function(plantTiles, offsetY) {
        scrollbar.on("change", function() {
           plantTiles.y = 20-scrollbar.currentValue;
           frame.stage.update(); 
       });
    })(plantTiles, this.plantBox.y);

    frame.stage.addChild(this.plantBox);    
    frame.stage.update();
}

function createScrollBar(topContainer, container, maxWidth, maxHeight, maskX, maskY, viewWidth, viewHeight, vertical) {
    var mask = new zim.Rectangle({width:width,height:height, color:smartInstructions.DEFAULT_BACKGROUND_COLOR});
    topContainer.addChild(mask);
    mask.x = maskX;
    mask.y = maskY;
    topContainer.addChild(mask);

    container.setMask(mask);
            
    var scollButton = new zim.Button({
        height:viewHeight/1000*viewHeight,
        width:10, 
        label:"",
        color:"#BBBBBB",
        rollColor:frame.grey,
        corner:0
    })

    var scrollbar = new zim.Slider({
        min:maxHeight-viewHeight,
        max:0,
        step:0,
        button:scollButton,
        barLength:viewHeight,
        barWidth:10,
        barColor:"#DDDDDD",
        vertical:vertical,
        inside:true
    });

    zim.expand(scrollbar.button); // helps on mobile
    container.addChild(scrollbar);
    scrollbar.x = container.x + viewWidth;
    scrollbar.y = container.y;
   
    (function(container) {
        scrollbar.on("change", function() {
           container.y = 20-scrollbar.currentValue;
           frame.stage.update(); 
       });
    })(container);
}

GardenPlanner.prototype.enableTool= function (tool) {
    if (this.mode!="selectTool") {
      for (elementKey in this.elements) {
          var element = this.elements[elementKey];
          element.asset.noDrag();     
      }
    }

    if (tool=='plantTool') {
        this.selectTool.toggle(false);
        this.borderTool.toggle(false);
        this.drawPlantBox();

    } else if (tool=='borderTool') {
        this.selectTool.toggle(false);
        this.plantTool.toggle(false);
        this.drawBorderBox();
    } else if (tool=='selectTool') {
        this.setMode("select");
        this.enterSelectionMode();
        frame.stage.removeChild(this.plantBox);
        frame.stage.removeChild(this.borderBox);
        frame.stage.update();
        this.plantTool.toggle(false);
        this.borderTool.toggle(false);
    }

}

GardenPlanner.prototype.initPlanner= function () {
    var scaling = "fit"; // fit scales to fit the browser window while keeping the aspect ratio
    var width = 1035; // can go higher...
    var height = 800;
    var color = "#AACCAA";
    frame = new zim.Frame(scaling, width, height, color); // see docs for more options and info


    var gardenPlanner = this;
    frame.on("ready", function() {
        tools = [];

        tools.push("planner_select.png");
        tools.push("planner_trash.png");
        tools.push("planner_trash_toggle.png");
        tools.push("edit_text_icon.png");
        tools.push("edit_text_icon_hover.png");
        tools.push("garden_design.png");
        tools.push("planner_select_toggle.png");
        tools.push("planner_file_view2.png");
        tools.push("planner_pdf.png");
        tools.push("planner_settings_view2.png");
        tools.push("planner_report_view.png");
        tools.push("planner_calendar_view.png");
        tools.push("planner_plant.png");
        tools.push("planner_border.png");
        tools.push("planner_border_toggle.png");
        tools.push("planner_access.png");
        tools.push("planner_plant_toggle.png");
        tools.push("planner_rectBorder.png");
        tools.push("planner_lineBorder.png");
        tools.push("planner_circleBorder.png");
        tools.push("planner_access_toggle.png");
        tools.push("planner_tomato_icon.png");
        tools.push("planner_corn_icon.png");
        tools.push("planner_wintersquash_icon.png");
        tools.push("planner_melon_icon.png");
        tools.push("planner_beans_icon.png");
        tools.push("planner_swisschard_icon.png");
        tools.push("planner_pepper_icon.png");
        tools.push("planner_sunflower_icon.png");
        tools.push("planner_rosemary_icon.png");
        tools.push("planner_thyme_icon.png");
        tools.push("planner_oregano_icon.png");
        tools.push("planner_basil_icon.png");
        tools.push("planner_dill_icon.png");
        tools.push("planner_sage_icon.png");
        tools.push("planner_lavender_icon.png");
        tools.push("planner_echinacea_icon.png");
        tools.push("planner_yarrow_icon.png");
        tools.push("planner_borage_icon.png");
        tools.push("planner_calendula_icon.png");
        tools.push("planner_anisehyssop_icon.png");
        tools.push("planner_nasturtium_icon.png");
        
        frame.loadAssets(tools, smartInstructions.DEFAULT_URL);
        document.getElementById('spares').appendChild(document.getElementById('myCanvas'));
        this.initiated = false;
        frame.on("complete", function() {
            if (this.initiated) 
                return;
            this.initiated = true;
            var saveButtonLabel = new zim.Label({
                text:"Save",
                size:14,
                color:"white"
            });
            var saveButton = new zim.Button({
                label:saveButtonLabel,
                width:50,
                height:40,
                color:"blue",
                gradient: 0.3,
                rollColor:"orange",
                corner:0
            });
            saveButton.x = 860;
            saveButton.y = 0;
            saveButton.on("click", function() {
                 gardenPlanner.updateTemplateOptions();
                 gardenPlanner.saveTemplate();
            });
            this.stage.addChild(saveButton);

            var newButtonLabel = new zim.Label({
                text:"New",
                size:14,
                color:"white"
            });
            var newButton = new zim.Button({
                label:newButtonLabel,
                width:50,
                height:40,
                color:"blue",
                gradient: 0.3,
                rollColor:"orange",
                corner:0
            });
            newButton.x = 800;
            newButton.y = 0;
            newButton.on("click", function() {
                gardenPlanner.designBox = new zim.Container();
                gardenPlanner.designBox.x = -275;
                gardenPlanner.designBox.y = -125;
                gardenPlanner.buildDesignBox(gardenPlanner.designBox);
                gardenPlanner.optionsPane = gardenPlanner.setupDialog(gardenPlanner.cleanupSettings);
                gardenPlanner.optionsPane.addChild(gardenPlanner.designBox);
                gardenPlanner.createTemplate();
           });
           this.stage.addChild(newButton);

            var viewBox = new zim.Container();
            viewBox.x = 800;
            viewBox.y = 50;

            var viewBoxBackGround = new zim.Rectangle({
                color: "gray",
                height: 150,
                width: 250
            });
            viewBox.addChild(viewBoxBackGround);
            var viewBoxTileBar = new zim.Rectangle({
                color: "white",
                height: 20,
                width: 250
            });
            viewBox.addChild(viewBoxTileBar);

            var viewBoxLabel = new zim.Label({
                text: "Views",
                size: 16,
                color: "#006600",
                font:this.font,
            });
            viewBoxLabel.x = 20;
            viewBox.addChild(viewBoxLabel);

            var settingsIcon = frame.asset("planner_settings_view2.png");
            settingsIcon.x = -40;
            var settingsView = new zim.Button({
                width:0,
                height:0,
                backing:settingsIcon,
                icon:settingsIcon
            });
            settingsView.x = 0;
            settingsView.y = 40;
            settingsView.on("click", function() {
                gardenPlanner.designBox = new zim.Container();
                gardenPlanner.designBox.x = -275;
                gardenPlanner.designBox.y = -125;
                gardenPlanner.buildDesignBox(gardenPlanner.designBox);
                gardenPlanner.optionsPane = gardenPlanner.setupDialog(gardenPlanner.cleanupSettings);
                gardenPlanner.optionsPane.addChild(gardenPlanner.designBox);
                gardenPlanner.optionsPane.show();
                frame.stage.update();
            }); 
            viewBox.addChild(settingsView);

            var reportIcon = frame.asset("planner_report_view.png");
            reportIcon.x = -40;
            var reportView = new zim.Button({
                width:0,
                height:0,
                backing:reportIcon,
                icon:reportIcon
            });
            reportView.x = 50;
            reportView.y = 40;
            reportView.on("click", function() {
                gardenPlanner.drawPlantingReport();
            }); 
            viewBox.addChild(reportView);

            var calendarIcon = frame.asset("planner_calendar_view.png");
            calendarIcon.x = -40;
            var calendarView = new zim.Button({
                width:0,
                height:0,
                backing:calendarIcon,
                icon:calendarIcon
            });
            calendarView.x = 100;
            calendarView.y = 40;
            calendarView.on("click", function() {
                gardenPlanner.drawCalendar();
            }); 
            viewBox.addChild(calendarView);

            var fileIcon = frame.asset("planner_file_view2.png");
            fileIcon.x = -40;
            var fileView = new zim.Button({
                width:0,
                height:0,
                backing:fileIcon,
                icon: fileIcon
            });
            fileView.x = 150;
            fileView.y = 40;
            fileView.on("click", function() {
                gardenPlanner.retrieveTemplates(gardenPlanner.showLoadSaveDialog, gardenPlanner);
            });
            viewBox.addChild(fileView);

            var pdfIcon = frame.asset("planner_pdf.png");
            pdfIcon.x = -40;
            var pdfView = new zim.Button({
                width:0,
                height:0,
                backing:pdfIcon,
                icon: pdfIcon
            });
            pdfView.x = 0;
            pdfView.y = 90;
            pdfView.on("click", function() {
                gardenPlanner.generatePDF();
            });
            viewBox.addChild(pdfView);
            this.stage.addChild(viewBox);

            var toolBox = new zim.Container();
            toolBox.x = 800;
            toolBox.y = 200;

            var toolBoxBackGround = new zim.Rectangle({
                color: "gray",
                height: 200,
                width: 250
            });
            toolBox.addChild(toolBoxBackGround);
            var toolBoxTileBar = new zim.Rectangle({
                color: "white",
                height: 20,
                width: 250
            });
            toolBox.addChild(toolBoxTileBar);

            var toolBoxLabel = new zim.Label({
                text: "Tools",
                size: 16,
                color: "#006600",
                font:this.font,
            });
            toolBoxLabel.x = 20;
            toolBox.addChild(toolBoxLabel);

            // set up button panel with items
            var selectIcon = frame.asset("planner_select.png");
            selectIcon.x = -40;
            var selectToggleIcon = frame.asset("planner_select_toggle.png");
            gardenPlanner.selectTool = new zim.Button({
                width:0,
                height:0,
                backing:selectIcon,
                icon:selectIcon,
                toggle:selectToggleIcon
            });
            gardenPlanner.selectTool.x = 20;
            gardenPlanner.selectTool.y = 40;
            gardenPlanner.selectTool.on("click", function() {
                gardenPlanner.enableTool("selectTool");
            }); 
            toolBox.addChild(gardenPlanner.selectTool);

            var plantIcon = frame.asset("planner_plant.png");
            plantIcon.x = -40;
            var plantToggleIcon = frame.asset("planner_plant_toggle.png");
            gardenPlanner.plantTool = new zim.Button({
                width:0,
                height:0,
                backing:plantIcon,
                icon:plantIcon,
                toggle:plantToggleIcon
            }); 
            gardenPlanner.plantTool.x = 80;
            gardenPlanner.plantTool.y = 40;

            gardenPlanner.plantTool.on("click", function() {
                gardenPlanner.enableTool("plantTool");
            });
            toolBox.addChild(gardenPlanner.plantTool);

            var borderIcon= frame.asset("planner_border.png");
            borderIcon.x = -40;
            var borderToggleIcon = frame.asset("planner_border_toggle.png");
            gardenPlanner.borderTool = new zim.Button({
                width:0,
                height:0,
                backing:borderIcon,
                icon:borderIcon,
                toggle:borderToggleIcon
            });
            gardenPlanner.borderTool.x = 140;
            gardenPlanner.borderTool.y = 40;
            gardenPlanner.borderTool.on("click", function() {
                gardenPlanner.enableTool("borderTool");
            });
            toolBox.addChild(gardenPlanner.borderTool);

            this.stage.addChild(toolBox);

            var trashIcon = frame.asset("planner_trash.png");
            trashIcon.x = -40;
            var trashButton = new zim.Button({
                width:0,
                height:0,
                backing:trashIcon,
                icon:trashIcon
            });
            trashButton.x = 20;
            trashButton.y = 100;
            trashButton.on("click", function() {
                var asset = gardenPlanner.hotItem;
                if (asset) {
                    delete gardenPlanner.elements[asset.id];
                    gardenPlanner.planBox.removeChild(asset);
                    frame.stage.update();
                }
            });
            toolBox.addChild(trashButton);

            gardenPlanner.buildPlanBox(800,800);

            frame.stage.update();
        });
    });
}

GardenPlanner.prototype.createTemplate = function() {
    // template is a snapshot of garden elements, settings, username
    // create template data structure and persist on the backend, getting id creation

    this.template = {
      "elements": [],
      "id": generateGuid()
    }
 
    this.optionsPane.show();
    frame.stage.update();
}


GardenPlanner.prototype.deleteTemplate = function() {
    // send out delete request
    var formData = new FormData();
    formData.append("action", "delete_planner_template");
    formData.append("templateId", this.template.id);
    var xhr = new XMLHttpRequest();
    (function(planner) {
          xhr.onreadystatechange=function() {
          if (xhr.readyState==4 && xhr.status==200) {
              if (xhr.response!=null) {
                  var success = xhr.response;
                  planner.filePane.hide();
              }
          }
      }
    })(this)
    xhr.open("POST","/wp-admin/admin-ajax.php",true);
    xhr.send(formData);

}

GardenPlanner.prototype.loadTemplate = function() {
    //  take current template and initialize settings and elements
    this.currentSettings = this.template.settings;
    for (var key in this.elements) {
        var element = this.elements[key];
        this.planBox.removeChild(element.asset);
    }
    this.elements = this.template.elements;
    for (var key in this.elements) {
        var element = this.elements[key];
        var asset;
        if (element.type=="plant") {
            asset = frame.asset("planner_" + element.meta + "_icon.png").clone();
        } else if (element.type=="border") {
             if (element.meta=="rectangle") {
               asset = new zim.Rectangle({width:element.width,
                  height:element.height,
                  color:"#EEE",
                  borderWidth:5,
                  borderColor:"black"});
             } else if (element.meta=="circle") {
               asset = new zim.Circle({radius:element.width/2,
                  color:"#EEE",
                  borderWidth:5,
                  borderColor:"black"});
             } else if (element.meta=="line") {
               asset = new zim.Shape();
               asset.setBounds(75,75);
               var lineG = asset.graphics;
               lineG.s("black").ss(5).mt(0,0);
               for (var i=0; i<element.lineCommands.length; i++) {
                    var lineCommand = element.lineCommands[i];
                    lineG.lt(lineCommand.x-element.location.x, lineCommand.y-element.location.y);
               }
            }
        }
        asset.x = element.location.x;
        asset.y = element.location.y;
        asset.id = element.id;
        element.asset = asset;
        this.planBox.addChild(asset); 
    }
    this.updateTemplateOptions();
    frame.stage.update();
}

GardenPlanner.prototype.retrieveTemplates = function(callback, parent) {
    //  reach out to backend to retrieve templates
    var formData = new FormData();
    formData.append("action", "load_planner_templates");

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange=function() {
      if (xhr.readyState==4 && xhr.status==200) {
          if (xhr.response!=null) {
              var rawList = JSON.parse(xhr.response);
              parent.templateList = [];
              for (var i=0; i<rawList.length; i++) {
                   parent.templateList.push(JSON.parse(rawList[i].template.replace(/\\/g, "")));
              }
          }
          if (callback) {
              callback(parent);
          }
      }
    }
    xhr.open("POST","/wp-admin/admin-ajax.php",true);
    xhr.send(formData);
}

GardenPlanner.prototype.saveThumbnail = function() {
    // first check whether there is an existing thumbnail and remove if it exists

    // capture a screenshot from the canvas, convert to image and upload
}

GardenPlanner.prototype.saveTemplate = function() {
    var planner = this;
    var formData = new FormData();
    formData.append("action", "save_planner_template");
    formData.append("templateId", this.template.id);
    formData.append("title", this.template.settings.templateName);
    var assets = {};
    for (var elementKey in this.template.elements) {
        assets[elementKey] = this.template.elements[elementKey].asset;
         this.template.elements[elementKey].asset = undefined;
    }
    formData.append("template", JSON.stringify(this.template));
    for (var elementKey in this.template.elements) {
        this.template.elements[elementKey].asset = assets[elementKey];
    }

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange=function() {
      if (xhr.readyState==4 && xhr.status==200) {
          planner.optionsPane.hide();      
      } 
    }
    xhr.open("POST","/wp-admin/admin-ajax.php",true);
    xhr.send(formData);
}

GardenPlanner.prototype.editSettingsText = function(title, widget, setting) {
    var textPane = new zim.Pane({
        container:frame.stage,
        width:400,
        height:200,
        color:"#FFF",
        modal:false,
        displayClose: false,
        fadeTime:1000});

    var editLabel = new zim.Label({
        text: title,
        size: 22,
        color: "#000",
        align:"left",
        font: this.font});
    editLabel.x = -editLabel.getBounds().width/2;
    editLabel.y = -50;
    textPane.addChild(editLabel);

    var editText = new zim.TextArea(frame,200,50);
    editText.currentValue = widget.text;
    editText.x = 420;
    editText.y = 530;
    (function (editText) {
        frame.on("resize", function() {
            editText.y = 380 + 120/this.scale;
        });
    })(editText)
    editText.backing.removeFrom(editText);
    editText.tag.style.color = "#000";
    editText.tag.style["background-color"] = "#EEE";
    editText.tag.style["border"] = "solid 1px #000";
    frame.stage.addChild(editText);

    var saveButtonLabel = new zim.Label({
        text:"Save",
        size:20,
        color:"white"
    });
    var saveButton = new zim.Button({
        label:saveButtonLabel,
        width:100,
        height:30,
        color:"blue",
        gradient: 0.3,
        rollColor:"orange",
        corner:0
    });
    saveButton.x = -saveButton.getBounds().width/2;
    saveButton.y = 50;
    textPane.addChild(saveButton);
    (function (editText, planner, widget) {
        saveButton.on("click", function() {
            if (!planner.currentSettings)
                planner.currentSettings = {};
            planner.currentSettings[setting] = editText.currentValue;
            widget.text = editText.currentValue;
            editText.dispose();
            textPane.hide();
        });
    })(editText, this, widget)

    textPane.show();
}

GardenPlanner.prototype.initTemplateList = function() {
    var loadList = new zim.Container();
    var i=0;
    for (var i=0; i<this.templateList.length; i++) {
        var template = this.templateList[i];
        var templateBacking = new zim.Rectangle(250,25,"white");
        var templateLabel = new zim.Label({
              text: template.settings.templateName,
              size: 16,
              color: "#006600",
              font:this.font,
              align:"left"
        });
        (function (planner,label,backing, template) {
            label.on("mouseover", function() {
                backing.color="#AAA";
                frame.stage.update();
            }); 
            label.on("mouseout", function() {
                if (planner.template!=template) {
                    backing.color="white";
                    frame.stage.update();
                }
            }); 
            label.on("click", function() {
                backing.color="#AAA";
                planner.template = template;
                frame.stage.update();
            }); 
        })(this,templateLabel, templateBacking, template)
        templateLabel.x = 10;
        templateLabel.y = i*25+5;
        templateBacking.x=-10;
        templateBacking.y=templateLabel.y-10;

        loadList.addChild(templateBacking);
        loadList.addChild(templateLabel);
    }
    return loadList;
}

GardenPlanner.prototype.buildLoadBox = function(loadBox) {
    var loadBoxBackground = new zim.Rectangle({
        color: "white",
        height: 250,
        width: 250,
        borderColor: "#000000",
        borderWidth: 2
    });

    var titleLabel = new zim.Label({
        text: "Pick Template",
        size: 22,
        color: "#000000",
        font:this.font
    });
    titleLabel.x =280-titleLabel.getBounds().width/2;
    titleLabel.y = -150;

    loadList = this.initTemplateList();
    //createScrollBar(loadBox, loadList, 200, 500, 0, 0, 200, 200, true);
    loadList.x = 10;
    loadList.y = 10;

    // add new button
    var newButtonLabel = new zim.Label({
        text:"New",
        size:20,
        color:"white"
    });
    var newButton = new zim.Button({
        label:newButtonLabel,
        width:200,
        height:30,
        color:"blue",
        gradient: 0.3,
        rollColor:"orange",
        corner:0
    });
    newButton.x = 300;
    newButton.y = 10;
    (function (planner) {
        newButton.on("click", function() {
            planner.filePane.hide();
            planner.designBox = new zim.Container();
            planner.designBox.x = -275;
            planner.designBox.y = -125;
            planner.buildDesignBox(planner.designBox);
            planner.optionsPane = planner.setupDialog();
            planner.optionsPane.addChild(planner.designBox);
            planner.createTemplate();
        });        
    })(this)

    loadBox.addChild(loadBoxBackground);
    loadBox.addChild(loadList);


    // add load button
    if (this.templateList.length>0) {
        var loadButtonLabel = new zim.Label({
            text:"Load",
            size:20,
            color:"white",
        });
        var loadButton = new zim.Button({
            label:loadButtonLabel,
            width:200,
            height:30,
            color:"blue",
            gradient: 0.3,
            rollColor:"orange",
            corner:0
        });
        loadButton.x = 300;
        loadButton.y = 60;
        (function (planner) {
            loadButton.on("click", function() {
                planner.loadTemplate();
                planner.filePane.hide();
            });
        })(this)
        loadBox.addChild(loadButton);
    }

    loadBox.addChild(newButton);
  
   // add delete button
    if (this.templateList.length>0) {
        var deleteButtonLabel = new zim.Label({
            text:"Delete",
            size:20,
            color:"white",
        });
        var deleteButton = new zim.Button({
            label:deleteButtonLabel,
            width:200,
            height:30,
            color:"blue",
            gradient: 0.3,
            rollColor:"orange",
            corner:0
        });
        deleteButton.x = 300;
        deleteButton.y = 120;
        (function (planner) {
            deleteButton.on("click", function() {
                planner.deleteTemplate();
            });
        })(this)
        loadBox.addChild(deleteButton);
    }

    loadBox.addChild(newButton);

    loadBox.addChild(titleLabel);
}

GardenPlanner.prototype.displayTooltip = function(label, container, item) {
   var tooltipBackground = new zim.Rectangle(100,40,"red");
   tooltipBackground.borderColor = "white";
   tooltipBackground.borderWidth = 1;
   item.tooltip = new zim.Label({
        text: label,
        size: 18,
        color: "#FFF",
        font:this.font,
        backing: tooltipBackground,
    });
    item.tooltip.alpha = 0.5;
    item.tooltip.x = item.x + 20;
    item.tooltip.y = item.y + 20;
   
    container.addChild(item.tooltip);
    frame.stage.update();
}

GardenPlanner.prototype.buildDesignBox = function(designBox) {
    this.showSettings = true;
    var designBoxBackground = new zim.Rectangle({
        color: "white",
        height: 350,
        width: 550,
        borderColor: "#000000",
        borderWidth: 2
    });
    designBoxBackground.y = -50;
    designBox.addChild(designBoxBackground);

    var titleLabel = new zim.Label({
        text: "Template Settings",
        size: 22,
        color: "#000000",
        font:this.font
    });
    titleLabel.x =280-titleLabel.getBounds().width/2;
    titleLabel.y = -150;
    designBox.addChild(titleLabel);
    
    // template title
    this.templateNameLabel = new zim.Label({
        text: "Template Name:",
        size: 22,
        color: "#000",
        font:this.font,
        align:"right"
    });
    this.templateNameLabel.x = 240;
    this.templateNameLabel.y = -10;
    designBox.addChild(this.templateNameLabel);

    var templateName = "";
    if (this.currentSettings) {
        templateName = this.currentSettings.templateName;
    }
    this.templateNameInput = new zim.Label({
        text: templateName,
        size: 22,
        color: "#888",
        font: this.font,
        align: "left"
    });
    this.templateNameInput.x = 260;
    this.templateNameInput.y = -10;
    this.templateNameLabel.y = -10;
    designBox.addChild(this.templateNameInput);

    var templateNameEditIcon = frame.asset("edit_text_icon.png");
    var templateNameEditHoverIcon = frame.asset("edit_text_icon_hover.png");
    var templateEditTool = new zim.Button({
        width:32,
        height:32,
        corner: 0,
        color: "#FFF",
        rollColor: "#FFF",
        shadowColor: -1,
        rollIcon: templateNameEditHoverIcon,
        icon:templateNameEditIcon
    });
    (function (planner) {
        templateEditTool.on("click", function() {
            planner.editSettingsText("Template Name", planner.templateNameInput, "templateName");
        });
    })(this)

    templateNameEditIcon.x = 0;
    templateNameEditIcon.y = 0;
    templateNameEditHoverIcon.x = 0;
    templateNameEditHoverIcon.y = 0;
    templateEditTool.x = 420;
    templateEditTool.y = -10;
    designBox.addChild(templateEditTool);

    // zipcode = set button
    var zipCodeNameLabel = new zim.Label({
        text: "Zip Code:",
        size: 22,
        color: "#000",
        font:this.font,
        align:"right"
    });
    zipCodeNameLabel.x = 240;
    zipCodeNameLabel.y = 40;
    designBox.addChild(zipCodeNameLabel);

    var zipCode = "";
    if (this.currentSettings) {
        zipCode = this.currentSettings.zipCode;
    }
    this.zipCodeInput = new zim.Label({
        text: zipCode,
        size: 22,
        color: "#888",
        font: this.font,
        align: "left"
    });
    this.zipCodeInput.x = 260;
    this.zipCodeInput.y = 40;
    designBox.addChild(this.zipCodeInput);

    var zipCodeEditTool = templateEditTool.clone();
    zipCodeEditTool.x = 405;
    zipCodeEditTool.y = 20;
    zipCodeEditTool.text = zipCode;
    (function (planner) {
        zipCodeEditTool.on("click", function() {
            planner.editSettingsText("Zipcode", planner.zipCodeInput, "zipCode");
        });
    })(this)
    designBox.addChild(zipCodeEditTool);

    // dimensions
    var widthNameLabel = new zim.Label({
        text: "Width:",
        size: 22,
        color: "#000",
        font:this.font,
        align:"right"
    });
    widthNameLabel.x = 120;
    widthNameLabel.y = 90;
    designBox.addChild(widthNameLabel);
    var widthFeetLabel = new zim.Label({
        text: "FT.",
        size: 16,
        color: "#000",
        font:this.font,
        align:"left"
    });
    widthFeetLabel.x = 190;
    widthFeetLabel.y = 95;
    designBox.addChild(widthFeetLabel);

    var widthFeet = "";
    if (this.currentSettings) {
        widthFeet = this.currentSettings.widthFeet;
    }
    this.widthFeetInput = new zim.Label({
        text: widthFeet,
        size: 22,
        color: "#888",
        font: this.font,
        align: "left"
    });
    this.widthFeetInput.x = 140;
    this.widthFeetInput.y = 90;
    designBox.addChild(this.widthFeetInput);

    var widthFeetEditTool = templateEditTool.clone();
    widthFeetEditTool.x = 210;
    widthFeetEditTool.y = 70;
    (function (planner) {
        widthFeetEditTool.on("click", function() {
            planner.editSettingsText("Width (Feet)", planner.widthFeetInput, "widthFeet");
        });
    })(this)
    designBox.addChild(widthFeetEditTool);

    var heightNameLabel = new zim.Label({
        text: "Height:",
        size: 22,
        color: "#000",
        font:this.font,
        align:"right"
    });
    heightNameLabel.x = 360;
    heightNameLabel.y = 90;
    designBox.addChild(heightNameLabel);
    var heightFeetLabel = new zim.Label({
        text: "FT.",
        size: 16,
        color: "#000",
        font:this.font,
        align:"left"
    });
    heightFeetLabel.x = 420;
    heightFeetLabel.y = 95;
    designBox.addChild(heightFeetLabel);

    var heightFeet = "";
    if (this.currentSettings) {
        heightFeet = this.currentSettings.heightFeet;
    }
    this.heightFeetInput = new zim.Label({
        text: heightFeet,
        size: 22,
        color: "#888",
        font: this.font,
        align: "left"
    });
    this.heightFeetInput.x = 370;
    this.heightFeetInput.y = 90;
    designBox.addChild(this.heightFeetInput);

    var heightFeetEditTool = templateEditTool.clone();
    heightFeetEditTool.x = 440;
    heightFeetEditTool.y = 70;
    (function (planner) {
        heightFeetEditTool.on("click", function() {
            planner.editSettingsText("Height (Feet)", planner.heightFeetInput, "heightFeet");
        });
    })(this)
    designBox.addChild(heightFeetEditTool);
    
    var closeButtonLabel = new zim.Label({
        text:"Save Template",
        size:20,
        color:"white"
    });
    var closeButton = new zim.Button({
        label:closeButtonLabel,
        width:200,
        height:40,
        color:"blue",
        gradient: 0.3,
        rollColor:"orange",
        corner:0
    });
    closeButton.x = 190;
    closeButton.y = 160;
    (function (planner) {
        closeButton.on("click", function() {
            planner.updateTemplateOptions();
            planner.saveTemplate();
            if (planner.filePane)
               planner.filePane.hide();
        });        
    })(this)
    designBox.addChild(closeButton);
}

function warnUser(message) {
    var warningLabel = new zim.Label(message, 20, "Arial", "white");
    var warningPane = new zim.Pane({
            container:frame.stage, 
            width:450, 
            height:200, 
            label:warningLabel,
            backing:pizzazz.makeShape("roadside", smartInstructions.DEFAULT_STROKE_COLOR).scale(4)});
        warningPane.show();
        return;
}

GardenPlanner.prototype.buildPlanBox = function(planWidth, planHeight) {
    var gardenPlanner = this;
    
    // save existing children
    var elements = [];
    if (this.planBox) {
        this.planBox.removeAllChildren;
    }

    // create box
    this.planBox = new zim.Container();
    this.planBox.x = 0;
    this.planBox.y = 0;

    var planMask = new zim.Rectangle({width:800,height:800, color:smartInstructions.DEFAULT_BACKGROUND_COLOR});
    frame.stage.addChild(planMask);
    planMask.x = 0;
    planMask.y = 0;
    this.planBox.setMask(planMask);

    var scrollW = 10;
    var viewerW = planWidth;
    var viewerH = planHeight;

    this.planGrid = new zim.Rectangle(planWidth, planHeight, "#EEE");
    this.planGrid.on("mousedown", function(e) {
        gardenPlanner.applyTool(e.stageX, e.stageY, "mousedown");
    })

    this.planGrid.on("pressmove", function(e) {
        gardenPlanner.applyTool(e.stageX, e.stageY, "mousemove");
    })

    this.planGrid.on("pressup", function(e) {
        gardenPlanner.applyTool(e.stageX, e.stageY, "mouseup");
    })

    this.planBox.addChild(this.planGrid);
    // add back existing children
    for (var elementKey in this.elements) {
        this.planBox.addChild(this.elements[elementKey].asset);
    }
    this.tool = "";
    this.mode = "";
    this.selectTool.toggle(false);
    this.borderTool.toggle(false);
    this.plantTool.toggle(false);
    frame.stage.addChild(this.planBox);
}

GardenPlanner.prototype.updateTemplateOptions = function() {
    this.template.settings = this.currentSettings;
    this.template.elements = this.elements;
    for (var i=0; i<this.template.elements; i++) {
         this.template.elements.asset = undefined;
    }
    var settings = this.currentSettings;
    // set dimensions
    if (settings.widthFeet && settings.heightFeet) {
        var width = 2*settings.widthFeet*75;
        var height = 2*settings.heightFeet*75;
        this.buildPlanBox(width, height);
    } 
    // grab zipcode.  If not set, alert user
    if (settings.zipCode!=undefined) {
        // fetch station and look up normals based off zipcode
        fetchClimateData(settings.zipCode, this);
    } else {
        warnUser("No Zip Code set");
    }
    
    // draw grid
    this.grid = new zim.Shape();
    var gridG = this.grid.graphics;
    gridG.sd([10, 3], 0);
    for (var i=0; i<this.planBox.width; i=i+75) {
         gridG.s("#AAA").mt(i,0).lt(i,this.planBox.height);
    }
    for (var i=0; i<this.planBox.height; i=i+75) {
         gridG.s("#AAA").mt(0,i).lt(this.planBox.width,i);
    }
    this.planBox.addChild(this.grid);
    frame.stage.update();
}

// assume first row is header row
function makeReportTable (data, headerData, rowHeight, colSizes, padding, backgroundColor, font) {
        var rowWidth;
        for (var size in colSizes) {
                rowWidth += size;
        }
        var tableContainer = new zim.Container();
        var tableBackground = new zim.Rectangle(rowWidth, rowHeight*data.length, "#000");
        tableContainer.addChild(tableBackground);

        // table header
        var tableX = 0;
        for (var j=0; j<headerData.length; j++) {
             var cellBorder = new zim.Rectangle(colSizes[j], rowHeight, backgroundColor, "black", 2);
             cellBorder.x = tableX;
             tableContainer.addChild(cellBorder);

             var newCell = new zim.Label({
                 text: headerData[j],
                 size: 20,
                 color: "black",
                 font: font
             });
             newCell.x = tableX + colSizes[j]/2 - newCell.getBounds().width/2;
             newCell.y = padding;
             tableContainer.addChild(newCell);
             tableX += colSizes[j];
        }

        for (var i=0; i<data.length; i++) {
             var tableX = 0;
             var rowData = data[i];
             for (var j=0; j<rowData.length; j++) {
                  var cellBorder = new zim.Rectangle(colSizes[j], rowHeight, backgroundColor, "black", 2);
                  cellBorder.x = tableX;
                  cellBorder.y = (i+1) * rowHeight;
                  tableContainer.addChild(cellBorder);
                  var cellData = rowData[j];
                  var newCell;
                  if (cellData instanceof zim.Container) {
                      newCell = cellData;
                  } else if (cellData instanceof zim.Bitmap) {
                      newCell = cellData.clone();
                      newCell.width = 30;
                  } else {
                      if (cellData==undefined) {
                          cellData = "N/A";
                      } else { 
                          newCell = new zim.Label({
                              text: cellData,
                              size: 20,
                              color: "black",
                              font:font
                          });
                      }
                  }
                  newCell.x = tableX + padding;
                  newCell.y = (i+1) * rowHeight + padding;
                  tableContainer.addChild(newCell);
                  tableX += colSizes[j];
            }
        }
        return tableContainer;
}

GardenPlanner.prototype.calcPlantWindow = function(plant) {
  var monthWidth = 35;
    // create mini months
    var monthsBox = new zim.Container();    
    for (var i=0; i<this.months.length; i++) {
         var month = new zim.Label({
            text: this.months[i],
            size: 12,
            lineWidth:monthWidth,
            lineHeight:30,
            color: "#000",
            font:this.font
          });
         month.x = i*monthWidth;
         monthsBox.addChild(month);
    }
    
    // determing planting window
    var min = this.plantInfo[plant].min;
    var max = this.plantInfo[plant].max;
    var minMonth;
    var maxMonth;
    for (var i=0; i<this.months.length; i++) {
         var minLabel = this.months[i] + "Min";
         var maxLabel = this.months[i] + "Max";
         if (minMonth==undefined && this.monthlyNorms[minLabel]>min) {
             minMonth = i;
         } 
         if (minMonth>0 && maxMonth==undefined && this.monthlyNorms[maxLabel]>max) {
             maxMonth = i;
         } 
         if (minMonth>0 && maxMonth==undefined && this.monthlyNorms[minLabel]<min) {
             maxMonth = i;
         }
    }
    var plantingWindow = new zim.Rectangle((maxMonth-minMonth)*monthWidth, 30, "green");
    plantingWindow.alpha = 0.5;
    plantingWindow.x = minMonth*monthWidth;
    monthsBox.addChild(plantingWindow);
    // count back germination time
    var germinationWidth = monthWidth*this.plantInfo[plant].germinationTime/30;
    var germinationWindow = new zim.Rectangle(germinationWidth, 30, "yellow");
    germinationWindow.alpha = 0.5;
    germinationWindow.x = plantingWindow.x - germinationWidth;
    monthsBox.addChild(germinationWindow);
    monthsBox.x = 10;
    return monthsBox;
}

GardenPlanner.prototype.cleanupSettings = function(planner) {
    frame.stage.removeChild(planner.zipCodeInput);
    frame.stage.removeChild(planner.templateNameInput);
    frame.stage.removeChild(planner.widthFeetInput);
    frame.stage.removeChild(planner.heightFeetInput);
    frame.stage.removeChild(planner.templateNameInput);
    frame.stage.update();
    this.showSettings = false;
}

GardenPlanner.prototype.setupDialog = function(cleanupRoutine) {
    var pane = new zim.Pane({
        container:frame.stage,
        width:800,
        height:580,
        color:"#FFF",
        modal:false,
        displayClose: false,
        fadeTime:1000});

    // draw background to world
    var background = frame.asset("garden_design.png");
    background.x = -400;
    background.y = -240;
    pane.addChild(background);

    // draw arrow to return from world
    var closeButton = makeButton("close", 180);
    closeButton.x = 340;
    closeButton.y = -280;
    (function(pane, planner) {
      closeButton.addEventListener("click", function() {
          pane.hide();
          if (cleanupRoutine) {
              cleanupRoutine(planner);
          }
      });
    })(pane,this)
    pane.addChild(closeButton);
    return pane;
}

GardenPlanner.prototype.drawPrintPane = function() {
    var printPane = setupDialog();

    // display options to include template, planting calendar, and plant report

    // create hidden second canvas element to generate images of planting calendar and plant report

    scaling = "report";
    width = 600;
    height = 400;
    var reportFrame = new zim.Frame(scaling, width, height);
    reportFrame.on("ready", function() {
        var stage = reportFrame.stage;
        var stageW = reportFrame.width;
        var stageH = reportFrame.height;

        // add planting report

        stage.update();
        var reportData = document.getElementById("report");
        var reportURL = reportData.toDataURL();



    }); // end of ready

    scaling = "calendar";
    width = 600;
    height = 400;
    var calendarFrame = new zim.Frame(scaling, width, height);
    calendarFrame.on("ready", function() {
        var stage = calendarFrame.stage;
        var stageW = calendarFrame.width;
        var stageH = calendarFrame.height;

        // add planting report

        stage.update();
        var calendarData = document.getElementById("calendar");
        var calendarURL = calendarData.toDataURL();

        

    }); // end of ready

    // use pdfKit to layout information and create pdf document
    printPane.show();
}


GardenPlanner.prototype.drawPlantingReport = function() {
    this.plantingPane = new zim.Pane({
        container:frame.stage,
        width:800,
        height:580,
        color:"#FFF",
        modal:false,
        displayClose: false,
        fadeTime:1000});

    // draw background to world
    var background = frame.asset("garden_design.png");
    background.x = -400;
    background.y = -240;
    this.plantingPane.addChild(background);

    // draw arrow to return from world
    var closeButton = makeButton("close", 180);
    closeButton.x = 340;
    closeButton.y = -280;
    (function(planner) {
      closeButton.addEventListener("click", function() {
          planner.plantingPane.hide();
      });
    })(this)
    this.plantingPane.addChild(closeButton);
    var plantingReportTable = this.populatePlantingTable();

    plantingReportTable.x = -330;
    plantingReportTable.y = -200;
    this.plantingPane.addChild(plantingReportTable);
    this.plantingPane.show();
}

GardenPlanner.prototype.populatePlantingTable = function() {
    var data=[];
    var counts = {};
    for (var elementKey in this.elements) {
         var element = this.elements[elementKey];
         if (element.type=="plant") {
             if (counts[element.meta]) {
                 counts[element.meta] = counts[element.meta]+1;
             } else {
                counts[element.meta] = 1;
             }
         }
    }

    for (var plant in counts) {
        var row = [];
        row.push(plant);
        row.push(frame.asset("planner_"+plant+"_icon.png"));
        row.push(counts[plant]);
        row.push(this.calcPlantWindow(plant));
        data.push(row);
    }

    var header = ["Plant", "Icon", "Qty", "Plant Window"];
    var colSizes = [100, 75, 50, 450];
    return makeReportTable(data, header, 40, colSizes, 10, "#FFF", this.font);
}

GardenPlanner.prototype.drawCalendar = function() {
    this.filePane.hide();
    this.monthlyPane = new zim.Pane({
        container:frame.stage,
        width:800,
        height:580,
        color:"#FFF",
        modal:false,
        displayClose: false,
        fadeTime:1000});

    // draw background to world
    var background = frame.asset("garden_design.png");
    background.x = -400;
    background.y = -240;
    this.monthlyPane.addChild(background);

    // draw arrow to return from world
    var closeButton = makeButton("close", 180);
    closeButton.x = 340;
    closeButton.y = -280;
    (function(planner) {
      closeButton.addEventListener("click", function() {
          planner.monthlyPane.hide();
      });
    })(this)
    this.monthlyPane.addChild(closeButton);

    var calendar = this.buildCalendar();
    calendar.x = -300;
    calendar.y = -150;
    this.monthlyPane.addChild(calendar);
    this.monthlyPane.show();
}

GardenPlanner.prototype.buildCalendar = function() {
        var normalsBox = new zim.Container();

        var normalsBackground = new zim.Rectangle(600,400, "white");
        normalsBox.addChild(normalsBackground);
        var axisLines = new zim.Shape();
        var g = axisLines.graphics;
        var maxLine = new zim.Shape();
        var minLine = new zim.Shape();
        g.s("black").mt(50,25).lt(50,350).lt(550,350);
        for (var i=0; i<12; i++) {
            var monthTag = 50+(i+1)*38;
            axisLines.graphics.moveTo(monthTag, 340).lineTo(monthTag, 360);

            // max point
            var maxLabel = this.months[i] + "Max";
            var maxY = 350-(this.monthlyNorms[maxLabel]*3);
            if (i!=0) {
                maxLine.graphics.lt(monthTag,maxY);
            } else {
                maxLine.graphics.s("red").mt(monthTag,maxY);
            }

            // min points
            var minLabel = this.months[i] + "Min";
            var minY = 350-(this.monthlyNorms[minLabel]*3);
            if (i!=0) {
                minLine.graphics.lt(monthTag,minY);
            } else {
                minLine.graphics.s("blue").mt(monthTag,minY);
            }


            var monthLabel = new zim.Label({
                 text: this.months[i],
                 size: 12,
                 color: "#000",
                 font:this.font
            });
            monthLabel.x = monthTag-10;
            monthLabel.y = 370;
            normalsBox.addChild(monthLabel);
        }

        for (var i=0; i<=11; i++) {
            var tempTag = 350-(i*30);
            axisLines.graphics.moveTo(45,tempTag).lineTo(55,tempTag);
            var tempLabel = new zim.Label({
                 text: i*10 + "F",
                 size: 12,
                 color: "#000",
                 font:this.font,
            });
            tempLabel.x = 20;
            tempLabel.y = tempTag;
            normalsBox.addChild(tempLabel);
        }

        normalsBox.addChild(axisLines);
        normalsBox.addChild(maxLine);
        normalsBox.addChild(minLine);
        return normalsBox;
}

GardenPlanner.prototype.showLoadSaveDialog = function(planner) {
   planner.filePane = new zim.Pane({
        container:frame.stage,
        width:800,
        height:580,
        color:"#FFF",
        modal:false,
        displayClose: false,
        fadeTime:1000});

    // draw background to world
    var background = frame.asset("garden_design.png");
    background.x = -400;
    background.y = -240;
    planner.filePane.addChild(background);

    // draw arrow to return from world
    var closeButton = makeButton("close", 180);
    closeButton.x = 340;
    closeButton.y = -280;
    (function(pane, planner) {
      closeButton.addEventListener("click", function() {
          pane.hide();
      });
    })(planner.filePane,this)
    planner.filePane.addChild(closeButton);

    // draw load box
    planner.loadBox = new zim.Container();
    planner.loadBox.x = -275;
    planner.loadBox.y = -125;
    planner.buildLoadBox(planner.loadBox);
    planner.filePane.addChild(planner.loadBox);
    planner.filePane.show();
    frame.stage.update();
}

var planner = new GardenPlanner();
planner.initPlanner();

