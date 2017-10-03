function CardFlow(world, module) {
    this.cards = [];
    this.currentCardIndex = 0;
    this.world = world;
    this.module = module;
    this.location = {x:0, y:20};
    this.setupFlow();
}

CardFlow.prototype.getCurrentCard = function() {
    return this.cards[this.currentCardIndex];
}

CardFlow.prototype.setCurrentCard = function(index) {
    this.currentCardIndex = index;
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
              var cardContent = JSON.parse(xhr.response);
              for (var i=0; i<cardContent.length; i++) {
                   cardflow.addCard(cardContent[i]);
              }
              cardflow.showCard(0);
          }
        };
    })(this);
    xhr.open("POST","/wp-admin/admin-ajax.php",true);
    xhr.send(formData);
}

CardFlow.prototype.setupFlow = function() {
    var scaling = "fit"; // fit scales to fit the browser window while keeping the aspect ratio
    var width = width; // can go higher...
    var height = height;
    var color = "#AACCAA";
    (function (cardflow) {
        frame = new zim.Frame(scaling, 500, 550, smartInstructions.DEFAULT_BACKGROUND_COLOR); // see docs for more options and info
        frame.on("ready", function() {
             document.getElementById('spares').appendChild(document.getElementById('myCanvas'));
             // fetch flow from server
             console.log(this.stage);
             cardflow.loadCardFlow();
        });
     })(this);
}

CardFlow.prototype.addCard = function(cardContents) {
    var card = new Card(frame.stage,this.location, smartInstructions.DEFAULT_WIDTH,smartInstructions.DEFAULT_HEIGHT);
    card.src_components = cardContents;
    console.log(cardContents);
    this.cards.push(card);
}  

CardFlow.prototype.showCard = function(cardIndex) {
    this.currentCardIndex = cardIndex;
    this.currentCard = this.cards[this.currentCardIndex];
    this.currentCard.generateLayout();
}

CardFlow.prototype.nextCard = function() {
    // clear the display of the current card
    this.currentCardIndex++;
    if (this.cards.length==this.currentCardIndex) {
        this.currentCardIndex--;
    }
    this.currentCard.resetEnv();
    this.currentCard = this.cards[this.currentCardIndex];
    this.currentCard.generateLayout();
}

CardFlow.prototype.previousCard = function() {
    this.currentCardIndex--;
    if (this.currentCardIndex<0) {
        this.currentCardIndex = 0;
    }
    this.currentCard.resetEnv();
    this.currentCard = this.cards[this.currentCardIndex];
    this.currentCard.generateLayout();
}
