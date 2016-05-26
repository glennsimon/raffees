/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

var firebase = firebase || {};

/* eslint-env browser */
(function() {
  'use strict';

  var querySelector = document.querySelector.bind(document);

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // Check to see if there's an updated version of service-worker.js with
      // new files to cache:
      // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-registration-update-method
      if (typeof registration.update === 'function') {
        registration.update();
      }

      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }
  // Your custom JavaScript goes here

  // constants
  /* var CORRECT_ANSWER_TEXT = 'Good job!';
  var CORRECT_ANSWER_SYM = 'check';
  var WRONG_ANSWER_TEXT = 'Oooo, no. Sorry!';
  var WRONG_ANSWER_SYM = 'close';
  var RIGHT = 'right';
  var WRONG = 'wrong';
  var PASS_TEXT = 'You passed!';
  var PASS_SYM = 'sentiment_neutral';
  var NEW = 'new';
  var LIMBO = 'limbo';
  var LOCKED = 'locked';
  var NUM_J_CATS = 14209;
  var NUM_DJ_CATS = 13631;
  var NUM_FJ_CATS = 3593;*/

  // initially undefined vars
  /* var now;
  var today;
  var gameMonday;
  var weekStart;
  var gameArray;
  var gameResultsObject;
  var userResultsObject;
  var fbGameLocation;
  var dayIndex;
  var connection;
  var userId;
  var connected;
  var qIndex;
  var practiceQ;*/

  // firebase vars
  var config = {
    apiKey: 'AIzaSyCnKyiGWhuCCpmmulm7KgXZ9CFVVafhxzM',
    authDomain: 'raffees.firebaseapp.com',
    databaseURL: 'https://raffees.firebaseio.com',
    storageBucket: 'project-7820448091501737461.appspot.com'
  };
  firebase.initializeApp(config);

  var storage = firebase.storage();
  var storageRef = storage.ref();
  var databaseRef = firebase.database();

  // elements in index.html
  var rafSplash = querySelector('#raf-splash');

  // general initialized vars
  var raffleItems = [];
  var currentItem = 5;
  /* var loggedIn = false;
  var todaysQs = [];*/

  /* ** INITIALIZE ** */
  init();

  function init() {
    databaseRef.ref('activeItems').once('value', function(snapshot) {
      /*snapshot.forEach(function(childSnapshot) {
        raffleItems.push(childSnapshot.val());
      });*/
      //This only works if items are in order, with no missing indexes
      raffleItems = snapshot.val();
      console.log(raffleItems);
      populateHero();
      createLogoBoxes();
      //populateLogos();
    });
    //This code is for uploading files - must change security rules to allow write
    //querySelector('#file').addEventListener('change', handleFileSelect, false);
  }

  function populateHero() {
    var heroUrlFilename = raffleItems[5].heroUrl;
    var fileLocation;

    //console.log(heroUrlFilename);
    fileLocation = storageRef.child('images/Products/5/' + heroUrlFilename);
    //console.log(fileLocation.bucket + '\n' + fileLocation.fullPath);
    fileLocation.getDownloadURL().then(function(url) {
      //console.log(url);
      querySelector('#raf-hero').style.backgroundImage = 'url(' + url + ')';
    }).catch(function(error) {
      console.log('error:\n' + error);
      // do something here?
    });
  }

  function createLogoBoxes() {
    var itemNum;
    var logoElement;
    var container = querySelector('#raf-strip');

    for (itemNum = 0; itemNum < raffleItems.length; itemNum++) {
      logoElement = document.createElement('div');
      logoElement.style.backgroundSize = raffleItems[itemNum].logoWidth;
      logoElement.classList.add('raf-strip__logo');
      container.appendChild(logoElement);
      populateLogo(itemNum, logoElement);
    }
  }

  function populateLogos() {
    var itemNum;

    for (itemNum = 0; itemNum < raffleItems.length; itemNum++) {
      populateLogo(itemNum);
    }
  }

  function populateLogo(itemNum, logoElement) {
    //var logoElement;
    //var elementId;
    var fileLocation;

    fileLocation = storageRef.child('images/Products/' + String(itemNum) + '/' + raffleItems[itemNum].logoUrl);
    //console.log(fileLocation.bucket + '\n' + fileLocation.fullPath);
    storageRef.child('images/Products/' + String(itemNum) + '/' + raffleItems[itemNum].logoUrl).getDownloadURL().then(function(url) {
      //elementId = '#raf-strip__' + String(100 + itemNum).slice(1);
      //console.log(elementId);
      //logoElement = querySelector(elementId);
      logoElement.style.backgroundImage = 'url(' + url + ')';
    }).catch(function(error) {
      console.log('error:\n' + error);
      // do something here?
    });
  }

  /*function handleFileSelect(evt) {
    var i, file;
    var files = evt.target.files;
    var itemNumber = '9';

    evt.stopPropagation();
    evt.preventDefault();

    for (i = 0; i < files.length; i++) {
      file = files[i];
      var metadata = {
        'contentType': file.type
      }
      var uploadTask = storageRef.child('images/Products/' + itemNumber + '/').child(file.name).put(file, metadata);
      uploadTask.on('state_changed', null, function(error) {
        console.error('Upload failed:', error);
      }, function() {
        console.log(uploadTask.snapshot.totalBytes, ' bytes.');
        console.log(uploadTask.snapshot.metadata);
      });
    }
  }*/

  rafSplash.addEventListener('animationend', hideSplash, false);

  function hideSplash(e) {
    if (e.animationName === 'hide') {
      console.log(e);
      rafSplash.classList.add('raf-hidden');
    }
  }
})();
