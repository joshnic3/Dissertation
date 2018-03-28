// Set default form options.
const DEFAULT_PDE = ".com";
const DEFAULT_SEF = true;

function onReceive() {
    // Get values from form.
    var priorityDomainExtension = document.getElementById('priorityDomainExtension').value;

    // Save to Chrome storage (using sync as is a user option).
    chrome.storage.sync.set({'priorityDomainExtension': priorityDomainExtension}, function(){});
    chrome.storage.sync.set({'shortestExtensionFirst': document.getElementById('shortestExtensionFirstOption').checked}, function(){});
    chrome.storage.sync.set({'popularGroupsFirst': document.getElementById('popularGroupsFirstOption').checked}, function(){});
}

// Read saved options and apply them to form where needed.
function restoreSavedOptions() {
    chrome.storage.sync.get(['priorityDomainExtension','shortestExtensionFirst','popularGroupsFirst'],function(items){
        // Set textbox value to saved PDE.
        document.getElementById('priorityDomainExtension').value = items.priorityDomainExtension;

        // Set checkbox value to saved SEF.
        document.getElementById('shortestExtensionFirstOption').checked = items.shortestExtensionFirst;

        // Set checkbox value to saved PGF.
        document.getElementById('popularGroupsFirstOption').checked = items.popularGroupsFirst;
    });
}

// Reset form to default values.
function resetOptions() {
    // Set textbox value to saved PDE.
    document.getElementById('priorityDomainExtension').value = DEFAULT_PDE;

    // Set checkbox value to saved SEF.
    document.getElementById('shortestExtensionFirstOption').checked = DEFAULT_SEF;
}


// Restore previously saved options.
document.addEventListener('DOMContentLoaded', restoreSavedOptions);

// Add actiion listener to form submit button.
document.getElementById('optionsForm').addEventListener('submit',onReceive);

// Add actiion listener to Reset To Default button.
document.getElementById('resetButton').addEventListener('click',resetOptions);

// Show save confirmation message.
chrome.storage.onChanged.addListener(function(changes, namespace) {
    alert("Updated options.")
});
