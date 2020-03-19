MVP:
    add all the irregular forms (https://en.wikipedia.org/wiki/Japanese_irregular_verbs) (including suru, kuru, desu, dewanai, dewaarimasen)
    Validate input via an express middleware?
    display particle title whenever a word is a particle (and revert the definition change?)
    test with a lot of different sites
    test and debug intensively the tokenizer and display of results
    find a name
    implement users
    hide and show words (and remember)
    webpack: different typescript config for each (lib and type keys for example)
    Use the proper languages depending on the user (currently filtered in the route definition)
    store visited urls to make recommendations later
    copy/paste functionality on the website
    include copyright somewhere in the site (and external resources used)

After:
    automatic test of the tooltip position calculations? (e2e tests of the result)
    automatic tests for the frontend? unit test some dom functions? How to do that?
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
