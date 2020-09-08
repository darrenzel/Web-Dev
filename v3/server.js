/*
Student:Zelong Bian #101008568
Student:Chengyi Song #101033544
*/
const express = require('express');
const app = express();
let http = require('http');
const PORT = process.env.PORT || 3000
const ROOT_DIR = '/public';
const API_KEY = '5ce64b2a4a4a4b6c77842737fe8cc0cc';

function sendRespnse(recipesData, res){
  //making a page with this style and format
  let data = JSON.parse(recipesData);
  var page = 	'<html><head><title>Assignment 4</title></head>' + '<body>' +
  '<style type="text/css">' +	'a {float: left; padding: 30px}' +	'form {padding: 30px; font-family: Arial; font-size: 50px}' +
	'body {background: #ffffff}' +'p {font-size: 20px}'  + '</style>' +
    '<form action="http://localhost:3000/recipes" method="get" align="right">' +
    'Ingredient:  <input name="ingredient"><br>' +'<input type="submit" value="search">' +
    '</form>'
    //fill the page with image and their titiles
  if(recipesData){
	for(var i=0; i < data.count; i++){
		page += '<a href="' + data.recipes[i].source_url + '" target="view_window" height=400 width=400>';
    page += '<img src= "' + data.recipes[i].image_url + '" alt = "food2fork" height=300 width=400 />';
		page += '<p>' + data.recipes[i].title +'</p>';
		page += '</a>';
	 }
  }
  page += '</body></html>'
  res.send(page);
}

//collect incoming data and send them to client
function parseRecipes(recipesRespones, res){
  let recipesData = ''
  recipesRespones.on('data', function (chunk) {
    recipesData += chunk
  })
  recipesRespones.on('end', function () {
    sendRespnse(recipesData, res)
  })
}

//use api key to get recipes from food2fork
function getRecipes(ingredient, res){
  const options = {
     host: 'www.food2fork.com',
     path: `/api/search?q=${ingredient}&key=${API_KEY}`
  }
  http.request(options, function(apiResponse){
    parseRecipes(apiResponse, res);
  }).end()
}

//using express middleware
app.all('*', function(req, res, next){
  console.log('-------------------------------');
  console.log('req.path: ', req.path);
  console.log('serving:' + __dirname + ROOT_DIR + req.path);
  next();
});

app.get('/', function (req, res) {
  getRecipes('cake', res);
})
app.get('/recipes', function (req, res) {
	var name = req.query.ingredient || 'cake';
	getRecipes(name, res);
})
app.get('/recipes.html', function (req, res) {
	var name = req.query.ingredient || 'cake';
	getRecipes(name, res);
})
app.get('/index.html', function (req, res) {
	var name = req.query.ingredient || 'cake';
	getRecipes(name, res);
})

//start server
app.listen(PORT, err => {
  if(err) console.log(err)
  else {console.log(`Server listening on port: ${PORT}`)}
})
