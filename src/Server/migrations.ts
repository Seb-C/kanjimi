import { sql } from 'kiss-orm';

export default {
	'001_create_User.sql': sql`
		CREATE TABLE "User" (
			"id" UUID PRIMARY KEY NOT NULL,
			"email" TEXT NOT NULL,
			"emailVerified" BOOLEAN NOT NULL,
			"emailVerificationKey" TEXT NULL,
			"password" TEXT NOT NULL,
			"passwordResetKey" TEXT NULL,
			"passwordResetKeyExpiresAt" TIMESTAMPTZ NULL,
			"languages" TEXT[] NOT NULL,
			"romanReading" BOOLEAN NOT NULL,
			"jlpt" SMALLINT NULL,
			"createdAt" TIMESTAMPTZ NOT NULL,
			CONSTRAINT "User_email_unique" UNIQUE ("email")
		);

		CREATE INDEX "User_email_index" ON "User"("email");

		INSERT INTO "User" VALUES (
			'cef830cb-6e75-43ab-91d3-ae13c82bd836',
			'contact@kanjimi.com',
			TRUE,
			NULL,
			'XezyI+4BK2TS47Wfol4+DbXXNWvHKwbFtFlmpG3Q4L0=', -- YQPtL67gddfnkads
			NULL,
			NULL,
			ARRAY['fr', 'en'],
			FALSE,
			3,
			'2020-03-26 22:21:16'
		);
	`,
	'002_create_ApiKey.sql': sql`
		CREATE TABLE "ApiKey" (
			"id" UUID PRIMARY KEY NOT NULL,
			"key" TEXT NOT NULL,
			"userId" UUID NOT NULL,
			"createdAt" TIMESTAMPTZ NOT NULL,
			"expiresAt" TIMESTAMPTZ NOT NULL,
			CONSTRAINT "ApiKey_key_unique" UNIQUE ("key"),
			CONSTRAINT "Token_userId_foreignKey"
				FOREIGN KEY ("userId")
				REFERENCES "User" ("id")
				ON DELETE CASCADE
		);

		CREATE INDEX "Token_token_index" ON "ApiKey"("key");

		INSERT INTO "ApiKey" VALUES (
			'a2912ca8-c206-467b-b914-aae961930c71',
			'PQKXFg4puvIsoY0/iwVDCNtt6K+iPj7PiK4LlayMOHddJErCcZl2lx8cnB7kT28+MqZX+FTu3efwrqXVqE2dbQ==',
			'cef830cb-6e75-43ab-91d3-ae13c82bd836',
			'2020-01-01 00:00:00',
			'2050-12-31 23:59:59'
		);
	`,
	'003_create_WordStatus.sql': sql`
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
	`,
	'004_create_UserActivity.sql': sql`
		CREATE TABLE "UserActivity" (
			"userId" UUID NOT NULL,
			"date" DATE NOT NULL,
			"characters" INTEGER NOT NULL,
			CONSTRAINT "UserActivity_primary_key" PRIMARY KEY("userId", "date"),
			CONSTRAINT "UserActivity_userId_foreignKey"
				FOREIGN KEY ("userId")
				REFERENCES "User" ("id")
				ON DELETE CASCADE
		);
	`,
	'005_create_AnalyzeLog.sql': sql`
		CREATE TABLE "AnalyzeLog" (
			"id" SERIAL PRIMARY KEY NOT NULL,
			"sessionId" UUID NOT NULL,
			"url" TEXT NOT NULL,
			"characters" INTEGER NOT NULL,
			"requestedAt" TIMESTAMPTZ NOT NULL
		);
	`,
};
