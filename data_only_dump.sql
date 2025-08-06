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
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."User" VALUES ('f87f6c4c-fd38-47b1-88dd-9b22ab611bb9', 'osama bin laden', 'wefind.dz@gmail.com', '$2b$10$Bk.D5KfvFGHQp/G17FSHTuoqAfomIbsQVYTb30M5I4mOGtFvkWnoC', '1234 Street Name', 'Updated bio information', 'RECIPIENT', 'A_POSITIVE', '1234567890', '1990-01-01 00:00:00', 'fa4d6afe-9813-4dde-aa53-f7476908f1bd.webp', 'd65bc664-917c-4691-93f3-b3e9b0d0f030.jpg', NULL, true, '2025-08-03 03:32:47.503', '2025-08-03 03:35:16.827', NULL);
INSERT INTO public."User" VALUES ('f4fa7984-706f-40fa-9ed8-ff0a2f98d1ba', 'Tar', 'tqmhosain@gmail.com', NULL, NULL, NULL, 'RECIPIENT', NULL, NULL, NULL, '123', NULL, NULL, true, '2025-08-05 14:31:47.198', '2025-08-05 14:31:47.198', NULL);


--
-- Data for Name: BloodTransfer; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Conversation; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Location; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: MessageRead; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Ucode; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: _UserConversations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public._prisma_migrations VALUES ('025f67b8-0e77-4d54-85ba-05ab0eb15616', 'eeaa68421458dc69628a8f172bb28f44bb191d044108817e965b02872abeb946', '2025-08-03 09:31:20.445942+06', '20250803033120_init', NULL, NULL, '2025-08-03 09:31:20.38926+06', 1);


--
-- Name: Ucode_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Ucode_id_seq"', 1, true);


--
-- PostgreSQL database dump complete
--

