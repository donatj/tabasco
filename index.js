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
    const tabs = [];
    return new Promise((resolve) => {
        chrome.windows.getAll({ populate: true }, (windows) => {
            for (const w of windows) {
                for (const t of w.tabs || []) {
                    tabs.push(t);
                }
            }
            resolve(tabs);
        });
    });
}
function getCurrentWindow() {
    return new Promise((resolve) => {
        chrome.windows.getCurrent((currentWindow) => { resolve(currentWindow); });
    });
}
function mergeAllWindows(w, tabs) {
    for (const t of tabs) {
        if (w.id == t.windowId || !t.id) {
            continue;
        }
        chrome.tabs.move(t.id, { windowId: w.id, index: -1 });
        if (t.pinned) {
            chrome.tabs.update(t.id, { pinned: true });
        }
    }
}
function removeDupes(tabs) {
    const urls = [];
    for (const t of tabs) {
        const a = document.createElement('a');
        if (!t.url) {
            continue;
        }
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
    if (!tab.id) {
        return;
    }
    chrome.tabs.update(tab.id, { selected: true });
    chrome.windows.update(tab.windowId, { focused: true });
}
function closeTabs(tabs) {
    if (!Array.isArray(tabs)) {
        tabs = [tabs];
    }
    for (const t of tabs) {
        if (!t.id) {
            continue;
        }
        chrome.tabs.remove(t.id);
    }
}
class TabLiButtonController {
    constructor(icon) {
        this.button = document.createElement('button');
        const img = document.createElement('img');
        img.src = icon;
        img.width = 10;
        this.button.appendChild(img);
    }
    getElement() {
        return this.button;
    }
    onClick(listener) {
        this.button.addEventListener('click', listener);
    }
}
class TabLiController {
    constructor(textContent, subtextContent = "", icon = "") {
        this.li = document.createElement('li');
        const wrap = document.createElement('div');
        const text = document.createElement('span');
        text.textContent = textContent;
        const fav = document.createElement('img');
        fav.src = icon;
        wrap.appendChild(fav);
        wrap.appendChild(text);
        if (subtextContent) {
            const small = document.createElement('small');
            small.textContent = subtextContent;
            wrap.appendChild(small);
        }
        this.li.appendChild(wrap);
    }
    addTabButton(btn) {
        this.li.appendChild(btn.getElement());
    }
    getElement() {
        return this.li;
    }
    remove() {
        this.li.remove();
    }
    onClick(listener) {
        this.li.addEventListener('click', listener);
    }
}
document.addEventListener('DOMContentLoaded', () => __awaiter(this, void 0, void 0, function* () {
    const [tabs, currentWindow] = yield Promise.all([getAllTabs(), getCurrentWindow()]);
    const mainContent = document.getElementById('main-content');
    const domainTabContent = document.getElementById('domain-tab-content');
    const domainTabHeader = document.getElementById('domain-tab-header');
    const domainTabList = document.getElementById('domain-tab-list');
    const domainList = document.getElementById('domain-list');
    const btnMergeAll = document.getElementById('btn-merge-all');
    const btnRemoveDupes = document.getElementById('btn-remove-dupes');
    btnMergeAll.addEventListener('click', () => {
        mergeAllWindows(currentWindow, tabs);
        window.close();
    });
    btnRemoveDupes.addEventListener('click', () => {
        removeDupes(tabs);
        window.close();
    });
    const hosts = {};
    for (const t of tabs) {
        const a = document.createElement('a');
        if (!t.url) {
            continue;
        }
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
    for (const h in hosts) {
        const subtext = hosts[h].count > 1 ? `${hosts[h].count} Tabs` : (hosts[h].tabs[0].title || 'Unnamed Tab');
        const xxli = new TabLiController(h, subtext, hosts[h].favicon || 'icon128.png');
        const xxbtn = new TabLiButtonController('x.png');
        xxli.addTabButton(xxbtn);
        domainList.appendChild(xxli.getElement());
        xxbtn.onClick((e) => {
            e.stopPropagation();
            closeTabs(hosts[h].tabs);
            xxli.remove();
        });
        xxli.onClick(() => {
            const domainTabs = hosts[h].tabs;
            if (hosts[h].count == 1) {
                focusTab(domainTabs[0]);
                window.close();
            }
            else {
                mainContent.style.display = 'none';
                domainTabContent.style.display = '';
                domainTabHeader.textContent = h;
                for (const domainTab of domainTabs) {
                    const dtli = new TabLiController(domainTab.title || domainTab.url || "Unnamed Tab", "", hosts[h].favicon || 'icon128.png');
                    const dcbtn = new TabLiButtonController('x.png');
                    dtli.addTabButton(dcbtn);
                    domainTabList.appendChild(dtli.getElement());
                    dcbtn.onClick((e) => {
                        e.stopPropagation();
                        closeTabs(domainTab);
                        dtli.remove();
                    });
                    dtli.onClick(() => {
                        focusTab(domainTab);
                        window.close();
                    });
                }
            }
        });
    }
}));
