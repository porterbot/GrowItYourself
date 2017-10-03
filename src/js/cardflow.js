function CardFlow(world, module) {
    this.cards = [];
    this.currentCardIndex = 0;
    this.world = world;
    this.module = module;
    this.location = {x:0, y:20};
    this.dependencies = [];
    this.videoList = [];
    this.videoCounter = 0;
    this.setupFlow();
}

CardFlow.prototype.getCurrentCard = function() {
    return this.cards[this.currentCardIndex];
}

CardFlow.prototype.setCurrentCard = function(index) {
    this.currentCardIndex = index;
}

CardFlow.prototype.calculateMilestones = function() {
    this.dependencies = [];
    for (var i=0; i<this.cards.length; i++) {
        var card = this.cards[i];
       for (var j=0; j<card.src_components.length; j++) {
            var block = card.src_components[j];
            if (block.type=='photoChallengeBlock' || (block.type=='linkBlock' && block.required==true)) {
                this.dependencies.push({
                    category: block.category});
            }
        }
    }
}

CardFlow.prototype.generateStatusLabel = function() {  
    if (this.statusLabel) {
        return this.statusLabel;
    }
    var worldStatus = gameState.worldHistory[this.world];
    if (!worldStatus) {
       gameState.worldHistory[this.world] = {};
       worldStatus = gameState.worldHistory[this.world];
    }
    var moduleStatus = worldStatus[this.module];
    if (!moduleStatus) {
        worldStatus[this.module]="inprogress";
    } 
    this.statusLabel = new zim.Label({
        text: moduleStatus,
        size: 16,
        color: "#000000",
        font:"Nunito"
    });

    this.statusLabel.x = 60;
    this.statusLabel.y = 40;
    return this.statusLabel;
}


CardFlow.prototype.loadCardFlow = function() {
    var formData = new FormData();
    formData.append("action", "load_cardflow");
    formData.append("world", this.world);
    formData.append("module", this.module);

    var xhr = new XMLHttpRequest();
    (function (cardflow) {
        xhr.onreadystatechange=function() {
          if (xhr.readyState==4 && xhr.status==200) {
console.log(xhr);
              var cardContent = JSON.parse(xhr.response);
              for (var i=0; i<cardContent.length; i++) {
                   cardflow.addCard(cardContent[i]);
              }
              cardflow.calculateMilestones();
              loadGameState(cardflow.updateGameState, cardflow);
          }
        };
    })(this);
    xhr.open("POST","/wp-admin/admin-ajax.php",true);
    xhr.send(formData);
}

CardFlow.prototype.updateGameState = function(parent, frameOnly) {
   if (!parent.statusLabel) {
       parent.generateStatusLabel();
   }
 
   // check gameState for parent world and modulea
   var worldStatus = gameState.worldHistory[parent.world];
   var moduleStatus = worldStatus[parent.module];
   if (moduleStatus=="completed") {
      parent.loadMedia();
      return; 
   }
    
   var complete = true;
   for (var i=0; i<parent.dependencies.length; i++) {
        var met = false;
        var dependency = parent.dependencies[i];
        for (var j=0; j<gameState.pointsHistory.length; j++) {
             var pointsItem = gameState.pointsHistory[j];
             if (pointsItem.module==parent.module && pointsItem.section==parent.world &&
                  pointsItem.category==dependency.category) {
                 met = true;
                 break;
             }
        }
        complete = complete && met;
        if (!complete) {
           break;
        }
    }

    if (complete) {
        worldStatus[parent.module]="completed";
        saveGameState();
    }
    parent.statusLabel.text = worldStatus[parent.module];
    if (frameOnly) {
        frame.stage.update();
    } else {
        parent.loadMedia();
    }
    fetchCommunityTasks();
}

CardFlow.prototype.setupVideo = function() {
    var lVideo = document.createElement('video');
    lVideo.src = smartInstructions.DEFAULT_URL + this.videoList[this.videoCounter];
    lVideo.autoplay = false;
    lVideo.style = "display:none;width:1, height:1";
    lVideo.id = this.videoList[this.videoCounter];
    document.getElementById("spares").appendChild(lVideo); 
    cardflow.videoCounter++;
    if (cardflow.videoCounter>cardflow.videoList.length-1) {
        cardflow.showCard(0);
    } else {
        cardflow.setupVideo();
    }
}

CardFlow.prototype.loadMedia = function() {
console.log("Loading Media....");
    var imgList=[];
    for (var i=0; i<this.cards.length; i++) {
         var cardblock = this.cards[i].src_components;
         for (var j=0; j<cardblock.length; j++) {
              var block = cardblock[j];
              if (block.type=="imageBlock" || (block.type=="linkBlock" && block.linkType=="Image")) {
                  imgList.push(block.icon);
              }
              if (block.type=="videoBlock") {
                  this.videoList.push(block.url);
              }
          }
    }
console.log(imgList);
    if (imgList.length>0) {
        frame.loadAssets(imgList, smartInstructions.DEFAULT_URL, false);
        (function (cardflow) {
            frame.on("complete", function() {
                if (cardflow.videoList.length>0) {
                    cardflow.setupVideo();
                } else {
                    cardflow.showCard(0);
                }
            });
        })(this);
    } else {
        if (this.videoList.length>0) {
            this.setupVideo();
        } else {
            this.showCard(0);
        }
    }
}

CardFlow.prototype.setupFlow = function() {
    var scaling = "fit"; // fit scales to fit the browser window while keeping the aspect ratio
    var width = width; // can go higher...
    var height = height;
    var color = "#AACCAA";
    (function (cardflow) {
        frame = new zim.Frame(scaling, 700, 750, smartInstructions.DEFAULT_BACKGROUND_COLOR); // see docs for more options and info
        frame.on("ready", function() {
             document.getElementById('spares').appendChild(document.getElementById('myCanvas'));
             // fetch flow from server
             cardflow.loadCardFlow();
        });
     })(this);
}

CardFlow.prototype.addCard = function(cardContents) {
    var card = new Card(this,frame.stage,this.location, 600, 400, this.module);
    card.src_components = cardContents;
    this.cards.push(card);
}  

CardFlow.prototype.showCard = function(cardIndex) {
console.log("Showing Card " + cardIndex);
    this.currentCardIndex = cardIndex;
    this.currentCard = this.cards[this.currentCardIndex];
    this.currentCard.prepLayout();
}

CardFlow.prototype.nextCard = function() {
    this.showCard(this.currentCardIndex+1);
}

CardFlow.prototype.previousCard = function() {
    this.showCard(this.currentCardIndex-1);
}
