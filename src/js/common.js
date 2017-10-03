var smartInstructions = {
    StyleEnum: {
        Normal : "Normal",
        Bold : "Bold",
        Italic : "Italic"
    },
    AlignEnum: {
        Center : "Center",
        Left : "Left",
        Right : "Right"
    },
    DEFAULT_FONT: "Nunito",
    DEFAULT_STROKE_COLOR: "#0d5c00",
    DEFAULT_FONT_WEIGHT: 12,
    DEFAULT_LINK_COLOR: "#0000bb",
    DEFAULT_FILL_COLOR: "#e9f4e8",
    DEFAULT_BACKGROUND_COLOR: "#e9f4e8",
    DEFAULT_MARGIN: 15,
    DEFAULT_THUMBNAIL_SIZE: 185,
    DEFAULT_TAB_HEIGHT: 60,
    DEFAULT_WIDTH: 500,
    DEFAULT_HEIGHT: 500,
    DEFAULT_COLUMNS: 1,
    DEFAULT_URL: "http://mygardengame.com/wp-content/uploads/2016/08/"
};

function buildSlider(parent, container, viewport) {
    var totalHeight = container.height;
    var scrollW = 25;
    var mask = new zim.Rectangle({width:viewport.width,height:viewport.height, color:"#CCC"});
    parent.addChild(mask);
    mask.x = 0;
    mask.y = 0;
    container.setMask(mask);
    var vButton = new zim.Button({
       height:viewport.height*(viewport.height/totalHeight),
       width:scrollW,
       label:"",
       color:"#555",
       rollColor:frame.gray,
       corner:0
    });

    var vScrollbar = new zim.Slider({
       min:totalHeight-viewport.height,
       max:0,
       step:0,
       button:vButton,
       barLength:totalHeight,
       barWidth:scrollW,
       barColor:"#DDDDDD",
       vertical:true,
       inside:true
    });

    zim.expand(vScrollbar.button); // helps on mobile
    container.addChild(vScrollbar);
    vScrollbar.x = viewport.width-scrollW;
    vScrollbar.y = 0;

    (function(container) {
        vScrollbar.on("change", function() {
            container.y = -vScrollbar.currentValue;
        });
    })(container)
    return vScrollbar;
}

function buildHorizontalSlider(parent, container, viewport) {
    var totalWidth = container.width;
    var scrollW = 25;
    var mask = new zim.Rectangle({width:viewport.width,height:viewport.height, color:"#CCC"});
    parent.addChild(mask);
    mask.x = 0;
    mask.y = 0;
    container.setMask(mask);
    var hButton = new zim.Button({
       width:viewport.width*(viewport.width/totalWidth),
       height:scrollW,
       label:"",
       color:"#555",
       rollColor:frame.gray,
       corner:0
    });

    var hScrollbar = new zim.Slider({
       min:0,
       max:totalWidth-viewport.width,
       step:0,
       button:hButton,
       barLength:totalWidth,
       barWidth:scrollW,
       barColor:"#DDDDDD",
       vertical:false,
       inside:true
    });

    zim.expand(hScrollbar.button); // helps on mobile
    frame.stage.addChild(hScrollbar);
    hScrollbar.y = 0;
    hScrollbar.x = 0;

    (function(container) {
        hScrollbar.on("change", function() {
            container.x = -hScrollbar.currentValue;
        });
    })(container)
    return hScrollbar;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

 
function getUserPointsList() {
            var formData = new FormData();
            formData.append("action", "get_all_user_points");
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange=function() {
                if (xhr.readyState==4 && xhr.status==200) {
                    var pointsList = JSON.parse(xhr.response);
                    var pointsTable = document.getElementById("pointsTable");
                    var tbl  = document.createElement("table");
                    var theadrow = document.createElement("tr");
                    var theadcell1 = document.createElement("th");
                    var column1 = document.createTextNode("username");
                    var theadcell2 = document.createElement("th");
                    var theadcell3 = document.createElement("th");
                    var column2 = document.createTextNode("points");
                    var column3 = document.createTextNode("top skill");
                    theadcell1.appendChild(column1);
                    theadcell2.appendChild(column2);
                    theadcell3.appendChild(column3);
                    theadrow.appendChild(theadcell1);
                    theadrow.appendChild(theadcell2);
                    theadrow.appendChild(theadcell3);
                    tbl.appendChild(theadrow);
                    var finalLeaders = [];
                    for (var j = 0; j <= pointsList.length; j++) {
                         if (!pointsList[j])
                             break;

                         var totalPoints = 0;
                         var worldState = JSON.parse(pointsList[j].world_state.replace(/\\/g, ""));
                         pointHistory = worldState['pointsHistory'];
                         for (var i=0; i<pointHistory.length; i++) {
                              var item = pointHistory[i];
                              totalPoints += item.points;
                         }
                         if (pointsList[j].username!='gardengameuser') {
                             finalLeaders.push({username:pointsList[j].username, points:totalPoints, skills:worldState.skills});
                         }
                    }
                    finalLeaders.sort(function(a, b) {
                         return b.points - a.points;
                    });

                    for(var j=0; j<=9; j++) {
                         var row = document.createElement("tr");
                         var displayCell = document.createElement("td");
                         displayCell.style.fontFamily = 'Lato';
                         displayCell.style.fontSize = '14pt';
                         var displayText = document.createTextNode(finalLeaders[j].username);
                         displayCell.appendChild(displayText);

                         var pointsCell = document.createElement("td");
                         pointsCell.style.fontFamily = 'Lato';
                         pointsCell.style.fontSize = '14pt';
                         var pointsText = document.createTextNode(finalLeaders[j].points);
                         pointsCell.appendChild(pointsText);

                         var skillCell = document.createElement("td");
                         skillCell.style.fontFamily = 'Lato';
                         skillCell.style.fontSize = '11pt';
                         if (finalLeaders[j].skills && finalLeaders[j].skills["garden-gnome"]) {
                             skillCell.innerHTML = "<img style=\"vertical-align:middle\" width='50' src=\"http://game.permakits.com/wp-content/uploads/2016/08/garden-gnome.jpg\"/> Garden Gnome";
                         }
                         if (finalLeaders[j].skills && finalLeaders[j].skills["garden-novice"]) {
                             skillCell.innerHTML = "<img style=\"vertical-align:middle\" width='50' src=\"http://game.permakits.com/wp-content/uploads/2016/08/garden_novice.png\"/> Garden Novice";
                         }

                         row.appendChild(displayCell);
                         row.appendChild(pointsCell);
                         row.appendChild(skillCell);
                         tbl.appendChild(row);
                    }
                    pointsTable.appendChild(tbl);
                }
            }
            xhr.open("POST","/wp-admin/admin-ajax.php",true);
            xhr.send(formData);
        }


function getUsername (callback, parent) {
    var formData = new FormData();
    formData.append("action", "get_username");
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange=function() {
      if (xhr.readyState==4 && xhr.status==200) {
          var username = xhr.response;
          callback(username, parent);
       }
   }
   xhr.open("POST","/wp-admin/admin-ajax.php",true);
   xhr.send(formData);
}

function fetchClimateData (zipcode, planner) {
    // first fetch closest station to zipcode
    var stationURL = "http://api.aerisapi.com/normals/closest?p="+zipcode+"&client_id=zukQI4u2JA0wMeD3zwfDT&client_secret=YQbd7PDY2CGhNB1w4HtU9hPuuMuo67ygKBAPIso3";
    var formData = new FormData();

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange=function() {
      if (xhr.readyState==4 && xhr.status==200) {
          var climateData = JSON.parse(xhr.response);
          var stationId = climateData.response[0].id;
          if (stationId==undefined)
              return null;
          var xhr2 = new XMLHttpRequest();
          formData = new FormData();
          formData.append("action", "get_monthly_temps");
          formData.append("station",stationId);
          xhr2.onreadystatechange=function() {
              if (xhr2.readyState==4 && xhr2.status==200) {
                  planner.monthlyNorms = JSON.parse(xhr2.response.replace(/\\/g, ""));
              }
          }
          xhr2.open("POST","/wp-admin/admin-ajax.php",true);
          xhr2.send(formData);
       }
   }
   xhr.open("GET",stationURL,true);
   xhr.send(formData);
}

function iOS() {

  var iDevices = [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ];

  if (!!navigator.platform) {
    while (iDevices.length) {
      if (navigator.platform === iDevices.pop()){ return true; }
    }
  }

  return false;
}

function fetchCommunityTasks(callback, parent) {
    var formData = new FormData();
    formData.append("action", "get_badgeos_achievements");

    var xhr = new XMLHttpRequest();
    var today = new Date();
    xhr.onreadystatechange=function() {
      if (xhr.readyState==4 && xhr.status==200) {
          if (xhr.response!="") {
              achievements = JSON.parse(xhr.response);
              var updateGameState = false;
              if (achievements.length>0) {
                  for (var i=0; i<achievements.length; i++) {
                       var achievementId = achievements[i]["ID"];
                       if (achievementId=='8127' && (!gameState.worldHistory['Community'] ||
                             !gameState.worldHistory['Community']['Profile'])) {
                           if (!gameState.worldHistory['Community']) {
                               gameState.worldHistory['Community'] = {};
                           }
                           updateGameState = true;
                            console.log(gameState.worldHistory['Community']);
                           gameState.worldHistory["Community"]["Profile"] = "completed";
                           gameState.pointsHistory.push({
                               category: "profile update",
                               title: "Community Action",
                               date: (today.getMonth()+1)+'/'+today.getDate() + '/' +today.getFullYear(),
                               points: 5});
                       } else if (achievementId=='8129' && (!gameState.worldHistory["Community"] ||
                             !gameState.worldHistory['Community']['Forum'])) {
                           if (!gameState.worldHistory['Community']) {
                               gameState.worldHistory['Community'] = {};
                           }
                           updateGameState = true;
                           gameState.worldHistory["Community"]["Forum"] = "completed";
                           gameState.pointsHistory.push({
                               category: "forum post",
                               title: "Community Action",
                               date: (today.getMonth()+1)+'/'+today.getDate() + '/' +today.getFullYear(),
                               points: 5});
                       } else if (achievementId=='8326' && (!gameState.worldHistory["Community"] ||
                             !gameState.worldHistory['Community']['Webinar'])) {
                           if (!gameState.worldHistory['Community']) {
                               gameState.worldHistory['Community'] = {};
                           }
                           updateGameState = true;
                           gameState.worldHistory["Community"]["Webinar"] = "completed";
                           gameState.pointsHistory.push({
                               category: "webinar watched",
                               title: "Community Action",
                               date: (today.getMonth()+1)+'/'+today.getDate() + '/' +today.getFullYear(),
                               points: 5});
                       }
                  }
              }    
              if (updateGameState) {
                  saveGameState(callback, parent);
              }  
              if (callback) {
                  callback(parent);
              }     
          }
      }
    }
    xhr.open("POST","/wp-admin/admin-ajax.php",true);
    xhr.send(formData);
}


// eventually callback hell needs to be replaced with
// promises or something similar
function saveGameState(callback, parent) {
    var formData = new FormData();
    formData.append("action", "save_world_status");
    formData.append("world_status",JSON.stringify(gameState)); 

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange=function() {
      if (xhr.readyState==4 && xhr.status==200) {
          console.log("Game State saved");
          if (callback) {
              callback(parent);
          }
      }
    }
    xhr.open("POST","/wp-admin/admin-ajax.php",true);
    xhr.send(formData);
}

function checkSkills (callback, parent) {
    // check achievements and award skill if everything met
    var skills = [];
    var updateGameState = false;
    if (gameState.worldHistory["Community"] && (!gameState.skills || !gameState.skills["garden-gnome"])) {
        var community = gameState.worldHistory["Community"];
        if (community["Profile"] && community["Forum"] && community["Webinar"]) {
            console.log ("Garden Gnome Skill achieved");
            updateGameState = true;
            gameState.skills = {};
            gameState.skills["garden-gnome"] = "completed";
            skills.push(1589);
        }
    } 
    if (gameState.worldHistory["Home"] && (!gameState.skill || !gameState.skills["garden-novice"])) {
        var home = gameState.worldHistory["Home"];
        if (home["Plant Guide"]=="completed" && 
              home["Strategy"]=="completed" && 
              home["Seed Starting"]=="completed" && 
              home["Transplanting"]=="completed" && 
              gameState.skills && 
              gameState.skills["garden-gnome"]) {
            console.log ("Garden Novice Skill achieved");
            updateGameState = true;
            gameState.skills["garden-novice"] = "completed";
            skills.push(7965);
        }
    }
    var track;
    if (gameState.worldHistory["Kids Garden"]) {
       track = gameState.worldHistory["Kids Garden"];
    } else if (gameState.worldHistory["Herb Spiral"]) {
       track = gameState.worldHistory["Herb Spiral"];
    } else if (gameState.worldHistory["Square Foot Garden"]) {
       track = gameState.worldHistory["Square Foot Garden"];
    }
    if (track) {
       if (track["Installation"]=="completed" && 
              track["Soils"]=="completed" &&
              track["Planner"]=="completed" &&
              track["Maintenance"]=="completed" &&
              !gameState.skills["green-thumb"]) {
           console.log ("Green Thumb Skill achieved");
           updateGameState = true;
           gameState.skills["green-thumb"] = "completed";
           skills.push(8308);
        }
    }

    if (updateGameState) {
        saveGameState();
    }      
    
    var formData = new FormData();
    formData.append("action", "award_badgeos_skills");
    formData.append("skill", JSON.stringify(skills));

    if (skills.length>0) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange=function() {
            if (xhr.readyState==4 && xhr.status==200) {
                if (xhr.response!="") {
                    console.log(xhr);
                    if (callback) {
                        callback(parent);
                    }
                }
            }
        }
        xhr.open("POST","/wp-admin/admin-ajax.php",true);
        xhr.send(formData);
    } else {
        if (callback) {
            callback(parent);
        }
    }
}

function loadGameState(callback, parent) {
    var formData = new FormData();
    formData.append("action", "load_world_status");

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange=function() {
      if (xhr.readyState==4 && xhr.status==200) {
          if (xhr.response!="") {
              gameState = JSON.parse(xhr.response.replace(/\\/g, ""));
              checkSkills(callback, parent);
          }
      }
    }
    xhr.open("POST","/wp-admin/admin-ajax.php",true);
    xhr.send(formData);
}

function verifyUser() {
    var formData = new FormData();
    formData.append("action", "verify_email_onboarding");
    formData.append("email", document.getElementById('email').value);

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange=function() {
      if (xhr.readyState==4 && xhr.status==200) {
          var results = JSON.parse(xhr.response);
          if (!results) {
              alert ('This email address does not correspond to a user registered for the game');
          } else if (results.username!='') {
              alert ('You have already onboarded this email address');
          } else {
              var table = document.getElementById("userTable");
              var row0 = table.insertRow(2);
              var cell01 = row0.insertCell(0);
              var cell02 = row0.insertCell(1);
              cell01.innerHTML = "<font color='#00FF00'><b>Verified</b></font>";
              cell02.innerHTML = "Create your account by entering a username/password below";

              var row1 = table.insertRow(3);
              var cell1 = row1.insertCell(0);
              var cell2 = row1.insertCell(1);
              cell1.innerHTML = "Username:";
              cell2.innerHTML = "<input type='text' id='username'/>";

              var row2 = table.insertRow(4);
              var cell3 = row2.insertCell(0);
              var cell4 = row2.insertCell(1);
              cell3.innerHTML = "Password:";
              cell4.innerHTML = "<input type='password' id='password'/>";
             
              var row21 = table.insertRow(5);
              var cell23 = row21.insertCell(0);
              var cell24 = row21.insertCell(1);
              cell23.innerHTML = "Verify Password:";
              cell24.innerHTML = "<input type='password' id='verify_password'/>";

              var row3 = table.insertRow(6);
              var cell5 = row3.insertCell(0);
              var cell6 = row3.insertCell(1);
              cell6.innerHTML = "<button class='vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-rounded vc_btn3-style-3d vc_btn3-color-grey' onclick='createUser();'>Create User</button>";
         }
      }
    }
    xhr.open("POST","/wp-admin/admin-ajax.php",true);
    xhr.send(formData);
}

function createUser() {
    if (document.getElementById('password').value!=document.getElementById('verify_password').value) {
        alert ('Password and Verify Password do not match.  Please fix and Press the create user button again');
    }
    var formData = new FormData();
    formData.append("action", "verify_email_onboarding");
    formData.append("email", document.getElementById('email').value);

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange=function() {
      if (xhr.readyState==4 && xhr.status==200) {
          // we've confirmed this isn't a bot so go ahead and create the user
          var formData2 = new FormData();
          formData2.append("action", "create_gardengame_user");
          formData2.append("username", document.getElementById('username').value);
          formData2.append("password", document.getElementById('password').value);
          var xhr2 = new XMLHttpRequest();
          xhr2.onreadystatechange=function() {
              if (xhr2.readyState==4 && xhr2.status==200) {
                 console.log(xhr2);
                 if (xhr2.response=="Success") {
                     var table = document.getElementById("userTable");
                     var row = table.insertRow(7);
                     var cell1 = row.insertCell(0);
                     var cell2 = row.insertCell(1);
                     cell1.innerHTML = "<font color='#00FF00'><b>User Created</b></font>";
                     cell2.innerHTML = "You can now login and customize your profile";
                 } else {
                    alert ('Problem creating username.  Please contact permaculturegardens@gmail.com for support');
                 }
              }
          }
          xhr2.open("POST","/wp-admin/admin-ajax.php",true);
          xhr2.send(formData2);
      }
    }
    xhr.open("POST","/wp-admin/admin-ajax.php",true);
    xhr.send(formData);
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var replaced = query.replace(/%20/g, " ");
  var vars = replaced.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  } 
}

function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function makeButton(type, rotation, toggle) {
    var icon = pizzazz.makeIcon({
        type:type,
        color:frame.dark,
        scale:0.5,
        multi:1,
        multiAlpha:.5,
        multiScale:0,
        multiX:2,
        multiY:2,
        skewX:0,
        skewY:0
    });
    var rollIcon =  pizzazz.makeIcon({
        type:type,
        color:"white",
        scale:0.5,
    });
    if (rotation && rotation>0) {
        icon.rotation = rotation;
        rollIcon.rotation = rotation;
    }
    var button;
    if (toggle) {
        var toggleIcon;
        toggleIcon = pizzazz.makeIcon({
            type:toggle,
            color:frame.dark,
            scale:0.5
        });
        button = new zim.Button({
            width:30,
            height:30,
            color:frame.lighter,
            rollColor:frame.green,
            gradient:.3,
            corner:15,
            icon:icon,
            toggle:toggleIcon
        });
    } else {
        button = new zim.Button({
            width:30,
            height:30,
            color:frame.lighter,
            rollColor:frame.green,
            gradient:.3,
            corner:15,
            icon:icon,
            rollIcon:rollIcon
        });
    }
    return button;
}
