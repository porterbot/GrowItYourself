
function initPoints() {
    var scaling = "fit"; // this will resize to fit inside the screen dimensions
    var width = 1000;
    var height = 800;
    var color = "#333";
    frame = new zim.Frame(scaling, width, height, color);
    frame.on("ready", function() {
        var icons = [];
        icons.push("points_tokens.png");
        icons.push("points_berries.png");
        icons.push("points_seeds.png");
        icons.push("points_fruittree.png");
        icons.push("garden_gnome.png");
        icons.push("green_thumb2.png");
        icons.push("garden_novice.png");
        icons.push("checkmark.png");
        
        this.loadAssets(icons, smartInstructions.DEFAULT_URL);
        document.getElementById('spares').appendChild(document.getElementById('myCanvas'));
        this.on("complete", function() {
            loadGameState(checkCommunity);
        });
    });
} 

function checkCommunity() {
    fetchCommunityTasks(layoutPoints);
}

function layoutPoints() {
	var stage = frame.stage;
	var stageW = frame.width;
	var stageH = frame.height;

	var pointsTab = new zim.Container();
	var pointsRect = new zim.Rectangle(900, 700, "#50c4b7");
	pointsTab.addChild(pointsRect);
	makePointsTab(pointsTab);

	var tokens = frame.asset("points_tokens.png");
	tokens.x = 30;
	tokens.y = 100;
	pointsTab.addChild(tokens);
        pointsTab.centerReg(stage);

	stage.update();
}

// assume first row is header row
function makeTable (data, headerData, rowHeight, colSizes, padding, backgroundColor) {
	var rowWidth;
	for (var size in colSizes) {
		rowWidth += size;
	}
	var tableContainer = new zim.Container();
	var tableBackground = new zim.Rectangle(rowWidth, rowHeight*data.length, "#FFFFFF");
	tableContainer.addChild(tableBackground);


	// table header
	var tableX = 0;
	for (var j=0; j<headerData.length; j++) {
		var cellBorder = new zim.Rectangle(colSizes[j], rowHeight, backgroundColor, "white", 2);
        cellBorder.x = tableX;
        tableContainer.addChild(cellBorder);

	    var newCell = new zim.Label({
            text: headerData[j],
            size: 20,
            color: "white",
            font:"Nunito"
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
			var cellBorder = new zim.Rectangle(colSizes[j], rowHeight, backgroundColor, "white", 2);
            cellBorder.x = tableX;
            cellBorder.y = (i+1) * rowHeight;
            tableContainer.addChild(cellBorder);
            var cellData = rowData[j];
            if (cellData==undefined) {
                cellData = "N/A";
            }
			var newCell = new zim.Label({
                text: cellData,
                size: 20,
                color: "white",
                font:"Nunito"
            });
            newCell.x = tableX + padding;
            newCell.y = (i+1) * rowHeight + padding;
            tableContainer.addChild(newCell);
            tableX += colSizes[j];
        }
	}
	return tableContainer;
}

function makePointsTab(tabContainer) {
	var data = [];
    var scrollW = 10;
	var header = ["Title", "Section", "Module", "Category", "Points", "Date"];
	var rowHeight = 40;
    var totalPoints = 0;
    for (var i=0; i<gameState.pointsHistory.length; i++) {
    	var item = gameState.pointsHistory[i];
        var row = [];
        row.push(item.title);
        row.push(item.section);
        row.push(item.module);
        row.push(item.category);
        row.push(item.points);
        row.push(item.date);
        totalPoints += item.points;
        data.push(row);
    }

    var homeStatus = gameState.worldHistory['Home'];
    var trackStatus;
    if (gameState.worldHistory['Herb Spiral']) {
        trackStatus = gameState.worldHistory['Herb Spiral'];
    }
    if (gameState.worldHistory['Square Foot Garden']) {
        trackStatus = gameState.worldHistory['Square Foot Garden'];
    }
    if (gameState.worldHistory['Kids Garden']) {
        trackStatus = gameState.worldHistory['Kids Garden'];
    }
       
    var colSizes = [150, 150, 150, 225, 75, 130];
    var pointsTable = makeTable(data, header, rowHeight, colSizes, 10, "#14988A");

    var viewerH = 200;
    var viewerW = 860;
            
    var mask = new zim.Rectangle({width:viewerW,height:viewerH, color:smartInstructions.DEFAULT_BACKGROUND_COLOR});
    tabContainer.addChild(mask);
    mask.x = 10;
    mask.y = 250;

    tabContainer.addChild(pointsTable);
    pointsTable.x = mask.x;
    pointsTable.y = mask.y;
    pointsTable.setMask(mask);
            
    var button = new zim.Button({
        height:viewerH/1000*viewerH, 
        width:scrollW,
        label:"",
        color:"#555555",
        rollColor:frame.grey,
        corner:0
    })

    var scrollbar = new zim.Slider({
        min:(10*totalPoints)-viewerH,
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
    tabContainer.addChild(scrollbar);
    scrollbar.x = pointsTable.x + viewerW;
    scrollbar.y = pointsTable.y;
   
    (function(cardflow) {
        scrollbar.on("change", function() {
           pointsTable.y = mask.y-scrollbar.currentValue;
           frame.stage.update(); 
       });
    })(pointsTable);

    // add points Bar
    var pointsBarBackground = new zim.Rectangle(500, 30, "black", "#FFE468", 2);
    pointsBarBackground.x = 250;
    pointsBarBackground.y = 100;
    tabContainer.addChild(pointsBarBackground);
    var pointsBar = new zim.Rectangle(totalPoints*2, 30, "#FFE468");
    pointsBar.x = 250;
    pointsBar.y = 100;
    tabContainer.addChild(pointsBar);

    var seedReward = new zim.Rectangle(5, 20, "black");
    seedReward.x = 300;
    seedReward.y = 130;
    tabContainer.addChild(seedReward);

    var seedRewardIcon = frame.asset("points_seeds.png");
    seedRewardIcon.x = 280;
    seedRewardIcon.y = 160;
    tabContainer.addChild(seedRewardIcon);

    var berryReward = new zim.Rectangle(5, 20, "black");
    berryReward.x = 500;
    berryReward.y = 130;
    tabContainer.addChild(berryReward);

    var berryRewardIcon = frame.asset("points_berries.png");
    berryRewardIcon.x = 485;
    berryRewardIcon.y = 160;
    tabContainer.addChild(berryRewardIcon);

    var fruittreeReward = new zim.Rectangle(5, 20, "black");
    fruittreeReward.x = 750;
    fruittreeReward.y = 130;
    tabContainer.addChild(fruittreeReward);

    var fruittreeRewardIcon = frame.asset("points_fruittree.png");
    fruittreeRewardIcon.x = 730;
    fruittreeRewardIcon.y = 160;
    tabContainer.addChild(fruittreeRewardIcon);

    var pointsLabel = new zim.Label({
        text: totalPoints,
        size: 20,
        color: "#FFE468",
        font:"Nunito"
    });
    pointsLabel.x = 250 + ((totalPoints*2)-pointsLabel.getBounds().x)/2;
    pointsLabel.y = 75;
    tabContainer.addChild(pointsLabel);


    // add skills Bar
    var skillsBarBackground = new zim.Rectangle(800, 3, "black");
    skillsBarBackground.x = 50;
    skillsBarBackground.y = 550;
    tabContainer.addChild(skillsBarBackground);

    // add items for garden gnome
    var profileSkillLabel = new zim.Label({
        text: "Update\nProfile",
        size: 14,
        color: "white",
        font:"Nunito"
    });
    profileSkillLabel.x = 50;
    profileSkillLabel.y = 560;
    tabContainer.addChild(profileSkillLabel);

    if (gameState.worldHistory['Community'] && gameState.worldHistory['Community']['Profile']) {
        var completed = frame.asset("checkmark.png").clone();
        completed.x = 50;
        completed.y = 510;
        tabContainer.addChild(completed);
    }

    var forumSkillLabel = new zim.Label({
        text: "Post\nForum",
        size: 14,
        color: "white",
        font:"Nunito"
    });
    forumSkillLabel.x = 105;
    forumSkillLabel.y = 560;
    tabContainer.addChild(forumSkillLabel);

    if (gameState.worldHistory['Community'] && gameState.worldHistory['Community']['Forum']) {
        var completed = frame.asset("checkmark.png").clone();
        completed.x = 105;
        completed.y = 510;
        tabContainer.addChild(completed);
    }

    var webinarSkillLabel = new zim.Label({
        text: "Watch\nWebinar",
        size: 14,
        color: "white",
        font:"Nunito"
    });
    webinarSkillLabel.x = 150;
    webinarSkillLabel.y = 560;
    tabContainer.addChild(webinarSkillLabel);

    if (gameState.worldHistory['Community'] && gameState.worldHistory['Community']['Webinar']) {
        var completed = frame.asset("checkmark.png").clone();
        completed.x = 150;
        completed.y = 510;
        tabContainer.addChild(completed);
    }

    var gardenGnomeSkillIcon = frame.asset("garden_gnome.png");
    gardenGnomeSkillIcon.x = 210;
    gardenGnomeSkillIcon.y = 560;
    gardenGnomeSkillIcon.width = 60;
    gardenGnomeSkillIcon.height = 60;
    tabContainer.addChild(gardenGnomeSkillIcon);

    var plantGuideSkillLabel = new zim.Label({
        text: "Plant\nGuide",
        size: 14,
        color: "white",
        font:"Nunito"
    });
    plantGuideSkillLabel.x = 280;
    plantGuideSkillLabel.y = 560;
    tabContainer.addChild(plantGuideSkillLabel);

    if (homeStatus && homeStatus['Plant Guide']=='completed') {
        var completed = frame.asset("checkmark.png").clone();
        completed.x = 280;
        completed.y = 510;
        tabContainer.addChild(completed);
    }

    var seedStrategySkillLabel = new zim.Label({
        text: "Strategy",
        size: 14,
        color: "white",
        font:"Nunito"
    });
    seedStrategySkillLabel.x = 330;
    seedStrategySkillLabel.y = 560;
    tabContainer.addChild(seedStrategySkillLabel);

    if (homeStatus && homeStatus['Strategy']=='completed') {
        var completed = frame.asset("checkmark.png").clone();
        completed.x = 330;
        completed.y = 510;
        tabContainer.addChild(completed);
    }

    var seedStartingSkillLabel = new zim.Label({
        text: "Seed\nStarting",
        size: 14,
        color: "white",
        font:"Nunito"
    });
    seedStartingSkillLabel.x = 390;
    seedStartingSkillLabel.y = 560;
    tabContainer.addChild(seedStartingSkillLabel);

    if (homeStatus && homeStatus['Seed Starting']=='completed') {
        var completed = frame.asset("checkmark.png").clone();
        completed.x = 390;
        completed.y = 510;
        tabContainer.addChild(completed);
    }

    var transplantingSkillLabel = new zim.Label({
        text: "Trans-\nplanting",
        size: 14,
        color: "white",
        font:"Nunito"
    });
    transplantingSkillLabel.x = 450;
    transplantingSkillLabel.y = 560;
    tabContainer.addChild(transplantingSkillLabel);

    if (homeStatus && homeStatus['Transplanting']=='completed') {
        var completed = frame.asset("checkmark.png").clone();
        completed.x = 450;
        completed.y = 510;
        tabContainer.addChild(completed);
    }

    var gardenNoviceSkillIcon = frame.asset("garden_novice.png");
    gardenNoviceSkillIcon.x = 500;
    gardenNoviceSkillIcon.y = 560;
    gardenNoviceSkillIcon.width = 60;
    gardenNoviceSkillIcon.height = 60;
    tabContainer.addChild(gardenNoviceSkillIcon);

    var installationSkillLabel = new zim.Label({
        text: "Install-\nation",
        size: 14,
        color: "white",
        font:"Nunito"
    });
    installationSkillLabel.x = 560;
    installationSkillLabel.y = 560;
    tabContainer.addChild(installationSkillLabel);

    if (trackStatus && trackStatus['Installation']=='completed') {
        var completed = frame.asset("checkmark.png").clone();
        completed.x = 560;
        completed.y = 510;
        tabContainer.addChild(completed);
    }

    soilsSkillLabel = new zim.Label({
        text: "Soils",
        size: 14,
        color: "white",
        font:"Nunito"
    });
    soilsSkillLabel.x = 620;
    soilsSkillLabel.y = 560;
    tabContainer.addChild(soilsSkillLabel);

    if (trackStatus && trackStatus['Soils']=='completed') {
        var completed = frame.asset("checkmark.png").clone();
        completed.x = 620;
        completed.y = 510;
        tabContainer.addChild(completed);
    }

    var plannerSkillLabel = new zim.Label({
        text: "Planning",
        size: 14,
        color: "white",
        font:"Nunito"
    });
    plannerSkillLabel.x = 660;
    plannerSkillLabel.y = 560;
    tabContainer.addChild(plannerSkillLabel);

    if (trackStatus && trackStatus['Planner']=='completed') {
        var completed = frame.asset("checkmark.png").clone();
        completed.x = 660;
        completed.y = 510;
        tabContainer.addChild(completed);
    }

    var maintenanceSkillLabel = new zim.Label({
        text: "Maint-\nenance",
        size: 14,
        color: "white",
        font:"Nunito"
    });
    maintenanceSkillLabel.x = 725;
    maintenanceSkillLabel.y = 560;
    tabContainer.addChild(maintenanceSkillLabel);

    if (trackStatus && trackStatus['Maintenance']=='completed') {
        var completed = frame.asset("checkmark.png").clone();
        completed.x = 725;
        completed.y = 510;
        tabContainer.addChild(completed);
    }

    var greenThumbSkillIcon = frame.asset("green_thumb2.png");
    greenThumbSkillIcon.x = 770;
    greenThumbSkillIcon.y = 560;
    greenThumbSkillIcon.width = 60;
    greenThumbSkillIcon.height = 60;
    tabContainer.addChild(greenThumbSkillIcon);

    return pointsTable;
}
