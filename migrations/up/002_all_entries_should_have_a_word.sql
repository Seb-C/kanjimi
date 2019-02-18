DO $$
	DECLARE row record;
	DECLARE insertedWordId INTEGER;
BEGIN
	SET search_path TO "dictionary", "public";

	FOR row IN
		SELECT "id", "reading", "irregular"
		FROM "Reading"
		LEFT OUTER JOIN "ReadingWord" ON "ReadingWord"."readingId" = "Reading"."id"
		WHERE "ReadingWord"."wordId" IS NULL
	LOOP
		INSERT INTO "Word" VALUES (
			DEFAULT, row."reading", NULL, FALSE, FALSE, row."irregular", FALSE
		) RETURNING "id" INTO insertedWordId;

		INSERT INTO "ReadingWord" ("readingId", "wordId") VALUES (row."id", insertedWordId);
	END LOOP;
END $$;
