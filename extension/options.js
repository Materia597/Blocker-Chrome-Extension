
const bannedWordsTextArea = document.getElementById('banned-words')
const blockedDomainsTextArea = document.getElementById('blocked-domains');

const saveButton = document.getElementById('save-button');

const bannedWordsSaveStatus = document.getElementById('banned-words-save-status')
const blockedDomainsSaveStatus = document.getElementById('blocked-domains-save-status');

// loads banned words from storage
chrome.storage.local.get({ bannedWords: []}, (data) => {
    bannedWordsTextArea.value = data.bannedWords.join("\n")
})

// loads banned sites from storage
chrome.storage.sync.get({ blockedDomains: []}, (data) => {
    blockedDomainsTextArea.value = data.blockedDomains.join("\n");
});


saveButton.addEventListener("click", () => {
    const domains = blockedDomainsTextArea.value
        .split("\n")
        .map(d => d.trim())
        .filter(d => d.length > 0);

    const words = bannedWordsTextArea.value
        .split("\n")
        .map(w => w.trim())
        .filter(w => w.length > 0)
    

    chrome.storage.local.set({ bannedWords: words}, () => {
        bannedWordsSaveStatus.innerText = "Saved!";
        setTimeout( () => {bannedWordsSaveStatus.innerText = ""}, 1500)
    })

    chrome.storage.sync.set({ blockedDomains: domains }, () => {
        blockedDomainsSaveStatus.innerText = "Saved!";
        setTimeout( () => {blockedDomainsSaveStatus.innerText = ""}, 1500);
    })
});