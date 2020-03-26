CREATE TABLE "User" (
	"id" UUID PRIMARY KEY NOT NULL,
	"email" TEXT NOT NULL,
	"emailVerified" BOOLEAN NOT NULL,
	"password" TEXT NOT NULL,
	"languages" TEXT[] NOT NULL,
	"createdAt" TIMESTAMP NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE ("email")
);

INSERT INTO "User" VALUES (
	'cef830cb-6e75-43ab-91d3-ae13c82bd836',
	'sebastiencaparros@gmail.com',
	TRUE,
	'tBFLEey0WrShutB+85y1imLXyhw7h9dtGQgmiG76cD0=',
	ARRAY['fr', 'en'],
	'2020-03-26 22:21:16'
);
