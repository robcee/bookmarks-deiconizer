/*
 *  bookmarks-deiconizer
 *
 *  This is free and unencumbered software released into the public domain.
 *
 *  Anyone is free to copy, modify, publish, use, compile, sell, or
 *  distribute this software, either in source code form or as a compiled
 *  binary, for any purpose, commercial or non-commercial, and by any
 *  means.
 *
 *  In jurisdictions that recognize copyright laws, the author or authors
 *  of this software dedicate any and all copyright interest in the
 *  software to the public domain. We make this dedication for the benefit
 *  of the public at large and to the detriment of our heirs and
 *  successors. We intend this dedication to be an overt act of
 *  relinquishment in perpetuity of all present and future rights to this
 *  software under copyright law.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 *  IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 *  OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 *  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 *  OTHER DEALINGS IN THE SOFTWARE.
 *
 *  For more information, please refer to <http://unlicense.org/>
 *
 *  Original Author:
 *    Rob Campbell <rcampbell@antennasoft.net>
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
