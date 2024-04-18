let theme;
let busy = async (newTheme) => {
    theme = newTheme;
    console.debug('Theme value is set to ' + theme);
    chrome.storage.local.set({ theme });
    return theme;
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.theme) {
        busy(msg.theme).then(sendResponse);
        return true;
    }
    if (msg.createContextMenu) {
        createContextMenu();
    }
});

function createContextMenu() {
    chrome.contextMenus.create({
        id: 'add-note-1',
        title: 'Add To Narrow Focus: Todo',
        type: 'normal',
        contexts: ['selection']
    }, () => chrome.runtime.lastError);
}

chrome.contextMenus.onClicked.addListener((item, tab) => {
    const menuId = item.menuItemId;
    const selectedText = item.selectionText;
    if (!selectedText.trim()) return;
    if (chrome.storage) {
        const newTask = {
            id: generateUUID(),
            text: selectedText,
            completed: false,
            createdDate: new Date().toISOString(),
        };
        checkSyncStorage((isSyncStorageAvailable) => {
            if (isSyncStorageAvailable) {
                chrome.storage.sync.get(['remoteBacklogTasks'], function (result) {
                    const remoteBacklogTasks = JSON.parse(result.remoteBacklogTasks);
                    const newBacklogTasks = [...remoteBacklogTasks, newTask];
                    chrome.storage.local.set({ backlogTasks: newBacklogTasks });
                    chrome.storage.sync.set({ "remoteBacklogTasks": JSON.stringify(newBacklogTasks, null, 2) }).then(() => {
                        console.debug('Data sync successful');
                    });
                });
            } else {
                chrome.storage.local.get(['backlogTasks'], function (result) {
                    const localBacklogTasks = result.backlogTasks;
                    const newBacklogTasks = [...localBacklogTasks, newTask];
                    chrome.storage.local.set({ backlogTasks: newBacklogTasks });
                });
            }
        });
        chrome.storage.sync.get(['remoteBacklogTasks'], function (result) {
            console.debug('BacklogTasks', result.remoteBacklogTasks);
            const remoteBacklogTasks = JSON.parse(result.remoteBacklogTasks);
            const newBacklogTasks = [...remoteBacklogTasks, newTask];
            chrome.storage.local.set({ backlogTasks: newBacklogTasks });
            chrome.storage.sync.set({ "remoteBacklogTasks": JSON.stringify(newBacklogTasks, null, 2) }).then(() => {
                console.debug('Data sync successful');
            });
        });
    }
});

function generateUUID() {
    let dt = new Date().getTime();
    const uuid = 'xxxx-xxxx-4xxx-yxxx-xxxx-xxxx'.replace(/[xy]/g, function (c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

function checkSyncStorage(callback) {
    try {
        chrome.storage.sync.get(null, function (items) {
            var error = chrome.runtime.lastError;
            if (error) {
                console.error('Sync storage error:', error);
                callback(false);
            } else {
                callback(true);
            }
        });
    } catch (e) {
        console.error('Sync storage not available:', e);
        callback(false);
    }
}