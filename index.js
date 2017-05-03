"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getAllTabs() {
    let tabs = [];
    return new Promise(resolve => {
        chrome.windows.getAll({ "populate": true }, (windows) => {
            for (let w of windows) {
                for (let t of w.tabs) {
                    tabs.push(t);
                }
            }
            resolve(tabs);
        });
    });
}
function getCurrentWindow() {
    return new Promise(resolve => {
        chrome.windows.getCurrent((currentWindow) => { resolve(currentWindow); });
    });
}
function mergeAllWindows(w, tabs) {
    for (let t of tabs) {
        if (w.id == t.windowId) {
            continue;
        }
        chrome.tabs.move(t.id, { "windowId": w.id, "index": -1 });
        if (t.pinned) {
            chrome.tabs.update(t.id, { "pinned": true });
        }
    }
}
function removeDupes(tabs) {
    let urls = [];
    for (let t of tabs) {
        let a = document.createElement('a');
        a.href = t.url;
        if (a.protocol != 'http:' && a.protocol != 'https:') {
            continue;
        }
        if (urls.indexOf(t.url) > -1) {
            closeTabs(t);
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
function closeTabs(tabs) {
    if (!Array.isArray(tabs)) {
        tabs = [tabs];
    }
    for (let t of tabs) {
        chrome.tabs.remove(t.id);
    }
}
document.addEventListener('DOMContentLoaded', () => __awaiter(this, void 0, void 0, function* () {
    let [tabs, currentWindow] = yield Promise.all([getAllTabs(), getCurrentWindow()]);
    let mainContent = document.getElementById('main-content');
    let domainTabContent = document.getElementById('domain-tab-content');
    let domainTabHeader = document.getElementById('domain-tab-header');
    let domainTabList = document.getElementById('domain-tab-list');
    let domainList = document.getElementById('domain-list');
    let btnMergeAll = document.getElementById('btn-merge-all');
    let btnRemoveDupes = document.getElementById('btn-remove-dupes');
    btnMergeAll.addEventListener('click', () => {
        mergeAllWindows(currentWindow, tabs);
        window.close();
    });
    btnRemoveDupes.addEventListener('click', () => {
        removeDupes(tabs);
        window.close();
    });
    let hosts = {};
    for (let t of tabs) {
        let a = document.createElement('a');
        a.href = t.url;
        if (a.protocol != 'http:' && a.protocol != 'https:') {
            continue;
        }
        if (!hosts[a.host]) {
            hosts[a.host] = {
                count: 0,
                favicon: t.favIconUrl,
                tabs: [],
            };
        }
        hosts[a.host].count += 1;
        hosts[a.host].tabs.push(t);
    }
    let imgbtn = (imgsrc) => {
        let ximg = document.createElement('img');
        ximg.src = imgsrc;
        ximg.width = 10;
        let closeBtn = document.createElement('button');
        closeBtn.appendChild(ximg);
        return closeBtn;
    };
    for (let h in hosts) {
        let dli = document.createElement('li');
        let wrap = document.createElement('div');
        let text = document.createElement('span');
        text.textContent = h;
        let small = document.createElement('small');
        small.textContent = hosts[h].count.toString();
        let fav = document.createElement('img');
        fav.src = hosts[h].favicon || 'icon.png';
        fav.width = 16;
        let closeBtn = imgbtn("x.png");
        wrap.appendChild(fav);
        wrap.appendChild(text);
        wrap.appendChild(small);
        dli.appendChild(wrap);
        dli.appendChild(closeBtn);
        domainList.appendChild(dli);
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTabs(hosts[h].tabs);
            dli.remove();
        });
        dli.addEventListener('click', () => {
            let domainTabs = hosts[h].tabs;
            if (hosts[h].count == 1) {
                focusTab(domainTabs[0]);
                window.close();
            }
            else {
                mainContent.innerHTML = '';
                domainTabContent.style.display = '';
                domainTabHeader.textContent = h;
                for (let domainTab of domainTabs) {
                    let dli = document.createElement('li');
                    let wrap = document.createElement('div');
                    let text = document.createElement('span');
                    text.textContent = domainTab.title;
                    let closeBtn = imgbtn("x.png");
                    wrap.appendChild(text);
                    dli.appendChild(wrap);
                    dli.appendChild(closeBtn);
                    closeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        closeTabs(domainTab);
                        dli.remove();
                    });
                    dli.addEventListener('click', () => {
                        focusTab(domainTab);
                        window.close();
                    });
                    domainTabList.appendChild(dli);
                }
            }
        });
    }
}));
