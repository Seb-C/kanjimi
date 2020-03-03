fix now broken conjugation tests
add a test for the i-adjectives in a sentence (and debug the lexer if needed)
add all the irregular forms (https://en.wikipedia.org/wiki/Japanese_irregular_verbs) (including suru, kuru, desu, dewanai, dewaarimasen)
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
