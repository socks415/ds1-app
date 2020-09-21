/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

function openInAppBrowser(baseUrl, url) {
  var ref = cordova.InAppBrowser.open(
    baseUrl + url,
    "_blank",
    "location=no,fullscreen=yes"
  );
  ref.addEventListener("loaderror", function () {
    ref.close();
    localStorage.removeItem("baseURL");
    alert(
      "Unable to load the address, please check your connection or enter the URL again."
    );
  });
  ref.addEventListener("loadstop", function () {
    ref.executeScript({
      code: "localStorage.removeItem('closeApp');",
    });
    setInterval(function () {
      ref.executeScript(
        {
          code: "localStorage.getItem('postfixUrl');",
        },
        function (values) {
          var postfixUrl = values[0];
          if (
            postfixUrl !== null &&
            postfixUrl !== "" &&
            postfixUrl !== localStorage.getItem("postfixUrl")
          ) {
            localStorage.setItem("postfixUrl", postfixUrl);
            openInAppBrowser(baseUrl, postfixUrl);
          }
        }
      );
      ref.executeScript(
        {
          code: "localStorage.getItem('closeApp');",
        },
        function (values) {
          var closeApp = values[0];
          if (closeApp !== null && closeApp !== "" && closeApp === "true") {
            ref.executeScript({
              code: "localStorage.getItem('closeApp', 'false');",
            });
            setTimeout(() => {
              navigator.app.exitApp();
            }, 500);
          }
        }
      );
    }, 500);
  });
}

function openBrowser() {
  var input = document.getElementById("url");
  // if baseURL already exists
  if (
    localStorage.getItem("baseUrl") !== "" &&
    localStorage.getItem("baseUrl") !== null
  ) {
    // Update the postfixUrl to have a # if doesn't exists
    var postfixUrl = localStorage.getItem("postfixUrl");
    if (postfixUrl != "null" && postfixUrl != null && postfixUrl !== "") {
      postfixUrl =
        postfixUrl.indexOf(0) !== "#" ? "#" + postfixUrl : postfixUrl;
    } else if (postfixUrl === null || postfixUrl == "null") {
      postfixUrl = "";
    }

    // open the app in the browser
    openInAppBrowser(localStorage.getItem("baseUrl"), postfixUrl);
    input.value = localStorage.getItem("baseUrl");
    // else
  } else {
    // Set input's default value
    input.value = "http://192.168.4.1";
  }
}

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener("deviceready", onDeviceReady, false);

function updateBaseUrl() {
  var input = document.getElementById("url");
  localStorage.setItem("baseUrl", input.value);
  openBrowser();
  return false;
}

function onDeviceReady() {
  cordova.plugins.autoStart.enable();
  document.getElementById("deviceready").classList.add("ready");
  var button = document.getElementById("submit");
  var input = document.getElementById("url");

  // Try to open the browser if existing user
  openBrowser();
  // On button submit store baseUrl and open the app
  button.addEventListener("click", () => {
    updateBaseUrl();
  });
  input.addEventListener("keyup", function (event) {
    console.log(event);
    if (event.keyCode === 13) {
      event.preventDefault();
      updateBaseUrl();
    }
  });
}
