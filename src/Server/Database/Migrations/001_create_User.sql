CREATE TABLE "User" (
	"id" UUID PRIMARY KEY NOT NULL,
	"email" TEXT NOT NULL,
	"emailVerified" BOOLEAN NOT NULL,
	"emailVerificationKey" TEXT NULL,
	"password" TEXT NOT NULL,
	"passwordRenewalKey" TEXT NULL,
	"passwordRenewalKeyCreatedAt" TIMESTAMP NULL,
	"languages" TEXT[] NOT NULL,
	"romanReading" BOOLEAN NOT NULL,
	"jlpt" SMALLINT NULL,
	"createdAt" TIMESTAMP NOT NULL,
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
