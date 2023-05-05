const TITLE_APPLY = "Ouvrir dans Reverso";
const APPLICABLE_PROTOCOLS = ["http:", "https:"];

/*
Toggle CSS: based on the current title, insert or remove the CSS.
Update the page action's title and icon to reflect its state.
*/

async function displaySentence(tab) {
    console.log("displaySentence");

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


    /*
    Uncomment to display the sentence in a new div
    */
    /*
    browser.tabs.executeScript({
      code: "var newDiv = document.createElement('div'); newDiv.innerHTML ='" + toDisplay + "'; document.body.appendChild(newDiv);"
    });
    */
   
    /*
    open in reverso using https://www.reverso.net/orthographe/correcteur-francais/#text=
    */
    var url = "https://www.reverso.net/orthographe/correcteur-francais/#text=" + toDisplay;
    //browser.tabs.create({ url: url });
    // opens a new tab if a tab on reverso is not already open
    browser.tabs.query({ url: "https://www.reverso.net/*" }).then((tabs) => {
        if (tabs.length === 0) {
            browser.tabs.create({ url: url });
        }
        else {
            // closes the reverso tab and opens a new one
            browser.tabs.remove(tabs[0].id).then(() => {
                browser.tabs.create({ url: url });
            }
            );
        }
    }
    );
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
