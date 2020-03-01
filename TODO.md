conjugation list is wrong, missing characters like べる (only へる exists)
    'きる' -> giru
    'ける' -> geru
    'しる' -> jiru
    'せる' -> zeru
    'ちる' -> jiru
    'てる' -> deru
    'ひる' -> biru
    'ひる' -> piru
    'へる' -> beru
    'へる' -> peru
    -> compare again to the grammar lists to be sure that everything is here (-u/-i might have become only u/i?)

add a test for splitByDictionarySearches
fix the failing test (the code is wrong?)
decomment last test sentences and test it properly

other forms based on i: yaritai, tabetai, tabetara
verbs without kanji: やりたい
add a test for the i-adjectives in a sentence (and debug the lexer if needed)
suru irregular
kuru irregular
desu? + dewa nai/arimasen

ConjugationForms -> use maps instead of objects (and everywhere)
fix the extension multiple errors
simplify the extension rendering
Do not show reading for loan words (katakana)
update vim syntax colours broken (see bottom of the dictionary)
improve the UI performance
commit dictionary?
Separate server, client and common classes?
Validate input via an express middleware?
webpack: different typescript config for each (lib and type keys for example)
implement down migrations
Search and fix the TODOs in the codebase
half width characters? full-width roman chars and letters?
Filter languages in server instead of client (see TODO in WordToken)
Add all data about a word as a tooltip
properly implement all the JSONApi spec (+ relationships)
Show a loading indicator
Client should be able to make parallel queries
Group HTTP queries?
Optimize the algorithm
Do not show single kana translations?
convert language code
Kanjis dictionary?
names dictionary?
counters?
places and countries names?
store unfound words?
display history
manual lookup history
