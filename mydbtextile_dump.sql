--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
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
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'COUPEUR',
    'CHEF',
    'USER'
);


ALTER TYPE public."Role" OWNER TO neondb_owner;

--
-- Name: Status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Status" AS ENUM (
    'EN_COURS',
    'EN_PAUSE',
    'EN_ATTENTE',
    'FINI'
);


ALTER TYPE public."Status" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Accessoire; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Accessoire" (
    id text NOT NULL,
    reference_accessoire text,
    "quantity_reçu" double precision,
    quantity_trouve double precision,
    quantity_manque double precision,
    "modelId" text
);


ALTER TABLE public."Accessoire" OWNER TO neondb_owner;

--
-- Name: Client; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Client" (
    id text NOT NULL,
    name text DEFAULT '-'::text,
    email text,
    phone1 text DEFAULT '-'::text,
    phone2 text DEFAULT '-'::text,
    fix text DEFAULT '-'::text,
    address text DEFAULT '-'::text,
    "matriculeFiscale" text DEFAULT '-'::text,
    soumission text DEFAULT '-'::text,
    "dateDebutSoumission" text DEFAULT '-'::text,
    "dateFinSoumission" text DEFAULT '-'::text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Client" OWNER TO neondb_owner;

--
-- Name: ClientModel; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ClientModel" (
    id text NOT NULL,
    name text,
    description text,
    "clientId" text NOT NULL,
    commandes text DEFAULT '-'::text,
    "commandesWithVariants" jsonb DEFAULT '0'::jsonb,
    lotto text,
    ordine text,
    puht double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ClientModel" OWNER TO neondb_owner;

--
-- Name: Commande; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Commande" (
    id text NOT NULL,
    name text NOT NULL,
    "issuerName" text DEFAULT ''::text NOT NULL,
    "issuerAddress" text DEFAULT ''::text NOT NULL,
    "clientName" text DEFAULT ''::text NOT NULL,
    "clientAddress" text DEFAULT ''::text NOT NULL,
    "commandeDate" text DEFAULT ''::text NOT NULL,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Commande" OWNER TO neondb_owner;

--
-- Name: CommandeLine; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CommandeLine" (
    id text NOT NULL,
    reference text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "commandeId" text
);


ALTER TABLE public."CommandeLine" OWNER TO neondb_owner;

--
-- Name: CoupeEntry; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CoupeEntry" (
    id text NOT NULL,
    "ficheCoupeId" text NOT NULL,
    week text NOT NULL,
    day text NOT NULL,
    category text NOT NULL,
    "quantityCreated" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CoupeEntry" OWNER TO neondb_owner;

--
-- Name: DeclarationExport; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."DeclarationExport" (
    id text NOT NULL,
    num_dec text NOT NULL,
    "clientName" text NOT NULL,
    "exportDate" text NOT NULL,
    valeur double precision NOT NULL,
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
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DeclarationExport" OWNER TO neondb_owner;

--
-- Name: DeclarationImport; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."DeclarationImport" (
    id text NOT NULL,
    num_dec text,
    date_import timestamp(3) without time zone NOT NULL,
    client text,
    valeur double precision,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DeclarationImport" OWNER TO neondb_owner;

--
-- Name: Event; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Event" (
    id integer NOT NULL,
    description text NOT NULL,
    date timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Event" OWNER TO neondb_owner;

--
-- Name: Event_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public."Event_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Event_id_seq" OWNER TO neondb_owner;

--
-- Name: Event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public."Event_id_seq" OWNED BY public."Event".id;


--
-- Name: ExportLine; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ExportLine" (
    id text NOT NULL,
    commande text NOT NULL,
    modele text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "unitPrice" double precision DEFAULT 0 NOT NULL,
    "isExcluded" boolean DEFAULT false NOT NULL,
    "exportId" text NOT NULL
);


ALTER TABLE public."ExportLine" OWNER TO neondb_owner;

--
-- Name: FicheCoupe; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."FicheCoupe" (
    id text NOT NULL,
    "clientId" text NOT NULL,
    "modelId" text NOT NULL,
    commande text NOT NULL,
    quantity double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FicheCoupe" OWNER TO neondb_owner;

--
-- Name: FicheProduction; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."FicheProduction" (
    id text NOT NULL,
    "clientId" text NOT NULL,
    "modelId" text NOT NULL,
    commande text NOT NULL,
    quantity integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FicheProduction" OWNER TO neondb_owner;

--
-- Name: Fournisseur; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."Fournisseur" OWNER TO neondb_owner;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: neondb_owner
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
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Invoice" OWNER TO neondb_owner;

--
-- Name: InvoiceLine; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."InvoiceLine" OWNER TO neondb_owner;

--
-- Name: Livraison; Type: TABLE; Schema: public; Owner: neondb_owner
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
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Livraison" OWNER TO neondb_owner;

--
-- Name: LivraisonEntree; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."LivraisonEntree" OWNER TO neondb_owner;

--
-- Name: LivraisonEntreeLine; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."LivraisonEntreeLine" (
    id text NOT NULL,
    commande text NOT NULL,
    description text NOT NULL,
    "quantityReçu" double precision NOT NULL,
    "quantityTrouvee" double precision NOT NULL,
    "livraisonEntreeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LivraisonEntreeLine" OWNER TO neondb_owner;

--
-- Name: LivraisonLine; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."LivraisonLine" OWNER TO neondb_owner;

--
-- Name: Model; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Model" (
    id text NOT NULL,
    name text,
    commande text,
    description text,
    "quantityReçu" double precision,
    "quantityTrouvee" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "declarationImportId" text,
    "livraisonEntreeId" text
);


ALTER TABLE public."Model" OWNER TO neondb_owner;

--
-- Name: ModelPlan; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."ModelPlan" OWNER TO neondb_owner;

--
-- Name: Planning; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Planning" (
    id text NOT NULL,
    name text NOT NULL,
    status public."Status" DEFAULT 'EN_COURS'::public."Status" NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Planning" OWNER TO neondb_owner;

--
-- Name: ProductionEntry; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ProductionEntry" (
    id text NOT NULL,
    "ficheId" text NOT NULL,
    week text NOT NULL,
    day text NOT NULL,
    hour text NOT NULL,
    "quantityCreated" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductionEntry" OWNER TO neondb_owner;

--
-- Name: SuiviProduction; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."SuiviProduction" (
    id text NOT NULL,
    model_name text NOT NULL,
    qte_total integer NOT NULL,
    client text NOT NULL,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SuiviProduction" OWNER TO neondb_owner;

--
-- Name: SuiviProductionLine; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public."SuiviProductionLine" OWNER TO neondb_owner;

--
-- Name: User; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "clerkUserId" text
);


ALTER TABLE public."User" OWNER TO neondb_owner;

--
-- Name: Variant; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Variant" (
    id text NOT NULL,
    name text,
    "clientModelId" text,
    qte_variante integer DEFAULT 0,
    "modelId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Variant" OWNER TO neondb_owner;

--
-- Name: _ModelAccessoires; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."_ModelAccessoires" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ModelAccessoires" OWNER TO neondb_owner;

--
-- Name: Event id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Event" ALTER COLUMN id SET DEFAULT nextval('public."Event_id_seq"'::regclass);


--
-- Data for Name: Accessoire; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Accessoire" (id, reference_accessoire, "quantity_reçu", quantity_trouve, quantity_manque, "modelId") FROM stdin;
temp-acc-1742640683455	ML	44	44	0	\N
temp-acc-1742642136190	52-52-363	300	300	0	\N
temp-acc-1742642285721	16-52-105	41	41	0	\N
temp-acc-1742642302498	17-52-528	73	73	0	\N
temp-acc-1742642303983	18-52-140	814	814	0	\N
temp-acc-1742642304948	21-52-012	325	325	0	\N
temp-acc-1742642305821	29-52-401	322	322	0	\N
temp-acc-1742642306676	30-52-70	70	70	0	\N
temp-acc-1742642307533	30-52-90	2	2	0	\N
temp-acc-1742642308685	30-52-500	52	52	0	\N
temp-acc-1742642500555	31-52-210	319	319	0	\N
temp-acc-1742642525993	38-52-102	315	315	0	\N
temp-acc-1742642526848	44-32-002	350	350	0	\N
temp-acc-1742642528200	51-51-006	300	300	0	\N
temp-acc-1742642607985	51-51-457	334	334	0	\N
temp-acc-1742642608861	51-52-412	300	300	0	\N
temp-acc-1742642610278	51-52-464	300	300	0	\N
temp-acc-1742642638192	51-52-507	300	300	0	\N
temp-acc-1742642639019	52-42-303	500	500	0	\N
temp-acc-1742642640031	52-52-001	2500	2500	0	\N
temp-acc-1742642693820	60-52-657	195	195	0	\N
temp-acc-1742643194869	10-52-528	363	363	0	\N
temp-acc-1742642183058	50-52-906	510	510	0	\N
temp-acc-1742642200602	51-52-613	600	600	0	\N
temp-acc-1742642214974	64-52-071	600	600	0	\N
temp-acc-1742642231400	64-52-088	600	600	0	\N
temp-acc-1742642731871	17-52-528	147	147	0	\N
temp-acc-1742642734564	20-52-304	4967	4967	0	\N
temp-acc-1742642735718	21-52-012	3344	3344	0	\N
temp-acc-1742642737194	30-52-070	93	93	0	\N
temp-acc-1742642738098	30-52-090	43	43	0	\N
temp-acc-1742642788099	30-52-500	82	82	0	\N
temp-acc-1742642789206	31-52-210	600	600	0	\N
temp-acc-1742642790718	44-32-002	596	596	0	\N
temp-acc-1742642885742	51-51-006	600	600	0	\N
temp-acc-1742642887891	51-52-412	600	600	0	\N
temp-acc-1742642888886	51-52-458	572	572	0	\N
temp-acc-1742642916430	51-52-464	600	600	0	\N
temp-acc-1742642917400	51-52-507	600	600	0	\N
temp-acc-1742642999721	52-42-303	1000	1000	0	\N
temp-acc-1742643000561	52-52-918	500	500	0	\N
temp-acc-1742643215416	10-52-528	619	619	0	\N
temp-acc-1742643115673	38-51-102	22	22	0	\N
temp-acc-1742643119085	52-42-303	1000	1000	0	\N
temp-acc-1742643237037	10-52-528	58	58	0	\N
temp-acc-1742643365308	52-52-363	300	300	0	\N
temp-acc-1742643377662	16-52-105	41	41	0	\N
temp-acc-1742643479479	17-52-528	73	73	0	\N
temp-acc-1742643480397	18-52-140	407	407	0	\N
temp-acc-1742643405236	50-52-906	510	510	0	\N
temp-acc-1742643417652	51-52-613	600	600	0	\N
temp-acc-1742643418537	64-52-071	600	600	0	\N
temp-acc-1742643430688	64-52-088	600	600	0	\N
temp-acc-1742643432117		0	0	0	\N
\.


--
-- Data for Name: Client; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Client" (id, name, email, phone1, phone2, fix, address, "matriculeFiscale", soumission, "dateDebutSoumission", "dateFinSoumission", "createdAt", "updatedAt") FROM stdin;
f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	hela.benjaafer@clfdenim.com	29446845	-	-	route de korbous-8020 soliman	1123479/B	BG166/25	2025-02-05	2025-05-05	2025-03-22 10:47:41.428	2025-03-22 10:47:41.428
75b8b768-b07a-4035-9f8c-5a67fb6002b5	Replay	ohajri@fashionboxmanufacturing.com.tn	72 333 303	-	-	Route de korbous, 8020 Soliman	1323682Q	171 BG 2025	2025-03-19	2025-03-22	2025-03-22 11:53:17.608	2025-03-22 11:53:17.608
38458e2c-a440-407a-b869-16811ce4085a	Dedimax	marella.tunisie2@gmail.com	+39 0522 927411	-	-	S.r.l.unipersonale via M.Mazzacurati,6 -42122 Reggio Emilia - Italy	-	-	2025-03-20	2025-03-23	2025-03-22 11:13:53.053	2025-03-22 18:38:05.304
\.


--
-- Data for Name: ClientModel; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ClientModel" (id, name, description, "clientId", commandes, "commandesWithVariants", lotto, ordine, puht, "createdAt", "updatedAt") FROM stdin;
66a3a84d-e3ab-4ed8-bee8-381b007e96cd	2525106011200	Jupe	38458e2c-a440-407a-b869-16811ce4085a	lotto 023	[{"value": "lotto 023", "variants": [{"name": "001", "qte_variante": 315}]}]	023	322183	\N	2025-03-22 11:34:15.746	2025-03-22 11:43:40.114
f8d99fe3-cf7e-4980-9109-d394e4dd6a38	2525186081270	pantalon jean blue	38458e2c-a440-407a-b869-16811ce4085a	824	[{"value": "824", "variants": [{"name": "001", "qte_variante": 722}]}]	824	321074	\N	2025-03-22 11:34:16.596	2025-03-22 11:45:01.859
fc9b1e3f-465b-46b4-b725-377795e1834c	2525116011200	chemise blue jean	38458e2c-a440-407a-b869-16811ce4085a	lotto 023	[{"value": "lotto 023", "variants": [{"name": "001", "qte_variante": 541}]}]	023	322173	\N	2025-03-22 11:34:16.252	2025-03-22 11:45:47.66
d2320f23-a2eb-4bb7-87fd-26a4b1f50f1f	wh461.000.573b915 097 028	Pantalon	f77d874c-3c93-48a4-8ab5-aa437f83740d	199	[{"value": "199", "variants": [{"name": "--", "qte_variante": 1066}]}]	\N	\N	\N	2025-03-25 10:53:04.988	2025-03-25 12:58:15.558
c2226c7c-5f19-41b3-b41d-2b8c6738d0fc	wa534.000.805 923 007	Pantalon 	f77d874c-3c93-48a4-8ab5-aa437f83740d	185	[{"value": "185", "variants": [{"name": "--", "qte_variante": 814}]}]	\N	\N	\N	2025-03-25 12:27:19.279	2025-03-25 12:55:45.35
17023281-0d15-4aa3-93be-5ae7fa75d4ab	m4145r.000.875.84a	Chemsie 	75b8b768-b07a-4035-9f8c-5a67fb6002b5	1245003	[{"value": "1245003", "variants": [{"name": "--", "qte_variante": 46}]}]	\N	\N	\N	2025-03-22 12:13:39.56	2025-03-22 12:40:13.536
00f71e45-cd6c-4ffe-8be2-3782baafa710	m9068.000.795.07a	Pantalon	75b8b768-b07a-4035-9f8c-5a67fb6002b5	1125927	[{"value": "1125927", "variants": [{"name": "--", "qte_variante": 276}]}]	\N	\N	\N	2025-03-22 12:13:38.236	2025-03-22 12:40:22.386
cf39aaf7-22fd-4db8-81fb-0020c3b06609	m9068.000.203.07a	Pantalon	75b8b768-b07a-4035-9f8c-5a67fb6002b5	1125933	[{"value": "1125933", "variants": [{"name": "--", "qte_variante": 46}]}]	\N	\N	\N	2025-03-22 12:13:37.524	2025-03-22 12:40:29.605
440803aa-50b1-4d13-ac75-5bb0927f74ec	w2439.000.270 07 007 n	RPL2354	f77d874c-3c93-48a4-8ab5-aa437f83740d	Dispo 659,Dispo 660,Dispo 682	[{"value": "Dispo 659", "variants": [{"name": "--", "qte_variante": 50}]}, {"value": "Dispo 660", "variants": [{"name": "--", "qte_variante": 50}]}, {"value": "Dispo 682", "variants": [{"name": "--", "qte_variante": 2}]}]	\N	\N	\N	2025-03-25 10:50:41.47	2025-03-25 12:58:27.975
4d09532d-b9e4-431c-a4e2-563c95e26ace	w2385.000.85528g n	Chemise	f77d874c-3c93-48a4-8ab5-aa437f83740d	Dispo 242,Dispo 663	[{"value": "Dispo 242", "variants": [{"name": "--", "qte_variante": 2}]}, {"value": "Dispo 663", "variants": [{"name": "--", "qte_variante": 50}]}]	\N	\N	\N	2025-03-25 12:08:46.826	2025-03-25 12:56:17.523
daad5303-5574-4dca-8cea-0577b7d6a9a7	w2379.000.85528g n	Chemise	f77d874c-3c93-48a4-8ab5-aa437f83740d	Dispo 241	[{"value": "Dispo 241", "variants": [{"name": "--", "qte_variante": 2}]}]	\N	\N	\N	2025-03-25 12:08:46.234	2025-03-25 12:56:26.213
b00adf99-1f75-4f1b-8f4d-42e67b721463	w1077.000.85528g n	JumpSuit	f77d874c-3c93-48a4-8ab5-aa437f83740d	Dispo 240	[{"value": "Dispo 240", "variants": [{"name": "--", "qte_variante": 2}]}]	\N	\N	\N	2025-03-25 12:08:45.471	2025-03-25 12:56:32.958
d9732c10-67ba-4062-b1d5-2bd4bedd1e6a	razor	Pantalon	f77d874c-3c93-48a4-8ab5-aa437f83740d	3185,3195,3071	[{"value": "3185", "variants": [{"name": "--", "qte_variante": 1679}]}, {"value": "3195", "variants": [{"name": "--", "qte_variante": 214}]}, {"value": "3071", "variants": [{"name": "--", "qte_variante": 990}]}]	\N	\N	\N	2025-03-25 12:01:13.513	2025-03-25 12:58:01.969
7c5fff3b-e1ce-40e9-9326-d6a68ce5cab5	s03wp	Cappuche	f77d874c-3c93-48a4-8ab5-aa437f83740d	356	[{"value": "356", "variants": [{"name": "--", "qte_variante": 8}]}]	\N	\N	\N	2025-03-25 11:11:07.978	2025-03-25 12:58:09.11
6381a8bf-0d57-47c6-82f2-5ff714a50e4b	w9240.000.85531 038 n	Robe vert	f77d874c-3c93-48a4-8ab5-aa437f83740d	Dispo 610,Dispo 530	[{"value": "Dispo 610", "variants": [{"name": "--", "qte_variante": 1}]}, {"value": "Dispo 530", "variants": [{"name": "--", "qte_variante": 40}]}]	\N	\N	\N	2025-03-25 08:31:42.391	2025-03-25 12:58:47.63
154ea34a-dca1-4075-a966-bd402237b9bb	mv864a.000.960 07a 007 n	Jacket	f77d874c-3c93-48a4-8ab5-aa437f83740d	Dispo 1	[{"value": "Dispo 1", "variants": [{"name": "--", "qte_variante": 2}]}]	\N	\N	\N	2025-03-25 12:08:44.719	2025-03-25 13:09:56.38
\.


--
-- Data for Name: Commande; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Commande" (id, name, "issuerName", "issuerAddress", "clientName", "clientAddress", "commandeDate", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CommandeLine; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CommandeLine" (id, reference, description, quantity, "commandeId") FROM stdin;
\.


--
-- Data for Name: CoupeEntry; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CoupeEntry" (id, "ficheCoupeId", week, day, category, "quantityCreated", "createdAt", "updatedAt") FROM stdin;
de860fdb-c439-4d3a-b163-d4825112eb52	912553c6-54b6-4c84-aba5-efe6e2b5b811	Week 1	lun-17	Tissu1	274	2025-03-25 09:43:01.182	2025-03-25 09:43:01.182
a0d65d51-a2c4-4e8d-ad9c-994108016312	912553c6-54b6-4c84-aba5-efe6e2b5b811	Week 1	lun-17	Tissu2	276	2025-03-25 09:43:01.182	2025-03-25 09:43:01.182
da940b15-b8d1-4287-be2b-2c62e8ecbcd4	912553c6-54b6-4c84-aba5-efe6e2b5b811	Week 1	lun-17	Broderie	274	2025-03-25 09:43:01.182	2025-03-25 09:43:01.182
d3d2bf7f-09d4-4c0a-bdef-ee01b31834af	581431d3-68b8-4db8-9b88-c73c49de314c	Week 1	lun-17	Tissu2	4	2025-03-25 10:23:51.58	2025-03-25 10:23:51.58
e2bef259-768d-41c3-af50-212a3eae283a	581431d3-68b8-4db8-9b88-c73c49de314c	Week 1	lun-17	Serigraphie	3	2025-03-25 10:23:51.58	2025-03-25 10:23:51.58
ba1e4f81-af8c-41ac-b80c-ccd2f2740e3f	581431d3-68b8-4db8-9b88-c73c49de314c	Week 1	lun-17	Broderie	0	2025-03-25 10:23:51.58	2025-03-25 10:23:51.58
f0170f2a-77a3-4bbe-8822-c162529a5312	581431d3-68b8-4db8-9b88-c73c49de314c	Week 1	lun-17	Tissu1	0	2025-03-25 10:23:51.58	2025-03-25 10:23:51.58
91720d6a-bec7-4567-9c0a-5978d4806231	581431d3-68b8-4db8-9b88-c73c49de314c	Week 1	lun-17	Doublure	0	2025-03-25 10:23:51.58	2025-03-25 10:23:51.58
\.


--
-- Data for Name: DeclarationExport; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."DeclarationExport" (id, num_dec, "clientName", "exportDate", valeur, "dueDate", "vatActive", "vatRate", status, "poidsBrut", "poidsNet", "nbrColis", volume, "modePaiment", "origineTessuto", "userId", "createdAt", "updatedAt") FROM stdin;
939780be-28ca-46b8-90b7-27ce63bffd0f	77	Replay	2025-03-26	0		f	20	1					1		\N	2025-03-26 07:58:37.26	2025-03-26 07:58:37.26
\.


--
-- Data for Name: DeclarationImport; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."DeclarationImport" (id, num_dec, date_import, client, valeur, "userId", "createdAt", "updatedAt") FROM stdin;
55bc0fa4-38db-4bf6-b709-6aa89f7210bc	666892	2025-03-15 00:00:00	Dedimax	5786.03	\N	2025-03-22 11:14:58.743	2025-03-22 11:34:14.174
cc0b820d-1284-452c-b6c6-9a4b6efa736c	633955	2025-03-15 00:00:00	Dedimax	5786.03	\N	2025-03-22 11:35:15.076	2025-03-22 11:39:56.127
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Event" (id, description, date) FROM stdin;
2	test	2025-03-27 23:00:00
\.


--
-- Data for Name: ExportLine; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ExportLine" (id, commande, modele, description, quantity, "unitPrice", "isExcluded", "exportId") FROM stdin;
\.


--
-- Data for Name: FicheCoupe; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."FicheCoupe" (id, "clientId", "modelId", commande, quantity, "createdAt", "updatedAt") FROM stdin;
912553c6-54b6-4c84-aba5-efe6e2b5b811	75b8b768-b07a-4035-9f8c-5a67fb6002b5	17023281-0d15-4aa3-93be-5ae7fa75d4ab	1245003	46	2025-03-25 09:40:34.918	2025-03-25 09:43:01.182
843fd0e5-7214-4ba1-bd52-e632e6b9e723	38458e2c-a440-407a-b869-16811ce4085a	66a3a84d-e3ab-4ed8-bee8-381b007e96cd	lotto 023	315	2025-03-25 09:47:23.533	2025-03-25 09:47:23.533
581431d3-68b8-4db8-9b88-c73c49de314c	38458e2c-a440-407a-b869-16811ce4085a	fc9b1e3f-465b-46b4-b725-377795e1834c	lotto 023	541	2025-03-22 12:58:32.906	2025-03-25 10:23:51.58
\.


--
-- Data for Name: FicheProduction; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."FicheProduction" (id, "clientId", "modelId", commande, quantity, "createdAt", "updatedAt") FROM stdin;
42f51e0a-a287-4078-ab60-1fd8b8e70726	38458e2c-a440-407a-b869-16811ce4085a	fc9b1e3f-465b-46b4-b725-377795e1834c	lotto 023	541	2025-03-22 13:00:39.555	2025-03-22 13:01:11.131
\.


--
-- Data for Name: Fournisseur; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Fournisseur" (id, name, email, phone, address, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Invoice" (id, name, "issuerName", "issuerAddress", "clientName", "clientAddress", "invoiceDate", "dueDate", "vatActive", "vatRate", status, "poidsBrut", "poidsNet", "nbrColis", volume, "modePaiment", "origineTessuto", gmailemetteur, phoneemetteur, gmailclient, phoneclient, "userId", "createdAt", "updatedAt") FROM stdin;
F-2025-03-0001	77			Replay				f	20	2					1						\N	2025-03-22 11:09:41.604	2025-03-22 22:29:24.188
\.


--
-- Data for Name: InvoiceLine; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."InvoiceLine" (id, commande, modele, description, quantity, "unitPrice", "invoiceId") FROM stdin;
1742682536484				1	0	F-2025-03-0001
\.


--
-- Data for Name: Livraison; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Livraison" (id, name, "issuerName", "issuerAddress", "clientName", "clientAddress", "livraisonDate", soumission, "soumissionValable", "userId", "createdAt", "updatedAt") FROM stdin;
L-2025-03-0001	00046			ArtLab		2025-03-25			\N	2025-03-25 13:26:36.926	2025-03-25 22:25:24.873
\.


--
-- Data for Name: LivraisonEntree; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."LivraisonEntree" (id, name, "clientId", "clientName", "livraisonDate", "userId", "createdAt", "updatedAt") FROM stdin;
L.E2025-03-0027	3457	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 12:15:39.929	2025-03-25 12:16:38.675
L.E2025-03-0002	4526	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 08:28:22.144	2025-03-25 08:31:43.009
L.E2025-03-0003	4527	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 08:32:57.388	2025-03-25 08:39:50.813
L.E2025-03-0004	4480	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 08:41:08.612	2025-03-25 08:42:14.132
L.E2025-03-0005	4280	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 08:42:50.088	2025-03-25 08:45:21.952
L.E2025-03-0006	5016	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 08:46:07.093	2025-03-25 08:48:04.262
L.E2025-03-0007	4920	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 08:49:05.74	2025-03-25 09:02:38.281
L.E2025-03-0008	5027	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 09:06:50.846	2025-03-25 09:23:28.492
L.E2025-03-0028	4034	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 12:16:58.454	2025-03-25 12:18:07.135
L.E2025-03-0009	5014	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 10:44:14.374	2025-03-25 10:46:12.794
L.E2025-03-0010	5050	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 10:47:54.137	2025-03-25 10:48:38.967
L.E2025-03-0011	5058	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 10:49:09.309	2025-03-25 10:50:41.992
L.E2025-03-0012	5118	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 10:52:23.761	2025-03-25 10:53:05.333
L.E2025-03-0013	5115	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 10:53:44.892	2025-03-25 10:54:36.229
L.E2025-03-0014	4443	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 10:58:50.1	2025-03-25 11:11:10.991
L.E2025-03-0015	4902	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 11:12:31.38	2025-03-25 11:13:50.604
L.E2025-03-0016	4961	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 11:14:57.634	2025-03-25 11:15:38.68
L.E2025-03-0017	4931	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 11:16:04.265	2025-03-25 11:17:57.924
L.E2025-03-0018	4967	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 11:18:19.677	2025-03-25 11:18:57.105
L.E2025-03-0019	4864	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 11:23:34.04	2025-03-25 11:33:38.376
L.E2025-03-0021	4530	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 11:49:13.336	2025-03-25 11:50:12.508
L.E2025-03-0023	3448	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 12:01:48.915	2025-03-25 12:08:47.015
L.E2025-03-0024	3449	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 12:09:15.494	2025-03-25 12:13:14.032
L.E2025-03-0025	3537	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 12:13:36.423	2025-03-25 12:14:32.926
L.E2025-03-0026	3523	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 12:14:52.872	2025-03-25 12:15:22.169
L.E2025-03-0029	4062	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 12:18:26.58	2025-03-25 12:19:21.931
L.E2025-03-0030	4264	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 12:19:40.807	2025-03-25 12:20:26.787
L.E2025-03-0031	4187	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 12:20:53.682	2025-03-25 12:21:32.044
L.E2025-03-0032	4274	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 12:21:48.969	2025-03-25 12:22:36.647
L.E2025-03-0033	4392	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 12:24:34.889	2025-03-25 12:25:00.074
L.E2025-03-0034	4410	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 12:26:02.339	2025-03-25 12:27:19.679
L.E2025-03-0001	025303	75b8b768-b07a-4035-9f8c-5a67fb6002b5	Replay	2025-03-22	\N	2025-03-22 11:57:36.011	2025-03-25 13:11:51.854
L.E2025-03-0022	3452	f77d874c-3c93-48a4-8ab5-aa437f83740d	ArtLab	2025-03-25	\N	2025-03-25 11:55:39.927	2025-03-25 13:12:57.113
\.


--
-- Data for Name: LivraisonEntreeLine; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."LivraisonEntreeLine" (id, commande, description, "quantityReçu", "quantityTrouvee", "livraisonEntreeId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LivraisonLine; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."LivraisonLine" (id, commande, modele, description, quantity, "livraisonId", "createdAt", "updatedAt", "isExcluded") FROM stdin;
1742909216809	Dispo 610	w9240.000.85531 038 n	Robe vert (Echantillon)	1	L-2025-03-0001	2025-03-25 13:27:36.613	2025-03-25 22:25:24.915	f
\.


--
-- Data for Name: Model; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Model" (id, name, commande, description, "quantityReçu", "quantityTrouvee", "createdAt", "updatedAt", "declarationImportId", "livraisonEntreeId") FROM stdin;
temp-1742642119386	2525106011200	\N	\N	\N	\N	2025-03-22 11:34:16.768	2025-03-22 11:34:16.768	55bc0fa4-38db-4bf6-b709-6aa89f7210bc	\N
temp-1742642165067	2525116011200	\N	\N	\N	\N	2025-03-22 11:34:18.531	2025-03-22 11:34:18.531	55bc0fa4-38db-4bf6-b709-6aa89f7210bc	\N
temp-1742643094503	2525186081270	\N	\N	\N	\N	2025-03-22 11:34:20.018	2025-03-22 11:34:20.018	55bc0fa4-38db-4bf6-b709-6aa89f7210bc	\N
temp-1742643348997	2525106011200	\N	\N	\N	\N	2025-03-22 11:39:57.871	2025-03-22 11:39:57.871	cc0b820d-1284-452c-b6c6-9a4b6efa736c	\N
temp-1742643389720	2525116011200	\N	\N	\N	\N	2025-03-22 11:39:59.561	2025-03-22 11:39:59.561	cc0b820d-1284-452c-b6c6-9a4b6efa736c	\N
86919f0d-5f1d-4f7a-ba5b-17badfa1494d	W9240.000.85531 038 N	610	Art 11437	4	4	2025-03-25 08:31:43.009	2025-03-25 08:31:43.009	\N	L.E2025-03-0002
f831bac1-b3ce-4c87-9041-aa2282ab3d54	W9240.000.85531 038 N	610	Art 4300	0.5	0.5	2025-03-25 08:31:43.009	2025-03-25 08:31:43.009	\N	L.E2025-03-0002
f41fa5fb-c7a8-4977-90fe-78c83b8c3c4f	W9240.000.85531 038 N	610	Art 19 viseline passant fixe	1	1	2025-03-25 08:39:50.813	2025-03-25 08:39:50.813	\N	L.E2025-03-0003
c55f35ac-c950-4d76-a8fe-e0ca1332d46a	W9240.000.85531 038 N	610	RPL2638	1	1	2025-03-25 08:39:50.813	2025-03-25 08:39:50.813	\N	L.E2025-03-0003
917b7737-430d-46d1-bd8b-9f86560cec0b			Art 16137	450	450	2025-03-25 08:42:14.132	2025-03-25 08:42:14.132	\N	L.E2025-03-0004
7ea60afc-e56d-42e3-bb5b-5f5fd81f93e9	Modèle Sans Nom		Art 16140	765	765	2025-03-25 08:42:14.132	2025-03-25 08:42:14.132	\N	L.E2025-03-0004
f7180fbb-eeac-4e76-ad24-175e81062cd0	Modèle Sans Nom		Art 16138	108	108	2025-03-25 08:42:14.132	2025-03-25 08:42:14.132	\N	L.E2025-03-0004
1b6d1d73-0ba6-4152-b054-c35767671347	Modèle Sans Nom		Art 16139	180	180	2025-03-25 08:42:14.132	2025-03-25 08:42:14.132	\N	L.E2025-03-0004
0750899f-3de8-48b5-b579-5ef024a3051b			Art 16666 starpoly 50 	60	60	2025-03-25 08:45:21.952	2025-03-25 08:45:21.952	\N	L.E2025-03-0005
02781681-22c2-46ce-b063-29df5b299b5d	Modèle Sans Nom		Art 166665 starpoly 25	20	20	2025-03-25 08:45:21.952	2025-03-25 08:45:21.952	\N	L.E2025-03-0005
f416c940-ba6e-4b11-acb5-23278d8e92e1			Art 16665 starpoly 25	15	15	2025-03-25 08:48:04.262	2025-03-25 08:48:04.262	\N	L.E2025-03-0006
ccfb71a3-b374-4ab6-905a-a7d17774edd0	Modèle Sans Nom		Art 16666 starpoly 50 	100	100	2025-03-25 08:48:04.262	2025-03-25 08:48:04.262	\N	L.E2025-03-0006
7489b539-2e4c-4da6-8cba-f0574ffceb6a	Modèle Sans Nom		Art 15574 starpoly 30 col 4443	3	3	2025-03-25 08:48:04.262	2025-03-25 08:48:04.262	\N	L.E2025-03-0006
b411cb89-0b3a-4ea5-b86f-79b0b906bf2a			Art 3275 starpol ET 50 col 627	4	4	2025-03-25 09:02:38.281	2025-03-25 09:02:38.281	\N	L.E2025-03-0007
5c84d4ac-ab7a-428c-833c-7035e3cc32a3	Modèle Sans Nom		Art 13795 startpol ET 36 col 627	10	10	2025-03-25 09:02:38.281	2025-03-25 09:02:38.281	\N	L.E2025-03-0007
29f91553-d0d8-485b-8d25-932a7ceb2f92	Modèle Sans Nom		Art 15504 air max 80 col 650	8	8	2025-03-25 09:02:38.281	2025-03-25 09:02:38.281	\N	L.E2025-03-0007
385f6c85-0072-410c-8875-5b45c56f75dd	Modèle Sans Nom		Art 15950 King Et 50 col 627	8	8	2025-03-25 09:02:38.281	2025-03-25 09:02:38.281	\N	L.E2025-03-0007
1654ad8a-809c-4fda-b7ff-63f55bed4c8c	Modèle Sans Nom		Art 16679 King Et 50 col 627	10	10	2025-03-25 09:02:38.281	2025-03-25 09:02:38.281	\N	L.E2025-03-0007
64dfff55-f39b-4c31-a04e-182d01cafcf9	Modèle Sans Nom		Art 15083 starpol 50 col 4	5	5	2025-03-25 09:02:38.281	2025-03-25 09:02:38.281	\N	L.E2025-03-0007
d7e9ae00-b66a-4ef1-b065-91c14e2cb784	Modèle Sans Nom		Art 12935 starpol Et 36 col 4	10	10	2025-03-25 09:02:38.281	2025-03-25 09:02:38.281	\N	L.E2025-03-0007
a444496d-b95a-40e6-ace4-68da1fb44b57	Modèle Sans Nom		Art 15558 Politex 40 col 650	4	4	2025-03-25 09:02:38.281	2025-03-25 09:02:38.281	\N	L.E2025-03-0007
d79a9419-a666-426a-b0d8-baeb492233ef	Modèle Sans Nom		Art 3843 Olimpo Et 50 col 92	5	5	2025-03-25 09:02:38.281	2025-03-25 09:02:38.281	\N	L.E2025-03-0007
90794ad1-e1e4-472e-ae20-9f4308ca87ec	Modèle Sans Nom		Art  14326 Pock 390 NT termosolubile	1	1	2025-03-25 09:02:38.281	2025-03-25 09:02:38.281	\N	L.E2025-03-0007
625a1dba-4e44-4252-a604-d1b19c06825c	W2439	685	Echantillon	1	1	2025-03-25 09:23:28.493	2025-03-25 09:23:28.493	\N	L.E2025-03-0008
45d86af8-b311-4769-bc07-03c171b25490	W2439.000.270 07 007	685	Art 11475	4	4	2025-03-25 10:46:12.794	2025-03-25 10:46:12.794	\N	L.E2025-03-0009
5a620b25-79af-4a85-a902-c7094964eff0	W2439.000.270 07 007	685	Art 11494	1	1	2025-03-25 10:46:12.794	2025-03-25 10:46:12.794	\N	L.E2025-03-0009
1638a17b-fce6-49ea-9afe-a75e44098814			retour broderie 3195	283	283	2025-03-25 10:48:38.967	2025-03-25 10:48:38.967	\N	L.E2025-03-0010
e6e00e83-3318-4fbc-aa8b-e737386077b8	W2439.000.270 07 007 N	685	RPL2354	2	2	2025-03-25 10:50:41.992	2025-03-25 10:50:41.992	\N	L.E2025-03-0011
8a9757f2-e3f3-42cc-bba9-2fa1077e80dd	W2439.000.270 07 007 N	685	Art65 7*13	2	2	2025-03-25 10:50:41.992	2025-03-25 10:50:41.992	\N	L.E2025-03-0011
cc0ec052-da3d-424d-a716-a25033170eb9	WH461.000.573B915 097 028	199	Art9591	6	6	2025-03-25 10:53:05.333	2025-03-25 10:53:05.333	\N	L.E2025-03-0012
6dd2d1c1-0ea3-4607-b4e5-506113dde336		356	retour apres serigh	8	8	2025-03-25 10:54:36.229	2025-03-25 10:54:36.229	\N	L.E2025-03-0013
fc57e0c5-d445-4a7a-bffc-19023e1b1fda	S03WP	356	Art 14742	9.6	9.6	2025-03-25 11:11:10.991	2025-03-25 11:11:10.991	\N	L.E2025-03-0014
79d47e46-820d-473f-b6ef-5dc7744a7402	S03WP	356	Art 65 7*13	16	16	2025-03-25 11:11:10.991	2025-03-25 11:11:10.991	\N	L.E2025-03-0014
7bb010ff-5ebc-414e-a235-ad9226fca403	S03WP		Art 16637	16	16	2025-03-25 11:11:10.991	2025-03-25 11:11:10.991	\N	L.E2025-03-0014
479a2b02-4917-4c0b-bd23-7fc7d5648b6f	S03WP		Art 3878	8	8	2025-03-25 11:11:10.991	2025-03-25 11:11:10.991	\N	L.E2025-03-0014
302e178e-ed74-4bef-9458-a552d1b2ee24	S03WP		Art 2606	4	4	2025-03-25 11:11:10.991	2025-03-25 11:11:10.991	\N	L.E2025-03-0014
3196cd4e-ae0f-4043-97a2-7b683206e724	S03WP		Art 12696	2	2	2025-03-25 11:11:10.991	2025-03-25 11:11:10.991	\N	L.E2025-03-0014
fac25fcd-005e-4843-a13d-7eae6914aefd	S03WP		DNH202 	8	8	2025-03-25 11:11:10.991	2025-03-25 11:11:10.991	\N	L.E2025-03-0014
ea8eb3ca-6b38-4d6f-a601-cbbb5c763f21	S03WP		DNH 1436	2	2	2025-03-25 11:11:10.991	2025-03-25 11:11:10.991	\N	L.E2025-03-0014
7c1187b6-f78a-431c-945d-04db87f468f1	S03WP		Art 16638	16	16	2025-03-25 11:11:10.991	2025-03-25 11:11:10.991	\N	L.E2025-03-0014
9f4d4a36-3569-44f8-a375-823123468054	S03WP		Art 12123	8	8	2025-03-25 11:11:10.991	2025-03-25 11:11:10.991	\N	L.E2025-03-0014
3d958226-6692-45db-b669-0316ca268806	S03WP		DNH 1437 puce de taille	2	2	2025-03-25 11:11:10.991	2025-03-25 11:11:10.991	\N	L.E2025-03-0014
b8b398c6-0586-4c2c-a5d8-75b8acd1b199	S03WP		Art 16327	4	4	2025-03-25 11:11:10.991	2025-03-25 11:11:10.991	\N	L.E2025-03-0014
618dbac7-a03b-450d-837b-cbdd007b9e46	S03WP		DNH 1435 puce de taille s	2	2	2025-03-25 11:11:10.991	2025-03-25 11:11:10.991	\N	L.E2025-03-0014
47abfa57-18c1-41b6-9f97-9d7990d49d12	S03WP		DNH 1437 puce de taille XL	2	2	2025-03-25 11:11:10.991	2025-03-25 11:11:10.991	\N	L.E2025-03-0014
4579d486-582b-498f-a2b0-e9468d61a5ba	W2385.000.85528G 098 N	663	Art 11439	80	80	2025-03-25 11:13:50.604	2025-03-25 11:13:50.604	\N	L.E2025-03-0015
839c2803-ea47-4781-a434-983f800166b3	W2385.000.85528G 098 N	663	Art 430	17	17	2025-03-25 11:13:50.604	2025-03-25 11:13:50.604	\N	L.E2025-03-0015
5ee76c77-b4f5-4b51-8ea1-ce9775fac3bb		3185	Retour Rehausse 	246	246	2025-03-25 11:15:38.68	2025-03-25 11:15:38.68	\N	L.E2025-03-0016
6bd92402-0bf9-45b1-a829-70703ec0a2f8	W2385.000.85528G 098 N	663	RPL 2638	50	50	2025-03-25 11:17:57.924	2025-03-25 11:17:57.924	\N	L.E2025-03-0017
8931f212-790e-4437-a719-a79ca98acd62	W2385.000.85528G 098 N	663	Art 19	50	50	2025-03-25 11:17:57.924	2025-03-25 11:17:57.924	\N	L.E2025-03-0017
8db2e653-82be-4a4a-bdf1-4e80ee7a8d15		663	echantillon	1	1	2025-03-25 11:18:57.105	2025-03-25 11:18:57.105	\N	L.E2025-03-0018
75470950-63b2-471d-98cc-a5f4512abfeb	Modèle Sans Nom	199	echantillon	1	1	2025-03-25 11:18:57.105	2025-03-25 11:18:57.105	\N	L.E2025-03-0018
1529e583-8edf-4925-97af-0809bb8e70ed	WH461.000.573B915 097 028	199	Art 4300	19.49	19.49	2025-03-25 11:33:38.377	2025-03-25 11:33:38.377	\N	L.E2025-03-0019
34387e8f-62d7-4328-8df4-7e865cd21d34	WH461.000.573B915 097 028	199	Art 9591	19.66	19.66	2025-03-25 11:33:38.377	2025-03-25 11:33:38.377	\N	L.E2025-03-0019
9d46bc0f-e6e5-47c7-9fc9-0833ae982215	WH461.000.573B915 097 028	199	Art 9977	110.72	110.72	2025-03-25 11:33:38.377	2025-03-25 11:33:38.377	\N	L.E2025-03-0019
c906a5ff-9630-479c-a332-d55fce7ac6d5	WH461.000.573B915 097 028	199	Art 9977	81.03	81.03	2025-03-25 11:33:38.377	2025-03-25 11:33:38.377	\N	L.E2025-03-0019
7f83b07e-311d-4577-9267-f689b7a1da95	WH461.000.573B915 097 028	199	Art4300	64.96	64.96	2025-03-25 11:33:38.377	2025-03-25 11:33:38.377	\N	L.E2025-03-0019
bdbc5fba-7e1d-4efb-b88d-e50828b1297e	WH461.000.573B915 097 028	199	Art9591	30.47	30.47	2025-03-25 11:33:38.377	2025-03-25 11:33:38.377	\N	L.E2025-03-0019
650bd096-8a9a-4703-8801-99d3b613983f	WH461.000.573B915 097 028	199	Art9591	35.07	35.07	2025-03-25 11:33:38.377	2025-03-25 11:33:38.377	\N	L.E2025-03-0019
c79e7311-6322-4d02-a716-72062a509297	WH461.000.573B915 097 028	199	Art 9977	49.97	49.97	2025-03-25 11:33:38.377	2025-03-25 11:33:38.377	\N	L.E2025-03-0019
b4686f18-c65a-4d9e-ba51-643592ad0027	WH461.000.573B915 097 028	199	Art 9977	134	134	2025-03-25 11:33:38.377	2025-03-25 11:33:38.377	\N	L.E2025-03-0019
b1b40b84-225f-41a9-9486-4e0bc197f78b	WH461.000.573B915 097 028	199	Art 9977	132.9	132.9	2025-03-25 11:33:38.377	2025-03-25 11:33:38.377	\N	L.E2025-03-0019
8e763dbd-a08a-41d0-aae7-2e1452d16fdb	WH461.000.573B915 097 028	199	Art 9977	130	130	2025-03-25 11:33:38.377	2025-03-25 11:33:38.377	\N	L.E2025-03-0019
6f0268f4-e566-48ca-aefb-2391d3a5ada6	WH461.000.573B915 097 028	199	Art 9977	130	130	2025-03-25 11:33:38.377	2025-03-25 11:33:38.377	\N	L.E2025-03-0019
495acad6-673e-44b6-9f97-abc1900245c8	WH461.000.573B915 097 028	199	Art 9977	97.67	97.67	2025-03-25 11:33:38.377	2025-03-25 11:33:38.377	\N	L.E2025-03-0019
51244e99-121a-4d11-8df7-e22441db5cda		610	echantillon	1	1	2025-03-25 11:50:12.509	2025-03-25 11:50:12.509	\N	L.E2025-03-0021
03047bd9-6416-43c4-bc1e-23cc62c6392b	Modèle Sans Nom	356	echantillon	1	1	2025-03-25 11:50:12.509	2025-03-25 11:50:12.509	\N	L.E2025-03-0021
4c25882e-40fb-45b4-a2ed-3645ef25f8fe	MV864A.000.960 07A 007 N	dispo1	Art 11354	4	4	2025-03-25 12:08:47.015	2025-03-25 12:08:47.015	\N	L.E2025-03-0023
f2975185-b53b-41e8-b59e-bd9ca1100fb0	MV864A.000.960 07A 007 N	dispo1	Art4300	1	1	2025-03-25 12:08:47.015	2025-03-25 12:08:47.015	\N	L.E2025-03-0023
2785c3fe-f55c-49e2-b06c-e9923c7b7544	W1077.000.85528G N	240	Art 11439	7	7	2025-03-25 12:08:47.015	2025-03-25 12:08:47.015	\N	L.E2025-03-0023
1e5de383-a994-4e49-88b1-065f640f43ab	W1077.000.85528G N	240	Art 4300	5	5	2025-03-25 12:08:47.015	2025-03-25 12:08:47.015	\N	L.E2025-03-0023
5ed8ef33-0d8d-4537-9e9a-dafa5954a2ca	W1077.000.85528G N	240	art 7861	1	1	2025-03-25 12:08:47.015	2025-03-25 12:08:47.015	\N	L.E2025-03-0023
8ee8e24a-9a6b-4878-a3f7-578b1050aca6	W2379.000.85528G N	241	Art 11439	4	4	2025-03-25 12:08:47.015	2025-03-25 12:08:47.015	\N	L.E2025-03-0023
323bf9a0-ff19-4394-a00e-4a500ddd8d70	W2379.000.85528G N	241	Art 4300	0.5	0.5	2025-03-25 12:08:47.015	2025-03-25 12:08:47.015	\N	L.E2025-03-0023
735367bc-14fc-4266-83b8-06270046abe6	W2385.000.85528G N	242	Art 11439	6	6	2025-03-25 12:08:47.015	2025-03-25 12:08:47.015	\N	L.E2025-03-0023
b007180c-d34a-4bf1-bfec-e8aea0ad59af	MV864A.000.960 07A 007 N	1	Rpl1472	2	2	2025-03-25 12:13:14.032	2025-03-25 12:13:14.032	\N	L.E2025-03-0024
a5005a79-e4d4-48fa-b11d-a232390d1610	MV864A.000.960 07A 007 N	1	Art65	2	2	2025-03-25 12:13:14.032	2025-03-25 12:13:14.032	\N	L.E2025-03-0024
93cb3f52-eaa6-40ff-a75a-e15f18bc62ec	MV864A.000.960 07A 007 N	1	RPL 1456	2	2	2025-03-25 12:13:14.032	2025-03-25 12:13:14.032	\N	L.E2025-03-0024
3145f99b-79d1-4831-a9a9-125635f65773	MV864A.000.960 07A 007 N	1	RPL 1452	2	2	2025-03-25 12:13:14.032	2025-03-25 12:13:14.032	\N	L.E2025-03-0024
5c9f744c-25d6-4ec9-b203-276a74a89ea4	MV864A.000.960 07A 007 N	1	RPL 2589	0.7	0.7	2025-03-25 12:13:14.032	2025-03-25 12:13:14.032	\N	L.E2025-03-0024
723c4d06-33b7-4656-9526-488d4808e7b7	MV864A.000.960 07A 007 N	1	RPL 2356	2	2	2025-03-25 12:13:14.032	2025-03-25 12:13:14.032	\N	L.E2025-03-0024
e2461eb2-85bf-4736-87ca-711e693c82eb	W2385.000.85528G N	242	RPL2577	2	2	2025-03-25 12:13:14.032	2025-03-25 12:13:14.032	\N	L.E2025-03-0024
aab87e57-9fe9-44cf-a41f-5f3b7cdc4e62		242	Echantillon	1	1	2025-03-25 12:14:32.926	2025-03-25 12:14:32.926	\N	L.E2025-03-0025
813a2743-2ebc-43f0-9fef-6c99d3eac80f	Modèle Sans Nom	1	Echantillon	1	1	2025-03-25 12:14:32.926	2025-03-25 12:14:32.926	\N	L.E2025-03-0025
9e58ef0f-6b57-4667-b363-02097c93ac4a	Modèle Sans Nom	240	Echantillon	1	1	2025-03-25 12:14:32.926	2025-03-25 12:14:32.926	\N	L.E2025-03-0025
c53052cc-dc06-4c2b-b6d3-2e2ca644bced	Modèle Sans Nom	241	Echantillon	1	1	2025-03-25 12:14:32.926	2025-03-25 12:14:32.926	\N	L.E2025-03-0025
61806ab8-2c1c-42d5-a72d-50f2dfafaf01		1	coli tissu	1	1	2025-03-25 12:15:22.169	2025-03-25 12:15:22.169	\N	L.E2025-03-0026
9e335759-ef9b-490c-9c4f-5e292dbb63ae		3071,3185,3195	echantillon	3	3	2025-03-25 12:16:38.675	2025-03-25 12:16:38.675	\N	L.E2025-03-0027
1bfd59f8-c91f-4b2e-a5e9-bb73c651bcfb	Razor	3185	etiquette	614	614	2025-03-25 12:18:07.135	2025-03-25 12:18:07.135	\N	L.E2025-03-0028
a9efd364-129a-4271-bb0b-0908e4e50bc2	Razor	3185	biais	204	204	2025-03-25 12:18:07.135	2025-03-25 12:18:07.135	\N	L.E2025-03-0028
fd0fe69a-2633-41df-8e59-3cd2bc5c3543	Razor	3185	puce de taille 	15	15	2025-03-25 12:18:07.135	2025-03-25 12:18:07.135	\N	L.E2025-03-0028
7ef002b3-1428-479d-9551-6c3c4db09532		3071	retour broderie	541	541	2025-03-25 12:19:21.931	2025-03-25 12:19:21.931	\N	L.E2025-03-0029
98be116a-2a10-4677-8de9-a4be923155a1	Modèle Sans Nom	3071	retour apres seriegraphie	1082	1082	2025-03-25 12:19:21.931	2025-03-25 12:19:21.931	\N	L.E2025-03-0029
0eb13679-6e99-4dd6-9511-853c9781dc0c	Razor	3071	retour apres seriegraphie	890	890	2025-03-25 12:20:26.787	2025-03-25 12:20:26.787	\N	L.E2025-03-0030
9a77f7c8-8907-462d-a3e6-9ebbf6d99304	Razor	3071	retour apres seriegraphie	445	445	2025-03-25 12:21:32.044	2025-03-25 12:21:32.044	\N	L.E2025-03-0031
f93f2ffe-b79b-42d0-991e-a618a361c3dd	Razor	3185	Art9399	10	10	2025-03-25 12:22:36.647	2025-03-25 12:22:36.647	\N	L.E2025-03-0032
2b45e8b5-767c-48b8-a603-8d34ec9eaa98		185	echantillon	1	1	2025-03-25 12:25:00.074	2025-03-25 12:25:00.074	\N	L.E2025-03-0033
f4d5b46f-fd09-47b0-8abf-13c91f64a453	WA534.000.805 923 007	185	Art 11117	116.5	116.5	2025-03-25 12:27:19.679	2025-03-25 12:27:19.679	\N	L.E2025-03-0034
70db4527-84a3-44f2-b1ec-69b734dcae3e	M9068.000.203.07A	1125933	etiquette	0	0	2025-03-25 13:11:51.854	2025-03-25 13:11:51.854	\N	L.E2025-03-0001
0c005020-67ea-4deb-8642-7fc8365b90c7	M9068.000.203.07A		1 colis	0	0	2025-03-25 13:11:51.854	2025-03-25 13:11:51.854	\N	L.E2025-03-0001
e15ffbc4-c193-4c4e-b878-09c6789d6980	M9068.000.795.07A	1125927	etiquette	0	0	2025-03-25 13:11:51.854	2025-03-25 13:11:51.854	\N	L.E2025-03-0001
2dc21164-dab2-4d2b-8971-f6ada896dc11	M9068.000.203.07A		tracée	0	0	2025-03-25 13:11:51.854	2025-03-25 13:11:51.854	\N	L.E2025-03-0001
25021522-d36d-4b97-a44a-53fec9b02185	M9068.000.203.07A		2 Rlx tissu ATT0203 NV102644	82	82	2025-03-25 13:11:51.854	2025-03-25 13:11:51.854	\N	L.E2025-03-0001
82a6cbe4-1103-4fcc-ab60-b18c2267d8db	M9068.000.795.07A		colis	0	0	2025-03-25 13:11:51.854	2025-03-25 13:11:51.854	\N	L.E2025-03-0001
b7ab59e6-c614-48ee-bf61-22a6e8af2b11	M9068.000.795.07A		tracée	0	0	2025-03-25 13:11:51.854	2025-03-25 13:11:51.854	\N	L.E2025-03-0001
d3154592-513a-443e-a4ee-60fcb03534a9	M9068.000.795.07A		1RLX tissu ATW 0795 NV 9010534	80	80	2025-03-25 13:11:51.854	2025-03-25 13:11:51.854	\N	L.E2025-03-0001
cbeb1868-bc58-47e8-be02-a207e30d27a0	M4145R.000.875.84A	1245003	colis	0	0	2025-03-25 13:11:51.854	2025-03-25 13:11:51.854	\N	L.E2025-03-0001
51123cac-0325-4cfe-965d-1a6ef44191d3	M4145R.000.875.84A		tracée	0	0	2025-03-25 13:11:51.854	2025-03-25 13:11:51.854	\N	L.E2025-03-0001
70c90c72-f14a-4ccd-a1eb-866415bbe04d	M4145R.000.875.84A	1245003	07 Rlx tissu ATT0875 NV102510	497	497	2025-03-25 13:11:51.854	2025-03-25 13:11:51.854	\N	L.E2025-03-0001
a4ab3d64-9d52-4261-ab75-5156d8438472	M4145R.000.875.84A		1Rlx adenix A20I43 NV 102305	37	37	2025-03-25 13:11:51.854	2025-03-25 13:11:51.854	\N	L.E2025-03-0001
64f9893f-d37c-4fe7-8318-f83daa65a16a	Razor	3185	Art9399	19.1	19.1	2025-03-25 13:12:57.113	2025-03-25 13:12:57.113	\N	L.E2025-03-0022
e4a99e33-f0e8-4652-ba62-d96353341318	Razor		Art9574	12.07	12.07	2025-03-25 13:12:57.113	2025-03-25 13:12:57.113	\N	L.E2025-03-0022
31a3a11b-ee86-44a6-9b71-81d9f7b3be8c	Razor		Art9960	30	30	2025-03-25 13:12:57.113	2025-03-25 13:12:57.113	\N	L.E2025-03-0022
ee5b4229-a0c6-4011-8a02-be5f8be55f73	Razor		Art9960	39	39	2025-03-25 13:12:57.113	2025-03-25 13:12:57.113	\N	L.E2025-03-0022
7f2e9075-5ccc-4059-8705-e4c10b01aa41	Razor		art9960	47.85	47.85	2025-03-25 13:12:57.113	2025-03-25 13:12:57.113	\N	L.E2025-03-0022
019ab156-3130-4e08-9c7c-d92ac91909c5	Razor		art9399	37.6	37.6	2025-03-25 13:12:57.113	2025-03-25 13:12:57.113	\N	L.E2025-03-0022
2e5920eb-ad27-444d-8150-51da4e7a958d	Razor		art9399	146.11	146.11	2025-03-25 13:12:57.113	2025-03-25 13:12:57.113	\N	L.E2025-03-0022
98195874-916b-4732-abc5-ebc402921c29	Razor		art9399	102.08	102.08	2025-03-25 13:12:57.113	2025-03-25 13:12:57.113	\N	L.E2025-03-0022
5f48802b-6a60-469f-9472-44327094231d	Razor		art9574	14	14	2025-03-25 13:12:57.113	2025-03-25 13:12:57.113	\N	L.E2025-03-0022
\.


--
-- Data for Name: ModelPlan; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ModelPlan" (id, name, lotto, commande, ordine, faconner, designation, date_import, date_export, date_entre_coupe, date_sortie_coupe, date_entre_chaine, date_sortie_chaine, "planningId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Planning; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Planning" (id, name, status, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProductionEntry; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ProductionEntry" (id, "ficheId", week, day, hour, "quantityCreated", "createdAt", "updatedAt") FROM stdin;
0e7b4ae1-663c-4ff7-bf04-7ed95e6226ed	42f51e0a-a287-4078-ab60-1fd8b8e70726	Week 1	Lun	10:00 	55	2025-03-22 13:01:11.131	2025-03-22 13:01:11.131
8d445cc6-a8b7-4bf6-9961-7acccb6ea604	42f51e0a-a287-4078-ab60-1fd8b8e70726	Week 1	Lun	13:00 	67	2025-03-22 13:01:11.131	2025-03-22 13:01:11.131
7e10548d-7fac-4976-8c9f-afed0163f472	42f51e0a-a287-4078-ab60-1fd8b8e70726	Week 1	Lun	15:30 	10	2025-03-22 13:01:11.131	2025-03-22 13:01:11.131
\.


--
-- Data for Name: SuiviProduction; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."SuiviProduction" (id, model_name, qte_total, client, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SuiviProductionLine; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."SuiviProductionLine" (id, commande, qte_livree, qte_reparation, numero_livraison, date_export, "suiviId") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."User" (id, name, email, role, "createdAt", "updatedAt", "clerkUserId") FROM stdin;
0954f5fa-0dd4-4a17-ba85-de2dcc474651	Admin	bennasrnessim@outlook.com	ADMIN	2025-03-22 22:21:39.564	2025-03-22 22:21:39.564	user_2tzAIQgJEa0yumcWtf5pnOfEQa8
9c417276-4e0d-4026-9838-a3c9ba5d9e71	Ines	ines.jamel.bennasr@gmail.com	ADMIN	2025-03-22 22:22:01.49	2025-03-22 22:23:36.48	user_2ugtnoZNHMvc0COEfogh7U5vOmC
0fe62922-23fc-40ee-8c0a-3f1a7ee2563a	Majdi	boudhriwamajdi@gmail.com	COUPEUR	2025-03-25 09:34:44.87	2025-03-25 09:35:57.39	user_2unroii5wddIEjWnwRLhFrYiKE4
51a121e5-7f21-4300-b2dd-a57271710dd7	Nessim Bennasr	bn.nessim@gmail.com	COUPEUR	2025-03-27 07:50:47.595	2025-03-27 07:51:51.745	user_2utJPAbG4c37pcZJqPx4bau7Cm0
5db82b20-387d-4196-b6c3-d3276f826141	Nessim Bennasr	bennasrnessim1919@gmail.com	CHEF	2025-03-27 08:07:45.525	2025-03-27 08:08:30.698	user_2utLQiqwyH2Pq80f4Gd6OIgufWj
\.


--
-- Data for Name: Variant; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Variant" (id, name, "clientModelId", qte_variante, "modelId", "createdAt", "updatedAt") FROM stdin;
dc244860-3037-4253-b512-571d66bd7393	001	66a3a84d-e3ab-4ed8-bee8-381b007e96cd	315	\N	2025-03-22 11:43:40.114	2025-03-22 11:43:40.114
d56efda8-025a-448e-8449-f51598c711b7	001	f8d99fe3-cf7e-4980-9109-d394e4dd6a38	722	\N	2025-03-22 11:45:01.859	2025-03-22 11:45:01.859
f33e1fe9-3e65-4428-8854-5e2b1f72c8e0	001	fc9b1e3f-465b-46b4-b725-377795e1834c	541	\N	2025-03-22 11:45:47.66	2025-03-22 11:45:47.66
69091eae-7f25-4758-933c-d63c31d95f5a	--	17023281-0d15-4aa3-93be-5ae7fa75d4ab	46	\N	2025-03-22 12:40:13.536	2025-03-22 12:40:13.536
00b73038-ec43-4fc9-8411-186e2f0fd441	--	00f71e45-cd6c-4ffe-8be2-3782baafa710	276	\N	2025-03-22 12:40:22.386	2025-03-22 12:40:22.386
368e2f87-e95f-439d-97d2-b1a1efdd3894	--	cf39aaf7-22fd-4db8-81fb-0020c3b06609	46	\N	2025-03-22 12:40:29.605	2025-03-22 12:40:29.605
0cf82221-6c56-4c8e-b9f6-f72015b17e15	--	c2226c7c-5f19-41b3-b41d-2b8c6738d0fc	814	\N	2025-03-25 12:55:45.35	2025-03-25 12:55:45.35
54b730ff-4626-425a-99e2-e392328c676c	--	4d09532d-b9e4-431c-a4e2-563c95e26ace	2	\N	2025-03-25 12:56:17.523	2025-03-25 12:56:17.523
e75ccdf6-a369-413d-af37-4fd755b5270b	--	4d09532d-b9e4-431c-a4e2-563c95e26ace	50	\N	2025-03-25 12:56:17.523	2025-03-25 12:56:17.523
a7a67e0a-c7e5-41f3-88e2-6e2b8f6e4eea	--	daad5303-5574-4dca-8cea-0577b7d6a9a7	2	\N	2025-03-25 12:56:26.213	2025-03-25 12:56:26.213
16c2e625-47d1-4086-be5d-fa4fafb01790	--	b00adf99-1f75-4f1b-8f4d-42e67b721463	2	\N	2025-03-25 12:56:32.958	2025-03-25 12:56:32.958
32f5299c-1d0d-45df-8a00-7dbe75960fc9	--	d9732c10-67ba-4062-b1d5-2bd4bedd1e6a	1679	\N	2025-03-25 12:58:01.969	2025-03-25 12:58:01.969
adb2a546-b181-4b61-9f5e-268308532a62	--	d9732c10-67ba-4062-b1d5-2bd4bedd1e6a	214	\N	2025-03-25 12:58:01.969	2025-03-25 12:58:01.969
88a53e01-8413-48ea-93f1-0b23064dc2bc	--	d9732c10-67ba-4062-b1d5-2bd4bedd1e6a	990	\N	2025-03-25 12:58:01.969	2025-03-25 12:58:01.969
9803ca58-2b63-4d91-9e8d-acec6bd2cd27	--	7c5fff3b-e1ce-40e9-9326-d6a68ce5cab5	8	\N	2025-03-25 12:58:09.11	2025-03-25 12:58:09.11
ec876899-2f00-48ac-8805-7682c068ae32	--	d2320f23-a2eb-4bb7-87fd-26a4b1f50f1f	1066	\N	2025-03-25 12:58:15.558	2025-03-25 12:58:15.558
2b4564be-693e-4b1b-a4d3-e2f2f3b61e8c	--	440803aa-50b1-4d13-ac75-5bb0927f74ec	50	\N	2025-03-25 12:58:27.975	2025-03-25 12:58:27.975
d9bf2411-11a2-4348-9983-a966e5b1a843	--	440803aa-50b1-4d13-ac75-5bb0927f74ec	50	\N	2025-03-25 12:58:27.975	2025-03-25 12:58:27.975
bf2ef9cb-d94d-4db9-9e8c-ee3b910ff4d9	--	440803aa-50b1-4d13-ac75-5bb0927f74ec	2	\N	2025-03-25 12:58:27.975	2025-03-25 12:58:27.975
58d720f4-c839-4dbd-9a80-bab69397aaa4	--	6381a8bf-0d57-47c6-82f2-5ff714a50e4b	1	\N	2025-03-25 12:58:47.63	2025-03-25 12:58:47.63
7637df12-ada2-479d-9a9f-1c198c35f272	--	6381a8bf-0d57-47c6-82f2-5ff714a50e4b	40	\N	2025-03-25 12:58:47.63	2025-03-25 12:58:47.63
3e3dda9c-e510-4dbc-92b8-2ae71d0eec7b	--	154ea34a-dca1-4075-a966-bd402237b9bb	2	\N	2025-03-25 13:09:56.38	2025-03-25 13:09:56.38
\.


--
-- Data for Name: _ModelAccessoires; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."_ModelAccessoires" ("A", "B") FROM stdin;
temp-acc-1742642136190	temp-1742642119386
temp-acc-1742642285721	temp-1742642119386
temp-acc-1742642302498	temp-1742642119386
temp-acc-1742642303983	temp-1742642119386
temp-acc-1742642304948	temp-1742642119386
temp-acc-1742642305821	temp-1742642119386
temp-acc-1742642306676	temp-1742642119386
temp-acc-1742642307533	temp-1742642119386
temp-acc-1742642308685	temp-1742642119386
temp-acc-1742642500555	temp-1742642119386
temp-acc-1742642525993	temp-1742642119386
temp-acc-1742642526848	temp-1742642119386
temp-acc-1742642528200	temp-1742642119386
temp-acc-1742642607985	temp-1742642119386
temp-acc-1742642608861	temp-1742642119386
temp-acc-1742642610278	temp-1742642119386
temp-acc-1742642638192	temp-1742642119386
temp-acc-1742642639019	temp-1742642119386
temp-acc-1742642640031	temp-1742642119386
temp-acc-1742642693820	temp-1742642119386
temp-acc-1742643194869	temp-1742642119386
temp-acc-1742642183058	temp-1742642165067
temp-acc-1742642200602	temp-1742642165067
temp-acc-1742642214974	temp-1742642165067
temp-acc-1742642231400	temp-1742642165067
temp-acc-1742642731871	temp-1742642165067
temp-acc-1742642734564	temp-1742642165067
temp-acc-1742642735718	temp-1742642165067
temp-acc-1742642737194	temp-1742642165067
temp-acc-1742642738098	temp-1742642165067
temp-acc-1742642788099	temp-1742642165067
temp-acc-1742642789206	temp-1742642165067
temp-acc-1742642790718	temp-1742642165067
temp-acc-1742642885742	temp-1742642165067
temp-acc-1742642887891	temp-1742642165067
temp-acc-1742642888886	temp-1742642165067
temp-acc-1742642916430	temp-1742642165067
temp-acc-1742642917400	temp-1742642165067
temp-acc-1742642999721	temp-1742642165067
temp-acc-1742643000561	temp-1742642165067
temp-acc-1742643215416	temp-1742642165067
temp-acc-1742643115673	temp-1742643094503
temp-acc-1742643119085	temp-1742643094503
temp-acc-1742643237037	temp-1742643094503
temp-acc-1742643365308	temp-1742643348997
temp-acc-1742643377662	temp-1742643348997
temp-acc-1742643479479	temp-1742643348997
temp-acc-1742643480397	temp-1742643348997
temp-acc-1742643405236	temp-1742643389720
temp-acc-1742643417652	temp-1742643389720
temp-acc-1742643418537	temp-1742643389720
temp-acc-1742643430688	temp-1742643389720
temp-acc-1742643432117	temp-1742643389720
\.


--
-- Name: Event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public."Event_id_seq"', 2, true);


--
-- Name: Accessoire Accessoire_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Accessoire"
    ADD CONSTRAINT "Accessoire_pkey" PRIMARY KEY (id);


--
-- Name: ClientModel ClientModel_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ClientModel"
    ADD CONSTRAINT "ClientModel_pkey" PRIMARY KEY (id);


--
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY (id);


--
-- Name: CommandeLine CommandeLine_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CommandeLine"
    ADD CONSTRAINT "CommandeLine_pkey" PRIMARY KEY (id);


--
-- Name: Commande Commande_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Commande"
    ADD CONSTRAINT "Commande_pkey" PRIMARY KEY (id);


--
-- Name: CoupeEntry CoupeEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CoupeEntry"
    ADD CONSTRAINT "CoupeEntry_pkey" PRIMARY KEY (id);


--
-- Name: DeclarationExport DeclarationExport_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."DeclarationExport"
    ADD CONSTRAINT "DeclarationExport_pkey" PRIMARY KEY (id);


--
-- Name: DeclarationImport DeclarationImport_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."DeclarationImport"
    ADD CONSTRAINT "DeclarationImport_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: ExportLine ExportLine_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ExportLine"
    ADD CONSTRAINT "ExportLine_pkey" PRIMARY KEY (id);


--
-- Name: FicheCoupe FicheCoupe_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FicheCoupe"
    ADD CONSTRAINT "FicheCoupe_pkey" PRIMARY KEY (id);


--
-- Name: FicheProduction FicheProduction_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FicheProduction"
    ADD CONSTRAINT "FicheProduction_pkey" PRIMARY KEY (id);


--
-- Name: Fournisseur Fournisseur_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Fournisseur"
    ADD CONSTRAINT "Fournisseur_pkey" PRIMARY KEY (id);


--
-- Name: InvoiceLine InvoiceLine_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InvoiceLine"
    ADD CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: LivraisonEntreeLine LivraisonEntreeLine_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LivraisonEntreeLine"
    ADD CONSTRAINT "LivraisonEntreeLine_pkey" PRIMARY KEY (id);


--
-- Name: LivraisonEntree LivraisonEntree_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LivraisonEntree"
    ADD CONSTRAINT "LivraisonEntree_pkey" PRIMARY KEY (id);


--
-- Name: LivraisonLine LivraisonLine_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LivraisonLine"
    ADD CONSTRAINT "LivraisonLine_pkey" PRIMARY KEY (id);


--
-- Name: Livraison Livraison_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Livraison"
    ADD CONSTRAINT "Livraison_pkey" PRIMARY KEY (id);


--
-- Name: ModelPlan ModelPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ModelPlan"
    ADD CONSTRAINT "ModelPlan_pkey" PRIMARY KEY (id);


--
-- Name: Model Model_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Model"
    ADD CONSTRAINT "Model_pkey" PRIMARY KEY (id);


--
-- Name: Planning Planning_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Planning"
    ADD CONSTRAINT "Planning_pkey" PRIMARY KEY (id);


--
-- Name: ProductionEntry ProductionEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductionEntry"
    ADD CONSTRAINT "ProductionEntry_pkey" PRIMARY KEY (id);


--
-- Name: SuiviProductionLine SuiviProductionLine_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."SuiviProductionLine"
    ADD CONSTRAINT "SuiviProductionLine_pkey" PRIMARY KEY (id);


--
-- Name: SuiviProduction SuiviProduction_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."SuiviProduction"
    ADD CONSTRAINT "SuiviProduction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Variant Variant_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Variant"
    ADD CONSTRAINT "Variant_pkey" PRIMARY KEY (id);


--
-- Name: _ModelAccessoires _ModelAccessoires_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."_ModelAccessoires"
    ADD CONSTRAINT "_ModelAccessoires_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: ClientModel_clientId_name_commandes_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "ClientModel_clientId_name_commandes_key" ON public."ClientModel" USING btree ("clientId", name, commandes);


--
-- Name: Client_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Client_email_key" ON public."Client" USING btree (email);


--
-- Name: CoupeEntry_ficheCoupeId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CoupeEntry_ficheCoupeId_idx" ON public."CoupeEntry" USING btree ("ficheCoupeId");


--
-- Name: CoupeEntry_week_day_category_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CoupeEntry_week_day_category_idx" ON public."CoupeEntry" USING btree (week, day, category);


--
-- Name: FicheCoupe_clientId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "FicheCoupe_clientId_idx" ON public."FicheCoupe" USING btree ("clientId");


--
-- Name: FicheCoupe_modelId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "FicheCoupe_modelId_idx" ON public."FicheCoupe" USING btree ("modelId");


--
-- Name: User_clerkUserId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_clerkUserId_key" ON public."User" USING btree ("clerkUserId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: _ModelAccessoires_B_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "_ModelAccessoires_B_index" ON public."_ModelAccessoires" USING btree ("B");


--
-- Name: Accessoire Accessoire_modelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Accessoire"
    ADD CONSTRAINT "Accessoire_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES public."Model"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClientModel ClientModel_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ClientModel"
    ADD CONSTRAINT "ClientModel_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommandeLine CommandeLine_commandeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CommandeLine"
    ADD CONSTRAINT "CommandeLine_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES public."Commande"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Commande Commande_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Commande"
    ADD CONSTRAINT "Commande_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CoupeEntry CoupeEntry_ficheCoupeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CoupeEntry"
    ADD CONSTRAINT "CoupeEntry_ficheCoupeId_fkey" FOREIGN KEY ("ficheCoupeId") REFERENCES public."FicheCoupe"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DeclarationExport DeclarationExport_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."DeclarationExport"
    ADD CONSTRAINT "DeclarationExport_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DeclarationImport DeclarationImport_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."DeclarationImport"
    ADD CONSTRAINT "DeclarationImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ExportLine ExportLine_exportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ExportLine"
    ADD CONSTRAINT "ExportLine_exportId_fkey" FOREIGN KEY ("exportId") REFERENCES public."DeclarationExport"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FicheCoupe FicheCoupe_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FicheCoupe"
    ADD CONSTRAINT "FicheCoupe_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FicheCoupe FicheCoupe_modelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FicheCoupe"
    ADD CONSTRAINT "FicheCoupe_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES public."ClientModel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FicheProduction FicheProduction_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FicheProduction"
    ADD CONSTRAINT "FicheProduction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FicheProduction FicheProduction_modelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."FicheProduction"
    ADD CONSTRAINT "FicheProduction_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES public."ClientModel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceLine InvoiceLine_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InvoiceLine"
    ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invoice Invoice_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LivraisonEntreeLine LivraisonEntreeLine_livraisonEntreeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LivraisonEntreeLine"
    ADD CONSTRAINT "LivraisonEntreeLine_livraisonEntreeId_fkey" FOREIGN KEY ("livraisonEntreeId") REFERENCES public."LivraisonEntree"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LivraisonEntree LivraisonEntree_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LivraisonEntree"
    ADD CONSTRAINT "LivraisonEntree_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LivraisonEntree LivraisonEntree_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LivraisonEntree"
    ADD CONSTRAINT "LivraisonEntree_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LivraisonLine LivraisonLine_livraisonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LivraisonLine"
    ADD CONSTRAINT "LivraisonLine_livraisonId_fkey" FOREIGN KEY ("livraisonId") REFERENCES public."Livraison"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Livraison Livraison_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Livraison"
    ADD CONSTRAINT "Livraison_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ModelPlan ModelPlan_planningId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ModelPlan"
    ADD CONSTRAINT "ModelPlan_planningId_fkey" FOREIGN KEY ("planningId") REFERENCES public."Planning"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Model Model_declarationImportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Model"
    ADD CONSTRAINT "Model_declarationImportId_fkey" FOREIGN KEY ("declarationImportId") REFERENCES public."DeclarationImport"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Model Model_livraisonEntreeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Model"
    ADD CONSTRAINT "Model_livraisonEntreeId_fkey" FOREIGN KEY ("livraisonEntreeId") REFERENCES public."LivraisonEntree"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Planning Planning_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Planning"
    ADD CONSTRAINT "Planning_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductionEntry ProductionEntry_ficheId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductionEntry"
    ADD CONSTRAINT "ProductionEntry_ficheId_fkey" FOREIGN KEY ("ficheId") REFERENCES public."FicheProduction"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SuiviProductionLine SuiviProductionLine_suiviId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."SuiviProductionLine"
    ADD CONSTRAINT "SuiviProductionLine_suiviId_fkey" FOREIGN KEY ("suiviId") REFERENCES public."SuiviProduction"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SuiviProduction SuiviProduction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."SuiviProduction"
    ADD CONSTRAINT "SuiviProduction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Variant Variant_clientModelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Variant"
    ADD CONSTRAINT "Variant_clientModelId_fkey" FOREIGN KEY ("clientModelId") REFERENCES public."ClientModel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Variant Variant_modelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Variant"
    ADD CONSTRAINT "Variant_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES public."ModelPlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ModelAccessoires _ModelAccessoires_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."_ModelAccessoires"
    ADD CONSTRAINT "_ModelAccessoires_A_fkey" FOREIGN KEY ("A") REFERENCES public."Accessoire"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ModelAccessoires _ModelAccessoires_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."_ModelAccessoires"
    ADD CONSTRAINT "_ModelAccessoires_B_fkey" FOREIGN KEY ("B") REFERENCES public."Model"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

