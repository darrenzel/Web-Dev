//Student name: Zelong Bian
//Student number: 101008568

var http = require("http"); //need to http
var fs = require("fs"); //need to read static files
var url = require("url"); //to parse url strings

//a function to split text file word by word and assign them x, y values
function splitfile(title){
  var words = [];
  var lines = fs.readFileSync('songs/'+title+'.txt').toString().split("\n");
  for(let i in lines){
    var aword = lines[i].split(" ")
    let textLength = 1;
    for(let j in aword){
      words.push({ word: aword[j], x: textLength*20+25, y: i*50+50});
      textLength += aword[j].length;
    }
  }
  return words;
}


var peacefulEasyFeeling = splitfile('Peaceful Easy Feeling');
var sisterGoldenHair = splitfile('Sister Golden Hair');
var brownEyedGirl = splitfile('Brown Eyed Girl');



var songs = {
  "Peaceful Easy Feeling": peacefulEasyFeeling,
  "Sister Golden Hair": sisterGoldenHair,
  "Brown Eyed Girl": brownEyedGirl
};

//Server Code


var counter = 1000; //to count invocations of function(req,res)

var ROOT_DIR = "html"; //dir to serve static files from

var MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript", //should really be application/javascript
  json: "application/json",
  png: "image/png",
  txt: "text/plain"
};

var get_mime = function(filename) {
  var ext, type;
  for (ext in MIME_TYPES) {
    type = MIME_TYPES[ext];
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return type;
    }
  }
  return MIME_TYPES["txt"];
};

http
  .createServer(function(request, response) {
    var urlObj = url.parse(request.url, true, false);
    console.log("\n============================");
    console.log("PATHNAME: " + urlObj.pathname);
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname);
    console.log("METHOD: " + request.method);

    var receivedData = "";

    //attached event handlers to collect the message data
    request.on("data", function(chunk) {
      receivedData += chunk;
    });

    //event handler for the end of the message
    request.on("end", function() {
      console.log("received data: ", receivedData);
      console.log("type: ", typeof receivedData);

      //if it is a POST request then echo back the data.
      if (request.method == "POST") {
        var dataObj = JSON.parse(receivedData);
        console.log("received data object: ", dataObj);
        console.log("type: ", typeof dataObj);
        //Here we can decide how to process the data object and what
        //object to send back to client.
        //FOR NOW EITHER JUST PASS BACK AN OBJECT
        //WITH "text" PROPERTY

        //TO DO: return the words array that the client requested
        //if it exists

        console.log("USER REQUEST: " + dataObj.text);

        var returnObj = {};

        if(Object.keys(songs).includes(dataObj.text)){
          returnObj.text = "FOUND";
          returnObj.wordArray= songs[dataObj.text];
        }
        else{
          returnObj.text = "NOT FOUND" + dataObj.text;
        }




        //object to return to client
        response.writeHead(200, { "Content-Type": MIME_TYPES["txt"] });
        response.end(JSON.stringify(returnObj)); //send just the JSON object
      }

      if (request.method == "GET") {
        //handle GET requests as static file requests
        var filePath = ROOT_DIR + urlObj.pathname;
        if (urlObj.pathname === "/") filePath = ROOT_DIR + "/index.html";

        fs.readFile(filePath, function(err, data) {
          if (err) {
            //report error to console
            console.log("ERROR: " + JSON.stringify(err));
            //respond with not found 404 to client
            response.writeHead(404);
            response.end(JSON.stringify(err));
            return;
          }
          response.writeHead(200, { "Content-Type": get_mime(filePath) });
          response.end(data);
        });
      }
    });
  })
  .listen(3000);

console.log("Server Running at http://127.0.0.1:3000  CNTL-C to quit");
