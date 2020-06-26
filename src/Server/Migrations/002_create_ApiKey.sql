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
