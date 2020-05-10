CREATE TABLE "ApiKey" (
	"id" UUID PRIMARY KEY NOT NULL,
	"key" TEXT NOT NULL,
	"userId" UUID NOT NULL,
	"createdAt" TIMESTAMP NOT NULL,
	"expiresAt" TIMESTAMP NOT NULL,
	CONSTRAINT "ApiKey_key_unique" UNIQUE ("key"),
	CONSTRAINT "Token_userId_foreignKey"
		FOREIGN KEY ("userId")
		REFERENCES "User" ("id")
		ON DELETE CASCADE
);

CREATE INDEX "Token_token_index" ON "ApiKey"("key");
