CREATE TABLE "Word" (
	"id" SERIAL PRIMARY KEY NOT NULL,
	"word" TEXT NOT NULL,
	"reading" TEXT NOT NULL,
	"partOfSpeech" TEXT[] NOT NULL,
	"translationLang" TEXT NOT NULL,
	"translation" TEXT NOT NULL
);

CREATE TABLE "PartOfSpeech" (
	"tag" TEXT NOT NULL PRIMARY KEY,
	"description" TEXT NOT NULL
);
