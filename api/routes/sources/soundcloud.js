'use strict';

var path    = require('path');
var qs      = require('querystring');
var Q       = require('q');
var request = require('request');
var _       = require('underscore');
var SC      = require('node-soundcloud');
var config  = require(path.join(__dirname, '../../../config'));

/* ====================================================== */

SC.init({
  id: config.soundcloud.id,
  secret: config.soundcloud.secret
});

/* ====================================================== */

exports.redirect = function(req, res) {

  var code = req.query.code;

  // authorize and get an access token
  SC.authorize(code);

  res.status(200);

};

/* ====================================================== */

exports.search = function(query, limit) {

  var mainDeferred = Q.defer();

  var getSearchResults = function(searchQuery) {
    var deferred = Q.defer();
    var queryUrl = '/tracks?';
    var searchParameters = {
      q: searchQuery.replace(/(%20)|( )/gi, '+'),
      limit: limit
    };
    var searchResults;

    queryUrl += qs.stringify(searchParameters);

    SC.get(queryUrl, function(err, results) {
      if ( err ) {
        deferred.reject(err);
      } else {
        // process each search result
        searchResults = _.map(results, function(item) {
          return {
            source: 'soundcloud',
            title: item.title,
            image: item.artwork_url ? item.artwork_url : null,
            sourceParam: item.id
          };
        });

        deferred.resolve(searchResults);
      }
    });

    return deferred.promise;
  };

  getSearchResults(query).then(function(results) {
    mainDeferred.resolve(results);
  }, function() {
    mainDeferred.reject('Unable to retrieve Soundcloud search results.');
  });

  return mainDeferred.promise;

};

/* ====================================================== */

exports.stream = function(req, res) {

  var getTrack = function(trackId) {
    var deferred = Q.defer();

    var queryUrl = '/tracks/' + trackId + '/stream';

    SC.get(queryUrl, function(err, trackInfo) {
      if ( err ) {
        deferred.reject(err);
      } else {
        deferred.resolve(request.get(trackInfo.location));
      }

      deferred.resolve(request.get(trackInfo.location));
    });

    return deferred.promise;
  };

  getTrack(req.params.trackId).then(function(track) {
    track.pipe(res);
  }, function(err) {
    res.status(500).send(err);
  });

};