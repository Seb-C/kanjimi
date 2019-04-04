SELECT
	"Word"."word",
	"Word"."frequency" AS "wordFrequency",
	"Reading"."reading",
	"Reading"."frequency" AS "readingFrequency",
	"Sense"."context" AS "context",
	"Sense"."partOfSpeech",
	"Translation"."translation",
	"Translation"."lang" AS "translationLang"
FROM "dictionary"."Word"

LEFT OUTER JOIN "dictionary"."ReadingWord" ON "ReadingWord"."wordId" = "Word"."id"
LEFT OUTER JOIN "dictionary"."Reading" ON "ReadingWord"."readingId" = "Reading"."id"

LEFT OUTER JOIN "dictionary"."SenseReading" ON "SenseReading"."readingId" = "Reading"."id"
LEFT OUTER JOIN "dictionary"."Sense" ON "SenseReading"."senseId" = "Sense"."id"

LEFT OUTER JOIN (
	(SELECT "senseId", "translation", "lang" FROM "dictionary"."Origin")
	UNION
	(SELECT "senseId", "translation", "lang" FROM "dictionary"."Translation")
) AS "Translation" ON "Translation"."senseId" = "Sense"."id"
