console.log("Youtube Title Block Started")

let bannedWords = []

chrome.storage.local.get( {bannedWords: []}, (data) => {
    bannedWords = data.bannedWords
    scanVideoTitleAndBlock()
})

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.bannedWords) {
        bannedWords = changes.bannedWords.newValue
        scanVideoTitleAndBlock()
    }
})

/**
 * 
 * @param {string} title
 * @returns {bool} 
 */
const titleContainsBannedWords = (title) => {
    console.log("Title:", title)
    const lowerTitle = title.toLowerCase();
    return bannedWords.some(word => lowerTitle.includes(word))
}

const scanVideoTitleAndBlock = (root = document) => {
    if (!bannedWords.length) return;

    console.log("root:", root)
    const titleElement = root.querySelector('yt-formatted-string.style-scope.ytd-watch-metadata')

    console.log(titleElement)

    if (titleContainsBannedWords(titleElement?.innerText)) {
        console.log("Should block video")
        chrome.runtime.sendMessage({
            action: "block"
        })
    }
}


const observeForElement = (selector, callback) => {
    const observer = new MutationObserver(() => {
        const el = document.querySelector(selector)
        if (el) {
            observer.disconnect()
            callback(document)
        }
    })

    observer.observe(document.body, { childList: true, subtree: true})

    const existing = document.querySelector(selector)
    if (existing) {
        observer.disconnect()
        callback(document)
    }
}

observeForElement('yt-formatted-string.style-scope.ytd-watch-metadata', scanVideoTitleAndBlock)