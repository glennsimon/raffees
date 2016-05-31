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
  var TOKENS_REMAINING = 'Tokens Remaining: ';

  // initially undefined vars
  /* var now;*/

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
  var navRight = querySelector('.raf-nav--right>i');
  var navLeft = querySelector('.raf-nav--left>i');
  var infoButton = querySelector('#raf-info');
  var menu = querySelector('.raf-menu');
  var drawer = querySelector('#raf-drawer');
  var obfuscator = querySelector('#raf-obfuscator');
  var love = querySelector('#raf-love>i');
  var tokenMessage = querySelector('#raf-token-message');

  // general initialized vars
  var raffleItems = [];
  var currentItem = 5;
  var tokens = 4;

  /* ** INITIALIZE ** */
  init();

  function init() {
    navLeft.addEventListener('click', moveOne);
    navRight.addEventListener('click', moveOne);
    infoButton.addEventListener('click', loadInfo);
    love.addEventListener('click', selectItem);
    menu.addEventListener('click', openDrawer);
    obfuscator.addEventListener('click', closeDrawer);
    // rafSplash.addEventListener('animationend', hideSplash);
    databaseRef.ref('activeItems').once('value', function(snapshot) {
      /* snapshot.forEach(function(childSnapshot) {
        raffleItems.push(childSnapshot.val());
      });*/
      // This only works if items are in order, with no missing indices
      raffleItems = snapshot.val();
      console.log(raffleItems);
      getRaffeesLogo();
      createLogoBoxes();
      populateHero(currentItem);
    });
    // This code is for uploading files - must change security rules to allow write
    // querySelector('#file').addEventListener('change', handleFileSelect, false);
  }

  function moveOne(evt) {
    var forward;
    var element;

    // evt.stopPropagation();
    // evt.preventDefault();
    // console.log(evt);
    tokenMessage.classList.remove('raf-token-msg-anim');
    element = evt.srcElement.localName === 'i' ?
      evt.srcElement : evt.children[0].srcElement;
    forward = element.innerText === 'keyboard_arrow_right';
    currentItem = forward ? currentItem + 1 : currentItem - 1;
    if (currentItem > raffleItems.length - 1) {
      currentItem = 0;
    }
    if (currentItem < 0) {
      currentItem = raffleItems.length - 1;
    }
    populateHero(currentItem);
    shiftLogos(forward);
    if (raffleItems[currentItem].selected) {
      love.style = 'color: gold;';
    } else {
      love.style = '';
    }
  }

  function shiftLogos(forward) {
    var stripContainer = querySelector('#raf-strip');
    var stripLogos = stripContainer.children;
    var removedLogo;

    // console.log(stripContainer);
    // console.log(stripLogos);
    // console.log(typeof stripLogos);

    if (forward) {
      removedLogo = stripLogos[0];
      stripContainer.removeChild(removedLogo);
      stripContainer.appendChild(removedLogo);
    } else {
      removedLogo = stripLogos[stripLogos.length - 1];
      stripContainer.removeChild(removedLogo);
      stripContainer.insertBefore(removedLogo, stripLogos[0]);
    }
  }

  function selectItem() {
    if (raffleItems[currentItem].selected) {
      love.style = '';
      delete raffleItems[currentItem].selected;
      tokens++;
    } else if (tokens > 0) {
      love.style = 'color: gold;';
      raffleItems[currentItem].selected = true;
      tokens--;
    }
    showTokensMessage();
    querySelector('#raf-token-count').textContent = tokens;
  }

  function showTokensMessage() {
    if (tokens > 1) {
      tokenMessage.textContent = 'You have ' + tokens + ' tokens left!';
    } else if (tokens > 0) {
      tokenMessage.textContent = 'You have ' + tokens + ' token left!';
    } else {
      tokenMessage.textContent = 'No more tokens. More tomorrow!';
    }
    tokenMessage.classList.add('raf-token-msg-anim');
  }

  function openDrawer() {
    obfuscator.classList.remove('raf-hidden');
    drawer.classList.remove('raf-closed');
    drawer.classList.add('raf-open');
  }

  function closeDrawer() {
    drawer.classList.remove('raf-open');
    drawer.classList.add('raf-closed');
    obfuscator.classList.add('raf-hidden');
  }

  function getRaffeesLogo() {
    var fileLocation;

    fileLocation = storageRef.child('images/raffees-token.PNG');
    fileLocation.getDownloadURL().then(function(url) {
      var tokenImage = querySelector('#raf-token__image');
      tokenImage.style.backgroundImage = 'url(' + url + ')';
    }).catch(function(error) {
      console.log('error:\n' + error);
      // do something here?
    });
  }

  function populateHero(itemNum) {
    var item = raffleItems[itemNum];
    var heroUrlFilename = item.heroUrl;
    var fileLocation;
    var menu = querySelector('.raf-menu>i');
    var share = querySelector('#raf-share>i');
    var name = querySelector('.raf-item-name');
    var info = querySelector('#raf-info>i');

    // console.log(heroUrlFilename);
    fileLocation =
      storageRef.child('images/Products/' + itemNum + '/' + heroUrlFilename);
    // console.log(fileLocation.bucket + '\n' + fileLocation.fullPath);
    fileLocation.getDownloadURL().then(function(url) {
      // console.log(url);
      querySelector('#raf-hero').style.backgroundImage = 'url(' + url + ')';
      querySelector('.raf-item-name').textContent = item.name;
      if (item.heroBackground === 'gray') {
        menu.classList.remove('raf-font--gray');
        share.classList.remove('raf-font--gray');
        love.classList.remove('raf-font--gray');
        name.classList.remove('raf-font--gray');
        info.classList.remove('raf-font--gray');
        menu.classList.add('raf-font--white');
        share.classList.add('raf-font--white');
        love.classList.add('raf-font--white');
        name.classList.add('raf-font--white');
        info.classList.add('raf-font--white');
      } else {
        menu.classList.remove('raf-font--white');
        share.classList.remove('raf-font--white');
        love.classList.remove('raf-font--white');
        name.classList.remove('raf-font--white');
        info.classList.remove('raf-font--white');
        menu.classList.add('raf-font--gray');
        share.classList.add('raf-font--gray');
        love.classList.add('raf-font--gray');
        name.classList.add('raf-font--gray');
        info.classList.add('raf-font--gray');
      }
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

  /* function populateLogos() {
    var itemNum;

    for (itemNum = 0; itemNum < raffleItems.length; itemNum++) {
      populateLogo(itemNum);
    }
  }*/

  function populateLogo(itemNum, logoElement) {
    var childString = 'images/Products/' + String(itemNum) + '/' +
      raffleItems[itemNum].logoUrl;
    storageRef.child(childString).getDownloadURL().then(function(url) {
      logoElement.style.backgroundImage = 'url(' + url + ')';
    }).catch(function(error) {
      console.log('error:\n' + error);
      // do something here?
    });
  }

  function loadInfo() {
    window.location.href = raffleItems[currentItem].siteUrl;
  }

  // This code is for uploading files - must change security rules to allow write
  /* function handleFileSelect(evt) {
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

  /* function hideSplash(e) {
    console.log(e.animationName);
    if (e.animationName === 'hide') {
      console.log(e);
      rafSplash.classList.add('raf-hidden');
    }
  }*/
})();
