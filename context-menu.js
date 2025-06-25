chrome.runtime.onInstalled.addListener(async () => {
    chrome.contextMenus.create({
        title: "Show Selections",
        id: "showSelections",
        documentUrlPatterns: ["https://vtop.vit.ac.in/vtop/content"],
    });
    chrome.contextMenus.create({
        title: "Show Timetable",
        id: "showTimetable",
        documentUrlPatterns: ["https://vtop.vit.ac.in/vtop/content"],
    });
    chrome.contextMenus.create({
        title: "Clear Timetable",
        id: "clearTimetable",
        documentUrlPatterns: ["https://vtop.vit.ac.in/vtop/content"],
    });
    chrome.contextMenus.create({
        title: "Save Timetable",
        id: "saveTimetable",
        documentUrlPatterns: ["https://vtop.vit.ac.in/vtop/content"],
    });
});

function invokeSaveTimetable() {
    saveTimetable();
}

function invokeClearTimetable() {
    clearTimetable();
}

function invokeShowTimetable() {
    showTimetable();
}

function invokeShowSelections() {
    showSelections();
}

function invokeGotoCourseAllocation() {
    gotoCourseAllocation();
}

function injectCode(fn) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["content-script.js"],
        }).then(() => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: fn,
            });
        });
    });
}

function injectCall(fn) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {text: "ping"}, function(msg) {
            if(chrome.runtime.lastError) {}
            msg = msg || {};
            console.log(msg);
            if (msg.status != 'pong') {
                injectCode(fn);
            } else {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: fn,
                });
            }
        });
    });
}

chrome.contextMenus.onClicked.addListener((item, tab) => {
    if (item.menuItemId === "showSelections") {
        injectCall(invokeShowSelections);
    } else if (item.menuItemId === "showTimetable") {
        injectCall(invokeShowTimetable);
    } else if (item.menuItemId === "clearTimetable") {
        injectCall(invokeClearTimetable);
    } else if (item.menuItemId === "saveTimetable") {
        injectCall(invokeSaveTimetable);
    }
});

chrome.commands.onCommand.addListener((command, tab) => {
    if (command == "gotoCourseAllocation") {
       injectCall(invokeGotoCourseAllocation);
    } else if (command == "showSelections") {
        injectCall(invokeShowSelections);
    } else if (command == "showTimetable") {
       injectCall(invokeShowTimetable);
    } else if (command == "clearTimetable") {
       injectCall(invokeClearTimetable);
    }
});
