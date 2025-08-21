
const blockedDomainsTextArea = document.getElementById('blocked-domains');

const saveButton = document.getElementById('save-button');
const saveStatus = document.getElementById('save-status');


chrome.storage.sync.get({ blockedDomains: []}, (data) => {
    blockedDomainsTextArea.value = data.blockedDomains.join("\n");
});


saveButton.addEventListener("click", () => {
    const domains = blockedDomainsTextArea.value
        .split("\n")
        .map(d => d.trim())
        .filter(d => d.length > 0);

    
    chrome.storage.sync.set({ blockedDomains: domains }, () => {
        saveStatus.innerText = "Saved!";
        setTimeout( () => {saveStatus.innerText = ""}, 1500);
    })
});