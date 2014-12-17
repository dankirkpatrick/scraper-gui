var http = Meteor.npmRequire('http');
/*
var zmq = Meteor.npmRequire('zmq');
var pushSocket = zmq.socket('push');
var pullSocket = zmq.socket('pull');
*/

/*
HTTP.methods({
    '/service/posts': {
        get: function(data) {
            console.log(data);
            var posts = Posts.find(data.selector, data.options);
            return JSON.stringify(Posts.find({}));
        },
        put: function(data) {
            // update post
        },
        post: function(data) {
            // insert post
        }
    }
});
*/

function updatePostScraped(id, msg) {
    var post = Posts.findOne(id);
    if (typeof post !== 'undefined') {
        if (typeof post.scrapeHistory === 'undefined') {
            post.scrapeHistory = [];
        }
        post.scrapeHistory.push(msg);
        Posts.update(
            { _id: id},
            { $set: {dateTime: msg.dateTime, location: msg.location} },
            function(err, count) {
                if (err) {
                    console.log("There was an error updating post");
                    throw err;
                }
                console.log("Updated " + count + " posts");
            }
        );
    } else {
        console.log('ERROR: could not find post with id: ' + id);
    }
};


Meteor.startup(function() {
    var boundUpdatePost = Meteor.bindEnvironment(updatePostScraped);
    var fs = Npm.require('fs');

/*
    pushSocket.bindSync('tcp://127.0.0.1:3010');
    console.log('Producer bound to port 3010');

    pullSocket.bindSync('tcp://127.0.0.1:3011');
    console.log('Worker connected to port 3011');

    pullSocket.on('message', function(msg) {
        console.log("Msg: " + msg);
        parsed = JSON.parse(msg.toString());
        boundUpdatePost(parsed.id, parsed.scrape);
    });
 */
});

Meteor.methods({
/*
    zmqServerScrape: function(id, url, title, scraper) {
        check(id, String);
        check(url, String);
        check(title, String);
        check(scraper, String);
        var msg = {"id":id,"url":url,"title":title,"scraper":scraper};
        console.log('Calling ZMQ scraping server for URL: ' + url);
        pushSocket.send(JSON.stringify(msg));
    },
 */
    httpServerScrape: function(id, url, title, scraper) {
        check(id, String);
        check(url, String);
        check(title, String);
        check(scraper, String);
        console.log('Calling HTTP scraping server for URL: ' + url);
        Meteor.http.call('POST', 'http://localhost:3020/' + scraper, {
                data: { 'id': id, 'url': url, 'title': title },
                headers: {'content-type':'application/json'}
            },
            function(err, res) {
                if (err) {
                    console.log('Error: ' + err.message);
                    throw err;
                }
                console.log('Scheduled scraping URL: ' + url);
            });
    }
});

