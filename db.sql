--
-- PostgreSQL database dump
--

-- Dumped from database version 15.11
-- Dumped by pg_dump version 15.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: min(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.min(uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN $1;
END;
$_$;


ALTER FUNCTION public.min(uuid) OWNER TO postgres;

--
-- Name: round(double precision, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.round(double precision, integer) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN round($1::numeric, $2);
END;
$_$;


ALTER FUNCTION public.round(double precision, integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accesses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    post_id character varying(255) NOT NULL,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    utm_source character varying(255),
    utm_medium character varying(255),
    utm_campaign character varying(255),
    utm_channel character varying(255)
);


ALTER TABLE public.accesses OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    is_admin boolean DEFAULT false,
    last_access timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    total_accesses integer DEFAULT 0,
    points integer DEFAULT 0,
    level integer DEFAULT 1
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: accesses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accesses (id, user_id, post_id, "timestamp", utm_source, utm_medium, utm_campaign, utm_channel) FROM stdin;
0b6b0245-a2b7-4711-88c6-5c21c7638d20	6554e3dc-7b0c-49b2-940e-dfa2d765f066	post_2025-02-14	2025-02-14 23:00:20.204+00	\N	\N	\N	\N
c4308dea-9ea2-4929-a731-115161af6194	6554e3dc-7b0c-49b2-940e-dfa2d765f066	post_2025-02-16	2025-02-16 08:01:10.747+00	\N	\N	\N	\N
d9aa0ffc-316f-4874-9478-59235acec5a7	6427ab30-6e1a-43e7-9af7-91d2e6b56e54	post_2025-02-20	2025-02-20 18:00:13.164+00	marketing	referral	new_feature	\N
8beb0c55-5b46-4420-816d-813a30ac93c3	6554e3dc-7b0c-49b2-940e-dfa2d765f066	post_2025-02-17	2025-02-17 02:01:59.833+00	tech_case	email	tech_case	\N
023e5e3d-d6db-4647-b542-f06cf09c61ca	6554e3dc-7b0c-49b2-940e-dfa2d765f066	post_2025-02-18	2025-02-18 07:03:09.809+00	tech_case	email	tech_case	\N
ecc2d67e-cd80-4c3c-b2c7-7d8c681de2b3	909cacfd-09e8-4df3-aa94-edb539f5028f	post_2025-02-20	2025-02-20 23:00:38.027+00	promo	social	launch	\N
ab99ce2c-9fbb-4ec1-b914-02fd82567b47	909cacfd-09e8-4df3-aa94-edb539f5028f	post_2025-02-21	2025-02-21 00:00:48.901+00	campaign	email	new_feature	\N
c871c39f-9b21-4434-900d-871125a55e0a	5f2a862f-47a7-4838-a641-f4971b9d8781	post_2025-02-15	2025-02-15 00:00:23.9+00	\N	\N	\N	\N
bba44138-8bb2-4e3d-94f6-e90a93170ceb	03f8a72f-ad13-4a4d-9280-e03159b5deb8	post_2025-02-21	2025-02-21 14:00:13.713+00	marketing	banner	tech_case	\N
b4b5a39a-8970-4ad9-8a1b-cf68d618f71e	d24b3859-a1be-4c49-b808-56c76bf40532	post_2025-02-21	2025-02-21 15:00:15.252+00	marketing	cpc	new_feature	\N
7cb80f3c-2334-447b-bfc3-486fad804ba3	5f2a862f-47a7-4838-a641-f4971b9d8781	post_2025-02-16	2025-02-16 06:01:36.552+00	\N	\N	\N	\N
e12f483f-b822-4867-8f1d-4c23c3b763f6	96e48cf7-dbfb-4ee1-8794-93bfa0f7d310	post_2025-02-21	2025-02-21 18:00:13.783+00	tech_case	email	new_feature	\N
8de3dffb-2225-4470-a7e3-e213c19d3d54	03f8a72f-ad13-4a4d-9280-e03159b5deb8	post_2025-02-21	2025-02-21 20:00:13.448+00	campaign	email	new_feature	\N
71ba5dac-f1b8-44d3-a081-7af90fa33e1e	4323a949-8ddf-477b-94b3-89d457b142b4	post_2025-02-21	2025-02-21 22:00:10.422+00	promo	banner	summer_sale	\N
795d324e-454d-4ec0-bf67-24ee98050d62	d24b3859-a1be-4c49-b808-56c76bf40532	post_2025-02-21	2025-02-21 23:00:09.099+00	promo	email	tech_case	\N
8625fd8d-3acd-4556-99d5-69b19f4e10e8	5f2a862f-47a7-4838-a641-f4971b9d8781	post_2025-02-17	2025-02-17 12:02:41.357+00	tech_case	email	tech_case	\N
cbd82089-4626-4c54-846d-a06982367350	5f2a862f-47a7-4838-a641-f4971b9d8781	post_2025-02-18	2025-02-18 03:03:09.047+00	tech_case	email	tech_case	\N
7d6cd939-e229-42ee-890f-7fdb3174d42b	03f8a72f-ad13-4a4d-9280-e03159b5deb8	post_2025-02-15	2025-02-15 01:00:21.087+00	\N	\N	\N	\N
bcd4489f-512e-44a0-999f-5feaa577f47a	03f8a72f-ad13-4a4d-9280-e03159b5deb8	post_2025-02-18	2025-02-18 13:04:23.833+00	tech_case	email	tech_case	\N
47d601a9-7a02-4977-b6f3-38b00624b546	519536df-21a6-4e7e-b757-3612904eb647	post_2025-02-15	2025-02-15 02:00:20.892+00	\N	\N	\N	\N
96da1740-3c3c-4afe-9a92-0a7711ae4b86	6427ab30-6e1a-43e7-9af7-91d2e6b56e54	post_2025-02-22	2025-02-22 04:00:05.058+00	newsletter	email	summer_sale	\N
dcd3d50d-dba6-4dc4-aeb7-671c11204f3c	a73501c5-ec9d-4a95-809f-b74efaad4874	post_2025-02-22	2025-02-22 05:00:07.624+00	tech_case	banner	tech_case	\N
39f792fa-29ee-439e-963e-a4adc068b58d	519536df-21a6-4e7e-b757-3612904eb647	post_2025-02-16	2025-02-16 13:01:56.221+00	\N	\N	\N	\N
0ab0f7d0-7fe2-4891-93cc-b3072ada14ff	519536df-21a6-4e7e-b757-3612904eb647	post_2025-02-17	2025-02-17 01:02:50.452+00	tech_case	email	tech_case	\N
e5e47826-013a-4837-bf9b-849118834796	a73501c5-ec9d-4a95-809f-b74efaad4874	post_2025-02-22	2025-02-22 07:00:41.249+00	marketing	referral	engagement	\N
ae1c48db-cdd4-4123-b9d0-d8478fe2d5e9	519536df-21a6-4e7e-b757-3612904eb647	post_2025-02-18	2025-02-18 10:03:36.755+00	tech_case	email	tech_case	\N
2235923a-88b3-4959-97bf-44d57372ea1c	d24b3859-a1be-4c49-b808-56c76bf40532	post_2025-02-15	2025-02-15 03:00:24.07+00	\N	\N	\N	\N
53a5805d-bc4b-4678-ae78-2aff5fad7935	d24b3859-a1be-4c49-b808-56c76bf40532	post_2025-02-16	2025-02-16 07:01:07.512+00	\N	\N	\N	\N
08f286e9-d473-4c89-b3d5-54a7ad2d2f22	d24b3859-a1be-4c49-b808-56c76bf40532	post_2025-02-17	2025-02-17 04:02:19.143+00	tech_case	email	tech_case	\N
b4e68013-2da9-4c40-9892-01c6df1587b8	d24b3859-a1be-4c49-b808-56c76bf40532	post_2025-02-18	2025-02-18 04:03:16.968+00	tech_case	email	tech_case	\N
e7be2100-0a86-4391-b4ad-0dc7072292ee	96e48cf7-dbfb-4ee1-8794-93bfa0f7d310	post_2025-02-15	2025-02-15 05:00:21.876+00	\N	\N	\N	\N
3121b2f9-e1fd-4a50-bb92-1293bc6ce918	96e48cf7-dbfb-4ee1-8794-93bfa0f7d310	post_2025-02-16	2025-02-16 17:01:48.123+00	tech_case	email	tech_case	\N
f1f43e5f-c741-447c-ad6c-f5a432041ccc	96e48cf7-dbfb-4ee1-8794-93bfa0f7d310	post_2025-02-17	2025-02-17 15:02:57.118+00	tech_case	email	tech_case	\N
92cbbf15-f1b5-4745-a3bb-91f316afdd87	96e48cf7-dbfb-4ee1-8794-93bfa0f7d310	post_2025-02-18	2025-02-18 00:03:51.629+00	tech_case	email	tech_case	\N
38129651-058c-4b46-a8b7-b943260081ee	f9a74020-53b7-404b-b3d9-35992437e5ba	post_2025-02-15	2025-02-15 07:00:25.939+00	\N	\N	\N	\N
ab822d4b-e0bc-45df-bfe9-1efcf2791da1	f9a74020-53b7-404b-b3d9-35992437e5ba	post_2025-02-16	2025-02-16 20:01:56.325+00	tech_case	email	tech_case	\N
0692449d-24a1-4ad0-874a-af3e31629004	f9a74020-53b7-404b-b3d9-35992437e5ba	post_2025-02-17	2025-02-17 08:02:35.726+00	tech_case	email	tech_case	\N
06b4773d-5a6f-49d9-ae81-7cc0d07714b1	a73501c5-ec9d-4a95-809f-b74efaad4874	post_2025-02-15	2025-02-15 10:00:25.075+00	\N	\N	\N	\N
01f73c45-f64a-4c6a-9f94-bfe3d982cb0b	a73501c5-ec9d-4a95-809f-b74efaad4874	post_2025-02-16	2025-02-16 02:01:41.977+00	\N	\N	\N	\N
0737da2d-cad8-4df7-a8b9-eec9c1a6761b	a73501c5-ec9d-4a95-809f-b74efaad4874	post_2025-02-17	2025-02-17 07:02:42.762+00	tech_case	email	tech_case	\N
06f001ca-e9ba-42d3-a336-e425b522a177	6427ab30-6e1a-43e7-9af7-91d2e6b56e54	post_2025-02-15	2025-02-15 15:01:11.229+00	\N	\N	\N	\N
7b4cee12-8d19-4bc6-a1f5-58d64592e8fe	6427ab30-6e1a-43e7-9af7-91d2e6b56e54	post_2025-02-17	2025-02-17 00:02:05.456+00	tech_case	email	tech_case	\N
73acb695-54f7-4e84-927a-4a9b981d4180	4323a949-8ddf-477b-94b3-89d457b142b4	post_2025-02-15	2025-02-15 16:02:07.758+00	\N	\N	\N	\N
e035ca52-85e6-4176-9946-d53ac60fda47	4323a949-8ddf-477b-94b3-89d457b142b4	post_2025-02-16	2025-02-16 01:02:30.05+00	\N	\N	\N	\N
1766abeb-8050-4554-bb61-c839e7028943	4323a949-8ddf-477b-94b3-89d457b142b4	post_2025-02-17	2025-02-17 21:03:47.156+00	tech_case	email	tech_case	\N
215b654c-d38d-4025-afab-e794a78770cd	4323a949-8ddf-477b-94b3-89d457b142b4	post_2025-02-18	2025-02-18 01:03:01.25+00	tech_case	email	tech_case	\N
4c88ef69-98ca-468b-9a6e-be7f6b71965d	c7c30ced-0bd9-4940-8545-89d4b452473b	post_2025-02-15	2025-02-15 21:01:39.316+00	\N	\N	\N	\N
fa1dd6dd-2262-4f38-85b7-374a2e524711	c7c30ced-0bd9-4940-8545-89d4b452473b	post_2025-02-16	2025-02-16 11:01:29.214+00	\N	\N	\N	\N
d2a8a122-f80c-4322-8076-cfb38d2032c0	c7c30ced-0bd9-4940-8545-89d4b452473b	post_2025-02-17	2025-02-17 06:02:12.234+00	tech_case	email	tech_case	\N
ee528d39-fb5a-4c07-a9a7-c1ff039e2b15	c7c30ced-0bd9-4940-8545-89d4b452473b	post_2025-02-18	2025-02-18 06:03:08.761+00	tech_case	email	tech_case	\N
1b2eaef2-5044-4f14-a3dd-d82e2e298373	909cacfd-09e8-4df3-aa94-edb539f5028f	post_2025-02-16	2025-02-16 00:01:29.052+00	\N	\N	\N	\N
7791c129-fe48-43ba-b54a-36fa29bf8db6	a73501c5-ec9d-4a95-809f-b74efaad4874	post_2025-02-20	2025-02-20 17:00:14.568+00	promo	social	launch	\N
bae79495-88f6-415a-89c6-96289c5b273e	909cacfd-09e8-4df3-aa94-edb539f5028f	post_2025-02-17	2025-02-17 10:02:41.338+00	tech_case	email	tech_case	\N
971337f7-2904-4d2c-966d-38f40b5f443a	909cacfd-09e8-4df3-aa94-edb539f5028f	post_2025-02-18	2025-02-18 09:04:16.717+00	tech_case	email	tech_case	\N
b9def708-6511-4118-8c9a-918764ab35af	5f2a862f-47a7-4838-a641-f4971b9d8781	post_2025-02-20	2025-02-20 19:00:12.506+00	campaign	social	engagement	\N
80eba274-c7e2-4890-8d2c-8709228c766e	5f2a862f-47a7-4838-a641-f4971b9d8781	post_2025-02-20	2025-02-20 20:00:11.596+00	promo	banner	new_feature	\N
cd0dd9f6-7863-40f0-a691-12258984e117	d24b3859-a1be-4c49-b808-56c76bf40532	post_2025-02-20	2025-02-20 21:00:10.832+00	promo	email	summer_sale	\N
9c07c7ec-756a-4910-ab87-6a576c772244	4323a949-8ddf-477b-94b3-89d457b142b4	post_2025-02-20	2025-02-20 21:10:25.962+00	campaign	referral	summer_sale	\N
3e14c8d7-7f63-47eb-b566-9c73bd171e00	519536df-21a6-4e7e-b757-3612904eb647	post_2025-02-20	2025-02-20 22:00:37.468+00	promo	cpc	summer_sale	\N
7563ec1a-d808-4a78-abb0-4e5b9e6bebb9	4323a949-8ddf-477b-94b3-89d457b142b4	post_2025-02-19	2025-02-19 19:00:22.556+00	campaign	social	launch	\N
669c2602-17d9-4ed1-b270-21abacbd3aee	519536df-21a6-4e7e-b757-3612904eb647	post_2025-02-21	2025-02-21 16:00:17.766+00	marketing	email	launch	\N
01325de8-3ca9-4959-b411-1a2a71b2f87e	519536df-21a6-4e7e-b757-3612904eb647	post_2025-02-21	2025-02-21 17:00:14.59+00	marketing	cpc	engagement	\N
99e51fe6-00c3-4d0c-a37a-ee01f88aa6fc	d24b3859-a1be-4c49-b808-56c76bf40532	post_2025-02-19	2025-02-19 20:00:26.088+00	newsletter	cpc	summer_sale	\N
83047e8b-4591-45f6-8a53-f7b58a23f6f8	f9a74020-53b7-404b-b3d9-35992437e5ba	post_2025-02-19	2025-02-19 22:01:05.392+00	newsletter	referral	new_feature	\N
276fd500-cf00-4400-a861-6717b17e0e01	f9a74020-53b7-404b-b3d9-35992437e5ba	post_2025-02-21	2025-02-21 19:00:14.1+00	marketing	banner	new_feature	\N
e99789e4-b171-41af-bd0f-d0927b791d9f	519536df-21a6-4e7e-b757-3612904eb647	post_2025-02-19	2025-02-19 23:01:00.721+00	marketing	email	new_feature	\N
57dfcc95-f572-4e89-8d42-76c5c3dd8ff6	909cacfd-09e8-4df3-aa94-edb539f5028f	post_2025-02-21	2025-02-21 21:00:14.182+00	marketing	email	launch	\N
23027648-056b-456b-9e51-cf6bbb19c996	03f8a72f-ad13-4a4d-9280-e03159b5deb8	post_2025-02-20	2025-02-20 00:01:00.683+00	tech_case	banner	engagement	\N
13dc52b8-b36b-450b-9835-f40031ee8780	519536df-21a6-4e7e-b757-3612904eb647	post_2025-02-20	2025-02-20 01:01:00.489+00	promo	email	engagement	\N
d89ce792-d2a7-4b33-afbc-78ae4a8cc91d	c7c30ced-0bd9-4940-8545-89d4b452473b	post_2025-02-22	2025-02-22 00:00:08.381+00	promo	cpc	summer_sale	\N
e52d2817-c3c3-4f54-8545-ecd10e438592	6554e3dc-7b0c-49b2-940e-dfa2d765f066	post_2025-02-22	2025-02-22 01:00:09.238+00	tech_case	banner	engagement	\N
ab367946-a41a-4f00-bf78-78f68c30197d	6554e3dc-7b0c-49b2-940e-dfa2d765f066	post_2025-02-20	2025-02-20 02:01:00.628+00	tech_case	email	launch	\N
7d5277fc-924e-4c02-bca0-f3b00a4dc4dc	5f2a862f-47a7-4838-a641-f4971b9d8781	post_2025-02-20	2025-02-20 03:01:00.527+00	newsletter	cpc	engagement	\N
cfd24216-6dad-4885-bc96-49764a215d9e	a73501c5-ec9d-4a95-809f-b74efaad4874	post_2025-02-22	2025-02-22 02:00:08.18+00	promo	referral	new_feature	\N
e855faec-49a2-4a4e-8c58-673e9d14bd98	c7c30ced-0bd9-4940-8545-89d4b452473b	post_2025-02-20	2025-02-20 06:01:00.492+00	tech_case	social	engagement	\N
55661ec6-baa5-4174-b396-ca5dc94993ff	a73501c5-ec9d-4a95-809f-b74efaad4874	post_2025-02-20	2025-02-20 07:00:33.016+00	tech_case	banner	summer_sale	\N
689e6001-f8a4-4163-9c40-2ff6f3de9da4	5f2a862f-47a7-4838-a641-f4971b9d8781	post_2025-02-22	2025-02-22 03:00:07.798+00	marketing	banner	launch	\N
879be5d4-8fe5-4ecf-b93a-d50974e1b280	6427ab30-6e1a-43e7-9af7-91d2e6b56e54	post_2025-02-20	2025-02-20 08:00:35.596+00	campaign	banner	launch	\N
458fa544-c1a5-4046-bb0a-62605a6f32b2	4323a949-8ddf-477b-94b3-89d457b142b4	post_2025-02-20	2025-02-20 09:00:31.967+00	marketing	email	tech_case	\N
77fa81b3-1032-4d5d-8580-f0e84cef6e9e	f9a74020-53b7-404b-b3d9-35992437e5ba	post_2025-02-20	2025-02-20 12:00:07.352+00	marketing	email	launch	\N
0ab34f46-e2fa-4b1a-88b8-042ab8f5ceb6	6427ab30-6e1a-43e7-9af7-91d2e6b56e54	post_2025-02-22	2025-02-22 06:00:09.469+00	tech_case	referral	tech_case	\N
9f95a726-cfe2-419b-91bb-0872a4ede112	d24b3859-a1be-4c49-b808-56c76bf40532	post_2025-02-20	2025-02-20 12:09:31.757+00	newsletter	social	summer_sale	\N
fb6aa74c-69b0-42a7-a406-3920ec6d6f1a	4323a949-8ddf-477b-94b3-89d457b142b4	post_2025-02-22	2025-02-22 08:00:37.966+00	marketing	referral	new_feature	\N
316f6afd-d2b9-4ca5-bea2-daf4fb68a55f	519536df-21a6-4e7e-b757-3612904eb647	post_2025-02-22	2025-02-22 09:00:42.669+00	tech_case	referral	new_feature	\N
c173fbf7-2ff3-468b-8314-9be560e85bd4	5f2a862f-47a7-4838-a641-f4971b9d8781	post_2025-02-22	2025-02-22 10:00:37.881+00	newsletter	cpc	summer_sale	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, is_admin, last_access, created_at, total_accesses, points, level) FROM stdin;
4323a949-8ddf-477b-94b3-89d457b142b4	teste10@exemplo.com	f	2025-02-22 08:00:37.966+00	2025-02-15 16:02:07.758+00	9	35	4
519536df-21a6-4e7e-b757-3612904eb647	teste6@exemplo.com	f	2025-02-22 09:00:42.674+00	2025-02-15 02:00:20.892+00	11	35	4
5f2a862f-47a7-4838-a641-f4971b9d8781	teste11@exemplo.com	f	2025-02-22 10:00:37.884+00	2025-02-15 00:00:23.9+00	9	25	3
1a7ac743-740a-4207-9a9f-86aba1022cf0	admin@admin.com	t	2025-02-20 18:06:36.064+00	2025-02-17 19:56:21.922+00	1	5	1
96e48cf7-dbfb-4ee1-8794-93bfa0f7d310	teste4@exemplo.com	f	2025-02-21 18:00:13.783+00	2025-02-15 05:00:21.876+00	5	20	3
f9a74020-53b7-404b-b3d9-35992437e5ba	teste8@exemplo.com	f	2025-02-21 19:00:14.1+00	2025-02-15 07:00:25.939+00	6	25	3
03f8a72f-ad13-4a4d-9280-e03159b5deb8	teste2@exemplo.com	f	2025-02-21 20:00:13.448+00	2025-02-15 01:00:21.087+00	5	20	3
909cacfd-09e8-4df3-aa94-edb539f5028f	teste9@exemplo.com	f	2025-02-21 21:00:14.182+00	2025-02-16 00:01:29.052+00	6	15	2
d24b3859-a1be-4c49-b808-56c76bf40532	teste12@exemplo.com	f	2025-02-21 23:00:09.099+00	2025-02-15 03:00:24.07+00	9	30	4
c7c30ced-0bd9-4940-8545-89d4b452473b	teste5@exemplo.com	f	2025-02-22 00:00:08.382+00	2025-02-15 21:01:39.316+00	6	25	3
6554e3dc-7b0c-49b2-940e-dfa2d765f066	teste7@exemplo.com	f	2025-02-22 01:00:09.238+00	2025-02-14 23:00:20.204+00	6	25	3
6427ab30-6e1a-43e7-9af7-91d2e6b56e54	teste3@exemplo.com	f	2025-02-22 06:00:09.469+00	2025-02-15 15:01:11.229+00	6	20	3
a73501c5-ec9d-4a95-809f-b74efaad4874	teste1@exemplo.com	f	2025-02-22 07:00:41.249+00	2025-02-15 10:00:25.075+00	8	20	3
\.


--
-- Name: accesses accesses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesses
    ADD CONSTRAINT accesses_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_accesses_post_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accesses_post_id ON public.accesses USING btree (post_id);


--
-- Name: idx_accesses_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accesses_timestamp ON public.accesses USING btree ("timestamp");


--
-- Name: idx_accesses_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accesses_user_id ON public.accesses USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: accesses accesses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesses
    ADD CONSTRAINT accesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

