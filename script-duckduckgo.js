// HTML reference points.
const RESULTS_BODY_CONTAINER_CLASS = "links_main links_deep result__body";
const RESULT_TITLE_CLASS = "result__title";
const RESULT_SNIPPET_CLASS = "result__snippet";
const RESULT_EXTRAS_CLASS = "result__extras";

// Other contants.
const GOOGLE_DOWN_ARROW_IMAGE_RESOURCE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAJCAYAAAAGuM1UAAAARElEQVR4AZXLoQ3AMBAEwXFP7ielpcvHIQdPLwUs24HzMw8Gd5kuJq8Xs6DMJq9TUZ9PQEF1DmiozwELyryBoDp3sPcBE+gdTR3BcJAAAAAASUVORK5CYII=";

// Likely to be replaced with a UI input and default.
// Also, extension only works on "www.google.co.uk"
const PRIORITY_DOMAIN_EXTENSION = ".co.uk";

// Extract data from HTML. (defo can be simplified to just on of these i think)
// Refactor everything to be based off resultsBody. 
// e.g. resultsBody[grouped[group][i]].getElementsByClassName(RESULT_TITLE_CLASS)[0]
// then you can remove resultsTitle, Snippet and Extras
// note for write up, doing it this way reduces the amount of ram used. show before and after.
var resultsBody = document.getElementsByClassName(RESULTS_BODY_CONTAINER_CLASS);
var resultsTitle = document.getElementsByClassName(RESULT_TITLE_CLASS);
var resultsSnippet = document.getElementsByClassName(RESULT_SNIPPET_CLASS);
var resultsExtras = document.getElementsByClassName(RESULT_EXTRAS_CLASS);

// Multi-dimensional array of URLs grouped according to similarity value, at the moment it is just a one to one match.
var  grouped = [];

var isGrouped;
var url;
var noOfResultsGrouped = 0;

// Traverse and group list of results.
for(i = 0; i < resultsTitle.length; i++) {
    isGrouped = false;

    // Compare similarity of each domain with first element in group.
    for(j = 0; j < grouped.length; j++) {

        // Extract URL from next element to compare.
        urlToCompare = getDomainFromURL(getURL(resultsTitle[i]));
        // Extract URL from first element in group.
        groupedUrl = getDomainFromURL(getURL(resultsTitle[grouped[j][0]]))

        // If there are similar results group them.
        if (similarity(urlToCompare, groupedUrl) >= 1) {
            grouped[j].push(i);
            isGrouped = true
            noOfResultsGrouped++;
        }
    }

    // If the current result is unique, create a new group.
    if (!isGrouped){
        grouped[j] = [i];
    }
}

// Process grouped elements.
for(i = 0; i < grouped.length; i++) {
    if (grouped[i].length > 1) {
        for(j = 0; j < grouped[i].length; j++) {
            // Hide repeated results.
            try {
                // Minimising here?.
                resultsBody[grouped[i][j]].style.display = 'none';
            }
            catch(err)
            {
                // If i dont get his error it works.
                console.log("Caught Error: Could not hide element. (Index: " + grouped[i][j] + ")");
            }

            // Move prioritied domain extension to front of group.
            var url = getURL(resultsTitle[grouped[i][j]])
            var domainName = getDomainFromURL(getURL(resultsTitle[grouped[i][j]]))
            var splitUrl = url.split("/");
            var domainExtension = splitUrl[2].split(domainName);

            if (domainExtension[1] == PRIORITY_DOMAIN_EXTENSION) {
                console.log("Prioritied " + getURL(resultsTitle[grouped[i][j]]))
                sendToFrontOfGroup(i, j);
            }

            // Now maybe prioitise smallest URLs to ensure results closest to URL homepage are displayed first.
            // The order of this for loop is important!
        }
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
console.log(grouped);

// Temp print
console.log(resultsTitle.length);
console.log(resultsSnippet.length);
console.log(resultsExtras.length);

// Print metrics!
console.log("No. of unique URLs: " + grouped.length);
console.log("No. of results grouped: " + noOfResultsGrouped);
console.log("Percentage of results space saved: " + (noOfResultsGrouped/resultsTitle.length)*100 + "%");

// Attempting to communicate with popup.html using messenger API.
chrome.runtime.sendMessage({uniqueURLs:grouped.length});
chrome.runtime.sendMessage({resultsGrouped:noOfResultsGrouped});
chrome.runtime.sendMessage({spaceSaved:(noOfResultsGrouped/resultsTitle.length)*100});

//TEMP
if (resultsTitle.length != resultsExtras) {
    console.log("resultsTitle and resultsExtras are different lengths.");
}

// ***--------------------------------------------------------------------------------------***

// similarityValue is the number of similar results, so We can just use the length of the group.
function injectHTMLModification(similarityValue,group) {
    var index = grouped[group][0];
    try {
        // Not sure what this is checking?
        // Doesnt get in loop
        //if (resultsExtras[index].getElementsByClassName(RESULT_EXTRAS_CLASS).length > 0){
            
            // Show main (lead) result.
            resultsBody[index].style.display = 'block';

            // Inject similarity value and expand button.
            var elementToModify = resultsTitle[index];

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
       // }
    }
    catch(err) {
        console.log("Caught Error: Something is going wrong with getElementsByClassName.")
    }
}

function generateHTMLForInjection(group) {
    var header = "<hr> ";

    var url = getDomainFromURL(getURL(resultsTitle[grouped[group][0]]))
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

        //TEMP
        //console.log(resultsBody[grouped[group][i]].getElementsByClassName(RESULT_TITLE_CLASS)[0].innerHTML)

        var title = "<br>" + resultsBody[grouped[group][i]].getElementsByClassName(RESULT_TITLE_CLASS)[0].innerHTML;
        var snippet = "<br>" + resultsBody[grouped[group][i]].getElementsByClassName(RESULT_SNIPPET_CLASS)[0].innerHTML;

         var a = resultsBody[grouped[group][i]].getElementsByClassName(RESULT_EXTRAS_CLASS)[0];
         if (a != null) {
            var extras = "<br>" + a.innerHTML + "<br>";
         }
         else{
            var extras = "<br>";
         }
         titleAndContent += title + snippet + extras;
    }

    var footer = "<br> <br> </div> <hr> ";
    out = header + brief + titleAndContent + footer;
    return out;
}

function getURL(node) {
    // Index in the node array specifies which part of the the element holds the url.
    // it was c[0] for google
    var c = node.childNodes;
    var url = c[1].getAttribute("href");
    if ( ( url != null ) && ( url != "" ) ) {
        return url;
    }
    else {
        return null;
    }
}

function getDomainFromURL(url) {
    if (url == null){
        return null;
    }
    var d = url.split("://");
    var urlAttributes = d[1].split("/");
    urlAttributes = urlAttributes[0].split(".");

    if (urlAttributes.length <= 2) {
        return urlAttributes[0];  
    }
    else {
        return urlAttributes[1];    
    }    
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

function sendToFrontOfGroup(group, groupIndexToMove) {
    if (groupIndexToMove >= grouped[group].length)
    {
        console.log("Caught Error: Tried to move out of bounds group index.");
        return;
    }
    var value = grouped[group][groupIndexToMove];
    while (groupIndexToMove > 0) {
        // Get values of index and index - 1.
        previousValue = grouped[group][groupIndexToMove - 1]
        value = grouped[group][groupIndexToMove]

        // Swap.
        grouped[group][groupIndexToMove] = previousValue;
        grouped[group][groupIndexToMove - 1] = value;

        // Reduce index.
        groupIndexToMove = groupIndexToMove - 1;
    }   
}