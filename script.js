// NOTES
// class="nrgt" already seems to group, best example is on search term "apple", 
// this should be left as requirement is already met.
//
// Some links are put in a "People also ask section, so the user may not see the original URL result."
//
// Remember to use var x on for loops or js will use the same var

// HTML reference points.
const RESULT_TITLE_CLASS = "r";
const RESULT_CONTENT_CLASS = "s";
const RESULT_URL_DISPLAY_CLASS = "f kv _SWb";
const RESULT_TABLED = "nrgt";

const GOOGLE_DOWN_ARROW_IMAGE_RESOURCE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAJCAYAAAAGuM1UAAAARElEQVR4AZXLoQ3AMBAEwXFP7ielpcvHIQdPLwUs24HzMw8Gd5kuJq8Xs6DMJq9TUZ9PQEF1DmiozwELyryBoDp3sPcBE+gdTR3BcJAAAAAASUVORK5CYII=";

// Extract data from HTML.
var resultsTitle = document.getElementsByClassName(RESULT_TITLE_CLASS);
var resultsContent = document.getElementsByClassName(RESULT_CONTENT_CLASS);

// Multi-dimensional array of URLs grouped according to similarity value, at the moment it is just a one to one match.
var  grouped = [];

var isGrouped;
var url;
var noOfResultsGrouped = 0;
// Traverse list of results
for(i = 0; i < resultsTitle.length; i++) {
    
    // TEMP
    console.log(resultsTitle[i].parentElement.parentElement.classList)
    if (resultsTitle[i].parentElement.parentElement.parentElement.classList.contains(RESULT_TABLED)) {
        console.log("Tabled result found.");
    }

    isGrouped = false;

    // Compare similarity of each domain with first element in group.
    for(j = 0; j < grouped.length; j++) {

        // Extract URL from next element to compare.
        urlToCompare = getAttributeFromURL(getURL(resultsTitle[i]),0);
        // Extract URL from first element in group.
        groupedUrl = getAttributeFromURL(getURL(resultsTitle[grouped[j][0]]),0)

        // If there are similar results group them.
        if (similarity(urlToCompare, groupedUrl) >= 1) {

            grouped[j].push(i);
            isGrouped = true
            
            // Hide repeated results.
            try {
                resultsTitle[i].style.display = 'none';
                resultsContent[i].style.display = 'none';
            }
            catch(err)
            {
                console.log("Caught Error: Could not hide element.");
            }

           noOfResultsGrouped++;
        }
    }

    // If the current result is unique, create a new group.
    if (!isGrouped){
        grouped[j] = [i];
    }
}

// Process sorted data.
for(i = 0; i < grouped.length; i++) {
    if (grouped[i].length > 1) {
        // Inject code modification into first element of each group.
        injectHTMLModification(grouped[i].length - 1, i);
    }
}

// Print out data structure
//console.log(grouped);

// Print metrics!
console.log("No. of unique URLs: " + grouped.length);
console.log("No. of results grouped: " + noOfResultsGrouped);
console.log("Percentage of results space saved: " + (noOfResultsGrouped/resultsTitle.length)*100 + "%");

// Attempting to communicate with popup.html using messenger API.
chrome.runtime.sendMessage({uniqueURLs:grouped.length});
chrome.runtime.sendMessage({resultsGrouped:noOfResultsGrouped});
chrome.runtime.sendMessage({spaceSaved:(noOfResultsGrouped/resultsTitle.length)*100});


// ***--------------------------------------------------------------------------------------***

function injectHTMLModification(similarityValue,group) {
    var index = grouped[group][0];
    try {
        // Not sure what this is checking?
        if (resultsContent[index].getElementsByClassName(RESULT_URL_DISPLAY_CLASS).length > 0){
            
            // Inject similarity value and expand button.
            var elementToModify = resultsContent[index].getElementsByClassName(RESULT_URL_DISPLAY_CLASS)[0];

            elementToModify.innerHTML = elementToModify.innerHTML + " [" + similarityValue + "] <img id='expandButton" + index + "' src='" + GOOGLE_DOWN_ARROW_IMAGE_RESOURCE + "'/>";
            document.getElementById("expandButton" + index).style.transform = 'rotate(0deg)';

            // Inject expandable area (hidden as default).        
            var hTMLToInject = "<div id='expandableDiv" + index + "'> " + generateHTMLForInjection(group) + " </div>";
            elementToModify.parentElement.outerHTML = elementToModify.parentElement.outerHTML + hTMLToInject;
            document.getElementById("expandableDiv" + index).style.display = 'none';
        
            // Add button action listener
            document.getElementById("expandButton" + index).addEventListener("click", function(){
                // Toggle function is controlled here as each button controls its own result.
                if (document.getElementById("expandButton" + index).style.transform == 'rotate(0deg)') {
                    // If button clicked and toggle is CLOSED.
                    document.getElementById("expandButton" + index).style.transform = 'rotate(180deg)';
                    document.getElementById("expandableDiv" + index).style.display = 'block';
                }
                else {
                    // If button clicked and toggle is OPEN.
                    document.getElementById("expandButton" + index).style.transform = 'rotate(0deg)';
                    document.getElementById("expandableDiv" + index).style.display = 'none';
                }
            });
        }
    }
    catch(err) {
        console.log("Caught Error: Something is going wrong with getElementsByClassName.")
    }
}

function generateHTMLForInjection(group) {
    var header = "<hr> ";

    var url = getAttributeFromURL(getURL(resultsTitle[grouped[group][0]]),0)
    if (url != null) {
        var brief = "<br> Showing alternate results for \"" + url + "\". <br> <br> <div id='expandedContent>'";
    }
    else
    {
        var brief = "<div id='expandedContent>";
    }
    
    // need to know which group result is in
    var titleAndContent = '';
    for(var i = 1; i < grouped[group].length; i++) {
        var title = "<br>" + resultsTitle[grouped[group][i]].innerHTML;
        var content = "<br>" + resultsContent[grouped[group][i]].innerHTML;
        titleAndContent += title + content;
    }

    var footer = "<br> <br> </div> <hr> ";
    out = header + brief + titleAndContent + footer;
    return out;
}

function getURL(node) {
    var c = node.childNodes;
    var url = c[0].getAttribute("href");
    if ( ( url != null ) && ( url != "" ) ) {
        return url;
    }
    else {
        return null;
    }
}

function getAttributeFromURL(url,attribute) {
    if (url == null){
        return null;
    }
    var d = url.split("://");
    var urlAttributes = d[1].split("/");
    return urlAttributes[attribute];    
}

function getSimilarityValue(item,items) {
    totalSimilarityValue = 0; 
    for(j = 0; j < items.length; j++) {
        totalSimilarityValue += similarity(item,items[j]);
    }
    return (totalSimilarityValue - 1);
}

// Can change, e.g. to Levenshtein distance metric
function similarity(s1, s2) {
    if (s1 == s2)
    {
        return 1;
    }
    else {
        return 0;
    }
}

function findIndexOfGroup(domain) {
    index = 0;
    while (index == 0) {
        if(similarity(domain,groupedDomains[index]) == 1) {
            return index;
        }
        index++;
    }
    return -1;
}

function printArrays() {
    console.log(resultsTitle[i]);
    console.log(domains[i]);
}