function WeedIdChallenge(location, weedInfo, photoURL, parent) {
            if (iOS()) {
                this.font = "Arial";
            } else {
                this.font = "Nunito";
            }
            this.location = location;
            this.photoURL = photoURL;
            this.key = weedInfo.key;
            this.description = weedInfo.description;
            this.container = new zim.Container();
            this.container.x = this.location.x;
            this.container.y = this.location.y;
            this.title = weedInfo.title;
            this.waiter = new zim.Waiter(frame.stage);
            this.iconSrc = frame.asset(weedInfo.asset);
            this.iconSrc.alpha = 0.5;
            this.parent = parent;
            this.makeTemporaryComponents();
        }

        WeedIdChallenge.prototype.handleEvent = function(e) {
            switch(e.type) {
            case "click":
                if (e.target instanceof zim.Label || e.target instanceof zim.Rectangle) {
                    document.getElementById(e.target.category).click();
                } else {
                    this.uploaded = false;
                    this.removePhoto();
                }
                break;
            case "change":
                this.startUpload();
                break;
            case "load":
                if (e.target instanceof Image) {
                    this.loadPhoto();
                } else {
                    this.loadThumbnail(e.target.result);
                }
                break;
            }
        }

        WeedIdChallenge.prototype.makeTemporaryComponents = function() {
            this.uploadLabel = new zim.Label({
                text:"    Click To\nUpload Photo",
                size: 16,
                color: "#FFF",
                font:this.font
            });
            this.uploadLabel.x = (smartInstructions.DEFAULT_THUMBNAIL_SIZE+10-this.uploadLabel.getBounds().width)/2;
            this.uploadLabel.y = smartInstructions.DEFAULT_TAB_HEIGHT+(smartInstructions.DEFAULT_THUMBNAIL_SIZE-this.uploadLabel.getBounds().height)/2;
            this.uploadLabel.category = this.key;

            this.deleteButton = makeButton("close");
            this.deleteButton.x = smartInstructions.DEFAULT_THUMBNAIL_SIZE - 20;
            this.deleteButton.y = 10;
            this.deleteButton.scaleX = .5;
            this.deleteButton.scaleY = .5;
            this.deleteButton.id = "delete";
            this.deleteButton.addEventListener("click", this, false); 
            if (this.photoURL) {
                this.loadThumbnail(this.photoURL, true);
            } 
        }

        WeedIdChallenge.prototype.createUploadWidget = function () {
            var photoFrame = new zim.Rectangle({
                width:smartInstructions.DEFAULT_THUMBNAIL_SIZE+10, 
                height:smartInstructions.DEFAULT_THUMBNAIL_SIZE+smartInstructions.DEFAULT_TAB_HEIGHT, 
                color:"#BBBBBB", 
                borderColor: "#FFFFFF",
                borderWidth: 5,
                corner:10,
                flatBottom: true});
            var photoTitleBar = new zim.Rectangle({
                width:smartInstructions.DEFAULT_THUMBNAIL_SIZE+10, 
                height:smartInstructions.DEFAULT_TAB_HEIGHT, 
                color:"#FFFFFF", 
                corner:10,
                flatBottom: true});
            var infoButton = makeButton("info");
            infoButton.x = 140;
            infoButton.scaleX=0.5;
            infoButton.scaleY=0.5;
            infoButton.y = 10;
            var weedIdChallenge = this;
            infoButton.addEventListener("click", function() {
                var infoPane = new zim.Pane({
                    container:frame.stage,
                    width:300,
                    height:200,
                    center: false,
                    color:"#FFF",
                    modal:false,
                    displayBacking: false
                    });
                var lineHeight = 0;
                for (var descKey in weedIdChallenge.description) {
                     var infoLabel = new zim.Label({
                         text: descKey + ":",
                         size: 18,
                         color: "#000000",
                         font:this.font,
                         fontOptions: "bold",
                     });
                     infoLabel.x = -140;
                     infoLabel.y = -100 + lineHeight;
                     infoPane.addChild(infoLabel);

                     var descLabel = new zim.Label({
                         text: weedIdChallenge.description[descKey],
                         size: 18,
                         color: "#000000",
                         font:this.font,
                         lineWidth: 190
                     });
                     descLabel.x = -60;
                     descLabel.y = -100 + lineHeight;
                     lineHeight += descLabel.getBounds().height + 10;
                     infoPane.addChild(descLabel);

                }
                var closeInfo = makeButton("close");
                closeInfo.scaleX=0.75;
                closeInfo.scaleY=0.75;
                closeInfo.y = 50;
                (function (infoPane) {
                     closeInfo.addEventListener("click", function() {
                         infoPane.hide();
                         infoPane.dispose();
                     });
                })(infoPane)    
                infoPane.addChild(closeInfo);
                infoPane.x = weedIdChallenge.location.x+150;
                infoPane.y = weedIdChallenge.location.y+100;
                infoPane.center = false;
                infoPane.show();
            });
            var categoryLabel = new zim.Label({
                text: this.title,
                size: 16,
                color: "#000000",
                font:this.font
            });
            categoryLabel.y = +smartInstructions.DEFAULT_TAB_HEIGHT/2-10;
            photoFrame.category = this.key;

            // set up events
            var input=document.createElement('input');
            input.type="file";
            input.style.display="none";
            input.id=this.key;
            document.getElementById('spares').appendChild(input);
            photoFrame.addEventListener("click",this,false);
            this.uploadLabel.addEventListener("click",this,false); 
            var imageLoader = document.getElementById(this.key);
            imageLoader.addEventListener('change', this, false);

            this.container.addChild(photoFrame);
            this.container.addChild(photoTitleBar);
            this.container.addChild(infoButton);
            if (this.iconSrc) {
                this.container.addChild(this.iconSrc);
                this.iconSrc.x = 5;
                this.iconSrc.y = 60;
            }
            this.container.addChild(this.uploadLabel);
            this.container.addChild(categoryLabel);
            this.container.x = this.location.x;
            this.container.y = this.location.y;
            return this.container;
        }

        WeedIdChallenge.prototype.removePhoto = function(url) {
            var obj = this;
            this.waiter.show();
            var formData = new FormData();
            this.uploaded=false;
            var baseName = "weedid_" + this.key;
            formData.append("action", "remove_game_photo");
            formData.append("category", baseName);
            var xhr = new XMLHttpRequest();
            var weedIdChallenge = this;
            xhr.onreadystatechange=function() {
                if (xhr.readyState==4 && xhr.status==200) {
                    console.log(xhr);
                    delete weedIdChallenge.parent.progress[weedIdChallenge.key];
                    weedIdChallenge.parent.updateGameBoard(weedIdChallenge);
                    obj.togglePhoto();
                }
            }
            xhr.open("POST","/wp-admin/admin-ajax.php",true);
            xhr.send(formData);
        }

        WeedIdChallenge.prototype.togglePhoto = function() {
                this.waiter.hide();
                if (this.uploaded) {
                    this.bitmap = new createjs.Bitmap(this.thumbnail);
                    this.bitmap.x = 3;
                    this.bitmap.y = smartInstructions.DEFAULT_TAB_HEIGHT;
                    this.bitmap.scaleY = (smartInstructions.DEFAULT_THUMBNAIL_SIZE-3)/this.bitmap.image.height;
                    this.bitmap.scaleX = (smartInstructions.DEFAULT_THUMBNAIL_SIZE+4)/this.bitmap.image.width;
                    this.uploadLabel.removeFrom(this.container);
                    this.container.addChild(this.bitmap);
                    this.container.addChild(this.deleteButton);
                    frame.stage.update();
                } else {
                    this.container.removeChild(this.bitmap);
                    this.deleteButton.removeFrom(this.container);
                    this.container.addChild(this.uploadLabel);
                    frame.stage.update();
                }
        }

        WeedIdChallenge.prototype.loadPhoto = function() {
            this.uploaded = true;
            this.togglePhoto();
        }
        
        WeedIdChallenge.prototype.startUpload = function() {
            var reader = new FileReader();
            var weedIdChallenge = this;
            this.waiter.show();
            (function(weedIdChallenge) {
                reader.onload = function (e) {
                    // get file reference
                    var formData = new FormData();
                    formData.append("action", "upload-attachment");
                    formData.append("async-upload", files);
                    formData.append("category", baseName);
                    var nonce = document.getElementById("wack").innerHTML;
                    formData.append("_wpnonce", nonce);
                    var xhr = new XMLHttpRequest();
                    xhr.onreadystatechange=function() {
                        if (xhr.readyState==4 && xhr.status==200) {
                            var metadata = JSON.parse(xhr.responseText);
                            weedIdChallenge.photoURL = metadata.data.url;
                            weedIdChallenge.parent.progress[weedIdChallenge.key] = metadata.data.url;
                            weedIdChallenge.parent.updateGameBoard(weedIdChallenge);
                            weedIdChallenge.loadThumbnail(metadata.data.url, true);
                        }
                    }
                    xhr.open("POST","/wp-admin/async-upload.php",true);
                    xhr.send(formData);
                }
            })(this)
            var imageLoader = document.getElementById(this.key);
            var files = imageLoader.files[0];
            var baseName =  "weedid_" + this.key;
            reader.readAsDataURL(files);
        }

        WeedIdChallenge.prototype.loadThumbnail = function (src, callback) {
            this.waiter.show();
            var obj = this;
            this.thumbnail = new Image();
            if (callback) {
                this.thumbnail.addEventListener('load',this,false);
            }
            this.thumbnail.src = src;
        }

        var weedInfo = [
            {
               key: "plantain",
               title: "Broadleaf Plantain",
               description:{"soil type":"hard, compacted",
                            "usages": "beneficial insect habitat, anti-swelling/anti-bleeding"},
               asset: "weedid_broadleafplantain.png"
            },
            {
               key: "chickweed",
               title: "Chickweed",
               description: {"soil type": "disturbed, low fertile",
                             "usages": "potassium and phosphorus accumulator, beneficial insects, culinary (salad green)"},
               asset: "weedid_chickweed.png"
            },
            {
               key: "clover",
               title: "White Clover",
               description: {"soil type": "nitrogen-lacking, dry, heavy clay",
                             "usages": "nitrogen-fixer, beneficial insects"},
               asset: "weedid_clover.png"
            },
            {
               key: "dandelion",
               title: "Dandelion",
               description: {"soil type": "acid, hard, compacted",
                             "usages": "dynamic accumulator, edible leaves"},
               asset: "weedid_dandelion.png"
            },
            {
               key: "purpledeadnettle",
               title: "Purple Dead Nettle",
               description: {"soil type": "fertile, disturbed",
                             "usages": "edible green high in minerals, anti-bleeding",
                             "identify": "spring, triangular-shaped leaves"},
               asset: "weedid_purplenettle.png"
            },
            {
               key: "purslane",
               title: "Purslane",
               description: {"soil type": "high phosphorus, fertile, well-drained",
                             "usages": "culinary (high in omega 3s, use as spinach)",
                             "identify": "thick succulent leaves and pinkish-brown thick stems"},
               asset: "weedid_purslane.png"
            },
            {
               key: "wildonion",
               title: "Wild Onion/Garlic",
               description: {"soil type": "heavy clay, compacted",
                             "usages": "edible leaves (use as green onions/chives)"},
               asset: "weedid_wildonion.png"
            },
            {
               key: "oxalis",
               title: "Wood Sorrel",
               description: {"soil type": "acid, moist, fertile",
                             "usages": "culinary (sour lemon taste, cook in stir-fries)"},
               asset: "weedid_yellowwoodsorrel.png"
            },
            {
               key: "mallow",
               title: "Common Mallow",
               description: {"soil type": "wet, Potassium rich",
                             "usages": "salve for external wounds, root is good for coughs"},
               asset: "weedid_mallow.png"
            },
            {
               key: "henbit",
               title: "Henbit",
               description: {"soil type": "fertile, disturbed",
                             "usages": "edible green high in minerals,anti-bleeding",
                             "identify": "spring, heart-shaped leaves"},
               asset: "weedid_henbit.png"
            },
            {
               key: "mint",
               title: "Mint",
               description: {"usages": "culinary, dynamic accumulator, beneficial insects"},
               asset: "weedid_mint.png"
            },
            {
               key: "garlicmustard",
               title: "Garlic Mustard",
               description: {"soil type": "disturbed",
                             "usages": "add garlic flavor in stir-fries",
                             "identify": "heart-shaped leaves, garlicky smell"},
               asset: "weedid_garlicmustard.png"
            },
            {
               key: "sowthistle",
               title: "Sow Thistle",
               description: {"soil type": "acidic, compacted",
                             "usages": "dynamic accumulator"},
               asset: "weedid_sowthistle.png"
            },
            {
               key: "burdock",
               title: "Burdock",
               description:{"soil type":"light, well-drained soil",
                            "usages": "root is used as purifier, leaves can be used for eczema, culinary(use as carrot)",
                            "identify": "Large, wavy, heart-shaped leaves"},
               asset: "weedid_burdock.png"
            },
            {
               key: "violet",
               title: "Violet",
               description: {"soil type":"moist, rich soil",
                             "usages": "edible flowers, leaves",
                             "identify": "small plants under 6, blooms in spring"},
               asset: "weedid_violet.png"
            },
            {
               key: "lambsquarters",
               title: "Lambs Quarters",
               description: {"soil type":"disturbed",
                             "usages": "dynamic accumulator, culinary (use as spinach)"},
               asset: "weedid_lambsquarters.png"
            },
        ];

        function WeedIdGame() {
           this.bingoCard = [];
           this.size = 5;
           this.progress = {};
         
        }

        WeedIdGame.prototype.initGame = function() {
           var scaling = "fit"; // fit scales to fit the browser window while keeping the aspect ratio
           var width = 950; // can go higher...
           var height = 925;
           var color = "#ACA";
           frame = new zim.Frame(scaling, width, height, color); // see docs for more options and info
           var weedGame = this;
           frame.on("ready", function() {
               var weeds = [];
               // push the 10 weeds
               weeds.push("weedid_broadleafplantain.png");
               weeds.push("weedid_chickweed.png");
               weeds.push("weedid_clover.png");
               weeds.push("weedid_dandelion.png");
               weeds.push("weedid_purplenettle.png");
               weeds.push("weedid_purslane.png");
               weeds.push("weedid_wildonion.png");
               weeds.push("weedid_yellowwoodsorrel.png");
               weeds.push("weedid_henbit.png");
               weeds.push("weedid_mint.png");
               weeds.push("weedid_lambsquarters.png");
               weeds.push("weedid_garlicmustard.png");
               weeds.push("weedid_sowthistle.png");
               weeds.push("weedid_violet.png");
               weeds.push("weedid_burdock.png");
               weeds.push("weedid_mallow.png");

               
               frame.loadAssets(weeds, smartInstructions.DEFAULT_URL);

               document.getElementById('container').appendChild(document.getElementById('myCanvas'));
               this.initiated = false;
               frame.on("complete", function() {
                   if (this.initiated)
                       return;
                   this.initiated = true;
                   var helpButton = makeButton("marker");
                   helpButton.scaleX=2;
                   helpButton.scaleY=2;
                   helpButton.on("click", function() {
                       var helpPane = new zim.Pane({
                           container:frame.stage,
                           width:500,
                           height:600,
                           color:"#FFF",
                       });
                       var helpLabel = new zim.Label({
                         text: "The goal of this game is to find as many common weeds in and around your garden as you can.  Clicking on the Weed Icon will allow you to upload a photo of this weed. Clicking the 'I' info button will give you a bit more information about the weed and how it can be used if harvested.  After uploading a photo, you can click on the 'X' button to remove it.\n\n\n If you can find 4 weeds you win a seed packet of your choice. \n\n\n If you can find 10 or more weeds you will win 10 sweet potato slips. ",
                         size: 24,
                         color: "#000000",
                         font:this.font, 
                         lineWidth: 450
                       });
                       helpPane.addChild(helpLabel);
                       helpLabel.x = -240;
                       helpLabel.y = -290;
                       helpPane.show();
                   });
                   frame.stage.addChild(helpButton);
                   helpButton.x = 885;
                   helpButton.y = 25;
                   
                   weedGame.loadProgress();
               });
           });
        }

        WeedIdGame.prototype.loadProgress = function() {
           var weedGame = this;
           // load user's weedid game data
           var formData = new FormData();
           formData.append("action", "load_weedgame");
           var xhr = new XMLHttpRequest();
           (function(planner) {
               xhr.onreadystatechange=function() {
                   if (xhr.readyState==4 && xhr.status==200) {
                       if (xhr.response!=null) {
                           if (xhr.response!="") {
                               var monkey = xhr.response.replace(/\\/g, "");
                               weedGame.progress = JSON.parse(monkey);
                           }
                           weedGame.startGame();
                       }
                   }
               }
           })(this)
           xhr.open("POST","/wp-admin/admin-ajax.php",true);
           xhr.send(formData);
        }



        WeedIdGame.prototype.startGame = function() {
           // assume progress and weed photos have been loaded
           this.bingoCard = new zim.Container();
           this.size = 4;
           var count = 0;
           for (var i=0; i<weedInfo.length; i++) {
               var row = Math.floor(i/4);
               var newLoc = {x:210*(i%4), y:255*row};
               var weedKey = weedInfo[i].key;
               var weedPhotoChallenge = new WeedIdChallenge(newLoc, weedInfo[i], 
                   this.progress[weedKey], this);
               this.bingoCard.addChild(weedPhotoChallenge.createUploadWidget());
           }
           buildSlider(frame.stage, this.bingoCard, {width: 850, height:800});
           frame.stage.addChild(this.bingoCard);
           frame.stage.update();
        }

        WeedIdGame.prototype.updateGameBoard = function(weedIdChallenge) {
           var formData = new FormData();
           formData.append("action", "save_weedgame");
           formData.append("progress", JSON.stringify(this.progress));
           var xhr = new XMLHttpRequest();
           (function(planner) {
               xhr.onreadystatechange=function() {
                   if (xhr.readyState==4 && xhr.status==200) {
                       console.log(xhr.response);
                   }
               }
           })(this)
           xhr.open("POST","/wp-admin/admin-ajax.php",true);
           xhr.send(formData);
        }


       
