CREATE TABLE "User" (
	"id" UUID PRIMARY KEY NOT NULL,
	"email" TEXT NOT NULL,
	"emailVerified" BOOLEAN NOT NULL,
	"password" TEXT NOT NULL,
	"languages" TEXT[] NOT NULL,
	"createdAt" TIMESTAMP NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE ("email")
);

CREATE INDEX "User_email_index" ON "User"("email");

INSERT INTO "User" VALUES (
	'cef830cb-6e75-43ab-91d3-ae13c82bd836',
	'contact@kanjimi.com',
	TRUE,
	'XezyI+4BK2TS47Wfol4+DbXXNWvHKwbFtFlmpG3Q4L0=', -- YQPtL67gddfnkads
	ARRAY['fr', 'en'],
	'2020-03-26 22:21:16'
);
