// Attempting to communicate with popup.html using messenger API.

chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
    var uniqueURLs = 0;
    var resultsGrouped = 0;
    var spaceSaved = 0;
    if(response.uniqueURLs) {
        uniqueURLs = response.uniqueURLs;
    }
    if(response.resultsGrouped) {
        resultsGrouped = response.resultsGrouped;
    }
    if(response.spaceSaved) {
        spaceSaved = response.spaceSaved;
        $("#testTextArea").text(spaceSaved);
    }
})