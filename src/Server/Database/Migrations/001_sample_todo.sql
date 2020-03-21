CREATE TABLE "User" (
	"id" SERIAL PRIMARY KEY NOT NULL,
	"email" TEXT NOT NULL,
	"emailVerified" BOOLEAN NOT NULL,
	"password" TEXT NOT NULL,
	"languages" TEXT[] NOT NULL,
	"createdAt" TIMESTAMP NOT NULL
);
