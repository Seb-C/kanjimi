CREATE TABLE "AnalyzeLog" (
	"id" SERIAL PRIMARY KEY NOT NULL,
	"sessionId" UUID NOT NULL,
	"url" TEXT NOT NULL,
	"characters" INTEGER NOT NULL,
	"requestedAt" TIMESTAMPZ NOT NULL
);
