

const updateRules = (blockedDomains) => {
    const rules = blockedDomains.map((domain, i) => ({
        id: i + 1,
        priority: 1,
        action: { type: 'block'},
        condition: {
            urlFilter: `||${domain}`,
            resourceTypes: ["image"]
        }
    }));

    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: rules.map(r => r.id),
        addRules: rules
    });
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get({ blockedDomains: []}, (data) => {
        updateRules(data.blockedDomains);
    });
})

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.sync.get( {blockedDomains: []}, (data) => {
        updateRules(data.blockedDomains)
    })
})

chrome.storage.onChanges.addListener((changes, area) => {
    if (area == "sync" && changes.blockedDomains) {
        updateRules(changes.blockedDomains.newValue);
    }
})