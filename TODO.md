MVP:
    add a JLPT level setting, use it to define the default status of words
    subscription process
    verify email process after subscription (and block login if not validated)
    after the subscription page is done: add links to the index page to the account (changing depending on the localStorage key)
    retrieve password process
    possibility to change password in the patch route
    onboarding (after subscription, install extension...)
    when there will be more links: add an e2e test to check that the menu links work
    Global vuejs error handling?
    Have the extension CSS match the website colours + unify the css with variables
    Landing page: better sync of the parallax on mobile
    bug with conjugated furiganas? Cf されて in the wikipedia test page
    test with a lot of different sites and texts
    test and debug with slack
    test and debug intensively the display of results
    store visited urls to make recommendations later (except on mode incognito (window.incognito?))
    save the watched words and stats about it (frequency, webpage, clicked...) and stats about toggling the words
    only apply conjugations to the words with verb tags
    chrome compatibility (and test others as well as mobile)
    Block access to the test pages in production
    webpack => production mode whenever necessary
    include copyright somewhere in the site (and external resources used) -> mostly external resources used
    free for beta
    CGU / RGPD ?
    need to register a copyright?!

After:
    make the wikipedia test page faster (remove useless assets)
    move the cypress classes in the cypress directory
    add a test to the filter that does not translate the site itself (settings sample, homepage samples...)
    separate the layout component: should have one menu component and one usermenu component
    route to delete an api key + use it on explicit disconnect + wait properly before showing the confirm message (and show a loader)
    search and fix remaining TODOs
    cypress tests in typescript
    server side fetching of a page to be independent from the extension
    copy/paste functionality on the website (can use the tool on any text, independently from the extension)
    share option for mobile, using the website: https://chodounsky.com/2019/03/24/progressive-web-application-as-a-share-option-in-android/
    Should saved word preferences be different for each reading?
    improve order of the returned words (the top one should be right in the context)
    Possible to have unit tests for new root classes: stores and router?
    OVH: try again to create a secondary account?
    free plan?
    paid member
    Have the home page js also built with webpack
    Load twitter timeline properly via an endpoint (which retrieves and cache the data) to avoid tracking
    Avoid Google Analytics tracking?
    Possible to fix this? https://github.com/Seb-C/kanjimi/network/alert/package-lock.json/minimist/closed
    translate the landing page (french?) and interface and add the supported languages list somewhere
    Cypress commands should run in a docker as well
    automatic updates (https://extensionworkshop.com/documentation/manage/updating-your-extension/)
    search better dictionaries? -> extract wiktionary (https://dumps.wikimedia.org/backup-index.html)
    disconnect (delete api key route)
    change email process
    error handling properly in express (500 and 404, should always be an API response?)
    recommend words to hide depending on the statistics
    fix the broken indentation and folding for typescript
    fix typescript vs vue components (vue 3.0? + store not typed?)
    implement down migrations? or not do it and remove related code
    hide and show kanjis by reading (and remember)
    example of words using the same kanjis and that have been seen before
    route to explain a word (split kanji and contextualized reading of every kanji)
    Kanjis translation and readings
    use kanjis svg instead of a font (proper sizing + animatable?)
    also show old kanji writings to provide a visual help
    half width characters? full-width roman chars and letters?
    extension hot-reload -> supported by vue.js, but the current instances are not migrated
    replace API with websockets?
    properly implement all the JSONApi spec (+ relationships, client already fixed)
    optimize server performance by compiling properly
    counters?
    store unfound words?
    streaming subtitles support: trigger the function on a dom inserted
    display history
    manual lookup history
    explain grammar
    netflix integration
    amazon ebook integration
    youtube compatibility
    handle closing popup with the back button using pushstate on mobile?
