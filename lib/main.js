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

var originalMode = "";

/**
 * Popup shown listener for the editBookmarkPanel
 */
var starPanelShown = function(event) {
  let doc = event.target.ownerDocument;

  if (event.target != doc.getElementById("editBookmarkPanel"))
    return;

  deiconizeToolbar(doc);
};

/**
 * Callback (observer) installed on nsIWindowWatcher.
 */
var windowOpenedCallback = function(aSubject, aTopic, aObject) {
  if (aTopic != "domwindowopened")
    return; // wrong topic

  let win = aSubject.QueryInterface(Ci.nsIDOMEventTarget);
  win.addEventListener("DOMContentLoaded", function checkAndDeiconize() {
    win.removeEventListener("DOMContentLoaded", arguments.callee, false);
    if (win.location != "chrome://browser/content/browser.xul")
      return; // not our window

    deiconizeToolbar(win.document);
    let starPanel = win.document.getElementById("editBookmarkPanel");
    starPanel.addEventListener("popupshown", starPanelShown(event), false);
  }, false);
};

/**
 * deiconizeToolbar. Called when initialized or when a new window is opened.
 * Changes the Bookmarks Toolbar to text mode.
 *
 * @param aDocument
 *        The XUL Document of a browser window.
 */
var deiconizeToolbar = function(aDocument) {
  let toolbar = aDocument.getElementById("PersonalToolbar");
  originalMode = toolbar.getAttribute("mode");
  toolbar.setAttribute("mode", "text");
};

/**
 * reiconizeToolbar. Called when disabling the deiconizer. Restore bookmarks
 * toolbar to its previous iconified state.
 *
 * @param aDocument
 *        The XUL Document for a browser window
 */
var reiconizeToolbar = function(aDocument) {
  let toolbar = aDocument.getElementById("PersonalToolbar");
  toolbar.setAttribute("mode", originalMode);
};

/**
 * main addon code
 */
exports.main = function(options, callbacks) {
  let xulWindows = services.wm.getXULWindowEnumerator(null);

  while(xulWindows.hasMoreElements()) {
    let recentBrowser = xulWindows.getNext();
    let docShell = recentBrowser.QueryInterface(Ci.nsIXULWindow).docShell;
    let containedDocShells = docShell.getDocShellEnumerator(
                              Ci.nsIDocShellTreeItem.typeChrome,
                              Ci.nsIDocShell.ENUMERATE_FORWARDS);

    while (containedDocShells.hasMoreElements()) {
      // Get the corresponding document for this docshell
      let childDocShell = containedDocShells.getNext();

      let childDoc = childDocShell.QueryInterface(Ci.nsIDocShell)
                      .contentViewer.DOMDocument;

      if (childDoc.location.href == "chrome://browser/content/browser.xul") {
        deiconizeToolbar(childDoc);
        let starPanel = childDoc.getElementById("editBookmarkPanel");
        starPanel.addEventListener("popupshown", starPanelShown, false);
      }
    }
  }

  services.ww.registerNotification(windowOpenedCallback, "domwindowopened", false);
};

/**
 * Called when addon is uninstalled, disabled, upgraded or downgraded.
 *
 * @param String reason for the unload
 */
exports.onUnload = function(reason) {
  let xulWindows = services.wm.getXULWindowEnumerator(null);

  while(xulWindows.hasMoreElements()) {
    let recentBrowser = xulWindows.getNext();
    let docShell = recentBrowser.QueryInterface(Ci.nsIXULWindow).docShell;
    let containedDocShells = docShell.getDocShellEnumerator(
                              Ci.nsIDocShellTreeItem.typeChrome,
                              Ci.nsIDocShell.ENUMERATE_FORWARDS);

    while (containedDocShells.hasMoreElements()) {
      // Get the corresponding document for this docshell
      let childDocShell = containedDocShells.getNext();

      let childDoc = childDocShell.QueryInterface(Ci.nsIDocShell)
                      .contentViewer.DOMDocument;

      if (childDoc.location.href == "chrome://browser/content/browser.xul") {
        reiconizeToolbar(childDoc);
        let starPanel = childDoc.getElementById("editBookmarkPanel");
        starPanel.removeEventListener("popupshown", starPanelShown, false);
      }
    }
  }

  services.ww.unregisterNotification(windowOpenedCallback);
};
