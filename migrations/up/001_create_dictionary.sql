CREATE TABLE "Word" (
	"id" SERIAL PRIMARY KEY NOT NULL,
	"word" TEXT NOT NULL,
	"reading" TEXT NOT NULL,
	"frequency" INTEGER NULL,
	"context" TEXT[] NOT NULL,
	"partOfSpeech" TEXT[] NOT NULL,
	"translationLang" TEXT NOT NULL,
	"translation" TEXT NOT NULL,
	UNIQUE(
		"word",
		"reading",
		"frequency",
		"context",
		"partOfSpeech",
		"translationLang",
		"translation"
	)
);

CREATE TABLE "PartOfSpeech" (
	"tag" TEXT NOT NULL PRIMARY KEY,
	"description" TEXT NOT NULL
);
