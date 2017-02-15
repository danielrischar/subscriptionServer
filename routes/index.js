var express = require('express');
var router = express.Router();
var PubNub = require('pubnub');
var pubnubconfig = require('../.pubnubconfig'); // Contains the publish and subscribe keys for pubnub

var pubnub = new PubNub({
  publish_key: pubnubconfig.publish_key,
  subscribe_key: pubnubconfig.subscribe_key
});

function publish(channel, message, contents) {
  pubnub.publish({
      channel: channel,
      message: {
        message: message,
        contents: contents
      }
    });
}
/* GET home page. */

router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/**
 * Performs verification for subscriptions
 */
router.get('/subs', function(req, res) {
  var params = require('url').parse(req.url, true, true);
  
  var channel = params.query['channel'];
  var challenge = params.query['hub.challenge'];

  publish(channel, "VERIFICATION", { challenge: challenge, channel: channel });

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(challenge);
});

/**
 * Converts a Wink pubsubhubbub style notification into a PubNub notification
 */
router.post('/subs', function(req, res) {
  var params = require('url').parse(req.url, true, true);
  var channel = params.query['channel'];

  // Publish headers and body synchronously
  publish(channel, "NOTIFICATION", { headers: req.headers, body: req.body });
  
  res.status("200").send("Success");
});

module.exports = router;
