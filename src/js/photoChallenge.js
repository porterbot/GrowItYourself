function PhotoChallenge(location, columnWidth, uploaded, section, module, category, title, startDate,iconSrc, parent) {
            this.location = location;
            this.columnWidth = columnWidth;
            this.uploaded = uploaded;
            this.module = module;
            this.section = section;
            this.category = category;
            this.container = new zim.Container();
            this.container.x = this.location.x + (columnWidth-(smartInstructions.DEFAULT_THUMBNAIL_SIZE+10))/2
            this.container.y = this.location.y;
            this.title = title;
            this.waiter = new zim.Waiter(frame.stage);
            this.startDate = Date.parse(startDate);
            this.startDateLabel = startDate;
            this.iconSrc = iconSrc;
            this.makeTemporaryComponents();
            this.parent = parent;
        }

        PhotoChallenge.prototype.handleEvent = function(e) {
            switch(e.type) {
            case "click":
                if (e.target instanceof zim.Label || e.target instanceof zim.Rectangle) {
                    if (this.startDate && this.startDate>Date.now()) {
                        var warningLabel = new zim.Label("Please wait until " + this.startDateLabel + " to post your photo", 20, "Nunito", "white");
                        var warningPane = new zim.Pane({
                           container:frame.stage, 
                           width:450, 
                           height:200, 
                           label:warningLabel,
                           backing:pizzazz.makeShape("roadside", smartInstructions.DEFAULT_STROKE_COLOR).scale(4)});
                        warningPane.show();
                    } else {
                        document.getElementById(e.target.category).click();
                    }
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

        PhotoChallenge.prototype.makeTemporaryComponents = function() {
            this.uploadLabel = new zim.Label({
                text:"    Click To\nUpload Photo",
                size: 16,
                color: smartInstructions.DEFAULT_STROKE_COLOR,
                font:"Nunito"
            });
            this.uploadLabel.x = (smartInstructions.DEFAULT_THUMBNAIL_SIZE+10-this.uploadLabel.getBounds().width)/2;
            this.uploadLabel.y = smartInstructions.DEFAULT_TAB_HEIGHT+(smartInstructions.DEFAULT_THUMBNAIL_SIZE-this.uploadLabel.getBounds().height)/2;
            this.uploadLabel.category = this.category;

            this.deleteButton = makeButton("close");
            this.deleteButton.x = smartInstructions.DEFAULT_THUMBNAIL_SIZE - 30;
            this.deleteButton.y = 10;
            this.deleteButton.id = "delete";
            this.deleteButton.addEventListener("click", this, false); 

            var photos = gameState.photos;
            for (var i=0; i<photos.length; i++) {
                 if (photos[i].category == this.category && photos[i].module==this.module && 
                        photos[i].section==this.section) {
                     this.loadThumbnail(photos[i].url, true);
                }
            }
            
            if (this.iconSrc) {
                this.icon = new Image();
                this.icon.onload = function() {
                    frame.stage.update();
                }
                this.icon.src = this.iconSrc;
            }
        }

        PhotoChallenge.prototype.createUploadWidget = function () {
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
            var categoryLabel = new zim.Label({
                text: this.title,
                size: 16,
                color: "#000000",
                font:"Nunito"
            });
            var iconBitmap;
            if (this.icon) {
                iconBitmap  = new createjs.Bitmap(this.icon);
                iconBitmap.x = 3;
                iconBitmap.y = 3;
            }
            categoryLabel.x = (smartInstructions.DEFAULT_THUMBNAIL_SIZE+10-categoryLabel.getBounds().width)/2;
            categoryLabel.y = +smartInstructions.DEFAULT_TAB_HEIGHT/2-10;
            photoFrame.category = this.category;

            // set up events
            var input=document.createElement('input');
            input.type="file";
            input.style="display:none";
            input.id=this.category;
            document.getElementById('spares').appendChild(input);
            photoFrame.addEventListener("click",this,false);
            this.uploadLabel.addEventListener("click",this,false); 
            var imageLoader = document.getElementById(this.category);
            imageLoader.addEventListener('change', this, false);

            this.container.addChild(photoFrame);
            this.container.addChild(photoTitleBar);
            this.container.addChild(iconBitmap);
            this.container.addChild(this.uploadLabel);
            this.container.addChild(categoryLabel);
            return this.container;
        }

        PhotoChallenge.prototype.removePhoto = function(url) {
            var obj = this;
            this.waiter.show();
            var formData = new FormData();
            this.uploaded=false;
            var baseName = this.section + "_" + this.module + "_" + this.category;
            formData.append("action", "remove_game_photo");
            formData.append("category", baseName);
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange=function() {
                if (xhr.readyState==4 && xhr.status==200) {
                    obj.togglePhoto();
                }
            }
            xhr.open("POST","/wp-admin/admin-ajax.php",true);
            xhr.send(formData);
        }

        PhotoChallenge.prototype.togglePhoto = function() {
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

        PhotoChallenge.prototype.loadPhoto = function() {
            this.uploaded = true;
            this.togglePhoto();
        }

        PhotoChallenge.prototype.savePhoto = function(url, obj) {
            var today = new Date();
            // updated game state and save
            var duplicate = false;
            for (var i=0; i<gameState.pointsHistory.length; i++) {
                 var pointHistory = gameState.pointsHistory[i];
                 if (pointHistory.category==obj.category && pointHistory.section==obj.world
                          && pointHistory.module==obj.module) {
                     duplicate = true;
                 }
            }

            if (!duplicate) {
                gameState.pointsHistory.push({
                    category: this.category,
                    title: "Photo Challenge",
                    date: (today.getMonth()+1)+'/'+today.getDate() + '/' +today.getFullYear(),
                    module: obj.module,
                    section: obj.section,
                    points: 5});
                gameState.photos.push({
                    url: url, 
                    category: obj.category,
                    module: obj.module,
                    section: obj.section });
                obj.uploaded = true;
                obj.parent.updateGameState(obj.parent, true);
            }
        }

        PhotoChallenge.prototype.startUpload = function() {
            var reader = new FileReader();
            this.waiter.show();
            (function(photoChallenge) {
                reader.onload = function (e) {
                    // get file reference
                    var formData = new FormData();
                    formData.append("action", "upload-attachment");
                    formData.append("async-upload", files);
                    formData.append("category", baseName);
                    var nonce = document.getElementById("wack").innerHTML;
                    formData.append("_wpnonce", nonce);
                    console.log(formData);
                    var xhr = new XMLHttpRequest();
                    xhr.onreadystatechange=function() {
                        if (xhr.readyState==4 && xhr.status==200) {
                            var metadata = JSON.parse(xhr.responseText);
                            console.log(metadata);
                            photoChallenge.savePhoto(metadata.data.url, photoChallenge);
                            photoChallenge.loadThumbnail(metadata.data.url, true);
                        }
                    }
                    xhr.open("POST","/wp-admin/async-upload.php",true);
                    xhr.send(formData);
                }
            })(this)
            var imageLoader = document.getElementById(this.category);
            var files = imageLoader.files[0];
            var baseName = this.section + "_" + this.module + "_" + this.category;
            files.name = baseName + "_" + gameState.user;
            console.log(files);
            reader.readAsDataURL(files);
        }

        PhotoChallenge.prototype.loadThumbnail = function (src, callback) {
            this.waiter.show();
            var obj = this;
            this.thumbnail = new Image();
            if (callback) {
                this.thumbnail.addEventListener('load',this,false);
            }
            this.thumbnail.src = src;
        }
