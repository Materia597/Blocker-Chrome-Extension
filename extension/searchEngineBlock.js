
let blockedDomains = [];

// Gets the blocked domains from storage when first loaded
chrome.storage.sync.get( {blockedDomains: [] }, (data) => {
    blockedDomains = data.blockedDomains;
    scanAndRemove();
})

// Listens for changes to the blocked domains, updates the list, and rescans
chrome.storage.onChanged.addListener((changes, area) => {
    if (area == "sync" && changes.blockedDomains) {
        blockedDomains = changes.blockedDomains.newValue
        scanAndRemove();
    }
})


/**
 * Tests if the url's domain is the same as a blocked website's domain.
 * @param {string} url The url to check for matches 
 * @returns {boolean} 
*/
const shouldBlock = (url) => {
    try {
        const u = new URL(url, window.location.href);
        return blockedDomains.some(domain => u.hostname.includes(domain))
    } catch {
        return false;
    }
}

/**
 * Tests is the string contains of a blocked domain anywhere, not just the domain name.
 * @param {string} url The url to check for matches
 * @returns {boolean}
*/
const canBlock = (url) => {
    return blockedDomains.some(domain => url.includes(domain))
}

const siteParameters = {
    "google": {
        elementPatterns: ['div.eA0Zlc', 'div.wHYlTd', 'div.PNCib', /*'div.MjjYud'*/],
        querySelectorParam: "a",
        blockCheckFunction: shouldBlock,
        linkAttribute: "href" 
    },
    "bing": {
        elementPatterns: ['li.b_algo'],
        querySelectorParam: "cite",
        blockCheckFunction: canBlock,
        linkAttribute: "innerHTML"
    },
    "duckduckgo": {
        elementPatterns: ['li'],
        querySelectorParam: "a",
        blockCheckFunction: shouldBlock,
        linkAttribute: "href"
    }
}

/**
 * removes search results if they contain a link to a blocked domain.
 * Search engines commonly use caches for images, so the link must be checked instead.
 * @param {ELEMENT_NODE} root Which DOM element to start the search from
 * @returns {void}
 */
const scanAndRemove = (root = document) => {
    if (!blockedDomains.length) return;

    // loads blocking method for the specific website
    let siteParams = {}
    if (location.hostname.includes('google.')) siteParams = siteParameters['google'];
    if (location.hostname.includes('bing.')) siteParams = siteParameters['bing'];
    if (location.hostname.includes('duckduckgo.')) siteParams = siteParameters['duckduckgo']

    const elementPatterns = siteParams.elementPatterns;
    const links = root.querySelectorAll(siteParams.querySelectorParam)
    const checkFunction = siteParams.blockCheckFunction;

    for (const link of links) {
        if (checkFunction(link[siteParams.linkAttribute])) {
            for (const el of elementPatterns) {
                let container = link.closest(el)
                if (container) container.remove();
            }
        }
    }
}

// Initial Scan
scanAndRemove();

// Handle infinite scroll / dynamically loaded results
const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType === node.ELEMENT_NODE) {
                scanAndRemove(node);
            }
        }
    }
})

observer.observe(document.body, {childList: true, subtree: true})