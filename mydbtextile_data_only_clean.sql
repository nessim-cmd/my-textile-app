--
-- Data for Name: Accessoire; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Accessoire" (id, reference_accessoire, "quantity_reçu", quantity_trouve, quantity_manque, "modelId") FROM stdin;
\.


--
-- Data for Name: Client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Client" (id, name, email, address, "createdAt", "updatedAt", "dateDebutSoumission", "dateFinSoumission", fix, "matriculeFiscale", phone1, phone2, soumission) FROM stdin;
\.


--
-- Data for Name: ClientModel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ClientModel" (id, name, description, "clientId", commandes, "commandesWithVariants", lotto, ordine, puht, "createdAt", "updatedAt") FROM stdin;
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

COPY public."DeclarationExport" (id, num_dec, "clientName", "exportDate", valeur, "dueDate", "vatActive", "vatRate", status, "poidsBrut", "poidsNet", "nbrColis", volume, "modePaiment", "origineTessuto", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DeclarationImport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DeclarationImport" (id, num_dec, date_import, client, valeur, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Event" (id, description, date) FROM stdin;
\.


--
-- Data for Name: ExportLine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ExportLine" (id, commande, modele, description, quantity, "unitPrice", "isExcluded", "exportId") FROM stdin;
\.


--
-- Data for Name: Fournisseur; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Fournisseur" (id, name, email, phone, address, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Invoice" (id, name, "issuerName", "issuerAddress", "clientName", "clientAddress", "invoiceDate", "dueDate", "vatActive", "vatRate", status, "poidsBrut", "poidsNet", "nbrColis", volume, "modePaiment", "origineTessuto", "userId", "createdAt", "updatedAt", gmailclient, gmailemetteur, phoneclient, phoneemetteur) FROM stdin;
\.


--
-- Data for Name: InvoiceLine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvoiceLine" (id, description, quantity, "unitPrice", "invoiceId", commande, modele) FROM stdin;
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

COPY public."LivraisonLine" (id, modele, commande, description, quantity, "livraisonId", "createdAt", "isExcluded", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Model" (id, name, "createdAt", "updatedAt", "declarationImportId") FROM stdin;
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
\.


--
-- Data for Name: Variant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Variant" (id, name, "clientModelId", qte_variante, "modelId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
28237521-cfe0-4dde-8957-51d1bf4cdeb8	8ff43e34fc38fd57c3562f5473b38b3bd6831564b8ef8e6ecb27cbb0b4727737	2025-03-02 01:36:15.710265+01	20250129231254_init	\N	\N	2025-03-02 01:36:15.566518+01	1
e1341aab-ba0a-495c-879f-355795e9448d	ccde733254985f9410a7aa9efbace8228e8c6e91defffa9660521df385d44815	2025-03-02 01:36:16.011812+01	20250302003225_add_all_models	\N	\N	2025-03-02 01:36:15.712468+01	1
6891cf1f-bcb5-4d1c-9519-e0a4a67d4f14	8ff43e34fc38fd57c3562f5473b38b3bd6831564b8ef8e6ecb27cbb0b4727737	2025-03-02 01:00:30.610934+01	20250129231254_init	\N	\N	2025-03-02 01:00:30.533689+01	1
a95076c8-cc52-49a5-85a8-c248e95ae197	ccde733254985f9410a7aa9efbace8228e8c6e91defffa9660521df385d44815	2025-03-02 01:32:25.569003+01	20250302003225_add_all_models	\N	\N	2025-03-02 01:32:25.3335+01	1
\.


--
-- Name: Event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--


REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

