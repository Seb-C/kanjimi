MVP:
    Basic login interface in a popup button, token in the extension config
        Extension: 
            post some news on twitter
            - login in the extension when logged in in the site
            - close tab and notify login after login
            - remove hardcoded key set for debugging (and fix related tests)
            - remove the api key from the migration?
            - test this login process
            - fix the static tests that should login before starting

    token component: replace js color detection with css currentColor keyword?
    OVH: try again to create a secundary account?
    subscription process
    verify email process after subscription (and block login if not validated)
    Fix the broken Tooltip test (tooltip does not switch when clicking another word while already opened)
    Website: implement the menu and test it
    Global vuejs error handling?
    dont save urls on mode incognito (window.incognito?)
    Have the extension CSS match the website colours + unify the css with variables
    Landing page: better sync of the parallax on mobile
    Fix the CI
    test with a lot of different sites and texts
    test and debug with slack
    test and debug intensively the display of results
    after the login and subscription pages are done: add links to the index page to the account (changing depending on the localStorage key)
    JLPT level at subscription, use it to define the default status of words
    store visited urls to make recommendations later
    save the watched words and stats about it (frequency, webpage, clicked...) and stats about toggling the words
    only apply conjugations to the words with verb tags
    retrieve password process
    route to modify a user (PATCH, languages and password only)
    database setup -> env file?
    chrome compatibility (and test others)
    search and fix remaining TODOs
    Block access to the test pages in production

Website/publishing:
    include dynamic interface elements (based on the landing page)
    free trial for beta?
    copy/paste functionality on the website (can use the tool on any text, independently from the extension)
    share option for mobile, using the website: https://chodounsky.com/2019/03/24/progressive-web-application-as-a-share-option-in-android/
    include copyright somewhere in the site (and external resources used) -> mostly external resources used
    onboarding
    free plan?
    CGU
    initialize user known words depending on the average JLPT level?

After:
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
