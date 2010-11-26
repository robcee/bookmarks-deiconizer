/*
 *  main
 *
 *  Created by Rob Campbell on 2010-10-07.
 *  Copyright (c) 2010 . All rights reserved.
 */

const {Cc,Ci,Cm,Cr,Cu} = require("chrome");

var jsm = {};

Cu.import("resource://gre/modules/Services.jsm", jsm);

var services = exports.services = jsm.Services;

windowOpenedCallback = function(aSubject, aTopic, aObject) {
  if (aTopic != "domwindowopened")
    return; // wrong topic

  let win = aSubject.QueryInterface(Ci.nsIDOMEventTarget);
  win.addEventListener("DOMContentLoaded", function checkAndDeiconize() {
    win.removeEventListener("DOMContentLoaded", arguments.callee, false);
    if (win.location != "chrome://browser/content/browser.xul")
      return; // not our window

    deiconizeToolbar(win);
  }, false);
};

deiconizeToolbar = function(aWindow) {
  let toolbar = aWindow.document.getElementById("PersonalToolbar");
  toolbar.setAttribute("mode", "text");
};

exports.main = function (options, callbacks) {
  let recentBrowser = services.wm.getMostRecentWindow("navigator:browser");
  deiconizeToolbar(recentBrowser);
  services.ww.registerNotification(windowOpenedCallback, "domwindowopened", false);
};
