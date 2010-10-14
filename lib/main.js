/*
 *  main
 *
 *  Created by Rob Campbell on 2010-10-07.
 *  Copyright (c) 2010 . All rights reserved.
 */

const {Cc,Ci,Cm,Cr,Cu} = require("chrome");

var jsm = {};

// Cu.import("resource://gre/modules/XPCOMUtils.jsm", jsm);
Cu.import("resource://gre/modules/Services.jsm", jsm);

// var utils = exports.utils = jsm.XPCOMUtils;
var services = exports.services = jsm.Services;

exports.main = function (options, callbacks) {
  let gBrowser = services.wm.getMostRecentWindow("navigator:browser");
  let toolbar = gBrowser.document.getElementById("PersonalToolbar");
  toolbar.setAttribute("mode", "text");
};
