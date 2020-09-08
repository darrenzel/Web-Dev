//Student name: Zelong Bian
//Student number: 101008568
//Use javascript array of objects to represent words and their locations
var words = [];
var chord_line = [];
var lyrics_line = [];
var movingString = {word: "moveing",
                    x: 100,
					y:100,
					xDirection: 1, //+1 for leftwards, -1 for rightwards
					yDirection: 1, //+1 for downwards, -1 for upwards
					stringWidth: 50, //will be updated when drawn
					stringHeight: 24}; //assumed height based on drawing point size
//indended for keyboard control
var movingBox = {x: 50,
                 y: 50,
				 width: 100,
				 height: 100};

var wayPoints = []; //locations where the moving box has been

var timer;

var wordBeingMoved;

var deltaX, deltaY; //location where mouse is pressed
var canvas = document.getElementById('canvas1'); //our drawing canvas

function getWordAtLocation(aCanvasX, aCanvasY){

	  //locate the word near aCanvasX,aCanvasY
	  //Just use crude region for now.
	  //should be improved to using lenght of word etc.

	  //note you will have to click near the start of the word
	  //as it is implemented now
	  for(var i=0; i<words.length; i++){
      var context = canvas.getContext('2d');
		 if(Math.abs((words[i].x + context.measureText(words[i].word).width/2) - aCanvasX) < context.measureText(words[i].word).width/2 &&
		    Math.abs(words[i].y - aCanvasY) < 20) return words[i];
	  }
	  return null;
    }

var drawCanvas = function(){

    var context = canvas.getContext('2d');

    context.fillStyle = 'white';
    context.fillRect(0,0,canvas.width,canvas.height); //erase canvas

    context.font = '20pt Arial';
    context.fillStyle = 'cornflowerblue';
    context.strokeStyle = 'blue';

    for(var i=0; i<words.length; i++){  //note i declared as var

			var data = words[i];
			context.fillText(data.word, data.x, data.y);
            context.strokeText(data.word, data.x, data.y);

	}

}

function handleMouseDown(e){

	//get mouse location relative to canvas top left
	var rect = canvas.getBoundingClientRect();
    //var canvasX = e.clientX - rect.left;
    //var canvasY = e.clientY - rect.top;
    var canvasX = e.pageX - rect.left; //use jQuery event object pageX and pageY
    var canvasY = e.pageY - rect.top;
	console.log("mouse down:" + canvasX + ", " + canvasY);

	wordBeingMoved = getWordAtLocation(canvasX, canvasY);
	//console.log(wordBeingMoved.word);
	if(wordBeingMoved != null ){
	   deltaX = wordBeingMoved.x - canvasX;
	   deltaY = wordBeingMoved.y - canvasY;
	   //document.addEventListener("mousemove", handleMouseMove, true);
       //document.addEventListener("mouseup", handleMouseUp, true);
	$("#canvas1").mousemove(handleMouseMove);
	$("#canvas1").mouseup(handleMouseUp);

	}

    // Stop propagation of the event and stop any default
    //  browser action

    e.stopPropagation();
    e.preventDefault();

	drawCanvas();
	}

function handleMouseMove(e){

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

function handleMouseUp(e){
	console.log("mouse up");

	e.stopPropagation();

    //$("#canvas1").off(); //remove all event handlers from canvas
    //$("#canvas1").mousedown(handleMouseDown); //add mouse down handler

	//remove mouse move and mouse up handlers but leave mouse down handler
    $("#canvas1").off("mousemove", handleMouseMove); //remove mouse move handler
    $("#canvas1").off("mouseup", handleMouseUp); //remove mouse up handler

	drawCanvas(); //redraw the canvas
	}

//JQuery Ready function -called when HTML has been parsed and DOM
//created
//can also be just $(function(){...});
//much JQuery code will go in here because the DOM will have been loaded by the time
//this runs

function handleTimer(){
	drawCanvas()
}

    //KEY CODES
	//should clean up these hard coded key codes
	var ENTER = 13;
	var RIGHT_ARROW = 39;
	var LEFT_ARROW = 37;
	var UP_ARROW = 38;
	var DOWN_ARROW = 40;


function handleKeyDown(e){

	console.log("keydown code = " + e.which );

	var dXY = 5; //amount to move in both X and Y direction
	if(e.which == UP_ARROW && movingBox.y >= dXY)
	   movingBox.y -= dXY;  //up arrow
	if(e.which == RIGHT_ARROW && movingBox.x + movingBox.width + dXY <= canvas.width)
	   movingBox.x += dXY;  //right arrow
	if(e.which == LEFT_ARROW && movingBox.x >= dXY)
	   movingBox.x -= dXY;  //left arrow
	if(e.which == DOWN_ARROW && movingBox.y + movingBox.height + dXY <= canvas.height)
	   movingBox.y += dXY;  //down arrow

    var keyCode = e.which;
    if(keyCode == UP_ARROW | keyCode == DOWN_ARROW){
       //prevent browser from using these with text input drop downs
       e.stopPropagation();
       e.preventDefault();
	}

}

function handleKeyUp(e){
	console.log("key UP: " + e.which);
	if(e.which == RIGHT_ARROW | e.which == LEFT_ARROW | e.which == UP_ARROW | e.which == DOWN_ARROW){
	var dataObj = {x: movingBox.x, y: movingBox.y};
	//create a JSON string representation of the data object
	var jsonString = JSON.stringify(dataObj);


	$.post("positionData", jsonString, function(data, status){
			console.log("data: " + data);
			console.log("typeof: " + typeof data);
			var wayPoint = JSON.parse(data);
			wayPoints.push(wayPoint);
			for(i in wayPoints) console.log(wayPoints[i]);
			});
	}

	if(e.which == ENTER){
	   handleSubmitButton(); //treat ENTER key like you would a submit
	   $('#userTextField').val(''); //clear the user text field
	}

	e.stopPropagation();
    e.preventDefault();


}

function handleSubmitButton () {

    let userText = $('#userTextField').val(); //get text from user text input field
	if(userText && userText != ''){
	   //user text was not empty


	   var userRequestObj = {text: userText}; //make object to send to server
       var userRequestJSON = JSON.stringify(userRequestObj); //make json string
	   $('#userTextField').val(''); //clear the user text field

	   //Prepare a POST message for the server and a call back function
	   //to catch the server repsonse.
       //alert ("You typed: " + userText);
	   $.post("userText", userRequestJSON, function(data, status){
			console.log("data: " + data);
			console.log("typeof: " + typeof data);
			var responseObj = JSON.parse(data);
			movingString.word = responseObj.text;
			//replace word array with new words if there are any
      words=[];
      chord_line = [];
      lyrics_line=[];

			if(responseObj.wordArray){
        words=chord_lyrics(responseObj.wordArray);

        for(let i in words){
          console.log("word is "+ words[i].word+" x: "+ words[i].x+" y: "+ words[i].y);
        }
				/*var lyrics="";
				 for(let a = 0; a<responseObj.wordArray.length; a++){
					 if(words[a].x==45){
						 lyrics += "<br>";
					 }
					 lyrics += words[a].word;
					 lyrics += " ";
					 console.log("x value: "+words[a].x);

				 }
				 console.log("lyrics: "+lyrics);

			   textDiv.innerHTML = textDiv.innerHTML + `<p> ${lyrics}</p>`;*/
			 }
			});
	}

}

function handleRefeshButton(){
  console.log("chord line: "+chord_line);
  console.log("lyrics line: "+lyrics_line);
  //find the closest proper y position for each word

  /*for(w of words){
    let needformat=false;

    for(let i=0; i<lyricLine; i++ ){
      if(lyricLine.contains(w.y)||chordLength.contains(w.y)){needformat=false;break;}
    }else{
      needformat=true;
    }

    if(needformat==true){
      reformat(w);
    }
function reformat(currentWord){
  let songline = []
  for(a of lyrics){songline.push(a)}
  for(a of chordLine){songline.push(a)}
  songline.sort(function(a,b){return a-b});


}*/
for(w of words){

    let orgional = w.x;
    let lines=[]
    //if the word is a chord, use chord line
    if(w.word.charAt(0)=='['){
      lines=chord_line;
    }else{lines=lyrics_line;}
      //find the line it should be on
      let closest_chord_line = lines.reduce(function(prev, curr){
        return (Math.abs(curr - w.y) < Math.abs(prev - w.y) ? curr : prev);
      });
      w.y=closest_chord_line;

      //getting all words on that line
      let theline = words.filter(function(words){
        return words.y==closest_chord_line;
      });
      //store x values in one array for comparison
      let xValueArray=[];
      for(i of theline){
        xValueArray.push(i.x);
      }
      //assign the closest x value to the word
      let newXvalue = xValueArray.reduce(function(prev, curr){
        return (Math.abs(curr - w.x) < Math.abs(prev - w.x) ? curr : prev);
      });
      w.x=newXvalue;
      console.log("xvalue: "+newXvalue);
      let wordWidth = canvas.getContext('2d').measureText(w.word).width;
      //increase x value of the rest of the line by length of the added word
      let restOftheLine = theline.filter(function(hahaha){
        return hahaha.x>=newXvalue;
      });

      restOftheLine.unshift(w);
      for(a of restOftheLine){console.log(a.word);}
      for(let i=1; i<restOftheLine; i++){
        if(restOftheLine[i].x!=orgional){
          restOftheLine[i].x+=wordWidth;
        }
      }
      //update the words array
      for(each of words){
        for(changed of restOftheLine){
          if(each.word==changed.word){
            each = changed;
          }
        }
      }


      /*for(let i=1; i<theline.length;i++){
        if(theline[i].x>=newXvalue){
          if(theline[i].x-theline[i-1].x<wordWidth+40){
            theline[i].x+=wordWidth;
          }
          if(w.word==theline[i].word){
            w=theline[i];
          }
        }
      }*/

    //if it is a lyric word, use lyrics line
    /*else{
      let closest_lyrics_line = lyrics_line.reduce(function(prev, curr){
        return (Math.abs(curr - w.y) < Math.abs(prev - w.y) ? curr : prev);
      });
      w.y=closest_lyrics_line;

      //getting all words on that line
      let theline = words.filter(function(words){
        return words.y==closest_lyrics_line;
      });
      //store all x values of that line in one array for comparison
      let xValueArray=[];
      for(i of theline){
        xValueArray.push(i.x);
      }
      //assign the closest x value to the word
      let newXvalue = xValueArray.reduce(function(prev, curr){
        return (Math.abs(curr - w.x) < Math.abs(prev - w.x) ? curr : prev);
      });
      w.x=newXvalue;

      //push the rest of the line back by length of the added word
      let wordWidth = canvas.getContext('2d').measureText(w.word).width/2;
      for(let i=1; i<theline.length;i++){
        if(theline[i].x>=newXvalue){
          if(theline[i].x-theline[i-1].x<wordWidth+40){
            theline[i].x+=wordWidth;
          }
          if(w.word==theline[i].word){
            w=theline[i];
          }
        }
      }
    }*/


  }

}

function handleSaveButton(){
  var text = '';
  let songline = []
  for(a of words){
    songline.push(a.x)}
  songline.sort(function(a,b){return a-b});
  for(i of songline){
    for(oneword of words){
      if(Object.values(oneword).includes(i)){
        text+=oneword.word;
        text+=" ";
      }
    }
    text+='\n';
  }

  let newsave = $('#userTextField').val();
  if(newsave && newsave != ''){
    var userRequestObj={text: "save", file: text, newfilename: newsave};
    var userRequestJSON = JSON.stringify(userRequestObj);
    $('#userTextField').val('');
    $.post("userText", userRequestJSON)
  }

}
//a function to split text file word by word and assign them x, y values
function chordPro(file){
  let words = [];
  let lines = file.split("\n");
  for(let i in lines){
    let aword = lines[i].split(" ")
    let textLength = 1;
    for(let j in aword){
      words.push({ word: aword[j], x: textLength*20+25, y: i*50+50});
      textLength += aword[j].length;
    }
  }
  return words;
}
function chord_lyrics(file){
  let textDiv = document.getElementById("text-area")
  let context = canvas.getContext('2d');

  let lines = file.split("\n");

  let yValue = 30;
  for(line of lines){
      let xValue = 20;

      //Write the line of lyrics beneath the search box
      textDiv.innerHTML = textDiv.innerHTML + `<p> ${line}</p>`

      // Dont bother wasting time on an empty line.
      if(line.length === 0) continue;

      let wordsInLine = line.split(/\s/);


      // Iterate over each word in the line
      for(aWord of wordsInLine){
          let chordsInThisWord = 0;
          let widthChordsNeed = 0;

          // Strip the words of their embedded chords and add them to the array to be drawn
          while (aWord.charAt(0)=='[' || aWord.indexOf('[') > -1 && (aWord.length - 1 > (aWord.indexOf(']') - aWord.indexOf('[')))  ){
        //if(aWord.charAt(0)=='['){
              chordsInThisWord += 1;

              let chord = '';
              let indexOfChord = aWord.indexOf('[');

              // Strip out the chord from the word
              chord = aWord.substring(indexOfChord,aWord.indexOf(']')+1);
              aWord = aWord.replace(/\b\[.+?\]|\[.+?\]\b|\[.+?\]/, '');

              // Offset to center the chord over the point in the word it should be played
              var xOffset = (indexOfChord * context.measureText(aWord.substring(0,indexOfChord)).width /
                             (indexOfChord + 1)) - context.measureText(chord).width /2;

              var chordWidth = context.measureText(chord).width;
              widthChordsNeed += chordWidth;

              // Offset the chord spacing if there are multiple chords so that they dont bunch up
              if(chordsInThisWord > 1) xOffset += chordWidth * (chordsInThisWord - 1);

              words.push({word:chord, x:xValue+xOffset, y:yValue-25});
              console.log("word y value: " + yValue);
          }

          words.push({word: aWord, x:xValue, y:yValue});

          // Calculate spacing after word
          xValue += 10 + context.measureText(aWord).width;
          if(chordsInThisWord > 1) xValue += widthChordsNeed/2 + 10;
      }
      chord_line.push(yValue-25);
      lyrics_line.push(yValue);
      yValue += 50;
  }
  return words;
  /*
  let result = '';
  let array = file.split("\n");
  var words = [];
  let chordLine = '';
  let lyricLine = '';
  let onechord = '';
  let spaces =0 ;
  let spaces2 = 0;
  let characterWidth = canvas.getContext('2d').measureText('m').width;

  for(let i=0; i<array.length; i++) {
     let line = array[i];
	 //console.log(line);
	 //console.log(typeof line);
	 let isReadingChord = false;
     chordLine = '';
	 lyricLine = '';
   spaces=0;
	 let chordLength = 0; //length of chord symbol
	 for(let charIndex = 0; charIndex < line.length; charIndex++) {
	    let ch = line.charAt(charIndex);
		if(ch === '['){isReadingChord = true; chordLength = 0;}
		if(ch === ']'){
      isReadingChord = false;
      words.push({word: onechord, x:spaces*characterWidth+20, y: 40+40*i+25*i})
       onechord = "";

     }
		if(!isReadingChord && ch != ']'){
	       lyricLine = lyricLine + ch;
		   if(chordLength > 0) chordLength--;  //consume chord sybol char
		   else{
         chordLine = chordLine + " ";   //pad chord line with blank
        spaces++;
     }
		}
		if(isReadingChord && ch != '['){
      onechord = onechord + ch;
      spaces+=1;
		   chordLine = chordLine + ch;
		   chordLength++;
		}
}

   //assign chord, lyrrics x/y sperately,
   //while chord[i]==" " x+=wordwith

   }

   result +=chordLine;
   result+= '\n';
   result += lyricLine;
   result+='\n';*/
  }

$(document).ready(function(){
	//This is called after the broswer has loaded the web page

	//add mouse down listener to our canvas object
	$("#canvas1").mousedown(handleMouseDown);

	//add key handler for the document as a whole, not separate elements.
	$(document).keydown(handleKeyDown);
	$(document).keyup(handleKeyUp);

	timer = setInterval(handleTimer, 100);
    //timer.clearInterval(); //to stop

	drawCanvas();
});
