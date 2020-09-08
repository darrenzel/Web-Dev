/*
Student Name:
	Zelong Bian	 #101008568
	Chengyi Song  #101033544

This is an air hockey game written in javascript and html
*/


var R = 82;
var B = 66;
//declare paddles, puck, goals
var puck = {
  x: 600,
  y: 300,
  xDirection: 0, //+1 for leftwards, -1 for rightwards
  yDirection: 0, //+1 for downwards, -1 for upwards
  radius: 25,
  start:0

};
var movingBox = {
  user:"",
  x: 50,
  y: 225,
  width: 100,
  height: 100,
  score: 0
};
var movingBox1={
  user:"",
  x:1050,
  y:225,
  width:100,
  height:100,
  score:0
}
var line={
	x:595,
	y:0,
	width:10,
	height:600
}
var door1={//door in left
	x:0,
	y:175,
	width:10,
	height:250
}
var door2={//door in right
	x:1190,
	y:175,
	width:10,
	height:250
}

var wayPoints = []; //locations were this client moved the box to

var timer; //used to control the free moving word
var pollingTimer; //timer to poll server for location updates

var wordBeingMoved; //word being dragged by mouse
var wordTargetRect = { x: 0, y: 0, width: 0, height: 0 }; //bounding box around word being targeted

var deltaX, deltaY; //location where mouse is pressed
var canvas = document.getElementById("canvas1"); //our drawing canvas
var fontPointSize = 18; //point size for word text
var wordHeight = 20; //estimated height of a string in the editor
var editorFont = "Arial"; //font for your editor
//Use javascript array of objects to represent words and their locations
var words = [];
words.push({ word: "Air", x: 50, y: 50 });
words.push({ word: "Hockey", x: 80, y: 50 });
words.push({ word: "Ver.0.1.3", x: 170, y: 50 });
words.push({ word: "EarlyAccess", x: 280, y: 50 });
words.push({word: "SCORE", x: 900, y: 50 })
words.push({ word: String(movingBox.score), x: 1000, y: 50 });//the score of blue
words.push({ word: ":", x: 1030, y: 50 });
words.push({ word: String(movingBox1.score), x: 1060, y: 50 });//the score of red
//a function to draw canvas and the elements
var drawCanvas = function() {
  var context = canvas.getContext("2d");

  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas
  //the title and score
  context.font = "" + fontPointSize + "pt " + editorFont;
  context.fillStyle = "cornflowerblue";
  context.strokeStyle = "blue";
  //update scoreboad
  words[5]={ word: String(movingBox.score), x: 1000, y: 50 };
  words[7]={ word: String(movingBox1.score), x: 1060, y: 50 };
  for (var i = 0; i < words.length; i++) {
    var data = words[i];
    context.fillText(data.word, data.x, data.y);
    context.strokeText(data.word, data.x, data.y);
  }
  context.fillStyle = "black";
  context.fillText(movingBox.user, movingBox.x+20, movingBox.y-5);
  context.fillText(movingBox1.user, movingBox1.x+20, movingBox1.y-5);
  //draw puck
  context.beginPath();
  context.arc(puck.x, puck.y, puck.radius, 0, 2*Math.PI);
  context.closePath();
  context.fill();

  //draw paddles
  context.fillStyle="blue"
  context.fillRect(movingBox.x, movingBox.y, movingBox.width, movingBox.height);
  //draw the line in the middle of the canvas
  context.fillRect(line.x,line.y,line.width,line.height);
  //draw the goals
  context.fillRect(door1.x,door1.y,door1.width,door1.height);
  context.fillRect(door2.x,door2.y,door2.width,door2.height);
  //draw the red paddle
  context.fillStyle = "red";
  context.fillRect(movingBox1.x, movingBox1.y, movingBox1.width, movingBox1.height);
  //draw moving box way points
  for (i in wayPoints) {
    context.strokeRect(
      wayPoints[i].x,
      wayPoints[i].y,
      movingBox.width,
      movingBox.height
    );
  }
  //draw circle
  context.beginPath();
  context.arc(
    canvas.width / 2, //x co-ord
    canvas.height / 2, //y co-ord
    canvas.height / 2 - 5, //radius
    0, //start angle
    2 * Math.PI //end angle
  );
  context.stroke();

  //draw box around word last targeted with mouse -for debugging
  context.strokeStyle = "red";
  context.strokeRect(
    wordTargetRect.x,
    wordTargetRect.y,
    wordTargetRect.width,
    wordTargetRect.height
  );
};

function handleMouseDown(e) {
  //get mouse location relative to canvas top left
  var rect = canvas.getBoundingClientRect();
  //var canvasX = e.clientX - rect.left;
  //var canvasY = e.clientY - rect.top;
  var canvasX = e.pageX - rect.left; //use jQuery event object pageX and pageY
  var canvasY = e.pageY - rect.top;
  console.log("mouse down:" + canvasX + ", " + canvasY);

  wordBeingMoved = getWordAtLocation(canvasX, canvasY);
  //console.log(wordBeingMoved.word);
  if (wordBeingMoved != null) {
    deltaX = wordBeingMoved.x - canvasX;
    deltaY = wordBeingMoved.y - canvasY;
    //attache mouse move and mouse up handlers
    $("#canvas1").mousemove(handleMouseMove);
    $("#canvas1").mouseup(handleMouseUp);
  }

  // Stop propagation of the event and stop any default
  //  browser action
  e.stopPropagation();
  e.preventDefault();

  drawCanvas();
}

function handleMouseMove(e) {
  console.log("mouse move");

  //get mouse location relative to canvas top left
  var rect = canvas.getBoundingClientRect();
  var canvasX = e.pageX - rect.left;
  var canvasY = e.pageY - rect.top;

  wordBeingMoved.x = canvasX + deltaX;
  wordBeingMoved.y = canvasY + deltaY;

  e.stopPropagation();

  drawCanvas();
}

function handleMouseUp(e) {
  console.log("mouse up");
  e.stopPropagation();

  //remove mouse move and mouse up handlers but leave mouse down handler
  $("#canvas1").off("mousemove", handleMouseMove); //remove mouse move handler
  $("#canvas1").off("mouseup", handleMouseUp); //remove mouse up handler

  drawCanvas(); //redraw the canvas
}
//a function to reset the canvas and start a new game
function reset(){
  movingBox.x=50;
  movingBox.y=225;
  movingBox1.x=1050;
  movingBox1.y=225;
  puck.x=600;
  puck.y=300;
  puck.xDirection=0;
  puck.yDirection=0;
  var puckdata={x:puck.x,y:puck.y,xDirection:puck.xDirection,yDirection:puck.yDirection,s:puck.start};
  var puckstring=JSON.stringify(puckdata);

   var dataObj = { user: movingBox.user, x: movingBox.x, y: movingBox.y};
  //create a JSON string representation of the dataObj
  var jsonString = JSON.stringify(dataObj);

  var dataObj1 = { user: movingBox1.user, x: movingBox1.x, y: movingBox1.y};
  //create a JSON string representation of the dataObj1
  var jsonString1 = JSON.stringify(dataObj1);

  var blue= {s:movingBox.score};
  //create a JSON string representation of blue score
  var blueString = JSON.stringify(blue);

  var red = {s:movingBox1.score};
  //create a JSON string representation of red score
  var redString = JSON.stringify(red);
  //update server with current score and puck info
  socket.emit('blue', blueString);
  socket.emit('red',redString) ;
  socket.emit('puck',puckstring);
  //update the server with a new location of the moving box
  socket.emit('redBoxData', jsonString1);
  socket.emit('blueBoxData', jsonString);
  //update scoreboard
  words[5]={ word: String(movingBox.score), x:1000, y: 50 };
  words[7]={ word: String(movingBox1.score), x: 1060, y: 50 }
   drawCanvas();
}
function handleTimer() {
  //move puck
  puck.x = puck.x + 5 * puck.xDirection;
  puck.y = puck.y + 5 * puck.yDirection;

  //keep moving word within bounds of canvas
  if (puck.x + puck.radius > canvas.width){
    puck.xDirection = -1;
    //pplayer on the left scores
    if(puck.y>door2.y && puck.y<door2.y+door2.height){
      movingBox.score+=1;

	  reset();

    }
  }
  if (puck.x-puck.radius < 0){
     puck.xDirection = 1;
     //player on the right scores
     if(puck.y>door1.y && puck.y<door1.y+door1.height){
       movingBox1.score+=1;

	   reset();

     }
   }
  if (puck.y +puck.radius> canvas.height) puck.yDirection = -1;
  if (puck.y - puck.radius < 0)
    puck.yDirection = 1;
  //Collision detection
  if(puck.y>=movingBox.y && puck.y<=movingBox.y+movingBox.height){
    //collide at the left
    if(puck.x+puck.radius>=movingBox.x && puck.x<=movingBox.x+movingBox.width/2){puck.xDirection= -1;puck.start=1;}
    //collide at the right
    else if(puck.x-puck.radius<=movingBox.x+movingBox.width && puck.x>=movingBox.x+movingBox.width/2){puck.xDirection = 1;puck.start=1;}
  }
  if(puck.x>=movingBox.x && puck.x<=movingBox.x+movingBox.width){
    //collide at the top
    if(puck.y+puck.radius>=movingBox.y && puck.y<=movingBox.y+movingBox.height/2){puck.yDirection = -1;}
    //collide at the bottom
    else if(puck.y-puck.radius<=movingBox.y+movingBox.height && puck.y>=movingBox.y+movingBox.height/2){puck.yDirection =1;}
  }

  if(puck.y>=movingBox1.y && puck.y<=movingBox1.y+movingBox1.height){
    //collide at the left
    if(puck.x+puck.radius>=movingBox1.x && puck.x<=movingBox1.x+movingBox1.width/2){puck.xDirection= -1;}
    //collide at the right
    else if(puck.x-puck.radius<=movingBox1.x+movingBox1.width && puck.x>=movingBox1.x+movingBox1.width/2){puck.xDirection = 1;}
  }
  if(puck.x>=movingBox1.x && puck.x<=movingBox1.x+movingBox1.width){
    //collide at the top
    if(puck.y+puck.radius>=movingBox1.y && puck.y<=movingBox1.y+movingBox1.height/2){puck.yDirection = -1;}
    //collide at the bottom
    else if(puck.y-puck.radius<=movingBox1.y+movingBox1.height && puck.y>=movingBox1.y+movingBox1.height/2){puck.yDirection =1;}
  }
  var puckdata={x:puck.x,y:puck.y,xDirection:puck.xDirection,yDirection:puck.yDirection,s:puck.start};
  var puckstring=JSON.stringify(puckdata);
  socket.emit('puck',puckstring)
  //update the server with a new location of the puck

  var blue= {s:movingBox.score};
  //create a JSON string representation of the clue score
  var blueString = JSON.stringify(blue);

  var red = {s:movingBox1.score};
  //create a JSON string representation of the red score
  var redString = JSON.stringify(red);
  //update server with current score
  socket.emit('blue', blueString);
  socket.emit('red',redString) ;

  drawCanvas();
}

//KEY CODES
//should clean up these hard coded key codes
var RIGHT_ARROW = 39;
var LEFT_ARROW = 37;
var UP_ARROW = 38;
var DOWN_ARROW = 40;
var users=[];
/*
function pollingTimerHandler() {
  //console.log("poll server");
  var dataObj = { x: -1, y: -1 }; //used by server to react as poll
  //create a JSON string representation of the data object
  var jsonString = JSON.stringify(dataObj);

  //Poll the server for the location of the moving box
  $.post("positionData", jsonString, function(data, status) {
    console.log("data: " + data);
    console.log("typeof: " + typeof data);
    //var locationData = JSON.parse(data);
    var locationData = data;
    movingBox.x = locationData.x;
    movingBox.y = locationData.y;
  });
}
*/

function handleKeyDown(e) {
  console.log("keydown code = " + e.which);
  //assign red paddle to player who presses R
  if(e.which ==R){
	 if(movingBox.user!=user){//if the current user is controling the paddle
     //if nobody is controling the paddle
	 if(movingBox1.user==""){ movingBox1.user=user;}
	 else{
	 if(movingBox1.user==user){movingBox1.user="";}
	 }}
	  }
    //assign blue paddle to player who presses B
  if(e.which==B){
     if(movingBox1.user!=user){
     if(movingBox.user==""){ movingBox.user=user;}
	 else{
	 if(movingBox.user==user){movingBox.user="";}
	 }}
	}
  var dXY = 5; //amount to move in both X and Y direction
  if (e.which == UP_ARROW && movingBox.y >= dXY&&movingBox.user==user) movingBox.y -= dXY; //up arrow
  if (
    e.which == RIGHT_ARROW &&
    movingBox.x + movingBox.width + dXY <= canvas.width/2&&movingBox.user==user
  )
    movingBox.x += dXY; //right arrow
  if (e.which == LEFT_ARROW && movingBox.x >= dXY&&movingBox.user==user) movingBox.x -= dXY; //left arrow
  if (
    e.which == DOWN_ARROW &&
    movingBox.y + movingBox.height + dXY <= canvas.height&&movingBox.user==user
  )
    movingBox.y += dXY; //down arrow




  if (e.which == UP_ARROW && movingBox1.y >= dXY&&movingBox1.user==user) movingBox1.y -= dXY; //up arrow
  if (
    e.which == RIGHT_ARROW &&
    movingBox1.x + movingBox1.width + dXY <= canvas.width&&movingBox1.user==user
  )
    movingBox1.x += dXY; //right arrow
  if (e.which == LEFT_ARROW && movingBox1.x >= dXY+600&&movingBox1.user==user) movingBox1.x -= dXY; //left arrow
  if (
    e.which == DOWN_ARROW &&
    movingBox1.y + movingBox1.height + dXY <= canvas.height&&movingBox1.user==user
  )
    movingBox1.y += dXY; //down arrow
}

function handleKeyUp(e) {
  console.log("key UP: " + e.which);
  var dataObj = { user: movingBox.user, x: movingBox.x, y: movingBox.y, s:movingBox.score};
  //create a JSON string representation of the data object
  var jsonString = JSON.stringify(dataObj);
  var dataObj1 = { user: movingBox1.user, x: movingBox1.x, y: movingBox1.y, s:movingBox1.score };
  //create a JSON string representation of the data object
  var jsonString1 = JSON.stringify(dataObj1);

  //update the server with a new location of the moving box
  socket.emit('redBoxData', jsonString1)
  socket.emit('blueBoxData', jsonString)
  /*
  $.post("positionData", jsonString, function(data, status) {
    console.log("data: " + data);
    console.log("typeof: " + typeof data);
    //var wayPoint = JSON.parse(data);
    var wayPoint = data;
    wayPoints.push(wayPoint);
  });
  */
}

//connect to server and retain the socket
var socket = io('http://' + window.document.location.host)
//var socket = io('http://localhost:3000')
//use sockets to commucate information
socket.on('blueBoxData', function(data) {
  console.log("data: " + data);
  console.log("typeof: " + typeof data);
  var locationData = JSON.parse(data);
  //var locationData = data;
  movingBox.x = locationData.x;
  movingBox.y = locationData.y;
  movingBox.user=locationData.user;

  drawCanvas();
})
socket.on('red', function(data) {
	var locationData = JSON.parse(data);
    movingBox1.score=locationData.s;
  drawCanvas();
})
socket.on('blue', function(data) {
	var locationData = JSON.parse(data);
    movingBox.score=locationData.s;
  drawCanvas();
})
socket.on('redBoxData', function(data) {
  console.log("data: " + data);
  console.log("typeof: " + typeof data);
  var locationData = JSON.parse(data);
  //var locationData = data;
  movingBox1.x = locationData.x;
  movingBox1.y = locationData.y;
  movingBox1.user=locationData.user;

  drawCanvas();
})
socket.on('puck', function(data) {
  console.log("data: " + data);
  console.log("typeof: " + typeof data);
  var locationDat = JSON.parse(data);
  //var locationData = data;
  puck.x = locationDat.x;
  puck.y = locationDat.y;
  puck.xDirection=locationDat.xDirection;
  puck.yDirection=locationDat.yDirection;
  puck.start=locationDat.start;
  drawCanvas();
})
$(document).ready(function() {
  user = prompt("Please type a name");
  users.push(user);
  //add mouse down listener to our canvas object
  $("#canvas1").mousedown(handleMouseDown);
  //add keyboard handler to document
  $(document).keydown(handleKeyDown);
  $(document).keyup(handleKeyUp);

  timer = setInterval(handleTimer, 25); 
  //pollingTimer = setInterval(pollingTimerHandler, 100); //quarter of a second
  //timer.clearInterval(); //to stop

  drawCanvas();
});
