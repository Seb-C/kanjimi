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
