'use strict';

var humps        = require('humps');
var camelizeKeys = humps.camelizeKeys;

var APIUtils = {

  API_ROOT: 'http://localhost:3000/api/v1/',

  getStreamUrl: function(track) {
    var streamUrl = this.API_ROOT + 'stream/' + track.source + '/' + encodeURIComponent(track.sourceParam);

    return streamUrl;
  },

  normalizeResponse: function(response) {
    return camelizeKeys(response.body);
  }

};

module.exports = APIUtils;