CREATE TABLE "Token" (
	"id" UUID PRIMARY KEY NOT NULL,
	"token" TEXT NOT NULL,
	"userId" UUID NOT NULL,
	"createdAt" TIMESTAMP NOT NULL,
	"expiresAt" TIMESTAMP NOT NULL,
	CONSTRAINT "Token_userId_foreignKey"
		FOREIGN KEY ("userId")
		REFERENCES "User" ("id")
		ON DELETE CASCADE
);

CREATE INDEX "Token_token_index" ON "Token"("token");

INSERT INTO "Token" VALUES (
	'a2912ca8-c206-467b-b914-aae961930c71',
	'PQKXFg4puvIsoY0/iwVDCNtt6K+iPj7PiK4LlayMOHddJErCcZl2lx8cnB7kT28+MqZX+FTu3efwrqXVqE2dbQ==',
	'cef830cb-6e75-43ab-91d3-ae13c82bd836',
	'2020-01-01 00:00:00',
	'2050-12-31 23:59:59'
);
