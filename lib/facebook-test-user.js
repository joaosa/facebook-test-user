/*
 * facebook-test-user
 * https://github.com/joaosa/facebook-test-user
 *
 * Copyright (c) 2013 João Sousa Andrade
 * Licensed under the MIT license.
 */

'use strict';

var $ = require('zepto-browserify').$,
  _ = require('underscore'),
  Q = require('q');

// zepto-specific overload
var zeptoGet = $.get;
$.get = function(url)  {
  var deferred = Q.defer();
  zeptoGet(url, function(resp) {
    deferred.resolve(resp);
  });
  return deferred.promise;
};

exports.Server = (function() {
  return {
    'login': function() {
      return Q.when('');
    }
  };
}());

// Test users - https://developers.facebook.com/docs/test_users/
// https://www.facebook.com/platform/test_account_login.php?user_id=100006315580269&n=zkTzK2fQgnGHtd9
exports.Facebook = (function() {
  var baseURL = 'https://graph.facebook.com/',
  reqPermissions = 'read_stream,user_location';

  return {
    login: function(clientID, clientSecret) {
      return Q.when($.get(baseURL + 'oauth/access_token?client_id=' +
                          clientID + '&client_secret=' +
                          clientSecret + '&grant_type=client_credentials'));
    },
    getTestUsers: function(clientID, accessToken) {
      return Q.when($.get(baseURL + clientID + '/accounts/test-users?' + accessToken)).then(function(resp) {
        return resp.data;
      });
    },
    getFriends: function(accessToken) {
      return Q.when($.get(baseURL + 'me/friends?access_token=' + accessToken)).then(function(resp) {
        return resp.data;
      });
    },
    getUser: function(accessToken) {
      return Q.when($.get(baseURL + 'me?access_token=' + accessToken));
    },
    hasAppInstalled: function(accessToken) {
      return Q.when($.get(baseURL + 'me?fields=installed&access_token=' + accessToken)).then(function(resp) {
        return resp.installed;
      });
    },
    changePermissions: function(accessToken, uid) {
      return Q.when($.post(baseURL + clientID +
                           '/accounts/test-users?installed=true&permissions=' +
                           reqPermissions + '&uid=' + uid + '&owner_access_token=' +
                           accessToken.split('access_token=')[1] + '&' + accessToken + '&method=post'));
    },
    getPermissions: function(accessToken) {
      return Q.when($.get(baseURL + 'me/permissions?access_token=' + accessToken)).then(function(resp) {
        return _.keys(resp.data[0]);
      });
    },
    checkPermissions: function(permissions) {
      return _.difference(reqPermissions.split(','), permissions).length !== 0;
    },
    getLocation: function(accessToken) {
      return Q.when($.get(baseURL + 'me?fields=location&access_token=' + accessToken)).then(function(resp) {
        var location = resp.location;
        // locations can be empty if not set on the user profile
        return location;
      });
    },
    getLocations: function(accessToken) {
      return Q.when($.get(baseURL + 'me/locations?access_token=' + accessToken)).then(function(resp) {
        return resp.data;
      });
    },
    makeFriends: function(u1, u2) {
      return Q.when(
        $.get(baseURL + u1.clientID() + '/friends/' + u2.clientID() + '?method=post&access_token=' + u1.accessToken())).then(function() {
        $.get(baseURL + u2.clientID() + '/friends/' + u1.clientID() + '?method=post&access_token=' + u2.accessToken());
      });
    }
  };
})();
