
const bannedWordsTextArea = document.getElementById('banned-words')
const blockedDomainsTextArea = document.getElementById('blocked-domains');

const saveButton = document.getElementById('save-button');
const saveStatus = document.getElementById('save-status');

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
        console.log("Banned words saved.")
    })

    chrome.storage.sync.set({ blockedDomains: domains }, () => {
        saveStatus.innerText = "Saved!";
        setTimeout( () => {saveStatus.innerText = ""}, 1500);
    })
});