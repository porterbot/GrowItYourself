function BugProfile(location, bugInfo, photoURL, parent) {
            if (iOS()) {
                this.font = "Arial";
            } else {
                this.font = "Nunito";
            }
            this.location = location;
            this.photoURL = photoURL;
            this.key = bugInfo.key;
            this.description = bugInfo.description;
            this.container = new zim.Container();
            this.container.x = this.location.x;
            this.container.y = this.location.y;
            this.title = bugInfo.title;
            this.waiter = new zim.Waiter(frame.stage);
            this.iconSrc = frame.asset(bugInfo.image);
            this.parent = parent;
            this.offset = 250;
            this.bugInfo = bugInfo;
            this.createInfoSlides();
            this.createCureSlide();
            this.buildGallery();
            this.makeBugPhotoUpload();
            this.createUploadWidget();
        }

        BugProfile.prototype.handleEvent = function(e) {
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

        BugProfile.prototype.buildGallery = function() {
            // draw a nice clickable photo of the bug
            this.bugPhoto = this.iconSrc.clone();
            this.bugPhoto.x = 30;
            this.bugPhoto.y = 30;
            if (this.bugInfo.category == "good") {
                this.bugFrame = new zim.Circle(100, "#000", "#225B00", 25);
            } else {
                this.bugFrame = new zim.Circle(100, "#000", "#A73529", 25);
            }
            this.bugFrameHighlight = new zim.Circle(95, "#FFF772");
            this.bugFrameHighlight.x = 124;
            this.bugFrameHighlight.y = 124;
            this.bugFrameHighlight.alpha = 0.2;
            (function (bugPhoto, bugProfile) {
                bugPhoto.on("mouseover", function() {
                    bugProfile.container.addChild(bugProfile.bugFrameHighlight);
                    frame.stage.update();
                }); 
                bugPhoto.on("mouseout", function() {
                    bugProfile.container.removeChild(bugProfile.bugFrameHighlight);
                    frame.stage.update();
                });
                bugPhoto.on("click", function() {
                    bugProfile.infoSlides[0].y = 150;
                    bugProfile.infoSlides[0].x = 250;
                    bugProfile.infoSlides[0].scale(0);
                    frame.stage.addChild(bugProfile.infoSlides[0]);
                    bugProfile.infoSlides[0].animate({scale:1, x:150, y: 300}, 700, null, done);
                    function done() {
                    }
                });
            })(this.bugPhoto, this)
            this.bugFrame.x = 124;
            this.bugFrame.y = 124;
            this.container.addChild (this.bugFrame);
            this.container.addChild (this.bugPhoto);

        }

        BugProfile.prototype.makeBugPhotoUpload = function() {
            this.uploadLabel = new zim.Label({
                text:"    Click To\nUpload Your\n      Photo",
                size: 16,
                color: "#FFF",
                font:this.font
            });
            this.uploadLabel.x = this.offset + (smartInstructions.DEFAULT_THUMBNAIL_SIZE+10-this.uploadLabel.getBounds().width)/2;
            this.uploadLabel.y = smartInstructions.DEFAULT_TAB_HEIGHT+(smartInstructions.DEFAULT_THUMBNAIL_SIZE-this.uploadLabel.getBounds().height)/2;
            this.uploadLabel.category = this.key;

            this.deleteButton = makeButton("close");
            this.deleteButton.x = this.offset + smartInstructions.DEFAULT_THUMBNAIL_SIZE - 20;
            this.deleteButton.y = 10;
            this.deleteButton.scaleX = .5;
            this.deleteButton.scaleY = .5;
            this.deleteButton.id = "delete";
            this.deleteButton.addEventListener("click", this, false); 
            if (this.photoURL) {
                this.loadThumbnail(this.photoURL, true);
            } 
        }

        BugProfile.prototype.createInfoSlides = function() {
           this.infoSlides = [];
           if (this.bugInfo.infoslides) {
               for (var i=0; i<this.bugInfo.infoslides.length; i++) {
                   var slideInfo = this.bugInfo.infoslides[i];
                   var infoPanel = new zim.Container();
                   var initialWidth = 475;
                   var initialHeight = 200;
                   var infoFrame;
                   var infoColor, infoBackColor;
                   if (this.bugInfo.category == "good") {
                       infoColor = "#225B00";
                       infoBackColor = "#60B62D";
                   } else {
                       infoColor = "#82170C";
                       infoBackColor = "#C65549";
                   }
                   infoFrame = new zim.Rectangle(initialWidth,initialHeight,infoBackColor,infoColor,5);
                   infoPanel.addChild(infoFrame);
                   infoPanel.addChild(infoFrame);
                   
                   var infoText = new zim.Label({
                        text:slideInfo.text,
                        size: 18,
                        color: infoColor,
                        lineHeight: 20,
                        lineWidth: Math.floor(initialWidth*2/3)-5
                   });
                   infoText.x = Math.floor(initialWidth*1/3);
                   infoText.y = 20;
                   infoPanel.addChild(infoText);

                   var nextButton = makeButton("arrow");
                   nextButton.x = initialWidth-50;
                   nextButton.y = initialHeight-50;
                   (function (bugProfile, infoPanel) {
                       nextButton.on("click", function() {
                           frame.stage.removeChild(infoPanel);
                           bugProfile.cureSlide.x = 150;
                           bugProfile.cureSlide.y = 300;
                           bugProfile.cureSlide.alpha = 0;
                           frame.stage.addChild(bugProfile.cureSlide);
                           bugProfile.cureSlide.animate({alpha:1, y: 300}, 1500, null, done);
                           function done() {
                           }

                       });
                   })(this, infoPanel)
                   if (this.bugInfo.cures) {
                       infoPanel.addChild(nextButton);
                   }

                   var infoImage = frame.asset (slideInfo.image);
                   infoImage.x = 10;
                   infoImage.y = 25;
                   infoPanel.addChild(infoImage);    
                   this.infoSlides.push(infoPanel);                
               }
           }        
           this.infoSlideIndex = 0;
        }

        BugProfile.prototype.createCureSlide = function() {
           if (this.bugInfo.cures) {
              var slideInfo = this.bugInfo.cures[0];
              var curePanel = new zim.Container();
              var initialWidth = 500;
              var initialHeight = 225;
              var cureFrame = new zim.Rectangle(initialWidth,initialHeight,"#60B62D", "#225B00",5);
              curePanel.addChild(cureFrame);

              var cureText = new zim.Label({
                    text:slideInfo.text,
                    size: 18,
                    color: "#225B00",
                    lineHeight: 20,
                    lineWidth: Math.floor(initialWidth*2/3)-5
              });
              cureText.x = Math.floor(initialWidth*1/3) - 10;
              cureText.y = 35;
              curePanel.addChild(cureText);

              var closeButton = makeButton("close");
              closeButton.x = initialWidth-35;
              closeButton.y = 10;
              closeButton.scaleX = 0.75;
              closeButton.scaleY = 0.75;
              (function (bugProfile, curePanel) {
                  closeButton.on("click", function() {
                      frame.stage.removeChild(curePanel);
                      frame.stage.update();
                  });
              })(this, curePanel)
              curePanel.addChild(closeButton);

              var cureImage = frame.asset (slideInfo.image);
              cureImage.x = 10;
              cureImage.y = 35;
              curePanel.addChild(cureImage);
              this.cureSlide = curePanel;
           }
        }
        

        BugProfile.prototype.createUploadWidget = function () {
            var photoFrame = new zim.Rectangle({
                width:smartInstructions.DEFAULT_THUMBNAIL_SIZE+10, 
                height:smartInstructions.DEFAULT_THUMBNAIL_SIZE+smartInstructions.DEFAULT_TAB_HEIGHT, 
                color:"#BBBBBB", 
                borderColor: "#FFFFFF",
                borderWidth: 5,
                corner:10,
                flatBottom: true});
            photoFrame.x = this.offset;
            var photoTitleBar = new zim.Rectangle({
                width:smartInstructions.DEFAULT_THUMBNAIL_SIZE+10, 
                height:smartInstructions.DEFAULT_TAB_HEIGHT, 
                color:"#FFFFFF", 
                corner:10,
                flatBottom: true});
            photoTitleBar.x = this.offset;
            var categoryLabel = new zim.Label({
                text: this.title,
                size: 16,
                color: "#000000",
                font:this.font
            });
            categoryLabel.x = this.offset + (smartInstructions.DEFAULT_THUMBNAIL_SIZE+10-categoryLabel.getBounds().width)/2;
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
            this.container.addChild(this.uploadLabel);
            this.container.addChild(categoryLabel);
        }

        BugProfile.prototype.removePhoto = function(url) {
            this.waiter.show();
            var formData = new FormData();
            this.uploaded=false;
            var baseName = "bughunt_" + this.key;
            formData.append("action", "remove_game_photo");
            formData.append("category", baseName);
            var xhr = new XMLHttpRequest();
            var bugHuntChallenge = this;
            (function (bugProfile) {
                xhr.onreadystatechange=function() {
                    if (xhr.readyState==4 && xhr.status==200) {
                        console.log(xhr);
                        delete bugProfile.parent.progress[bugProfile.key];
                        bugProfile.parent.action = "remove";
                        loadGameState(bugProfile.parent.updateGameBoard, bugProfile);
                        bugProfile.togglePhoto();
                    }
                }
            })(this)
            xhr.open("POST","/wp-admin/admin-ajax.php",true);
            xhr.send(formData);
        }

        BugProfile.prototype.togglePhoto = function() {
                this.waiter.hide();
                if (this.uploaded) {
                    this.bitmap = new createjs.Bitmap(this.thumbnail);
                    this.bitmap.x = this.offset;
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

        BugProfile.prototype.loadPhoto = function() {
            this.uploaded = true;
            this.togglePhoto();
        }
        
        BugProfile.prototype.startUpload = function() {
            var reader = new FileReader();
            this.waiter.show();
            (function(bugProfile) {
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
                            bugProfile.photoURL = metadata.data.url;
                            bugProfile.parent.progress[bugProfile.key] = metadata.data.url;
                            bugProfile.parent.newPoints = bugProfile.key;
                            bugProfile.parent.action = "add";
                            loadGameState(bugProfile.parent.updateGameBoard, bugProfile);
                            bugProfile.loadThumbnail(metadata.data.url, true);
                        }
                    }
                    xhr.open("POST","/wp-admin/async-upload.php",true);
                    xhr.send(formData);
                }
            })(this)
            var imageLoader = document.getElementById(this.key);
            var files = imageLoader.files[0];
            var baseName =  "bughunt_" + this.key;
            reader.readAsDataURL(files);
        }

        BugProfile.prototype.loadThumbnail = function (src, callback) {
            this.waiter.show();
            var obj = this;
            this.thumbnail = new Image();
            if (callback) {
                this.thumbnail.addEventListener('load',this,false);
            }
            this.thumbnail.src = src;
        }

        var bugInfo = [
            {
               key: "cucumber_beetle",
               title: "Cucumber Beetle",
               image: "bughunt_cucumberbeetle.png",
               infoslides:[
                   {"image":"cucumberbeetle_bacterialwilt.png",
                    "text": "Although cucumber beetles don't do much physical damage to cucurbits (melons, squash, cucumbers), they are a carrier for bacterial wilt (the bacteria Erwinia tracheiphila), which can wilts leaves and kill a full-size plant in a few days."}
               ],
               cures: [
                   {"text":"Cucumber beetles are hard to catch and don't really swarm, so the best way to deal with them is choosing wilt-resistant cucurbit varieties and spreading out your crops so they don't concentrate in one area.  Other strategies include using yellow stick traps or row covers.",
                    "image": "yellow_sticky_trap.png"}
               ]
            },
            {
               key: "slug",
               title: "Slug",
               image: "bughunt_slug.png",
               infoslides:[
                   {"image":"slug_in_strawberry.png",
                    "text":"Slugs not only leave slimy trails in the garden, they love to munch on leafy greens and strawberries, causing damage to young seedlings and ruining those berries right before they become ripe."}
               ],
               cures: [
                   {"image":"slugs_drown_in_cans.png",
                    "text": "Slugs mostly target plants on the ground, so protecting young seedlings and strawberries with diatomaceous earth, ground up eggshells and beer in a tuna can are effective defense mechanisms for this soft-bellied, non-flying pest."}
               ]
            },
            {
               key: "tachinid_fly",
               category: "good",
               title: "Tachinid Fly",
               image: "bughunt_tachinidfly.png",
               infoslides:[
                   {"image":"tachinidfly_parasitizes_hornworm.png",
                    "text":"These flies look like small houseflies and lay eggs on all manner of larvae and caterpillars.  When their eggs hatch, their own larvae feed on these pest larvae.  They can be attracted to your garden by growing plants with small flowers, like dill, chamomile, and shasta daisy."}
               ]
            },
            {
               key: "colorado_potato_beetle",
               title: "Colorado Potato Beetle",
               image: "bughunt_coloradopotatobeetle.png",
               infoslides: [
                   {"image":"coloradobeetle_defoliation.png",
                    "text": "These beetles arrive early in the spring and love to eat the leaves of solonacea (potato, tomato, eggplant, etc.), which they can totally defoliate."}
               ],
               cures: [
                   {"image":"coloradobeetle_trap_plants.png",
                    "text": "These pests really target potato plants and other solanacea early in the season and also swarm, so growing some trap crops and manually eliminating them (dropping them into soapy water) early on will reduce most infestations."}
               ]
            },
            {
               key: "harlequin_bug",
               title: "Harlequin Bug",
               image: "bughunt_harlequinbug.png",
               infoslides: [
                   {"image":"harlequinbugs_wilt.png",
                    "text": "These brightly-colored bugs are distant cousins of stink bugs, reproduce quickly with distinct barrel-shaped eggs, and will attack brassicas (broccoli, kale, cauliflower), creating brown tattered leaves and wilt with their feeding."}
               ],
               cures: [
                   {"image":"removing_plant_debris2.png",
                    "text": "Manually removing these bugs from large brassicas with reduce their numbers, but it's also important to immediately remove any plants that have died or are dying from their infestation, since harlequin bugs will use them as habitat for continued breeding the following year."}
               ]
            },
            {
               key: "lacewing",
               category: "good",
               title: "Lacewing",
               image: "bughunt_lacewing.png",
               infoslides:[
                   {"image":"lacewinglarvae_eats_aphid.png",
                    "text":"Lacewing larvae are voracious aphid eaters, devouring as many as 20-30 in a day. Attract lacewings into your garden by planting dill, yarrow, or cilantro."}
               ]
            },
            {
               key: "cabbage_worm",
               title: "Cabbage Worm",
               image: "bughunt_cabbageworm.png",
               infoslides: [
                   {"image":"cabbageworm_leafdamage.png",
                    "text": "The larvae of these white moths can quickly create ragged holes in leaves and prevent the formation of heads in cabbage and cauliflower."}
               ],
               cures: [
                   {"image":"beneficial_insects.png",
                    "text": "Parasitic wasps and green lacewings are beneficial insects that naturally target cabbage moths in their larvae (worm) and egg stage.  Adding plants that attract these insects into your garden (Yarrow, Calendula, Mallow) will help deal with these pests with minimal effort on your part."}
               ]

            },
            {
               key: "flea_beetle",
               title: "Flea Beetle",
               image: "bughunt_fleabeetle2.png",
               infoslides: [
                   {"image":"fleabeetle_holes.png",
                    "text": "Tiny black bugs that poke innumerable tiny holes in the leaves of eggplants, corn and cabbage.  The holes can severely stunt the growth of young plants."}
               ],
               cures: [
                   {"image":"fleabeetle_rowcovers.png",
                    "text": "Flea beetles can be handled by dusting diatomaceous earth on the leaves of infested plants, but it washes off in rain.  Using row covers over seedling is very effective in preventing early damage of eggplants."}
               ]
            },
            {
               key: "ladybug",
               category: "good",
               title: "Ladybug",
               image: "bughunt_ladybug.png",
               infoslides:[
                   {"image":"ladybug_eats_aphid.png",
                    "text":"Ladybugs are great predator insects in your garden, with the ability to eat up to 50-60 aphids per day, or many other garden pests such as scales and mites.  Attract them to your garden with garlic, dill, calendula, and yarrow."}
               ]
            },
            {
               key: "aphid",
               title: "Aphids",
               image: "bughunt_aphid.png",
               infoslides: [
                   {"image":"aphid_leafdamage.png",
                    "text": "Born to reproduce (they are literally pregnant when born), these tiny green, white or black insects swarm on the underside of plant leaves and will gradually suck all the sap out of target plants."}
               ],
               cures: [
                   {"image":"ladybug_feast.png",
                    "text": "Many beneficial insects (LadyBugs, Lacewings) will feast on aphids, so attracting them into your garden is a high priority.  Aphids are also quite fragile and washing your plants with a light water shower will remove the worst infestations."}
               ]
            },
            {
               key: "squash_bug",
               title: "Squash Bug",
               image: "bughunt_squashbug.png",
               infoslides: [
                   {"image":"squashbug_nymphs.png",
                    "text": "These stink bug look-a-likes will cause wilt on cucurbit (squash, melon, cucumber) plants and lay a large number of small golden eggs on the undersides of their leaves, possibly leading to massive infestation."}
               ],
               cures: [
                   {"image":"pickingoff_squashbugeggs.png",
                    "text": "Squash bugs do their damage with numbers, so it's best to be vigilant and prevent infestation at the early stages of development, either by picking off the golden eggs they like to lay underneath leaves or at the nymph stage when they are small, white and extremely easy to pick off."}
               ]
            },
            {
               key: "ground_beetle",
               category: "good",
               title: "Ground Beetle",
               image: "bughunt_groundbeetle.png",
               infoslides:[
                   {"image":"groundbeetle_eats_eggs.png",
                    "text":"Ground beetles are effective predators of pests in the soil, including caterpillars/worms, other beetles (squash vine borers/colorado potato beetles), and slugs.  They prefer to stay at or near the soil level, so attracting them involves creating a nice habitat (mulched perennial beds and flat rocks and logs)."}
               ]
            },
            {
               key: "tomato_hornworm",
               title: "Tomato Hornworm",
               image: "bughunt_tomatohornworm.png",
               infoslides: [
                   {"image":"tomatohornworm_leafdamage.png",
                    "text": "These caterpillars will attack tomatoes exclusively and will attack the tomatoes and stems once the leaves have been defoliated."}
               ],
               cures: [
                   {"image":"parasiticwasp_eggs.png",
                    "text": "Parasitic wasps love to lay their eggs on these worms and let their larvae feed on the worm as they develop. If you are lucky enough to be in a location that has permissive animal rules, chickens also love to feast on these worms."}
               ]
            },
            {
               key: "japanese_beetle",
               title: "Japanese Beetle",
               image: "bughunt_japanesebeetle.png",
               infoslides: [
                   {"image":"japanesebeetle_hungryeater.png",
                    "text": "These general pests attack a wide variety of garden plants and will quickly destroy the leaves of vegetables, berries and fruit trees they've targetted for consumption."}
               ],
               cures: [
                   {"image":"soldier_eats_japanesebeetle.png",
                    "text": "Unlike most beetle pests, japanese beetles are general feeders and will flock on plants that catch their current group's fancy. If discouraged early to land on certain plants by immediate removal, they will tend to drift off to easier food choices.  Certain beneficial insects like soldier and wheel bugs will also attack japanese beetles."}
               ]
            },
            {
               key: "parasitic_wasp",
               category: "good",
               title: "Parasitic Wasp",
               image: "bughunt_parasiticwasp2.png",
               infoslides:[
                   {"image":"wasp_finishes_meal.png",
                    "text":"Comprising a large number of different species in the same family, parasitic wasps don't kill their prey outright, but instead lay eggs on/in their hosts and let their young consume their targets. You can attract wasps with yarrow, dill or mallow."}
               ]
            }

        ];

        function BugHuntGame() {
           this.bugGallery = [];
           this.progress = {};
         
        }

        BugHuntGame.prototype.initGame = function() {
           var scaling = "fit"; // fit scales to fit the browser window while keeping the aspect ratio
           var width = 800; // can go higher...
           var height = 800;
           var color = "#ACA";
           frame = new zim.Frame(scaling, width, height, color); // see docs for more options and info
           (function (bugHuntGame) {
               frame.on("ready", function() {
                   var bug_media = [];
                   bug_media.push("bughunt_cucumberbeetle.png");
                   bug_media.push("bughunt_slug.png");
                   bug_media.push("bughunt_coloradopotatobeetle.png");
                   bug_media.push("bughunt_harlequinbug.png");
                   bug_media.push("bughunt_cabbageworm.png");
                   bug_media.push("bughunt_aphid.png");
                   bug_media.push("bughunt_squashbug.png");
                   bug_media.push("bughunt_fleabeetle2.png");
                   bug_media.push("bughunt_tomatohornworm.png");
                   bug_media.push("bughunt_japanesebeetle.png");
                   bug_media.push("bughunt_tachinidfly.png");
                   bug_media.push("bughunt_lacewing.png");
                   bug_media.push("bughunt_ladybug.png");
                   bug_media.push("bughunt_groundbeetle.png");
                   bug_media.push("bughunt_parasiticwasp2.png");
                   bug_media.push("left_slider2.png");
                   bug_media.push("left_slider_highlight2.png");
                   bug_media.push("right_slider2.png");
                   bug_media.push("right_slider_highlight2.png");
                   for (var i=0; i<bugInfo.length; i++) {
                       if (bugInfo[i].infoslides) {
                           for (var j=0; j<bugInfo[i].infoslides.length; j++) {
                                bug_media.push(bugInfo[i].infoslides[j].image);
                           }
                       }
                       if (bugInfo[i].cures) {
                           bug_media.push(bugInfo[i].cures[0].image);
                       }
                   }
               
                   frame.loadAssets(bug_media, smartInstructions.DEFAULT_URL);

                   document.getElementById('container').appendChild(document.getElementById('myCanvas'));
                   this.initiated = false;
                   frame.on("complete", function() {
                       if (this.initiated)
                           return;
                       this.initiated = true;
                       bugHuntGame.loadProgress();
                   });
              });
           })(this)
        }

        BugHuntGame.prototype.loadProgress = function() {
           // load user's bug hunt game data
           var formData = new FormData();
           formData.append("action", "load_bughunt_game");
           var xhr = new XMLHttpRequest();
           (function(bugHuntGame) {
               xhr.onreadystatechange=function() {
                   if (xhr.readyState==4 && xhr.status==200) {
                       if (xhr.response!=null) {
                           if (xhr.response!="") {
                               var monkey = xhr.response.replace(/\\/g, "");
                               console.log(monkey);
                               if (monkey!="") {
                                   bugHuntGame.progress = JSON.parse(monkey);
                               }
                           }
                           bugHuntGame.startGame();
                       }
                   }
               }
           })(this)
           xhr.open("POST","/wp-admin/admin-ajax.php",true);
           xhr.send(formData);
        }



        BugHuntGame.prototype.startGame = function() {
           // assume progress and bug hunt photos have been loaded
           this.bugGallery = new zim.Container();
           this.bugGallery.x = 150;
           var count = 0;
           for (var i=0; i<bugInfo.length; i++) {
               var newLoc = {x:500*i, y:0};
               var bugKey = bugInfo[i].key;
               var bugProfile = new BugProfile(newLoc, bugInfo[i], 
                   this.progress[bugKey], this);
               this.bugGallery.addChild(bugProfile.container);
               bugInfo[i].bugProfile = bugProfile;
           }
           var infoText = new zim.Label({
               text:"               Click on the bug photo to see more information.\n     Green Borders=Beneficial Insects, Red Borders=Garden Pests",
               size: 20,
               color: "#333",
               lineHeight: 24,
                
           });
           infoText.x = 100;
           infoText.y = 550;
           frame.stage.addChild(infoText);
           this.buildArrowSlider();
           frame.stage.addChild(this.bugGallery);
           frame.stage.update();
        }

        BugHuntGame.prototype.buildArrowSlider = function () {
           // add mask
           var mask = zim.setMask(this.bugGallery, new zim.Rectangle(500,300, "black"));
           mask.x = 150;
           frame.stage.addChild(mask);
           this.bugGalleryOffset = 0;

           // add arrows
           var leftSliderIcon = frame.asset("left_slider2.png");
           var leftSliderHighlightIcon = frame.asset("left_slider_highlight2.png");
           var leftArrowSlider = new zim.Button({
               width:75,
               height:75,
               corner: 0,
               color: "#ACA",
               rollColor: "#ACA",
               shadowColor: -1,
               rollIcon: leftSliderIcon,
               icon:leftSliderHighlightIcon
           });
           (function (bugHuntGame, leftArrowSlider) {
               leftArrowSlider.on("click", function() {
                   frame.stage.removeChild(bugInfo[bugHuntGame.bugGalleryOffset].bugProfile.infoSlides[0]);
                   frame.stage.removeChild(bugInfo[bugHuntGame.bugGalleryOffset].bugProfile.cureSlide);
                   if (bugHuntGame.bugGalleryOffset>0) {
                       bugHuntGame.bugGalleryOffset--;
                       var offset = 150-(bugHuntGame.bugGalleryOffset * 500);
                    
                       bugHuntGame.bugGallery.animate({x:offset}, 1000, null, done); 
                       function done(target) {
                           // target is circle if params is not set
                           console.log("done animating"); 
                       }
                   }
               });
           })(this, leftArrowSlider)
           frame.stage.addChild(leftArrowSlider);

           var rightSliderIcon = frame.asset("right_slider2.png");
           var rightSliderHighlightIcon = frame.asset("right_slider_highlight2.png");
           var rightArrowSlider = new zim.Button({
               width:75,
               height:75,
               corner: 0,
               color: "#ACA",
               rollColor: "#ACA",
               shadowColor: -1,
               rollIcon: rightSliderIcon,
               icon:rightSliderHighlightIcon
           });
           (function (bugHuntGame, rightArrowSlider) {
               rightArrowSlider.on("click", function() {
                   frame.stage.removeChild(bugInfo[bugHuntGame.bugGalleryOffset].bugProfile.cureSlide);
                   frame.stage.removeChild(bugInfo[bugHuntGame.bugGalleryOffset].bugProfile.infoSlides[0]);
                   if (bugHuntGame.bugGalleryOffset<bugInfo.length-1) {
                       bugHuntGame.bugGalleryOffset++;
                       var offset = 150-(bugHuntGame.bugGalleryOffset * 500);

                       bugHuntGame.bugGallery.animate({x:offset}, 1000, null, done);
                       function done(target) {
                           // target is circle if params is not set
                           console.log("done animating");
                       }
                   }
               });
           })(this, rightArrowSlider)
           rightArrowSlider.x = 650;
           frame.stage.addChild(rightArrowSlider);
        }

        BugHuntGame.prototype.fixGameState = function(key) {
           if (this.action=="remove") {
               var photoIndex = -1;
               for (var i=0; i<gameState.pointsHistory.length; i++) {
                    if (gameState.pointsHistory[i].category == key) {
                        photoIndex = i;
                        break;
                    }
               }
               if (photoIndex>= 0) {
                   gameState.pointsHistory.splice(photoIndex, 1);
               }
           } else {
               var photoIndex = -1;
               for (var i=0; i<gameState.pointsHistory.length; i++) {
                    if (gameState.pointsHistory[i].category == key) {
                        photoIndex = i;
                        break;
                    }
               } 
               if (photoIndex==-1) {
                   var today = new Date();
                   gameState.pointsHistory.push({
                       category: key,
                       title: "Photo Challenge",
                       date: (today.getMonth()+1)+'/'+today.getDate() + '/' +today.getFullYear(),
                       module: "BugHunt",
                       points: 5});
               }
           }
           this.key = "";
           this.action = "";
        }
        

        BugHuntGame.prototype.updateGameBoard = function(bugHuntChallenge) {
           bugHuntChallenge.parent.fixGameState(bugHuntChallenge.key);
           var formData = new FormData();
           formData.append("action", "save_bughunt_game");
           formData.append("progress", JSON.stringify(bugHuntChallenge.parent.progress));
           var xhr = new XMLHttpRequest();
           (function(planner) {
               xhr.onreadystatechange=function() {
                   if (xhr.readyState==4 && xhr.status==200) {
                       console.log(xhr.response);
                       console.log(gameState);
                       saveGameState();
                   }
               }
           })(this)
           xhr.open("POST","/wp-admin/admin-ajax.php",true);
           xhr.send(formData);
        }


       
