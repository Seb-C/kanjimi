MVP:
    hide and show words (and remember)
        create insert client method and test
        create get client method and test
    landing page + video
    automatic test of the tooltip position calculations? (e2e tests of the result? selenium? geckodriver?)
    automatic tests for the frontend? unit test some dom functions? How to do that?
    Basic login interface in a popup button, token in the extension config
        - remove hardcoded key set for debugging
    test with a lot of different sites
    test and debug intensively the display of results
    webpack: different webpack and typescript config for extension and server
    store visited urls to make recommendations later
    save the watched words and stats about it (frequency, webpage, clicked...) and stats about toggling the words
    only apply conjugations to the words with verb tags
    retrieve password process
    verify email process after subscription (and block login if not validated)
    route to modify a user (PATCH, languages and password only)
    database setup -> env file?
    chrome compatibility

Website/publishing:
    free trial for beta?
    analytics?
    copy/paste functionality on the website (can use the tool on any text, independently from the extension)
    share option for mobile, using the website: https://chodounsky.com/2019/03/24/progressive-web-application-as-a-share-option-in-android/
    include copyright somewhere in the site (and external resources used)
    onboarding
    contact/newsletters/discussions/rss (forum or discord?)
    make a website and newsletter before release
    free plan?
    CGU
    initialize user known words depending on the average jlpt level?
    coming soon page early

After:
    tslint: clean useless imports -> migrate to https://github.com/typescript-eslint/typescript-eslint
    automatic updates (https://extensionworkshop.com/documentation/manage/updating-your-extension/)
    search better dictionaries? -> extract wiktionary (https://dumps.wikimedia.org/backup-index.html)
    remove tslint?
    disconnect (delete api key route)
    change email process
    error handling properly in express (500 and 404, should always be an API response?)
    recommend words to hide depending on the statistics
    CI to run the tests
    fix the broken indentation and folding for typescript
    implement down migrations? or not do it and remove related code
    hide and show kanjis by reading (and remember)
    example of words using the same kanjis and that have been seen before
    route to explain a word (split kanji and contextualized reading of every kanji)
    Kanjis explanation and readings
    use kanjis svg instead of a font (proper sizing + animatable?)
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
    slack compatibility
    handle closing popup with the back button using pushstate on mobile?
