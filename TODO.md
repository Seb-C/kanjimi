publish latest changes
join sentences splitted in divs?
post kanjimi on linkedin
post kiss-orm on the orm list on github
post kiss-orm in the most upvoted post about nodejs orms
easy way to google translate sentence
CI became slow because it has to build the docker images
    + fix test failing in CI
move the command that uses kubectl in a docker container to avoid having a dependency on this command
log analysis tool? Goaccess?
auto update of the cluster? -> service would be down randomly (domain entrypoint = main node + it is more powerful than the other nodes)
self-host the registry in the cluster?
CI tests -> run on the raw docker images (without the development-related stuff?)
custom 404 page instead of the default one from nginx
Fix pull-to-refresh on Google Chrome?
stop storing URLS: Privacy problem (gdrive, discord, google meet, slack channels...)
pwa: button to navigate back or go home
cypress fetch handler
update screenshots on the extension as well as the homepage samples (kanji details...)
tests Cypress on mobile resolution as well
if can e2e test standalone (for the PWA)
    test that the footer is hidden
    test that the logo has no link
contact page -> rel=noopener?
rss for the changelog
use kubernetes locally as well?
improve the main menu?
    make the Kanjimi and beta subtitles on two lines in the same column on mobile
    tab buttons on mobile for analyze and browse?
    tablet -> don't show the username? Show the buttons instead
automate the file list in the PWA's service worker
dictionary page (+ kanjis?)
trademark? copyright?
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
    -> also saw someone that published some interesting illustrations on twitter
Improve the explanation kunyoumi / onyoumi in the kanji details?
handle sub-element scrolling in the PageHandler detection (example site hvc)
have kanjimi on the product list on the KanjiVG web page
properly handle the srcdoc attribute instead of removing it (relative to absolute conversion)
recognize suffixes to hide some definitions (...shi (city), kun, yama...)?
postgresql 13
alerts if down (use healthcheck)
strategy / gamification / city builder with unlocks inside the app?
migrate to VueJS 3
API rate limiting with nginx (except for local client ips)
Tag words by specific domain vocabulary (community based)
rename the old migrations from XXX_Name.sql to Name (js file + db + production)?
declare activity -> if permissions OK -> do when I start the paid subscriptions
check immigration -> waiting for mail answer
Page API endpoint: use the outgoing network interface?
Do not generate browser.build.js in the WebApp -> not necessary
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
end of Beta: bank OK?
investigate the slow starting time of Jasmine
test other browsers
api subdomain instead of /api/?
when edge is available on linux -> add it to the CI
use the omnibox option to allow translating a string ( https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/omnibox )
don't create Repository objects at every request? Dependency-inject it properly?
pool is set to max 10 connections, will it work with digitalocean (max 22 per node)?
presentation video? show it on the homepage?
cypress: try to use the --experimentalFetchPolyfill option
tsconfig: split client/server? Or extend only what is different (--> need to create sub-files and extract existing stuff)
add a specific type (subset of string) to identify the ids used in the repository methods
cypress in docker to remove the randomness of failure?
create a model class for UserActivity
unit tests: replace loose variables with this.xxx
unit test all store methods by injecting required global stuff
show similar words with shared kanjis to explain better the meaning
move the lexer in a worker?
future free plan -> block after x mojis, but allow to continue a session on same page for x minutes
add the zoom on readings inside the popup
simplify showing tags in definitions -> any way to group it? Show everything in another tab?
merge definitions in all cases (see kotoba in the home samples test page -> there is a name so contents does not get merged)
test the dictionary load method
save the watched words and stats about it (frequency, webpage, clicked...) and stats about toggling the words
save all words and sentences to show up later?
only apply conjugations to the words with verb tags
conjugations that depends on the verb tags
Dictionary: split definitions and reading/tags?
possible to test the Firefox for Android version on CI? (it works but need to forward the 443 port from the emulator)
aria attributes on tooltip (modal dialog attributes?)
keyboard navigation for tokens and tooltip (token only + keystrokes explained in the tooltip?)
underline and overline (text-decoration) for sentence parts / grammar?
commented cypress lines (about disabled fields during loading) -> remove and merge in a separate skipped tests (already done in most test suites)
test the links in the user dropdown
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
Should saved word preferences be different for each reading?
improve order of the returned words (the top one should be right in the context)
Possible to have unit tests for new root classes: stores and router?
free plan?
paid member
Have the home page js also built with webpack?
Use a proper css build system instead of overwriting variables
translate the landing page (french?) and interface and add the supported languages list somewhere
search better dictionaries? -> extract wiktionary (https://dumps.wikimedia.org/backup-index.html) + synonyms, examples...
delete api key when disconnecting (need to create a route)
change email process
error handling properly in express (500 and 404, should always be an API response?)
recommend words to hide depending on the statistics
fix typescript vs vue components (vue 3.0? + store not typed?)
hide and show kanjis by reading (and remember)
example of words using the same kanjis and that have been seen before
route to explain a word (split kanji and contextualized reading of every kanji)
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
