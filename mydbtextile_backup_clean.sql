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
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


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

