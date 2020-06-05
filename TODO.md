MVP:
    test with a lot of different sites and texts
    fix the red border not always properly placed (saw it on wikipedia in the book bordered box on the top) -> re-test on laptop, can't reproduce
    test and debug with slack
    test and debug intensively the display of results
    only apply conjugations to the words with verb tags
    test other browsers
    chrome compatibility (+ add to CI)
    firefox android compatibility (+ add mobile to CI)
    store visited urls and the number of characters/words per page (except on mode incognito (window.incognito?))
    save the watched words and stats about it (frequency, webpage, clicked...) and stats about toggling the words
    save all words and sentences to show up later?
    Block access to the test pages in production
    include references to external resources used somewhere in the site
    onboarding (after sign-up, install extension...)
    webpack => production mode whenever necessary
    check that the distributed clients cannot contain server-side code
    CGU / RGPD ?
    need to register a copyright?!
    post on producthunt
    post on hackernews
    post on reddit
    post on linkedin
    post on twitter

After:
    commented cypress lines (about disabled fields during loading) -> remove and merge in a separate skipped tests (already done in most test suites)
    test the links in the user dropdown
    assets update -> browser will not update it?
    don't restart server if a server test file has changed
    unit test for the user controller -> create some common code to reduce the number of lines of code
    url encoding of query strings is not necessary? should be lighter and more readable
    force dates to utc server side (instead of `new Date()`)
    vocabulary review
    analyzer: any way to regroup sentences and then split again based on the original string index in the array?
    Remove google Analytics tracking, analyze nginx logs instead
    remove twitter tracking, use the API + static content (or via a cached API route?)
    click on logo = go home
    animations on the tooltip (appear/disappear)
    Global vuejs error handling?
    if an email already exists and is not validated, try to send again the email at sign-up time (with the same token)
    create a regular batch that removes non-validated users after a week
    good pages recommendation system?
    payment system and freemium for after the beta
    menus animation when opening (user + mobile) -> css transitions? with vue transitions?
    make the extension interactions keyboard-navigable too (and have proper aria attributes)
    add tests for the keyboard-navigability (settings, menus...)
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
