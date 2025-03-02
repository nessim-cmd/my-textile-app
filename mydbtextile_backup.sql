--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Status" AS ENUM (
    'EN_COURS',
    'EN_PAUSE',
    'EN_ATTENTE',
    'FINI'
);


ALTER TYPE public."Status" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Accessoire; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Accessoire" (
    id text NOT NULL,
    reference_accessoire text NOT NULL,
    "quantity_reçu" double precision NOT NULL,
    quantity_trouve double precision NOT NULL,
    quantity_manque double precision NOT NULL,
    "modelId" text NOT NULL
);


ALTER TABLE public."Accessoire" OWNER TO postgres;

--
-- Name: Client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Client" (
    id text NOT NULL,
    name text,
    email text,
    phone1 text,
    phone2 text,
    fix text,
    address text,
    "matriculeFiscale" text,
    soumission text,
    "dateDebutSoumission" text,
    "dateFinSoumission" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Client" OWNER TO postgres;

--
-- Name: ClientModel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ClientModel" (
    id text NOT NULL,
    name text,
    description text,
    "clientId" text NOT NULL,
    commandes text,
    "commandesWithVariants" jsonb,
    lotto text,
    ordine text,
    puht double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ClientModel" OWNER TO postgres;

--
-- Name: Commande; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Commande" (
    id text NOT NULL,
    name text NOT NULL,
    "issuerName" text DEFAULT ''::text NOT NULL,
    "issuerAddress" text DEFAULT ''::text NOT NULL,
    "clientName" text DEFAULT ''::text NOT NULL,
    "clientAddress" text DEFAULT ''::text NOT NULL,
    "commandeDate" text DEFAULT ''::text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Commande" OWNER TO postgres;

--
-- Name: CommandeLine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CommandeLine" (
    id text NOT NULL,
    reference text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "commandeId" text
);


ALTER TABLE public."CommandeLine" OWNER TO postgres;

--
-- Name: DeclarationExport; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DeclarationExport" (
    id text NOT NULL,
    "clientName" text NOT NULL,
    "exportDate" text NOT NULL,
    "dueDate" text DEFAULT ''::text NOT NULL,
    "vatActive" boolean DEFAULT false NOT NULL,
    "vatRate" double precision DEFAULT 20 NOT NULL,
    status integer DEFAULT 1 NOT NULL,
    "poidsBrut" text NOT NULL,
    "poidsNet" text NOT NULL,
    "nbrColis" text NOT NULL,
    volume text NOT NULL,
    "modePaiment" integer DEFAULT 1 NOT NULL,
    "origineTessuto" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    num_dec text NOT NULL,
    valeur double precision NOT NULL
);


ALTER TABLE public."DeclarationExport" OWNER TO postgres;

--
-- Name: DeclarationImport; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DeclarationImport" (
    id text NOT NULL,
    num_dec text NOT NULL,
    date_import timestamp(3) without time zone NOT NULL,
    client text NOT NULL,
    valeur double precision NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DeclarationImport" OWNER TO postgres;

--
-- Name: Event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Event" (
    id integer NOT NULL,
    description text NOT NULL,
    date timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Event" OWNER TO postgres;

--
-- Name: Event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Event_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Event_id_seq" OWNER TO postgres;

--
-- Name: Event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Event_id_seq" OWNED BY public."Event".id;


--
-- Name: ExportLine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ExportLine" (
    id text NOT NULL,
    commande text NOT NULL,
    modele text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "unitPrice" double precision DEFAULT 0 NOT NULL,
    "exportId" text NOT NULL,
    "isExcluded" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."ExportLine" OWNER TO postgres;

--
-- Name: Fournisseur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Fournisseur" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Fournisseur" OWNER TO postgres;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    name text NOT NULL,
    "issuerName" text DEFAULT ''::text NOT NULL,
    "issuerAddress" text DEFAULT ''::text NOT NULL,
    "clientName" text DEFAULT ''::text NOT NULL,
    "clientAddress" text DEFAULT ''::text NOT NULL,
    "invoiceDate" text DEFAULT ''::text NOT NULL,
    "dueDate" text DEFAULT ''::text NOT NULL,
    "vatActive" boolean DEFAULT false NOT NULL,
    "vatRate" double precision DEFAULT 20 NOT NULL,
    status integer DEFAULT 1 NOT NULL,
    "poidsBrut" text NOT NULL,
    "poidsNet" text NOT NULL,
    "nbrColis" text NOT NULL,
    volume text NOT NULL,
    "modePaiment" integer DEFAULT 1 NOT NULL,
    "origineTessuto" text NOT NULL,
    gmailemetteur text NOT NULL,
    phoneemetteur text NOT NULL,
    gmailclient text NOT NULL,
    phoneclient text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Invoice" OWNER TO postgres;

--
-- Name: InvoiceLine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InvoiceLine" (
    id text NOT NULL,
    commande text DEFAULT ''::text NOT NULL,
    modele text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "unitPrice" double precision DEFAULT 0 NOT NULL,
    "invoiceId" text
);


ALTER TABLE public."InvoiceLine" OWNER TO postgres;

--
-- Name: Livraison; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Livraison" (
    id text NOT NULL,
    name text NOT NULL,
    "issuerName" text DEFAULT ''::text NOT NULL,
    "issuerAddress" text DEFAULT ''::text NOT NULL,
    "clientName" text DEFAULT ''::text NOT NULL,
    "clientAddress" text DEFAULT ''::text NOT NULL,
    "livraisonDate" text DEFAULT ''::text NOT NULL,
    soumission text DEFAULT ''::text NOT NULL,
    "soumissionValable" text DEFAULT ''::text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Livraison" OWNER TO postgres;

--
-- Name: LivraisonEntree; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LivraisonEntree" (
    id text NOT NULL,
    name text,
    "clientId" text,
    "clientName" text,
    "livraisonDate" text,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LivraisonEntree" OWNER TO postgres;

--
-- Name: LivraisonEntreeLine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LivraisonEntreeLine" (
    id text NOT NULL,
    modele text NOT NULL,
    commande text NOT NULL,
    description text NOT NULL,
    "quantityReçu" double precision NOT NULL,
    "quantityTrouvee" double precision NOT NULL,
    "livraisonEntreeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LivraisonEntreeLine" OWNER TO postgres;

--
-- Name: LivraisonLine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LivraisonLine" (
    id text NOT NULL,
    commande text,
    modele text NOT NULL,
    description text,
    quantity double precision,
    "livraisonId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isExcluded" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."LivraisonLine" OWNER TO postgres;

--
-- Name: Model; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Model" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "declarationImportId" text NOT NULL
);


ALTER TABLE public."Model" OWNER TO postgres;

--
-- Name: ModelPlan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ModelPlan" (
    id text NOT NULL,
    name text NOT NULL,
    lotto text NOT NULL,
    commande text NOT NULL,
    ordine text NOT NULL,
    faconner text NOT NULL,
    designation text NOT NULL,
    date_import timestamp(3) without time zone NOT NULL,
    date_export timestamp(3) without time zone NOT NULL,
    date_entre_coupe timestamp(3) without time zone NOT NULL,
    date_sortie_coupe timestamp(3) without time zone NOT NULL,
    date_entre_chaine timestamp(3) without time zone NOT NULL,
    date_sortie_chaine timestamp(3) without time zone NOT NULL,
    "planningId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ModelPlan" OWNER TO postgres;

--
-- Name: Planning; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Planning" (
    id text NOT NULL,
    name text NOT NULL,
    status public."Status" DEFAULT 'EN_COURS'::public."Status" NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Planning" OWNER TO postgres;

--
-- Name: SuiviProduction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SuiviProduction" (
    id text NOT NULL,
    model_name text NOT NULL,
    qte_total integer NOT NULL,
    client text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SuiviProduction" OWNER TO postgres;

--
-- Name: SuiviProductionLine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SuiviProductionLine" (
    id text NOT NULL,
    commande text NOT NULL,
    qte_livree integer NOT NULL,
    qte_reparation integer NOT NULL,
    numero_livraison text NOT NULL,
    date_export timestamp(3) without time zone NOT NULL,
    "suiviId" text
);


ALTER TABLE public."SuiviProductionLine" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "clerkUserId" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: Variant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Variant" (
    id text NOT NULL,
    name text,
    "clientModelId" text,
    qte_variante integer,
    "modelId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Variant" OWNER TO postgres;

--
-- Name: Event id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event" ALTER COLUMN id SET DEFAULT nextval('public."Event_id_seq"'::regclass);


--
-- Data for Name: Accessoire; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Accessoire" (id, reference_accessoire, "quantity_reçu", quantity_trouve, quantity_manque, "modelId") FROM stdin;
temp-acc-1740827987458	aaa	88	88	0	temp-1740827981832
temp-acc-1740826403655	a449	5	5	0	temp-1740826397012
temp-acc-1740866729253	A115	11	11	0	temp-1740866721088
temp-acc-1740869999960		0	0	0	temp-1740866721088
temp-acc-1740870000834		0	0	0	temp-1740866721088
temp-acc-1740870001753		0	0	0	temp-1740866721088
temp-acc-1740870002530		0	0	0	temp-1740866721088
temp-acc-1740870003311		0	0	0	temp-1740866721088
temp-acc-1740870004636		0	0	0	temp-1740866721088
temp-acc-1740870005911		0	0	0	temp-1740866721088
temp-acc-1740870006907		0	0	0	temp-1740866721088
temp-acc-1740870008519		0	0	0	temp-1740866721088
temp-acc-1740870009501		0	0	0	temp-1740866721088
temp-acc-1740870010887		0	0	0	temp-1740866721088
\.


--
-- Data for Name: Client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Client" (id, name, email, phone1, phone2, fix, address, "matriculeFiscale", soumission, "dateDebutSoumission", "dateFinSoumission", "createdAt", "updatedAt") FROM stdin;
31f501dc-1744-4fa1-9c70-c9f7ad31cc2a	dedimax	dedimax@gmail.com	0522927411	11	11	italy	11	big	2025-02-10	2025-05-10	2025-03-01 10:52:43.394	2025-03-01 10:52:43.394
\.


--
-- Data for Name: ClientModel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ClientModel" (id, name, description, "clientId", commandes, "commandesWithVariants", lotto, ordine, puht, "createdAt", "updatedAt") FROM stdin;
879bc20a-5149-4e24-917b-719621f66bb0	aaz7889	pantalon	31f501dc-1744-4fa1-9c70-c9f7ad31cc2a	899com	[{"value": "899com", "variants": [{"name": "002", "qte_variante": 22}]}]	\N	\N	\N	2025-03-01 11:20:02.274	2025-03-01 11:23:46.475
dfa14942-672e-4843-b56d-64992628a1b4	modele11	jacket	31f501dc-1744-4fa1-9c70-c9f7ad31cc2a	Commande	[{"value": "Commande", "variants": [{"name": "003", "qte_variante": 66}]}]	\N	\N	\N	2025-03-01 22:05:37.797	2025-03-01 22:06:19.462
416610d9-99bc-479d-8be8-f7ac8389cddc	m11	chemise	31f501dc-1744-4fa1-9c70-c9f7ad31cc2a	hf	[{"value": "hf", "variants": [{"name": "77variant", "qte_variante": 85}]}]	\N	\N	\N	2025-03-01 22:08:11.381	2025-03-01 22:08:49.207
\.


--
-- Data for Name: Commande; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Commande" (id, name, "issuerName", "issuerAddress", "clientName", "clientAddress", "commandeDate", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CommandeLine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CommandeLine" (id, reference, description, quantity, "commandeId") FROM stdin;
\.


--
-- Data for Name: DeclarationExport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DeclarationExport" (id, "clientName", "exportDate", "dueDate", "vatActive", "vatRate", status, "poidsBrut", "poidsNet", "nbrColis", volume, "modePaiment", "origineTessuto", "userId", "createdAt", "updatedAt", num_dec, valeur) FROM stdin;
27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	dedimax	2025-03-11T00:00:00.000Z		f	20	2			hh	hh	2	hh	0e487020-f38e-49a7-9dfe-3ace5be70884	2025-03-01 12:00:09.942	2025-03-01 22:59:15.567	1122	55
4e7cf226-c85b-4acd-8159-1dc0e9adb502	dedimax	2025-08-08T00:00:00.000Z		f	20	1					1		0e487020-f38e-49a7-9dfe-3ace5be70884	2025-03-01 23:02:22.639	2025-03-01 23:03:06.836	88	0
\.


--
-- Data for Name: DeclarationImport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DeclarationImport" (id, num_dec, date_import, client, valeur, "userId", "createdAt", "updatedAt") FROM stdin;
e913854d-debd-4ce2-b08a-68676520786f	tets	2009-07-07 00:00:00	dedimax	788	0e487020-f38e-49a7-9dfe-3ace5be70884	2025-03-01 11:19:38.184	2025-03-01 11:25:36.423
a45ec22d-6e93-4760-baeb-c8b27ad6f383	123456789	2025-02-22 00:00:00	dedimax	445.8	0e487020-f38e-49a7-9dfe-3ace5be70884	2025-03-01 10:53:10.059	2025-03-01 22:08:11.371
bc853ff7-9c6a-413b-a41b-ddf824a60529	95489699	2025-05-05 00:00:00	dedimax	77.55	0e487020-f38e-49a7-9dfe-3ace5be70884	2025-03-01 22:04:52.996	2025-03-01 23:00:13.043
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Event" (id, description, date) FROM stdin;
\.


--
-- Data for Name: ExportLine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ExportLine" (id, commande, modele, description, quantity, "unitPrice", "exportId", "isExcluded") FROM stdin;
1740870149714				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870182684				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870182870				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870183032				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870183202				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870183359				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870183523				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870183686				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870183842				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870184013				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870184183				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870184347				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870184510				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870184674				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870184851				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870185009				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870185185				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870185426				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870185603				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740830672408	Commande	modele11	jacket	1	0	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	t
1740830700939	hf	m11	chemise	1	55	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	f
1740832964270	899com	aaz7889	pantalon	1	0	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	f
1740869952891				1	0	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	f
1740869953047				1	0	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	f
1740869953197				1	0	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	f
1740869953345				1	0	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	f
1740869953495				1	0	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	f
1740869953651				1	0	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	f
1740869953808				1	0	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	f
1740869953957				1	0	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	f
1740869954106				1	0	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	f
1740869954248				1	0	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	f
1740869954397				1	0	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	f
1740869954617				1	0	27a8a0c8-bb0b-4ebe-a939-f438e0d8ff5e	f
1740870147630	Commande	modele11	jacket	1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870147787				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870147943				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870148106	Commande	modele11	jacket	1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870148255				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870148405				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870148561				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870148724				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870148874				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870149036				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870149193				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870149342				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
1740870149491				1	0	4e7cf226-c85b-4acd-8159-1dc0e9adb502	f
\.


--
-- Data for Name: Fournisseur; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Fournisseur" (id, name, email, phone, address, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Invoice" (id, name, "issuerName", "issuerAddress", "clientName", "clientAddress", "invoiceDate", "dueDate", "vatActive", "vatRate", status, "poidsBrut", "poidsNet", "nbrColis", volume, "modePaiment", "origineTessuto", gmailemetteur, phoneemetteur, gmailclient, phoneclient, "userId", "createdAt", "updatedAt") FROM stdin;
F-2025-03-0001	facture			dedimax				f	20	3					1						0e487020-f38e-49a7-9dfe-3ace5be70884	2025-03-01 23:10:38.018	2025-03-01 23:11:14.981
\.


--
-- Data for Name: InvoiceLine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvoiceLine" (id, commande, modele, description, quantity, "unitPrice", "invoiceId") FROM stdin;
1740870660899	Commande	modele11	jacket	18	2	F-2025-03-0001
\.


--
-- Data for Name: Livraison; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Livraison" (id, name, "issuerName", "issuerAddress", "clientName", "clientAddress", "livraisonDate", soumission, "soumissionValable", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LivraisonEntree; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LivraisonEntree" (id, name, "clientId", "clientName", "livraisonDate", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LivraisonEntreeLine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LivraisonEntreeLine" (id, modele, commande, description, "quantityReçu", "quantityTrouvee", "livraisonEntreeId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LivraisonLine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LivraisonLine" (id, commande, modele, description, quantity, "livraisonId", "createdAt", "updatedAt", "isExcluded") FROM stdin;
\.


--
-- Data for Name: Model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Model" (id, name, "createdAt", "updatedAt", "declarationImportId") FROM stdin;
temp-1740827981832	aaz7889	2025-03-01 11:20:02.276	2025-03-01 11:25:36.437	e913854d-debd-4ce2-b08a-68676520786f
temp-1740826397012	M11	2025-03-01 10:53:38.851	2025-03-01 22:08:11.384	a45ec22d-6e93-4760-baeb-c8b27ad6f383
temp-1740866721088	modele11	2025-03-01 22:05:37.802	2025-03-01 23:00:13.055	bc853ff7-9c6a-413b-a41b-ddf824a60529
\.


--
-- Data for Name: ModelPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ModelPlan" (id, name, lotto, commande, ordine, faconner, designation, date_import, date_export, date_entre_coupe, date_sortie_coupe, date_entre_chaine, date_sortie_chaine, "planningId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Planning; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Planning" (id, name, status, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SuiviProduction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SuiviProduction" (id, model_name, qte_total, client, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SuiviProductionLine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SuiviProductionLine" (id, commande, qte_livree, qte_reparation, numero_livraison, date_export, "suiviId") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "createdAt", "updatedAt", "clerkUserId") FROM stdin;
0e487020-f38e-49a7-9dfe-3ace5be70884	null null	bennasrnessim@outlook.com	2025-03-01 10:24:46.761	2025-03-01 22:04:24.56	user_2sK0JhQm2YmeG9UMpSA7prTjNyh
\.


--
-- Data for Name: Variant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Variant" (id, name, "clientModelId", qte_variante, "modelId", "createdAt", "updatedAt") FROM stdin;
804e2a0f-a8ce-4e46-a2e8-31a32b162f35	002	879bc20a-5149-4e24-917b-719621f66bb0	22	\N	2025-03-01 11:23:46.475	2025-03-01 11:23:46.475
7d2ea3c1-88fc-4bbc-ae14-5175a9be9f63	003	dfa14942-672e-4843-b56d-64992628a1b4	66	\N	2025-03-01 22:06:19.462	2025-03-01 22:06:19.462
aa800931-2e6e-49a9-b5ac-3f9d53cb7c1e	77variant	416610d9-99bc-479d-8be8-f7ac8389cddc	85	\N	2025-03-01 22:08:49.207	2025-03-01 22:08:49.207
\.


--
-- Name: Event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Event_id_seq"', 1, false);


--
-- Name: Accessoire Accessoire_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Accessoire"
    ADD CONSTRAINT "Accessoire_pkey" PRIMARY KEY (id);


--
-- Name: ClientModel ClientModel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientModel"
    ADD CONSTRAINT "ClientModel_pkey" PRIMARY KEY (id);


--
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY (id);


--
-- Name: CommandeLine CommandeLine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommandeLine"
    ADD CONSTRAINT "CommandeLine_pkey" PRIMARY KEY (id);


--
-- Name: Commande Commande_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Commande"
    ADD CONSTRAINT "Commande_pkey" PRIMARY KEY (id);


--
-- Name: DeclarationExport DeclarationExport_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DeclarationExport"
    ADD CONSTRAINT "DeclarationExport_pkey" PRIMARY KEY (id);


--
-- Name: DeclarationImport DeclarationImport_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DeclarationImport"
    ADD CONSTRAINT "DeclarationImport_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: ExportLine ExportLine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExportLine"
    ADD CONSTRAINT "ExportLine_pkey" PRIMARY KEY (id);


--
-- Name: Fournisseur Fournisseur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fournisseur"
    ADD CONSTRAINT "Fournisseur_pkey" PRIMARY KEY (id);


--
-- Name: InvoiceLine InvoiceLine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceLine"
    ADD CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: LivraisonEntreeLine LivraisonEntreeLine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LivraisonEntreeLine"
    ADD CONSTRAINT "LivraisonEntreeLine_pkey" PRIMARY KEY (id);


--
-- Name: LivraisonEntree LivraisonEntree_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LivraisonEntree"
    ADD CONSTRAINT "LivraisonEntree_pkey" PRIMARY KEY (id);


--
-- Name: LivraisonLine LivraisonLine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LivraisonLine"
    ADD CONSTRAINT "LivraisonLine_pkey" PRIMARY KEY (id);


--
-- Name: Livraison Livraison_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Livraison"
    ADD CONSTRAINT "Livraison_pkey" PRIMARY KEY (id);


--
-- Name: ModelPlan ModelPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelPlan"
    ADD CONSTRAINT "ModelPlan_pkey" PRIMARY KEY (id);


--
-- Name: Model Model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Model"
    ADD CONSTRAINT "Model_pkey" PRIMARY KEY (id);


--
-- Name: Planning Planning_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Planning"
    ADD CONSTRAINT "Planning_pkey" PRIMARY KEY (id);


--
-- Name: SuiviProductionLine SuiviProductionLine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SuiviProductionLine"
    ADD CONSTRAINT "SuiviProductionLine_pkey" PRIMARY KEY (id);


--
-- Name: SuiviProduction SuiviProduction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SuiviProduction"
    ADD CONSTRAINT "SuiviProduction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Variant Variant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Variant"
    ADD CONSTRAINT "Variant_pkey" PRIMARY KEY (id);


--
-- Name: ClientModel_clientId_name_commandes_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ClientModel_clientId_name_commandes_key" ON public."ClientModel" USING btree ("clientId", name, commandes);


--
-- Name: Client_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Client_email_key" ON public."Client" USING btree (email);


--
-- Name: User_clerkUserId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_clerkUserId_key" ON public."User" USING btree ("clerkUserId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Accessoire Accessoire_modelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Accessoire"
    ADD CONSTRAINT "Accessoire_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES public."Model"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClientModel ClientModel_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientModel"
    ADD CONSTRAINT "ClientModel_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommandeLine CommandeLine_commandeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommandeLine"
    ADD CONSTRAINT "CommandeLine_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES public."Commande"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Commande Commande_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Commande"
    ADD CONSTRAINT "Commande_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DeclarationExport DeclarationExport_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DeclarationExport"
    ADD CONSTRAINT "DeclarationExport_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DeclarationImport DeclarationImport_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DeclarationImport"
    ADD CONSTRAINT "DeclarationImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ExportLine ExportLine_exportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExportLine"
    ADD CONSTRAINT "ExportLine_exportId_fkey" FOREIGN KEY ("exportId") REFERENCES public."DeclarationExport"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceLine InvoiceLine_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceLine"
    ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invoice Invoice_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LivraisonEntreeLine LivraisonEntreeLine_livraisonEntreeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LivraisonEntreeLine"
    ADD CONSTRAINT "LivraisonEntreeLine_livraisonEntreeId_fkey" FOREIGN KEY ("livraisonEntreeId") REFERENCES public."LivraisonEntree"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LivraisonEntree LivraisonEntree_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LivraisonEntree"
    ADD CONSTRAINT "LivraisonEntree_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LivraisonEntree LivraisonEntree_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LivraisonEntree"
    ADD CONSTRAINT "LivraisonEntree_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LivraisonLine LivraisonLine_livraisonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LivraisonLine"
    ADD CONSTRAINT "LivraisonLine_livraisonId_fkey" FOREIGN KEY ("livraisonId") REFERENCES public."Livraison"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Livraison Livraison_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Livraison"
    ADD CONSTRAINT "Livraison_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ModelPlan ModelPlan_planningId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModelPlan"
    ADD CONSTRAINT "ModelPlan_planningId_fkey" FOREIGN KEY ("planningId") REFERENCES public."Planning"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Model Model_declarationImportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Model"
    ADD CONSTRAINT "Model_declarationImportId_fkey" FOREIGN KEY ("declarationImportId") REFERENCES public."DeclarationImport"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Planning Planning_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Planning"
    ADD CONSTRAINT "Planning_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SuiviProductionLine SuiviProductionLine_suiviId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SuiviProductionLine"
    ADD CONSTRAINT "SuiviProductionLine_suiviId_fkey" FOREIGN KEY ("suiviId") REFERENCES public."SuiviProduction"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SuiviProduction SuiviProduction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SuiviProduction"
    ADD CONSTRAINT "SuiviProduction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Variant Variant_clientModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Variant"
    ADD CONSTRAINT "Variant_clientModelId_fkey" FOREIGN KEY ("clientModelId") REFERENCES public."ClientModel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Variant Variant_modelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Variant"
    ADD CONSTRAINT "Variant_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES public."ModelPlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

