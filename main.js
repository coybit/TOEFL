var natural = require('natural');
var extractor = require('unfluff');
var request = require('request');
var fs = require('fs');
var words = require('./words.js').words;
var express = require('express')  
var app = express()  
var port = 3000

/*
	Configurating and running server
*/
app.use(express.static(__dirname + '/public'));

app.listen(port, function(err) {  
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log('server is listening on ' + port )
})


/*
	URL handlers
*/
app.get('/', function(request, response)  {  
  response.sendfile('index.html')
})

app.get('/compare', function(request, response)  {  
	var url = request.query.url;

	downloadTextFrom( url, function(content) {

		var res = compare(words,createWordsListFrom(content));

		fs.appendFile('history.txt', url + ',' + res + '\n', function (err) {

			response.send( res );

		});

		

	});

  
})

/*

*/
function compare(words1,words2) {
	var sameWords = words2.filter(function(item, pos) {
    	return words1.indexOf(item) != -1;
	});

	var diffWords = words2.filter(function(item, pos) {
    	return words1.indexOf(item) == -1;
	});

	return '%' + (100 * sameWords.length / words2.length);
}

function downloadTextFrom(url, callback) {
	request(url, function(error, response, html){
        if(!error){
        	data = extractor(html);
			callback(data.text);
        }
        else {
        	console.log(error);
        }
	});
}

function loadTextFrom(filename, callback) {

	var txt = ''

	console.log('Reading ' + filename );

	fs.createReadStream(filename)
	.on('data', function (data) {
	  txt += data;
	})
	.on('end', function (err) {
	  callback(txt);
	})
	.on('error', function (err) {
	  console.error(err);
	});
}

function createWordsListFrom(txt) {

	tokenizer = new natural.WordTokenizer();
	var words = tokenizer.tokenize(txt).map( function(w) { 
		return natural.PorterStemmer.stem(w.toLowerCase())
	})
	var finalWords = words.filter(function(item, pos) {
	    return words.indexOf(item) == pos;
	}).sort();


	console.log('Words: ' + finalWords.length);

	return finalWords;

	/*
	var punctuationless = txt.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ").trim();
	var finalString = punctuationless.replace(/[\r\n\t]/g," ").replace(/\s{2,}/g," ");
	var words = finalString.split(' ').map( function(w) { return w.toLowerCase() })
	var finalWords = words.filter(function(item, pos) {
	    return words.indexOf(item) == pos;
	}).sort();
	*/
}
