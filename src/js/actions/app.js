'use strict';

var Reflux     = require('reflux');
var Q          = require('q');
var superagent = require('superagent');

var actions = Reflux.createActions({
  'load':                 { asyncResult: true },
  'loadCurrentChallange': { asyncResult: true },
  'loadTopics':           { asyncResult: true },
});

//Load
actions.load.listenAndPromise(function(params) {
  return Q.resolve({
    background: "/img/backgrounds/1.jpg",
    "name": "John Doe",
    "token": "<authentication token>"
  });
  //http://private-6cea5-soundofscience.apiary-mock.com/api/v1/session
  //{
  //  "access_token" : "<oauth access token>",
  //  "provider" : "<oauth access provider>",
  //  "device_vendor" : "web",
  //  "notification_key" : "GCM or Push Notification Key"
  //}
});

actions.loadTopics.listenAndPromise(function() {
  var deferred = Q.defer();

  superagent
    .get("http://private-6cea5-soundofscience.apiary-mock.com/api/v1/topics")
    .end(function(err, res) {
      var data;

      if (err) {
        //TODO: handle errors here
      }

      data = res.body.map(function(el) {
        return {
          id: el.id,
          title: el.title,
          views: el.vote_count,
          status: el.liked
        };
      });

      deferred.resolve(data);
  });

  return deferred.promise;
});

module.exports = actions;
