// The popup is created and destroyed everytime it is opened/closed (voliatile)
// This means I can't just update the inner HTML, i need to store and access the data.
// https://developer.chrome.com/extensions/storage
// will use storeage.local as this is only relevant to current session.
// Talk about how you use existing google api

// Receive data.
function onReceive(request, sender, sendResponse){
    // Remove previous stored data.
    chrome.storage.local.clear(function(){
        var error = chrome.runtime.lastError;
           if (error) {
               console.log(error);
           }
    })
    
    // Store new data. 
    chrome.storage.local.set({'spaceSaved': request.spaceSaved, 'uniqueUrls': request.uniqueUrls, 'resultsGrouped': request.resultsGrouped}, function() {});
}

// Called when popup is opened.
function refresh() {
    // Retrieve saved data and display on popup.
    chrome.storage.local.get(['spaceSaved', 'uniqueUrls', 'resultsGrouped'], function(items) {
        document.getElementById("spaceSavedOut").innerHTML = "Space Saved: " + items.spaceSaved;
        document.getElementById("uniqueUrlsOut").innerHTML = "No. of Unique Results: " + items.uniqueUrls;
        document.getElementById("resultsGroupedOut").innerHTML = "No. of Results Grouped: " + items.resultsGrouped;
    });

    var priorityDomainExtension = "none";
    chrome.storage.sync.get(['priorityDomainExtension'],function(items){
        // Set saved PDE value.
        document.getElementById("priorityDomainExtension").innerHTML = "Priority Domain Extension: " + items.priorityDomainExtension;
    });
    
}

function optionsLinkOnPress() {
    alert("OPTIONS!");
}

// Refresh stats everytime popup is opened.
window.onload = refresh;

// Setup message action listener.
chrome.runtime.onMessage.addListener(onReceive);