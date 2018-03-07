function onReceive() {
    var priorityDomainExtension = document.getElementById('priorityDomainExtension').value;
    // Save to Chrome storage (using sync as is a user option).
    chrome.storage.sync.set({'priorityDomainExtension': priorityDomainExtension}, function(){});
}

// Read saved options and apply them to form where needed.
function restoreSavedOptions() {
    chrome.storage.sync.get(['priorityDomainExtension'],function(items){
        // Set saved PDE as value of textbox.
        document.getElementById('priorityDomainExtension').value = items.priorityDomainExtension;
    });
}

// Restore previously saved options.
document.addEventListener('DOMContentLoaded', restoreSavedOptions);

// Add actiion listener to form submit button.
document.getElementById('optionsForm').addEventListener('submit',onReceive);
