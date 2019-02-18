--
-- PostgreSQL database dump
--

-- Dumped from database version 11.1 (Debian 11.1-3.pgdg90+1)
-- Dumped by pg_dump version 11.1 (Debian 11.1-3.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: dictionary; Type: SCHEMA; Schema: -; Owner: test
--

CREATE SCHEMA "dictionary";


ALTER SCHEMA "dictionary" OWNER TO "test";

--
-- Name: SenseType; Type: TYPE; Schema: dictionary; Owner: test
--

CREATE TYPE "dictionary"."SenseType" AS ENUM (
    'literal',
    'figurative',
    'explanation'
);


ALTER TYPE "dictionary"."SenseType" OWNER TO "test";

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: Anthonym; Type: TABLE; Schema: dictionary; Owner: test
--

CREATE TABLE "dictionary"."Anthonym" (
    "id" integer NOT NULL,
    "senseId" integer NOT NULL,
    "anthonymWordId" integer,
    "anthonymReadingId" integer,
    "anthonymSenseId" integer
);


ALTER TABLE "dictionary"."Anthonym" OWNER TO "test";

--
-- Name: Anthonym_id_seq; Type: SEQUENCE; Schema: dictionary; Owner: test
--

CREATE SEQUENCE "dictionary"."Anthonym_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "dictionary"."Anthonym_id_seq" OWNER TO "test";

--
-- Name: Anthonym_id_seq; Type: SEQUENCE OWNED BY; Schema: dictionary; Owner: test
--

ALTER SEQUENCE "dictionary"."Anthonym_id_seq" OWNED BY "dictionary"."Anthonym"."id";


--
-- Name: Origin; Type: TABLE; Schema: dictionary; Owner: test
--

CREATE TABLE "dictionary"."Origin" (
    "id" integer NOT NULL,
    "senseId" integer NOT NULL,
    "lang" "text" NOT NULL,
    "translation" "text" NOT NULL,
    "describesFully" boolean NOT NULL,
    "madeFromForeignWords" boolean NOT NULL
);


ALTER TABLE "dictionary"."Origin" OWNER TO "test";

--
-- Name: Origin_id_seq; Type: SEQUENCE; Schema: dictionary; Owner: test
--

CREATE SEQUENCE "dictionary"."Origin_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "dictionary"."Origin_id_seq" OWNER TO "test";

--
-- Name: Origin_id_seq; Type: SEQUENCE OWNED BY; Schema: dictionary; Owner: test
--

ALTER SEQUENCE "dictionary"."Origin_id_seq" OWNED BY "dictionary"."Origin"."id";


--
-- Name: PartOfSpeech; Type: TABLE; Schema: dictionary; Owner: test
--

CREATE TABLE "dictionary"."PartOfSpeech" (
    "tag" "text" NOT NULL,
    "description" "text" NOT NULL
);


ALTER TABLE "dictionary"."PartOfSpeech" OWNER TO "test";

--
-- Name: Reading; Type: TABLE; Schema: dictionary; Owner: test
--

CREATE TABLE "dictionary"."Reading" (
    "id" integer NOT NULL,
    "reading" "text" NOT NULL,
    "trueReading" boolean NOT NULL,
    "frequency" integer,
    "irregular" boolean NOT NULL,
    "outDated" boolean NOT NULL
);


ALTER TABLE "dictionary"."Reading" OWNER TO "test";

--
-- Name: ReadingWord; Type: TABLE; Schema: dictionary; Owner: test
--

CREATE TABLE "dictionary"."ReadingWord" (
    "readingId" integer NOT NULL,
    "wordId" integer NOT NULL
);


ALTER TABLE "dictionary"."ReadingWord" OWNER TO "test";

--
-- Name: Reading_id_seq; Type: SEQUENCE; Schema: dictionary; Owner: test
--

CREATE SEQUENCE "dictionary"."Reading_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "dictionary"."Reading_id_seq" OWNER TO "test";

--
-- Name: Reading_id_seq; Type: SEQUENCE OWNED BY; Schema: dictionary; Owner: test
--

ALTER SEQUENCE "dictionary"."Reading_id_seq" OWNED BY "dictionary"."Reading"."id";


--
-- Name: Sense; Type: TABLE; Schema: dictionary; Owner: test
--

CREATE TABLE "dictionary"."Sense" (
    "id" integer NOT NULL,
    "info" "text",
    "dialect" "text"[] NOT NULL,
    "context" "text"[] NOT NULL,
    "type" "text"[] NOT NULL,
    "partOfSpeech" "text"[] NOT NULL
);


ALTER TABLE "dictionary"."Sense" OWNER TO "test";

--
-- Name: SenseReading; Type: TABLE; Schema: dictionary; Owner: test
--

CREATE TABLE "dictionary"."SenseReading" (
    "senseId" integer NOT NULL,
    "readingId" integer NOT NULL
);


ALTER TABLE "dictionary"."SenseReading" OWNER TO "test";

--
-- Name: SenseWord; Type: TABLE; Schema: dictionary; Owner: test
--

CREATE TABLE "dictionary"."SenseWord" (
    "senseId" integer NOT NULL,
    "wordId" integer NOT NULL
);


ALTER TABLE "dictionary"."SenseWord" OWNER TO "test";

--
-- Name: Sense_id_seq; Type: SEQUENCE; Schema: dictionary; Owner: test
--

CREATE SEQUENCE "dictionary"."Sense_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "dictionary"."Sense_id_seq" OWNER TO "test";

--
-- Name: Sense_id_seq; Type: SEQUENCE OWNED BY; Schema: dictionary; Owner: test
--

ALTER SEQUENCE "dictionary"."Sense_id_seq" OWNED BY "dictionary"."Sense"."id";


--
-- Name: Synonym; Type: TABLE; Schema: dictionary; Owner: test
--

CREATE TABLE "dictionary"."Synonym" (
    "id" integer NOT NULL,
    "senseId" integer NOT NULL,
    "synonymWordId" integer,
    "synonymReadingId" integer,
    "synonymSenseId" integer
);


ALTER TABLE "dictionary"."Synonym" OWNER TO "test";

--
-- Name: Synonym_id_seq; Type: SEQUENCE; Schema: dictionary; Owner: test
--

CREATE SEQUENCE "dictionary"."Synonym_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "dictionary"."Synonym_id_seq" OWNER TO "test";

--
-- Name: Synonym_id_seq; Type: SEQUENCE OWNED BY; Schema: dictionary; Owner: test
--

ALTER SEQUENCE "dictionary"."Synonym_id_seq" OWNED BY "dictionary"."Synonym"."id";


--
-- Name: Translation; Type: TABLE; Schema: dictionary; Owner: test
--

CREATE TABLE "dictionary"."Translation" (
    "id" integer NOT NULL,
    "senseId" integer NOT NULL,
    "lang" "text" NOT NULL,
    "translation" "text" NOT NULL,
    "type" "dictionary"."SenseType"
);


ALTER TABLE "dictionary"."Translation" OWNER TO "test";

--
-- Name: Translation_id_seq; Type: SEQUENCE; Schema: dictionary; Owner: test
--

CREATE SEQUENCE "dictionary"."Translation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "dictionary"."Translation_id_seq" OWNER TO "test";

--
-- Name: Translation_id_seq; Type: SEQUENCE OWNED BY; Schema: dictionary; Owner: test
--

ALTER SEQUENCE "dictionary"."Translation_id_seq" OWNED BY "dictionary"."Translation"."id";


--
-- Name: Word; Type: TABLE; Schema: dictionary; Owner: test
--

CREATE TABLE "dictionary"."Word" (
    "id" integer NOT NULL,
    "word" "text" NOT NULL,
    "frequency" integer,
    "ateji" boolean NOT NULL,
    "irregularKanji" boolean NOT NULL,
    "irregularKana" boolean NOT NULL,
    "outDatedKanji" boolean NOT NULL
);


ALTER TABLE "dictionary"."Word" OWNER TO "test";

--
-- Name: Word_id_seq; Type: SEQUENCE; Schema: dictionary; Owner: test
--

CREATE SEQUENCE "dictionary"."Word_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "dictionary"."Word_id_seq" OWNER TO "test";

--
-- Name: Word_id_seq; Type: SEQUENCE OWNED BY; Schema: dictionary; Owner: test
--

ALTER SEQUENCE "dictionary"."Word_id_seq" OWNED BY "dictionary"."Word"."id";


--
-- Name: Anthonym id; Type: DEFAULT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Anthonym" ALTER COLUMN "id" SET DEFAULT "nextval"('"dictionary"."Anthonym_id_seq"'::"regclass");


--
-- Name: Origin id; Type: DEFAULT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Origin" ALTER COLUMN "id" SET DEFAULT "nextval"('"dictionary"."Origin_id_seq"'::"regclass");


--
-- Name: Reading id; Type: DEFAULT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Reading" ALTER COLUMN "id" SET DEFAULT "nextval"('"dictionary"."Reading_id_seq"'::"regclass");


--
-- Name: Sense id; Type: DEFAULT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Sense" ALTER COLUMN "id" SET DEFAULT "nextval"('"dictionary"."Sense_id_seq"'::"regclass");


--
-- Name: Synonym id; Type: DEFAULT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Synonym" ALTER COLUMN "id" SET DEFAULT "nextval"('"dictionary"."Synonym_id_seq"'::"regclass");


--
-- Name: Translation id; Type: DEFAULT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Translation" ALTER COLUMN "id" SET DEFAULT "nextval"('"dictionary"."Translation_id_seq"'::"regclass");


--
-- Name: Word id; Type: DEFAULT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Word" ALTER COLUMN "id" SET DEFAULT "nextval"('"dictionary"."Word_id_seq"'::"regclass");


--
-- Name: Anthonym Anthonym_pkey; Type: CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Anthonym"
    ADD CONSTRAINT "Anthonym_pkey" PRIMARY KEY ("id");


--
-- Name: Origin Origin_pkey; Type: CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Origin"
    ADD CONSTRAINT "Origin_pkey" PRIMARY KEY ("id");


--
-- Name: PartOfSpeech PartOfSpeech_pkey; Type: CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."PartOfSpeech"
    ADD CONSTRAINT "PartOfSpeech_pkey" PRIMARY KEY ("tag");


--
-- Name: ReadingWord ReadingWord_pkey; Type: CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."ReadingWord"
    ADD CONSTRAINT "ReadingWord_pkey" PRIMARY KEY ("readingId", "wordId");


--
-- Name: Reading Reading_pkey; Type: CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Reading"
    ADD CONSTRAINT "Reading_pkey" PRIMARY KEY ("id");


--
-- Name: SenseReading SenseReading_pkey; Type: CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."SenseReading"
    ADD CONSTRAINT "SenseReading_pkey" PRIMARY KEY ("senseId", "readingId");


--
-- Name: SenseWord SenseWord_pkey; Type: CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."SenseWord"
    ADD CONSTRAINT "SenseWord_pkey" PRIMARY KEY ("senseId", "wordId");


--
-- Name: Sense Sense_pkey; Type: CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Sense"
    ADD CONSTRAINT "Sense_pkey" PRIMARY KEY ("id");


--
-- Name: Synonym Synonym_pkey; Type: CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Synonym"
    ADD CONSTRAINT "Synonym_pkey" PRIMARY KEY ("id");


--
-- Name: Translation Translation_pkey; Type: CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Translation"
    ADD CONSTRAINT "Translation_pkey" PRIMARY KEY ("id");


--
-- Name: Word Word_pkey; Type: CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Word"
    ADD CONSTRAINT "Word_pkey" PRIMARY KEY ("id");


--
-- Name: Anthonym Anthonym_anthonymReadingId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Anthonym"
    ADD CONSTRAINT "Anthonym_anthonymReadingId_fkey" FOREIGN KEY ("anthonymReadingId") REFERENCES "dictionary"."Reading"("id");


--
-- Name: Anthonym Anthonym_anthonymSenseId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Anthonym"
    ADD CONSTRAINT "Anthonym_anthonymSenseId_fkey" FOREIGN KEY ("anthonymSenseId") REFERENCES "dictionary"."Sense"("id");


--
-- Name: Anthonym Anthonym_anthonymWordId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Anthonym"
    ADD CONSTRAINT "Anthonym_anthonymWordId_fkey" FOREIGN KEY ("anthonymWordId") REFERENCES "dictionary"."Word"("id");


--
-- Name: Anthonym Anthonym_senseId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Anthonym"
    ADD CONSTRAINT "Anthonym_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "dictionary"."Sense"("id");


--
-- Name: Origin Origin_senseId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Origin"
    ADD CONSTRAINT "Origin_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "dictionary"."Sense"("id");


--
-- Name: ReadingWord ReadingWord_readingId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."ReadingWord"
    ADD CONSTRAINT "ReadingWord_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "dictionary"."Reading"("id");


--
-- Name: ReadingWord ReadingWord_wordId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."ReadingWord"
    ADD CONSTRAINT "ReadingWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "dictionary"."Word"("id");


--
-- Name: SenseReading SenseReading_readingId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."SenseReading"
    ADD CONSTRAINT "SenseReading_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "dictionary"."Reading"("id");


--
-- Name: SenseReading SenseReading_senseId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."SenseReading"
    ADD CONSTRAINT "SenseReading_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "dictionary"."Sense"("id");


--
-- Name: SenseWord SenseWord_senseId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."SenseWord"
    ADD CONSTRAINT "SenseWord_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "dictionary"."Sense"("id");


--
-- Name: SenseWord SenseWord_wordId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."SenseWord"
    ADD CONSTRAINT "SenseWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "dictionary"."Word"("id");


--
-- Name: Synonym Synonym_senseId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Synonym"
    ADD CONSTRAINT "Synonym_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "dictionary"."Sense"("id");


--
-- Name: Synonym Synonym_synonymReadingId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Synonym"
    ADD CONSTRAINT "Synonym_synonymReadingId_fkey" FOREIGN KEY ("synonymReadingId") REFERENCES "dictionary"."Reading"("id");


--
-- Name: Synonym Synonym_synonymSenseId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Synonym"
    ADD CONSTRAINT "Synonym_synonymSenseId_fkey" FOREIGN KEY ("synonymSenseId") REFERENCES "dictionary"."Sense"("id");


--
-- Name: Synonym Synonym_synonymWordId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Synonym"
    ADD CONSTRAINT "Synonym_synonymWordId_fkey" FOREIGN KEY ("synonymWordId") REFERENCES "dictionary"."Word"("id");


--
-- Name: Translation Translation_senseId_fkey; Type: FK CONSTRAINT; Schema: dictionary; Owner: test
--

ALTER TABLE ONLY "dictionary"."Translation"
    ADD CONSTRAINT "Translation_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "dictionary"."Sense"("id");


--
-- PostgreSQL database dump complete
--

