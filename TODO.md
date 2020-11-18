next release:
    progressive web app (+ TODO list features to integrate + better interface)
        need to fix the origin redirect to work on the local network
        share integration
        improve the browser page to look like an actual browser
        define proper caching for the client-side?
        button / interface to install the PWA smoothly
    update the changelog + date
    change the version and publish the extension
    do some database backups manually

important to do soon:
    security alerts from github
    kubernetes + load balancer + automated certificates
    log analysis tool? Goaccess?
    certbot in a cron
        - run automatically certbot with the arguments found in the nginx deployment file
        - make nginx reload it's configuration automatically once a day (currently done with this command: docker exec -t nginx nginx -s reload)
    test charge
    get and install second server
    post on producthunt

After:
    dictionary page (+ kanjis?)
    Rename master branch to production
    Make a development branch
    Automatic deployment when the production branch is deployed?
    More languages for the Kanjis (Should have the same than the main dictionaries)
    fix clearing cache of nginx that breaks things and require restart
    copy tests from the extension to test the in-app browser?
    test NHK easy -> need to remove the ruby tags in a page, replace with root text + normalize parent
    Arabic and Hindi dictionaries?
    Some parts of the Kanjis are contained in another and thus not clickable -> change the order to make it actually clickable?
    ancient writing for the kanjis? -> https://commons.wikimedia.org/wiki/Commons:Ancient_Chinese_characters_project
    Improve the explanation kunyoumi / onyoumi in the kanji details?
    handle sub-element scrolling in the PageHandler detection (example site hvc)
    have kanjimi on the product list on the KanjiVG web page
    properly handle the srcdoc attribute instead of removing it (relative to absolute conversion)
    use Kanjimi more (set a daily planning?)
    add commands to easily connect to the servers
        - list of server ips with a map?
        - simple connections with a ./ssh script
        - database? ./db script? ./ssh db?
    Browse.e2e.ts failing locally but not in the CI -> local url detection not working?
    recognize suffixes to hide some definitions (...shi (city), kun, yama...)?
    nginx restart after failure may take the original configuration env file rather than the latest hot-updated one
    postgresql 13
    alerts if down (use healthcheck)
    update docker nginx sometimes? + pull nodejs container up-to-date at deploy time
    strategy / gamification / city builder with unlocks inside the app?
    migrate to VueJS 3
    manage load balancer list when deploying
    healthcheck for load balancer
    API rate limiting with nginx (except for local client ips)
    config: use default https port (443) instead of 3000 locally
    tests Cypress on mobile resolution
    Tag words by specific domain vocabulary (community based)
    rename the old migrations from XXX_Name.sql to Name (js file + db + production)?
    declare activity -> if permissions OK -> do when I start the paid subscriptions
    check immigration -> waiting for mail answer
    auto restart docker engine sometimes? Seems to become unavailable... (service docker restart)
    make nginx serve the static assets?
    Page API endpoint: use the outgoing network interface?
    Do not generate browser.build.js in the WebApp -> not necessary
    update servers manually before install (and reboot?)
    post on hackernews
    post on reddit
    post on linkedin
    extension: disable the browser action on localhost and kanjimi domains
    update homepage previews
    への recognized as word (name) rather than particles
    inconsistency: GET lexer/kanji takes languages from the profile, not POST lexer/analyze
    alternative KanjiVG files = better?
    setup SES alert when quota reached?
    mass emails = must handle bounces and complaints ( https://aws.amazon.com/fr/blogs/messaging-and-targeting/handling-bounces-and-complaints/ )
    improve the visibility of error messages in the subscription page (too small)
    set docker-compose stop_grace_period to make stop faster
    manually rate-limit the user creation route (save ip in db?)
    how to keep accounting?
    aws -> double factor authentication?
    add manual backups of the db, done on the servers to complete the 7 days provided?
    end of Beta: bank OK?
    better emails (ovh spam filter sucks...)?
    investigate the slow starting time of Jasmine
    reenable the docker_image test (fails because the healthcheck does not have a database)
    test other browsers
    api subdomain instead of /api/?
    when edge is available on linux -> add it to the CI
    use the omnibox option to allow translating a string ( https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/omnibox )
    don't create repository objects at every request?
    pool is set to max 10 connections, will it work with digitalocean (max 22 per node)?
    presentation video? show it on the homepage?
    cypress: try to use the --experimentalFetchPolyfill option
    tsconfig: split client/server? Or extend only what is different (--> need to create sub-files and extract existing stuff)
    add a specific type (subset of string) to identify the ids used in the repository methods
    ping endpoint to use for healthcheck (also tests the db)
    cypress in docker to remove the randomness of failure?
    create a model class for UserActivity
    unit tests: replace loose variables with this.xxx
    unit test all store methods by injecting required global stuff
    show similar words with shared kanjis to explain better the meaning
    move the lexer in a worker?
    replace API with websockets?
    future free plan -> block after x mojis, but allow to continue a session on same page for x minutes
    add the zoom on readings inside the popup
    simplify showing tags in definitions -> any way to group it? Show everything in another tab?
    merge definitions in all cases (see kotoba in the home samples test page -> there is a name so contents does not get merged)
    test the dictionary load method
    cross browser testing
    save the watched words and stats about it (frequency, webpage, clicked...) and stats about toggling the words
    save all words and sentences to show up later?
    only apply conjugations to the words with verb tags
    conjugations that depends on the verb tags
    Dictionary: split definitions and reading/tags?
    dependency-injection for all the browser.xxx APIs from the main script
    bookmarklet that redirects to the site?
    possible to test the Firefox for Android version on CI? (it works but need to forward the 3000 port from the emulator)
    aria attributes on tooltip (modal dialog attributes?)
    keyboard navigation for tokens and tooltip (token only + keystrokes explained in the tooltip?)
    underline and overline (text-decoration) for sentence parts / grammar?
    commented cypress lines (about disabled fields during loading) -> remove and merge in a separate skipped tests (already done in most test suites)
    test the links in the user dropdown
    don't restart server if a server test file has changed
    vocabulary review
    analyzer: any way to regroup sentences and then split again based on the original string index in the array?
    animations on the tooltip (appear/disappear)
    animations on the notification (appear/disappear)
    animations on the webapp (everywhere even if no natural delay)
    Global vuejs error handling?
    if an email already exists and is not validated, try to send again the email at sign-up time (with the same token)
    create a regular batch that removes non-validated users after a week
    good pages recommendation system?
    payment system and freemium for after the beta
    menus animation when opening (user + mobile) -> css transitions? with vue transitions?
    make the extension interactions keyboard-navigable too (and have proper aria attributes)
    add tests for the keyboard-navigability (settings, menus...)
    add a test to the filter that does not translate the site itself (settings sample, homepage samples...)
    translate the interface in french (+ add a multi-lang / labels system)
    separate the layout component: should have one menu component and one usermenu component
    route to delete an api key + use it on explicit disconnect + wait properly before showing the confirm message (and show a loader)
    auto remove expired api keys
    search and fix remaining TODOs
    cypress tests in typescript
    server side fetching of a page to be independent from the extension
    share option for mobile, using the website: https://chodounsky.com/2019/03/24/progressive-web-application-as-a-share-option-in-android/
    Should saved word preferences be different for each reading?
    improve order of the returned words (the top one should be right in the context)
    Possible to have unit tests for new root classes: stores and router?
    OVH: try again to create a secondary account?
    free plan?
    paid member
    Have the home page js also built with webpack?
    Use a proper css build system instead of overwriting variables
    Possible to fix this? https://github.com/Seb-C/kanjimi/network/alert/package-lock.json/minimist/closed
    translate the landing page (french?) and interface and add the supported languages list somewhere
    Cypress commands should run in a docker as well
    search better dictionaries? -> extract wiktionary (https://dumps.wikimedia.org/backup-index.html) + synonyms, examples...
    delete api key when disconnecting (need to create a route)
    change email process
    error handling properly in express (500 and 404, should always be an API response?)
    recommend words to hide depending on the statistics
    fix typescript vs vue components (vue 3.0? + store not typed?)
    hide and show kanjis by reading (and remember)
    example of words using the same kanjis and that have been seen before
    route to explain a word (split kanji and contextualized reading of every kanji)
    show knji part and roots and explain everything (+ color different parts)
    also show antique kanji writings (pictograms) to provide a visual help? Or make a more practical image database (I saw a twitter user doing this)?
    half width characters? full-width roman chars and letters?
    extension hot-reload -> supported by vue.js, but the current instances are not migrated
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
