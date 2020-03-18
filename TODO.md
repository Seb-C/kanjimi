fix the tooltip position in case of a change in the position of the node (= loaded text on the top for example)
    - put properties whose changes should not be observed in the data constructor (window and document positions)
    - find a way to observe any change on the parent nodes, and then trigger update
    - also trigger on resize
add all the irregular forms (https://en.wikipedia.org/wiki/Japanese_irregular_verbs) (including suru, kuru, desu, dewanai, dewaarimasen)
debug the tokenizer (+ check the non-kanji forms?)
automatic test of the tooltip position calculations? (e2e tests of the result)
automatic tests for the frontend? unit test some dom functions? How to do that?
find a name

implement users
implement down migrations? or not do it and remove related code
hide and show tokens (and remember)
hide and show kanjis by reading (and remember)
example of words using the same kanjis and that have been seen before
route to explain a word (split kanji and contextualized reading of every kanji)
Kanjis explanation and readings
use kanjis svg instead of a font (proper sizing + animatable?)
Validate input via an express middleware?
close popup if click outside (except another word)
webpack: different typescript config for each (lib and type keys for example)
half width characters? full-width roman chars and letters?
Use the proper languages depending on the user (currently filtered in the route definition)
extension hot-reload -> supported by vue.js, but the current instances are not migrated
replace API with websockets?
properly implement all the JSONApi spec (+ relationships, client already fixed)
optimize server performance by compiling properly
Do not show single kana translations? Or hide words with a particle tag?
counters?
store unfound words?
streaming subtitles support: trigger the function on a dom inserted
display history
manual lookup history
make the enum values hardcoded to avoid future compatibility issues
explain grammar
copy/paste functionality on the website
netflix integration
amazon ebook integration
youtube compatibility
slack compatibility
include copyright somewhere in the site (and external resources used)
