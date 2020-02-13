var http 	= require("http");
var cheerio = require("cheerio");
var fs 		= require("fs");

var url 	= "http://www.9900rt.org/html/yazhou/2020/0208/8940.html";
var path	= "E:/*";
var dlFiles = "*";


function requestForNum(url, num, init, callback, options) {
	http.get(url, function(res) {
		var html = "";

		if(init && init != null) { init(res); }

		res.on("data", function(data) {
			html += data;
		});

		res.on("end", function() {
			callback(html, options);
		});
	}).on("error", function() {
		console.log("Cant get response from URL, " +
			"start the next request, rest num " + (num--));
		if(num > 0) {
			requestForNum(url, num, null, callback, options);
		} else {
			console.log("Cant connect to the url, please check the internet");
		}
	});
}

function downloadImg(imgUrl) {
	// console.log(imgUrl);
	var imgNam = imgUrl.split("/").pop();
	if(typeof dlFiles === "string") {
		if(dlFiles !== "*" && dlFiles !== imgNam) {
			return;
		}
	} else {
		if(!dlFiles.includes(imgNam)) {
			return;
		}
	}

	requestForNum(imgUrl, 5, function(res) {
		res.setEncoding("binary");
	}, function(img) {
		fs.writeFile(path.concat(imgNam), img, "binary", function(err) {
			if(err) {
				console.log("Image download failed!");
			} else {
				console.log("Image " + imgNam + " downloaded");
			}
		});
	});
}

function parseHtml(html, options) {
	var $		= cheerio.load(html);
	var $numPgs	= $(".main .a1").last().prev().text();
	var $imgDiv	= $($(".main").children("div")[1]);
	var $imgAry = $imgDiv.find("img");

	for(var j = 0; j < $imgAry.length; ++j) {
		downloadImg($($imgAry[j]).attr("src"));
	}

	var i = options.i + 1;
	if(i >= $numPgs) { return; }
	var newUrl = url.replace(".html", "_" + i + ".html");
	requestForNum(newUrl, 10, null, parseHtml, {i:i});
}

requestForNum(url, 10, null, parseHtml, {i:1});
