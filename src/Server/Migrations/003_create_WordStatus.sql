CREATE TABLE "WordStatus" (
	"userId" UUID NOT NULL,
	"word" TEXT NOT NULL,
	"showFurigana" BOOLEAN NOT NULL,
	"showTranslation" BOOLEAN NOT NULL,
	CONSTRAINT "WordStatus_primary_key" PRIMARY KEY("userId", "word"),
	CONSTRAINT "WordStatus_userId_foreignKey"
		FOREIGN KEY ("userId")
		REFERENCES "User" ("id")
		ON DELETE CASCADE
);
