// Network blocking for images
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

chrome.storage.onChanged.addListener((changes, area) => {
    if (area == "sync" && changes.blockedDomains) {
        updateRules(changes.blockedDomains.newValue);
    }
})


// Keyword blocking

let bannedWords = [];

// sites to apply the search blocking to and the parameter they us in searches
const sites = [
    { hostContains: "google.com", param: "q"},
    { hostContains: "bing.com", param: "q"},
    { hostContains: "duckduckgo.com", param: "q"},
    { hostContains: "youtube.com", param: "search_query"},
    { hostContains: "amazon.com", param: "k"},
    { hostContains: "wikipedia.org", param: "search"},
    { hostContains: "tiktok.com", param: "q"},
    { hostContains: "itch.io", param: "q"}
]


const checkAndBlock = (details) => {
    try {
        const url = new URL(details.url);

        const site = sites.find(s => url.host.includes(s.hostContains));
        if (!site) return;

        const queryValue = url.searchParams.get(site.param);
        if (queryValue) {
            const lowerQuery = queryValue.toLowerCase();
            if (bannedWords.some(word => lowerQuery.includes(word))) {
                chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL("block.html")})
            }
        }

    } catch (error) {
        console.error(error);
    }
}

// load settings
chrome.storage.local.get({ bannedWords: []}, (data) => {
    bannedWords = data.bannedWords.map(w => w.toLowerCase());
})

// Update list when options change
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.bannedWords) {
        baneedWords = changes.bannedWords.newValue.map(w => w.toLowerCase())
    }
})

chrome.webNavigation.onBeforeNavigate.addListener(checkAndBlock, {
    url: sites.map (s => ({hostContains: s.hostContains}))
})

chrome.webNavigation.onHistoryStateUpdated.addListener(checkAndBlock, {
    url: sites.map(s => ({hostContains: s.hostContains}))
})