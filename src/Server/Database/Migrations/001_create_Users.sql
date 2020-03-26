CREATE TABLE "User" (
	"id" UUID PRIMARY KEY NOT NULL,
	"email" TEXT NOT NULL,
	"emailVerified" BOOLEAN NOT NULL,
	"password" TEXT NOT NULL,
	"languages" TEXT[] NOT NULL,
	"createdAt" TIMESTAMP NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE ("email")
);
