CREATE TABLE "WordStatus" (
	"userId" UUID NOT NULL,
	"word" TEXT NOT NULL,
	"showFurigana" BOOLEAN NOT NULL,
	"showTranslation" TEXT NOT NULL,
	CONSTRAINT "WordStatus_primary_key" PRIMARY KEY("userId", "word")
);
