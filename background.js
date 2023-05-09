const TITLE_APPLY = "Vérifier la phrase";
const APPLICABLE_PROTOCOLS = ["http:", "https:"];


async function getSentence() {
    /*
    Get the current tab's HTML
    */
    var gettingHtml = browser.tabs.executeScript({
        code: "document.body.innerHTML"
    });

    /*
    Logs it
    gettingHtml.then((results) => {
      console.log(results[0]);
    });
    */

    var document = gettingHtml.then((results) => {
        return results[0];
    });

    /*
    get div with class="sentence"
    */
    var sentence = document.then((results) => {
        var parser = new DOMParser();
        var htmlDoc = parser.parseFromString(results, 'text/html');
        return htmlDoc.getElementsByClassName("sentence")[0];
    });

    /*
    get the innerText of the div
    */
    var sentenceText = sentence.then((results) => {
        return results.innerText;
    }
    );
    const toDisplay = await sentenceText;

    /*
    logs the innerText
    */
    sentenceText.then((results) => {
        console.log(results);
    });

    return toDisplay;
}

async function getCorrection(toDisplay) {
    var urlApi = "https://languagetool.org/api/v2/check?language=fr&text=" + toDisplay + "&enabledOnly=false";
    var gettingApi = fetch(urlApi);
    var api = gettingApi.then((results) => {
        return results.json();
    });
    
    var value = api.then((results) => {
        //return results.matches[0].replacements[0].value;
        // check if there is a correction
        if (results.matches.length > 0) {
            return results.matches[0].replacements[0].value;
        } else {
            return "La phrase semble correcte";
        }
    });

    var message = api.then((results) => {
        //return results.matches[0].message;
        // check if there is a correction
        if (results.matches.length > 0) {
            return results.matches[0].message;
        } else {
            return "La phrase semble correcte";
        }
    });

    //console.log(await value);
    //console.log(await message);
    
    return [await value, await message];
}

async function displaySentence() {
    /*
    var toDisplay = await getSentence();
    var correction = await getCorrection(toDisplay);
    var value = correction[0];
    var message = correction[1];
    console.log(await value);
    console.log(await message);
    */

    var toDisplay = await getSentence();
    var correction = await getCorrection(toDisplay);
    var value = correction[0];
    var message = correction[1];

    console.log("correction : " + correction);

    // removes all divs with id="correction"
    browser.tabs.executeScript({
        code: "var divs = document.querySelectorAll('#correction'); for (var i = 0; i < divs.length; i++) { divs[i].remove(); }"
    });
    
    // Adds a div at the end of the body with the correction
    browser.tabs.executeScript({
        code: "var div = document.createElement('div'); div.id = 'correction'; div.innerHTML = '<p><strong>Correction :</strong> " + value + "</p><p><strong>Message :</strong> " + message + "</p>'; document.body.appendChild(div);"
    });
    
    // set the div just after the div with class "top-side-bar-training"
    browser.tabs.executeScript({
        code: "var div = document.getElementById('correction'); var topSideBarTraining = document.getElementsByClassName('top-side-bar-training')[0]; topSideBarTraining.parentNode.insertBefore(div, topSideBarTraining.nextSibling);"
    });

    // set a padding to the left and top and the div
    browser.tabs.executeScript({
        code: "var div = document.getElementById('correction'); div.style.paddingLeft = '10px'; div.style.paddingTop = '10px'; div.style.paddingBottom = '10px';"
    });
}

/*
Returns true only if the URL's protocol is in APPLICABLE_PROTOCOLS.
Argument url must be a valid URL string.
*/
function protocolIsApplicable(url) {
    const protocol = (new URL(url)).protocol;
    return APPLICABLE_PROTOCOLS.includes(protocol);
}

/*
Initialize the page action: set icon and title, then show.
Only operates on tabs whose URL's protocol is applicable.
*/
function initializePageAction(tab) {
    if (protocolIsApplicable(tab.url)) {
        /* 
        Checks if the tab is on projet-voltaire.fr
        */
        if (tab.url.includes("projet-voltaire.fr")) {
            browser.pageAction.setIcon({ tabId: tab.id, path: "icons/off.svg" });
            browser.pageAction.setTitle({ tabId: tab.id, title: TITLE_APPLY });
            browser.pageAction.show(tab.id);
        }
    }
}
/*
When first loaded, initialize the page action for all tabs.
*/
let gettingAllTabs = browser.tabs.query({});
gettingAllTabs.then((tabs) => {
    for (let tab of tabs) {
        initializePageAction(tab);
    }
});

/*
Each time a tab is updated, reset the page action for that tab.
*/
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    initializePageAction(tab);
});

/*
Toggle CSS when the page action is clicked.
*/
browser.pageAction.onClicked.addListener(displaySentence);
