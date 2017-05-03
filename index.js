"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
function mergeAllWindows(w, tabs) {
    for (var _i = 0, tabs_1 = tabs; _i < tabs_1.length; _i++) {
        var t = tabs_1[_i];
        if (w.id == t.windowId) {
            continue;
        }
        chrome.tabs.move(t.id, { "windowId": w.id, "index": -1 });
        if (t.pinned) {
            chrome.tabs.update(t.id, { "pinned": true });
        }
    }
}
function getAllTabs() {
    var tabs = [];
    return new Promise(function (resolve) {
        chrome.windows.getAll({ "populate": true }, function (windows) {
            var urls = {};
            for (var _i = 0, windows_1 = windows; _i < windows_1.length; _i++) {
                var w = windows_1[_i];
                for (var _a = 0, _b = w.tabs; _a < _b.length; _a++) {
                    var t = _b[_a];
                    tabs.push(t);
                }
            }
            resolve(tabs);
        });
    });
}
function getCurrentWindow() {
    return new Promise(function (resolve) {
        chrome.windows.getCurrent(function (currentWindow) { resolve(currentWindow); });
    });
}
function removeDupes(tabs) {
    var urls = [];
    for (var _i = 0, tabs_2 = tabs; _i < tabs_2.length; _i++) {
        var t = tabs_2[_i];
        var a = document.createElement('a');
        a.href = t.url;
        if (a.protocol != 'http:' && a.protocol != 'https:') {
            continue;
        }
        if (urls.indexOf(t.url) > -1) {
            chrome.tabs.remove(t.id);
        }
        else {
            urls.push(t.url);
        }
    }
}
function focusTab(tab) {
    chrome.tabs.update(tab.id, { selected: true });
    chrome.windows.update(tab.windowId, { focused: true });
}
document.addEventListener('DOMContentLoaded', function () { return __awaiter(_this, void 0, void 0, function () {
    var mainContent, domainTabContent, domainTabHeader, domainTabList, domainList, btnMergeAll, btnRemoveDupes, tabs, currentWindow, hosts, _i, tabs_3, t, a, imgbtn, _loop_1, h;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mainContent = document.getElementById('main-content');
                domainTabContent = document.getElementById('domain-tab-content');
                domainTabHeader = document.getElementById('domain-tab-header');
                domainTabList = document.getElementById('domain-tab-list');
                domainList = document.getElementById('domain-list');
                btnMergeAll = document.getElementById('btn-merge-all');
                btnRemoveDupes = document.getElementById('btn-remove-dupes');
                return [4 /*yield*/, getAllTabs()];
            case 1:
                tabs = _a.sent();
                return [4 /*yield*/, getCurrentWindow()];
            case 2:
                currentWindow = _a.sent();
                btnMergeAll.addEventListener('click', function () {
                    mergeAllWindows(currentWindow, tabs);
                    window.close();
                });
                btnRemoveDupes.addEventListener('click', function () {
                    removeDupes(tabs);
                    window.close();
                });
                hosts = {};
                for (_i = 0, tabs_3 = tabs; _i < tabs_3.length; _i++) {
                    t = tabs_3[_i];
                    a = document.createElement('a');
                    a.href = t.url;
                    if (a.protocol != 'http:' && a.protocol != 'https:') {
                        continue;
                    }
                    if (!hosts[a.host]) {
                        hosts[a.host] = {
                            count: 0,
                            favicon: t.favIconUrl,
                            tabs: []
                        };
                    }
                    hosts[a.host].count += 1;
                    hosts[a.host].tabs.push(t);
                }
                imgbtn = function (imgsrc) {
                    var ximg = document.createElement('img');
                    ximg.src = imgsrc;
                    ximg.width = 10;
                    var closeBtn = document.createElement('button');
                    closeBtn.appendChild(ximg);
                    return closeBtn;
                };
                _loop_1 = function (h) {
                    var dli = document.createElement('li');
                    var text = document.createElement('span');
                    text.textContent = h;
                    var small = document.createElement('small');
                    small.textContent = hosts[h].count.toString();
                    var fav = document.createElement('img');
                    fav.src = hosts[h].favicon || 'icon.png';
                    fav.width = 16;
                    var closeBtn = imgbtn("x.png");
                    dli.appendChild(fav);
                    dli.appendChild(text);
                    dli.appendChild(closeBtn);
                    dli.appendChild(small);
                    domainList.appendChild(dli);
                    closeBtn.addEventListener('click', function () {
                        for (var _i = 0, _a = hosts[h].tabs; _i < _a.length; _i++) {
                            var t = _a[_i];
                            chrome.tabs.remove(t.id);
                        }
                        window.close();
                    });
                    dli.addEventListener('click', function () {
                        var domainTabs = hosts[h].tabs;
                        if (hosts[h].count == 1) {
                            focusTab(domainTabs[0]);
                            window.close();
                        }
                        else {
                            mainContent.style.display = 'none';
                            domainTabContent.style.display = '';
                            domainTabHeader.textContent = h;
                            var _loop_2 = function (t) {
                                var dli_1 = document.createElement('li');
                                var text_1 = document.createElement('span');
                                text_1.textContent = t.title;
                                var closeBtn_1 = imgbtn("x.png");
                                dli_1.appendChild(text_1);
                                dli_1.appendChild(closeBtn_1);
                                dli_1.addEventListener('click', function () {
                                    focusTab(t);
                                    window.close();
                                });
                                domainTabList.appendChild(dli_1);
                            };
                            for (var _i = 0, domainTabs_1 = domainTabs; _i < domainTabs_1.length; _i++) {
                                var t = domainTabs_1[_i];
                                _loop_2(t);
                            }
                        }
                    });
                };
                for (h in hosts) {
                    _loop_1(h);
                }
                return [2 /*return*/];
        }
    });
}); });
