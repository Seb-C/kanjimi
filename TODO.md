Tech priority:
- Separate server, client and common classes?
- Validate input via an express middleware?
- webpack: different typescript config for each (lib and type keys for example)
- webpack: commonize as much config as possible
- implement down migrations

Algorithm priorities:
- suru irregular
- kuru irregular
- adjectives conjugation? https://en.wikipedia.org/wiki/Japanese_verb_conjugation
- multi token expressions?
- half width characters? full-width roman chars and letters?

Misc
- Filter languages in server instead of client (see TODO in WordToken)
- decomment last random test sentences
- Add all data about a word as a tooltip

Optimization related:
- properly implement all the JSONApi spec (+ relationships)
- Show a loading indicator
- Client should be able to make parallel queries
- Group HTTP queries?
- Optimize the algorithm

Algorithm tiny fixes:
- Do not show reading for load words (katakana)
- Do not show single kana translations?

Need to relaunch the dictionary script:
- convert language code
- Kanjis dictionary?
- names dictionary?
- counters?
- places and countries names?
