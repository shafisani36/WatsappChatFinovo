--
-- PostgreSQL database dump
--

\restrict KgH1xyxYcRbC9z3GeZtqq20zLAaEAd3g6ieA9RVTC6sGjhg4vJWpe9eduCFP6Y7

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-08-31 17:33:13

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
-- TOC entry 882 (class 1247 OID 25274)
-- Name: enum_activity_events_activity_state; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_activity_events_activity_state AS ENUM (
    'ACTIVE',
    'IDLE'
);


ALTER TYPE public.enum_activity_events_activity_state OWNER TO postgres;

--
-- TOC entry 885 (class 1247 OID 25280)
-- Name: enum_activity_events_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_activity_events_category AS ENUM (
    'PRODUCTIVE',
    'NON_PRODUCTIVE',
    'NEUTRAL'
);


ALTER TYPE public.enum_activity_events_category OWNER TO postgres;

--
-- TOC entry 861 (class 1247 OID 25151)
-- Name: enum_companies_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_companies_status AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'INACTIVE'
);


ALTER TYPE public.enum_companies_status OWNER TO postgres;

--
-- TOC entry 900 (class 1247 OID 27193)
-- Name: enum_conversations_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_conversations_type AS ENUM (
    'DIRECT',
    'GROUP'
);


ALTER TYPE public.enum_conversations_type OWNER TO postgres;

--
-- TOC entry 894 (class 1247 OID 25611)
-- Name: enum_tasks_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_tasks_status AS ENUM (
    'Pending',
    'In Progress',
    'Completed'
);


ALTER TYPE public.enum_tasks_status OWNER TO postgres;

--
-- TOC entry 867 (class 1247 OID 25171)
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_role AS ENUM (
    'COMPANY_ADMIN',
    'MANAGER',
    'EMPLOYEE'
);


ALTER TYPE public.enum_users_role OWNER TO postgres;

--
-- TOC entry 876 (class 1247 OID 25227)
-- Name: enum_work_sessions_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_work_sessions_status AS ENUM (
    'ACTIVE',
    'PAUSED',
    'COMPLETED'
);


ALTER TYPE public.enum_work_sessions_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 25287)
-- Name: activity_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_events (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    application character varying(255),
    domain character varying(255),
    window_title character varying(255),
    activity_state public.enum_activity_events_activity_state DEFAULT 'ACTIVE'::public.enum_activity_events_activity_state NOT NULL,
    category public.enum_activity_events_category DEFAULT 'NEUTRAL'::public.enum_activity_events_category NOT NULL,
    duration_seconds integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.activity_events OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 25157)
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email_domain character varying(255),
    status public.enum_companies_status DEFAULT 'ACTIVE'::public.enum_companies_status,
    settings jsonb DEFAULT '{"companyDomainRestriction": {"enabled": false}}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 27221)
-- Name: conversation_participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversation_participants (
    id uuid NOT NULL,
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    last_read_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.conversation_participants OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 27197)
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    type public.enum_conversations_type DEFAULT 'DIRECT'::public.enum_conversations_type NOT NULL,
    name character varying(255),
    created_by_id uuid NOT NULL,
    last_message_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 27243)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 25199)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    user_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 25328)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    working_hours_per_day integer DEFAULT 8 NOT NULL,
    working_days_per_week integer DEFAULT 5 NOT NULL,
    idle_threshold_seconds integer DEFAULT 300 NOT NULL,
    timezone character varying(255) DEFAULT 'UTC'::character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN settings.working_hours_per_day; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings.working_hours_per_day IS 'Standard working hours per day';


--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN settings.working_days_per_week; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings.working_days_per_week IS 'Number of working days per week';


--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN settings.idle_threshold_seconds; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings.idle_threshold_seconds IS 'Seconds of inactivity before marking as IDLE (default 5 minutes)';


--
-- TOC entry 5192 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN settings.timezone; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings.timezone IS 'Company timezone for reports';


--
-- TOC entry 225 (class 1259 OID 25617)
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text DEFAULT ''::text,
    points integer DEFAULT 2 NOT NULL,
    status public.enum_tasks_status DEFAULT 'Pending'::public.enum_tasks_status NOT NULL,
    due_date date,
    completed_at timestamp with time zone,
    assigned_to_id uuid NOT NULL,
    created_by_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 25177)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(255),
    password_hash character varying(255) NOT NULL,
    role public.enum_users_role DEFAULT 'EMPLOYEE'::public.enum_users_role,
    team_id uuid,
    manager_id uuid,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    points integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 25233)
-- Name: work_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_sessions (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    task_id uuid,
    started_at timestamp with time zone NOT NULL,
    ended_at timestamp with time zone,
    status public.enum_work_sessions_status DEFAULT 'ACTIVE'::public.enum_work_sessions_status NOT NULL,
    total_seconds integer DEFAULT 0 NOT NULL,
    working_seconds integer DEFAULT 0 NOT NULL,
    idle_seconds integer DEFAULT 0 NOT NULL,
    non_productive_seconds integer DEFAULT 0 NOT NULL,
    paused_seconds integer DEFAULT 0 NOT NULL,
    last_activity_at timestamp with time zone,
    device_id character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.work_sessions OWNER TO postgres;

--
-- TOC entry 5178 (class 0 OID 25287)
-- Dependencies: 223
-- Data for Name: activity_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_events (id, tenant_id, session_id, user_id, "timestamp", application, domain, window_title, activity_state, category, duration_seconds, created_at, updated_at) FROM stdin;
b3d70a03-a20d-4204-a94f-c325de60662b	c49269dc-402d-4fe8-9be9-480025fc2047	695f74fe-cf95-41d2-bd97-1972d1e89fda	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 11:32:51.809+05	Visual Studio Code	\N	.env - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 11:32:51.848+05	2026-08-31 11:32:51.848+05
0edb727a-1f4d-4937-af8c-6ec1df5d68cb	c49269dc-402d-4fe8-9be9-480025fc2047	695f74fe-cf95-41d2-bd97-1972d1e89fda	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 11:32:55.22+05	Visual Studio Code	\N	.env - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 11:32:55.225+05	2026-08-31 11:32:55.225+05
7382974f-1a84-4945-b4ab-b91a96858729	c49269dc-402d-4fe8-9be9-480025fc2047	695f74fe-cf95-41d2-bd97-1972d1e89fda	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 11:33:00.22+05	Visual Studio Code	\N	.env - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 11:33:00.221+05	2026-08-31 11:33:00.221+05
96986e67-8b6b-4c61-8e1d-c96668e5b201	c49269dc-402d-4fe8-9be9-480025fc2047	695f74fe-cf95-41d2-bd97-1972d1e89fda	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 11:33:05.241+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 11:33:05.261+05	2026-08-31 11:33:05.261+05
e67b94b2-a502-4796-91b2-4bc214164824	c49269dc-402d-4fe8-9be9-480025fc2047	695f74fe-cf95-41d2-bd97-1972d1e89fda	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 11:33:10.242+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 11:33:10.245+05	2026-08-31 11:33:10.245+05
0dae979c-4b1f-4f4f-89b2-f0abb4745e79	c49269dc-402d-4fe8-9be9-480025fc2047	678a45f6-f8f0-4012-9a09-6d3462edc231	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 11:36:00.64+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 11:36:00.649+05	2026-08-31 11:36:00.649+05
71bcd6fd-f8cc-4e7b-b8bc-fd5114db3df5	c49269dc-402d-4fe8-9be9-480025fc2047	678a45f6-f8f0-4012-9a09-6d3462edc231	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 11:36:05.571+05	Visual Studio Code	\N	.env - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 11:36:05.579+05	2026-08-31 11:36:05.579+05
0e18188a-0858-4cd9-a6f9-af3351c00958	c49269dc-402d-4fe8-9be9-480025fc2047	678a45f6-f8f0-4012-9a09-6d3462edc231	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 11:36:10.565+05	Visual Studio Code	\N	.env - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 11:36:10.571+05	2026-08-31 11:36:10.571+05
d1eb4051-76a8-49f6-8fa6-c8b7a1bd5cfa	c49269dc-402d-4fe8-9be9-480025fc2047	678a45f6-f8f0-4012-9a09-6d3462edc231	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 11:36:15.63+05	Visual Studio Code	\N	.env - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 11:36:15.632+05	2026-08-31 11:36:15.632+05
2f30c5d5-0357-4ada-bb5e-02895879b73f	c49269dc-402d-4fe8-9be9-480025fc2047	678a45f6-f8f0-4012-9a09-6d3462edc231	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 11:36:20.631+05	Visual Studio Code	\N	.env - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 11:36:20.65+05	2026-08-31 11:36:20.65+05
d48e29bd-e2a3-49c4-bbe3-4759640fb42f	c49269dc-402d-4fe8-9be9-480025fc2047	678a45f6-f8f0-4012-9a09-6d3462edc231	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 11:36:25.621+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 11:36:25.623+05	2026-08-31 11:36:25.623+05
47f3623b-bd85-4e3e-8e93-ccf26e7b66bf	c49269dc-402d-4fe8-9be9-480025fc2047	678a45f6-f8f0-4012-9a09-6d3462edc231	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 11:36:30.656+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 11:36:30.663+05	2026-08-31 11:36:30.663+05
195e51fb-e478-4677-8957-62987c390389	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:19:43.657+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 12:19:43.661+05	2026-08-31 12:19:43.661+05
30686e9e-0804-4fa0-a5b4-eafb4d3eef3f	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:19:47.421+05	Visual Studio Code	\N	seed.js - task-leaderboard-app-v3 - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:19:47.422+05	2026-08-31 12:19:47.422+05
9b381f65-0355-4b67-9c2a-8697e3b0124d	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:19:52.367+05	Visual Studio Code	\N	seed.js - task-leaderboard-app-v3 - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:19:52.369+05	2026-08-31 12:19:52.369+05
79ecda6f-948e-4c5e-a2f9-d186c5886567	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:19:57.446+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:19:57.448+05	2026-08-31 12:19:57.448+05
4ab57816-4153-4020-b520-59e73adaa9d7	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:20:03.647+05	Microsoft Edge	\N	● oms_wms - Day 3: Staff Management & Dynamic Role-Based UI - Asana - Personal - Microsoft​ Edge	ACTIVE	PRODUCTIVE	5	2026-08-31 12:20:03.652+05	2026-08-31 12:20:03.652+05
a639c722-7408-4388-9b57-a940f95fbbb0	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:20:07.396+05	Microsoft Edge	\N	● oms_wms - Day 3: Staff Management & Dynamic Role-Based UI - Asana - Personal - Microsoft​ Edge	ACTIVE	PRODUCTIVE	5	2026-08-31 12:20:07.397+05	2026-08-31 12:20:07.397+05
501be120-7cdb-4dc2-957c-0cdd85abbf85	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:20:12.398+05	Microsoft Edge	\N	● oms_wms - Day 3: Staff Management & Dynamic Role-Based UI - Asana - Personal - Microsoft​ Edge	ACTIVE	PRODUCTIVE	5	2026-08-31 12:20:12.4+05	2026-08-31 12:20:12.4+05
2ee71732-5b00-41d4-acb9-e899d0455b4d	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:20:17.403+05	Microsoft Edge	\N	● oms_wms - Day 3: Staff Management & Dynamic Role-Based UI - Asana - Personal - Microsoft​ Edge	IDLE	PRODUCTIVE	5	2026-08-31 12:20:17.405+05	2026-08-31 12:20:17.405+05
07f22493-caad-4862-a28c-fef5b730556f	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:20:22.412+05	Microsoft Edge	\N	● oms_wms - Day 3: Staff Management & Dynamic Role-Based UI - Asana - Personal - Microsoft​ Edge	ACTIVE	PRODUCTIVE	5	2026-08-31 12:20:22.415+05	2026-08-31 12:20:22.415+05
248c5235-d177-451e-87c4-fd4bda9f4336	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:20:27.479+05	Microsoft Edge	\N	● oms_wms - Day 3: Staff Management & Dynamic Role-Based UI - Asana - Personal - Microsoft​ Edge	IDLE	PRODUCTIVE	5	2026-08-31 12:20:27.481+05	2026-08-31 12:20:27.481+05
04371a36-e383-4b7a-992e-40c564beebd0	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:20:32.443+05	Microsoft Edge	\N	● oms_wms - Day 3: Staff Management & Dynamic Role-Based UI - Asana - Personal - Microsoft​ Edge	ACTIVE	PRODUCTIVE	5	2026-08-31 12:20:32.445+05	2026-08-31 12:20:32.445+05
1091f0e0-fa43-4b52-be34-0099cd3fcad9	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:20:37.435+05	Microsoft Edge	\N	New tab and 1 more page - Personal - Microsoft​ Edge	ACTIVE	PRODUCTIVE	5	2026-08-31 12:20:37.438+05	2026-08-31 12:20:37.438+05
eb75fd2f-a631-481f-b1e6-d0e70c0c25b8	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:20:42.464+05	Microsoft Edge	\N	New tab and 1 more page - Personal - Microsoft​ Edge	ACTIVE	PRODUCTIVE	5	2026-08-31 12:20:42.466+05	2026-08-31 12:20:42.466+05
4c4e3087-cf8a-4050-a4cc-102e13c5f5f1	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:20:47.457+05	Microsoft Edge	\N	New tab and 1 more page - Personal - Microsoft​ Edge	ACTIVE	PRODUCTIVE	5	2026-08-31 12:20:47.46+05	2026-08-31 12:20:47.46+05
da75f6f7-577c-4667-b9f3-560c4cc7c129	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:20:52.488+05	Microsoft Edge	\N	Unknown	ACTIVE	PRODUCTIVE	5	2026-08-31 12:20:52.491+05	2026-08-31 12:20:52.491+05
d874b044-5f9a-45dc-a39c-5d67d47284bf	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:20:57.467+05	Microsoft Edge	\N	Unknown	ACTIVE	PRODUCTIVE	5	2026-08-31 12:20:57.468+05	2026-08-31 12:20:57.468+05
70727eef-7dc8-418f-8d1f-acc0f0667f7d	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:21:02.515+05	Google Chrome	\N	shafisani36/WatsappChatFinovo at feat/request-logging-database - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:21:02.518+05	2026-08-31 12:21:02.518+05
952dcda1-7b2c-42de-9ebc-c49430f878ad	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:21:07.476+05	Google Chrome	\N	New Tab - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:21:07.478+05	2026-08-31 12:21:07.478+05
83008484-cf81-4f24-8f89-c3c73639a545	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:21:12.811+05	Unknown	\N	Unknown	ACTIVE	PRODUCTIVE	5	2026-08-31 12:21:12.813+05	2026-08-31 12:21:12.813+05
f1750e3b-c01a-4313-ba75-5b3f048f0e9e	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:21:17.489+05	Google Chrome	\N	New Tab - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:21:17.491+05	2026-08-31 12:21:17.491+05
4b00585b-90ae-4d4c-9b81-42e5db161333	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:21:22.506+05	Google Chrome	\N	New Tab - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:21:22.508+05	2026-08-31 12:21:22.508+05
a719663c-af5b-43e2-ad69-4c589e0d9129	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:21:27.512+05	Google Chrome	\N	New Tab - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:21:27.514+05	2026-08-31 12:21:27.514+05
4f3bb302-a502-4d11-a05f-3aafaf841f15	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:21:32.537+05	Google Chrome	\N	New Tab - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:21:32.539+05	2026-08-31 12:21:32.539+05
3470c10e-8c6f-455a-9649-5f38ae801308	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:21:37.57+05	Google Chrome	\N	New Tab - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:21:37.574+05	2026-08-31 12:21:37.574+05
462b00e1-12a2-4812-aa42-1ed99b52ee1e	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:21:42.535+05	Google Chrome	\N	New Tab - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:21:42.537+05	2026-08-31 12:21:42.537+05
1ce67768-78ec-4c01-b381-0e3f6d0a6df8	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:21:47.549+05	Google Chrome	\N	New Incognito Tab - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:21:47.553+05	2026-08-31 12:21:47.553+05
5489cfa7-f4e6-43d6-8de7-7532a4672f51	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:21:52.549+05	Google Chrome	\N	New Incognito Tab - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:21:52.552+05	2026-08-31 12:21:52.552+05
2294adf3-58aa-4436-b392-fcff96c333b8	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:21:57.581+05	Google Chrome	\N	New Incognito Tab - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:21:57.583+05	2026-08-31 12:21:57.583+05
8af9b1ab-f687-41a6-87c7-e5ec1949b0b4	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:22:02.599+05	Google Chrome	\N	YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:22:02.603+05	2026-08-31 12:22:02.603+05
5f74542e-518d-414e-837c-9eceb504e44f	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:22:07.94+05	Google Chrome	\N	YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:22:07.942+05	2026-08-31 12:22:07.942+05
0ca4be0b-518c-4a04-94b5-c7748e0fe91a	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:22:12.585+05	Google Chrome	\N	Optimal Gamer Morning Routine... - YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:22:12.589+05	2026-08-31 12:22:12.589+05
1d98892d-8940-41fd-b550-12f3e71ca91e	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:22:17.589+05	Google Chrome	\N	Optimal Gamer Morning Routine... - YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:22:17.591+05	2026-08-31 12:22:17.591+05
c0318d1b-4550-4f26-8e93-ef0c408a2345	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:22:22.596+05	Google Chrome	\N	Optimal Gamer Morning Routine... - YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:22:22.598+05	2026-08-31 12:22:22.598+05
ceafe672-f022-4dbc-baba-6a6885152b25	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:22:27.614+05	Google Chrome	\N	Optimal Gamer Morning Routine... - YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:22:27.616+05	2026-08-31 12:22:27.616+05
ac356d92-857f-4a79-bfdf-3d613f342f16	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:22:32.705+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 12:22:32.707+05	2026-08-31 12:22:32.707+05
cc9725e2-d4b6-420d-872a-57cb6f66a7af	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:22:37.64+05	Google Chrome	\N	Optimal Gamer Morning Routine... - YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:22:37.642+05	2026-08-31 12:22:37.642+05
69d42b31-625e-4b58-b6d1-a8bcefacf8da	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:22:42.808+05	Google Chrome	\N	#student #schoollife #schoollife #school #teachers #teacherbelike - YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:22:42.811+05	2026-08-31 12:22:42.811+05
b9d11903-db7f-47c5-ac79-8cf310d395cf	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:22:47.971+05	Google Chrome	\N	#student #schoollife #schoollife #school #teachers #teacherbelike - YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:22:47.979+05	2026-08-31 12:22:47.979+05
add89a2f-3d2f-491f-be94-82ea14cbfa57	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:22:52.887+05	Google Chrome	\N	YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:22:52.89+05	2026-08-31 12:22:52.89+05
fd591eb3-1dbb-494a-a900-135f314e3f44	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:22:57.927+05	Google Chrome	\N	YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:22:57.929+05	2026-08-31 12:22:57.929+05
d4cfcec5-e31b-4edb-bfb1-365d5ba2e37c	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:23:02.897+05	Google Chrome	\N	YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:23:02.899+05	2026-08-31 12:23:02.899+05
e09d3c10-a22a-4d76-b066-553844ce51a4	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:23:08.027+05	Google Chrome	\N	New Tab - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:23:08.03+05	2026-08-31 12:23:08.03+05
3e027ebf-4615-4902-b126-76829c7e2024	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:23:13.012+05	Google Chrome	\N	GitHub - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:23:13.015+05	2026-08-31 12:23:13.015+05
eee3b808-827d-4a87-8529-ca70eb231cae	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:23:18.024+05	Google Chrome	\N	GitHub - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:23:18.027+05	2026-08-31 12:23:18.027+05
8abd6fc9-52df-4129-85fd-8f9dc9d2588f	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:23:22.979+05	Google Chrome	\N	GitHub - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:23:22.982+05	2026-08-31 12:23:22.982+05
eeee9bdd-564c-47c9-81fc-1f11e0fda966	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:23:27.976+05	Google Chrome	\N	GitHub - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:23:27.978+05	2026-08-31 12:23:27.978+05
df4ecdd2-40c8-46fd-95a5-1b7887573dd4	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:23:33.01+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:23:33.011+05	2026-08-31 12:23:33.011+05
f091b42c-483b-40e7-a238-cb587c6bd1d6	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:23:38.199+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:23:38.2+05	2026-08-31 12:23:38.2+05
cb07fe12-22ac-4d5d-9c81-7195839ee753	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:23:42.996+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:23:43.143+05	2026-08-31 12:23:43.143+05
5b69ee8e-522e-4843-a744-aea77f117426	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:23:48.17+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:23:48.171+05	2026-08-31 12:23:48.171+05
e291ba98-bb8c-466e-ba83-e4e75137a911	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:23:53.034+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:23:53.129+05	2026-08-31 12:23:53.129+05
1e2f7238-e0ed-4a5c-b086-15950a8c17d6	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:23:58.381+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:23:58.382+05	2026-08-31 12:23:58.382+05
4758dbe1-daf5-4299-a8a6-bc6c023455f6	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:24:03.036+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:24:03.039+05	2026-08-31 12:24:03.039+05
7cb05ab0-cff2-4241-b38d-51195beea6ce	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:24:08.233+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:24:08.235+05	2026-08-31 12:24:08.235+05
ba3376a0-0e53-4068-8c78-46f9dd1d8fc7	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:24:13.031+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	IDLE	PRODUCTIVE	5	2026-08-31 12:24:13.034+05	2026-08-31 12:24:13.034+05
3159d755-1d3a-4709-a9df-038c5674318c	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:24:18.162+05	Jibble - Time Tracking.exe	\N	Jibble	ACTIVE	PRODUCTIVE	5	2026-08-31 12:24:18.164+05	2026-08-31 12:24:18.164+05
7ffa25f8-5821-4695-8113-f4f33af5d71f	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:24:23.087+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:24:23.089+05	2026-08-31 12:24:23.089+05
242c12a6-f4bc-4224-bc7c-fd023a267d90	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:24:28.126+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	IDLE	PRODUCTIVE	5	2026-08-31 12:24:28.128+05	2026-08-31 12:24:28.128+05
4e69ebd9-8e92-4a0b-84ca-b281f74ac146	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:24:33.132+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:24:33.134+05	2026-08-31 12:24:33.134+05
d97a45fe-17fa-4352-ba2b-a8af934850c0	c49269dc-402d-4fe8-9be9-480025fc2047	5353a68d-b4d1-4f19-914a-62ef5c91e41f	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:24:38.79+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 12:24:38.793+05	2026-08-31 12:24:38.793+05
bc6d3e1c-421a-4b93-a7b8-1447225f4e7f	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:30:04.159+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 12:30:04.216+05	2026-08-31 12:30:04.216+05
2a90bd31-0acf-4b0c-a70e-d0c1f9de548b	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:30:08.87+05	Visual Studio Code	\N	seed.js - task-leaderboard-app-v3 - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:30:08.872+05	2026-08-31 12:30:08.872+05
d9c1436a-5233-484c-ac64-3db7667db43c	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:30:13.842+05	Visual Studio Code	\N	.env.example - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:30:13.845+05	2026-08-31 12:30:13.845+05
f80e201e-1d59-43cd-ac52-0f4b913a6c3b	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:30:19.269+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:30:19.272+05	2026-08-31 12:30:19.272+05
c027cc7d-6207-4e25-9a20-84b60e722233	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:30:23.774+05	Google Chrome	\N	YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:30:23.784+05	2026-08-31 12:30:23.784+05
f5f9ae99-8eb2-487c-84c7-3dea1e42717c	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:30:28.748+05	Google Chrome	\N	YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:30:28.755+05	2026-08-31 12:30:28.755+05
f66f7c4d-9d9a-4789-a97c-aff65236e219	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:30:34.556+05	Google Chrome	\N	How Rare Are You 😱 - YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:30:34.583+05	2026-08-31 12:30:34.583+05
80b590ae-a48b-4388-8410-38e8ce3adee3	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:30:40.417+05	Google Chrome	\N	How Rare Are You 😱 - YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:30:40.432+05	2026-08-31 12:30:40.432+05
26679e72-34d5-4f08-810a-77022f7800a9	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:30:45.171+05	Google Chrome	\N	How Rare Are You 😱 - YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:30:45.469+05	2026-08-31 12:30:45.469+05
e1efdad4-aaff-47bb-b3cd-310915ff4289	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:30:48.992+05	SnippingTool.exe	\N	Recording toolbar	ACTIVE	PRODUCTIVE	5	2026-08-31 12:30:49.013+05	2026-08-31 12:30:49.013+05
4b775816-742e-41f3-aa6d-b65de445febc	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:30:53.845+05	Google Chrome	\N	youtube - Yahoo Search Results - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:30:53.847+05	2026-08-31 12:30:53.847+05
a4ec0a2c-d4a0-4257-b6d1-9a78c6393824	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:30:58.85+05	Google Chrome	\N	shafisani36/WatsappChatFinovo at feat/request-logging-database - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:30:58.852+05	2026-08-31 12:30:58.852+05
832393ee-b9ab-46b0-ada7-4cce4086cea6	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:31:04.035+05	Windows Explorer	\N	Unknown	ACTIVE	PRODUCTIVE	5	2026-08-31 12:31:04.037+05	2026-08-31 12:31:04.037+05
7f9e4e20-3db3-47f1-85be-a913a68d9ae4	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:31:08.881+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:31:08.883+05	2026-08-31 12:31:08.883+05
51666d13-c145-40d9-a18e-d890b1dac5f6	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:31:13.867+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:31:13.869+05	2026-08-31 12:31:13.869+05
e8b53885-0348-488c-9ad9-74c58902238c	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:31:18.905+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:31:18.907+05	2026-08-31 12:31:18.907+05
e0c1abb1-2616-47e9-844a-4158a37e6d2a	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:31:23.885+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:31:23.887+05	2026-08-31 12:31:23.887+05
dce8eb92-58bf-4326-a7c1-c7d614665984	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:31:28.902+05	Visual Studio Code	\N	promote-user.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:31:28.908+05	2026-08-31 12:31:28.908+05
448da6b7-68d2-4802-b7e2-4ba4e9bcb2b4	c49269dc-402d-4fe8-9be9-480025fc2047	4f713fae-4c4c-4612-af5d-f3e51aba968d	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 12:31:34.496+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 12:31:34.852+05	2026-08-31 12:31:34.852+05
7dd3030e-b772-40d6-a6d1-05de9dcacd33	c49269dc-402d-4fe8-9be9-480025fc2047	e45cfc03-65a5-4220-b296-ac8071e80a44	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:47:27.338+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 12:47:27.341+05	2026-08-31 12:47:27.341+05
81493528-66d1-4105-b6db-41b5088cfe66	c49269dc-402d-4fe8-9be9-480025fc2047	e45cfc03-65a5-4220-b296-ac8071e80a44	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:47:31.992+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 12:47:31.995+05	2026-08-31 12:47:31.995+05
488f8e74-5573-4176-aa8b-c3ecee4eb833	c49269dc-402d-4fe8-9be9-480025fc2047	e45cfc03-65a5-4220-b296-ac8071e80a44	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:47:37.161+05	Visual Studio Code	\N	auth.controller.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:47:37.164+05	2026-08-31 12:47:37.164+05
621d9b33-de03-4768-8910-29d574faa54c	c49269dc-402d-4fe8-9be9-480025fc2047	e45cfc03-65a5-4220-b296-ac8071e80a44	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:47:42.15+05	Visual Studio Code	\N	auth.controller.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:47:42.153+05	2026-08-31 12:47:42.153+05
91f5fa59-a42f-4fa5-ac1f-09b349465414	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:52:07.531+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 12:52:07.541+05	2026-08-31 12:52:07.541+05
00646cc2-2615-47c1-99fc-25f006e14b9e	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:52:12.513+05	Google Chrome	\N	GitHub - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:52:12.515+05	2026-08-31 12:52:12.515+05
6cc9a4ed-377a-49c8-8a1f-b94d761fa0eb	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:52:17.688+05	Google Chrome	\N	GitHub - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:52:17.697+05	2026-08-31 12:52:17.697+05
42d258ae-51d9-482c-b4d0-291ac0accaa7	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:52:22.529+05	Visual Studio Code	\N	auth.controller.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:52:22.531+05	2026-08-31 12:52:22.531+05
4e5b4381-ac7c-44ec-ab5d-ecdac32e1366	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:52:27.552+05	Google Chrome	\N	GitHub - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:52:27.554+05	2026-08-31 12:52:27.554+05
ec7c1b40-98af-4673-a53d-dd3aa75d45d4	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:52:32.718+05	Google Chrome	\N	youtube - Yahoo Search Results - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:52:32.72+05	2026-08-31 12:52:32.72+05
6ea54c10-eac2-4e18-9807-fbbd93ce1916	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:52:37.614+05	Google Chrome	\N	New Tab - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:52:37.64+05	2026-08-31 12:52:37.64+05
0896571d-fba1-4484-8499-7433830ff4ca	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:52:42.61+05	Google Chrome	\N	YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:52:42.616+05	2026-08-31 12:52:42.616+05
5657515e-6b14-44d1-90aa-b0d47ed8ac27	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:52:48.037+05	Google Chrome	\N	YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:52:48.049+05	2026-08-31 12:52:48.049+05
d82d2ee3-45d5-4139-92c4-2cefd3bb8501	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:52:52.782+05	Google Chrome	\N	YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:52:52.784+05	2026-08-31 12:52:52.784+05
4b4b7068-1212-433c-82b6-40482b39d7c0	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:52:57.841+05	Google Chrome	\N	(173) YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:52:57.844+05	2026-08-31 12:52:57.844+05
c58038fc-909c-4a9e-9e34-655898cf06c5	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:53:03.165+05	Google Chrome	\N	(173) YouTube - Google Chrome	ACTIVE	NON_PRODUCTIVE	5	2026-08-31 12:53:03.167+05	2026-08-31 12:53:03.167+05
e3cfb727-aff6-416f-850c-cb0de09bf6d4	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:53:07.889+05	Google Chrome	\N	shafisani36/WatsappChatFinovo at feat/request-logging-database - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:53:07.896+05	2026-08-31 12:53:07.896+05
46abe461-f974-4436-ad8b-75f6c429f661	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:53:12.848+05	Google Chrome	\N	shafisani36/WatsappChatFinovo at feat/request-logging-database - Google Chrome	ACTIVE	PRODUCTIVE	5	2026-08-31 12:53:12.851+05	2026-08-31 12:53:12.851+05
734ea396-1e15-4467-ae5b-bc1957e8c4f3	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:53:17.867+05	Visual Studio Code	\N	auth.controller.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:53:17.87+05	2026-08-31 12:53:17.87+05
1b74f6dd-9138-4130-94b7-1802c8a03c73	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:53:22.876+05	Visual Studio Code	\N	auth.controller.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:53:22.879+05	2026-08-31 12:53:22.879+05
9e043010-92c1-45bc-97af-3e8dbb336b79	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:53:27.863+05	Visual Studio Code	\N	auth.controller.js - WatsappChatFinovo-feat-request-logging-database - Visual Studio Code	ACTIVE	PRODUCTIVE	5	2026-08-31 12:53:27.869+05	2026-08-31 12:53:27.869+05
88235eb7-5433-496e-b895-4809d9640b5d	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:53:33.013+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 12:53:33.069+05	2026-08-31 12:53:33.069+05
5056e3ba-37e2-4f19-bbfa-2b58517c1b62	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:53:38.096+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 12:53:38.569+05	2026-08-31 12:53:38.569+05
d1f9a416-3990-4420-8d33-f99a4ee7d6e8	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:53:42.968+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 12:53:42.993+05	2026-08-31 12:53:42.993+05
41d0376d-6cde-45e7-b933-6a153464301b	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:53:47.909+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 12:53:47.911+05	2026-08-31 12:53:47.911+05
4907d13c-23f5-4655-92ab-446ef7ac97e2	c49269dc-402d-4fe8-9be9-480025fc2047	375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 12:54:53.118+05	Electron	\N	Employee Time Tracking	ACTIVE	PRODUCTIVE	5	2026-08-31 12:54:53.12+05	2026-08-31 12:54:53.12+05
\.


--
-- TOC entry 5174 (class 0 OID 25157)
-- Dependencies: 219
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, name, email_domain, status, settings, created_at, updated_at) FROM stdin;
c49269dc-402d-4fe8-9be9-480025fc2047	Finovo Global	\N	ACTIVE	{"companyDomainRestriction": {"enabled": false}}	2026-08-31 10:14:16.503082+05	2026-08-31 10:14:16.503082+05
\.


--
-- TOC entry 5182 (class 0 OID 27221)
-- Dependencies: 227
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversation_participants (id, conversation_id, user_id, last_read_at, created_at, updated_at) FROM stdin;
87b30fe6-0991-4594-ab0b-4ba2e933a1aa	497a5ec0-16e2-46fb-9bb2-d96fc437241e	391ba1f0-99b6-4524-8614-93f68b897803	\N	2026-08-31 14:33:57.852+05	2026-08-31 14:33:57.852+05
22d71ade-c92c-40bc-b7f9-8ef2b68fb734	497a5ec0-16e2-46fb-9bb2-d96fc437241e	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 14:34:01.135+05	2026-08-31 14:33:57.852+05	2026-08-31 14:34:01.136+05
729b9905-f744-4a87-9576-ea589b9aad02	a5b0e6b9-c2e4-4e47-9b96-9214384074f1	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 15:37:25.08+05	2026-08-31 14:34:01.978+05	2026-08-31 15:37:25.08+05
399b9be0-565c-42a5-aa44-2c3b1717910c	8f0159c9-9f99-430a-9067-941febe744ff	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 15:37:26.005+05	2026-08-31 14:34:40.755+05	2026-08-31 15:37:26.006+05
2c50f845-364a-482a-8df9-b356c045c318	926a916e-1e7b-4854-bc01-3941c1af270c	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 15:02:54.82+05	2026-08-31 14:17:49.851+05	2026-08-31 15:02:54.82+05
0b5765a1-5044-47cc-b09c-f925ea287fff	8f0159c9-9f99-430a-9067-941febe744ff	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 14:35:59.315+05	2026-08-31 14:34:40.755+05	2026-08-31 14:35:59.315+05
2d25fdcc-7f4f-4730-994a-274a38dd9b4b	8f0159c9-9f99-430a-9067-941febe744ff	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 15:44:17.884+05	2026-08-31 14:34:40.755+05	2026-08-31 15:44:17.884+05
2f3ff22f-2534-4334-9e70-06a2fd49baf1	8f0159c9-9f99-430a-9067-941febe744ff	ad0c83d3-3922-448c-8e12-861b88b4602a	\N	2026-08-31 14:34:40.755+05	2026-08-31 14:34:40.755+05
d90728b9-659b-433f-86a4-52a405455a7d	926a916e-1e7b-4854-bc01-3941c1af270c	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 15:15:25.559+05	2026-08-31 14:17:49.851+05	2026-08-31 15:15:25.559+05
133c0fe2-cd6e-46c2-8d57-4774cddb21bd	6700d0e7-b3e8-40db-aecf-c13d6e72a886	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 15:15:28.042+05	2026-08-31 14:19:38.259+05	2026-08-31 15:15:28.042+05
8510ad7f-503b-445d-8ae8-e679983df174	a5b0e6b9-c2e4-4e47-9b96-9214384074f1	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 14:35:05.786+05	2026-08-31 14:34:01.978+05	2026-08-31 14:35:05.787+05
fb362d96-c140-4cc7-aadd-25f662062acf	926a916e-1e7b-4854-bc01-3941c1af270c	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 15:15:45.196+05	2026-08-31 14:17:49.851+05	2026-08-31 15:15:45.196+05
27fe1bed-92a3-442d-a5ef-5b8966ddf766	6700d0e7-b3e8-40db-aecf-c13d6e72a886	391ba1f0-99b6-4524-8614-93f68b897803	2026-08-31 14:26:32.35+05	2026-08-31 14:19:38.259+05	2026-08-31 14:26:32.35+05
\.


--
-- TOC entry 5181 (class 0 OID 27197)
-- Dependencies: 226
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, tenant_id, type, name, created_by_id, last_message_at, created_at, updated_at) FROM stdin;
6700d0e7-b3e8-40db-aecf-c13d6e72a886	c49269dc-402d-4fe8-9be9-480025fc2047	DIRECT	\N	da92ef24-f786-4cee-8018-72f565c14eed	2026-08-31 14:20:43.999+05	2026-08-31 14:19:38.257+05	2026-08-31 14:20:44.003+05
497a5ec0-16e2-46fb-9bb2-d96fc437241e	c49269dc-402d-4fe8-9be9-480025fc2047	DIRECT	\N	92a4bccb-0bfe-4fca-ba25-bc44487065c6	\N	2026-08-31 14:33:57.844+05	2026-08-31 14:33:57.844+05
a5b0e6b9-c2e4-4e47-9b96-9214384074f1	c49269dc-402d-4fe8-9be9-480025fc2047	DIRECT	\N	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 14:34:19.25+05	2026-08-31 14:34:01.976+05	2026-08-31 14:34:19.262+05
926a916e-1e7b-4854-bc01-3941c1af270c	c49269dc-402d-4fe8-9be9-480025fc2047	GROUP	frontend developer	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 14:36:04.555+05	2026-08-31 14:17:49.846+05	2026-08-31 14:36:04.573+05
8f0159c9-9f99-430a-9067-941febe744ff	c49269dc-402d-4fe8-9be9-480025fc2047	GROUP	bug fixer	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 15:15:37.648+05	2026-08-31 14:34:40.751+05	2026-08-31 15:15:37.654+05
\.


--
-- TOC entry 5183 (class 0 OID 27243)
-- Dependencies: 228
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, tenant_id, conversation_id, sender_id, content, created_at, updated_at) FROM stdin;
a9c2ad3b-a8a5-435a-b9bb-5fea2c140de6	c49269dc-402d-4fe8-9be9-480025fc2047	926a916e-1e7b-4854-bc01-3941c1af270c	92a4bccb-0bfe-4fca-ba25-bc44487065c6	hello	2026-08-31 14:17:55.196+05	2026-08-31 14:17:55.196+05
295bcc64-18f1-4c95-b2b1-1e75bfd0280d	c49269dc-402d-4fe8-9be9-480025fc2047	926a916e-1e7b-4854-bc01-3941c1af270c	92a4bccb-0bfe-4fca-ba25-bc44487065c6	today's work is on frontend	2026-08-31 14:18:05.927+05	2026-08-31 14:18:05.927+05
9f90f7df-5ee4-4aee-bd5e-4082bfb57e0c	c49269dc-402d-4fe8-9be9-480025fc2047	926a916e-1e7b-4854-bc01-3941c1af270c	da92ef24-f786-4cee-8018-72f565c14eed	ok sir i will start work on frontend	2026-08-31 14:19:13.714+05	2026-08-31 14:19:13.714+05
ac7de917-1a17-41e9-beb8-83153462f407	c49269dc-402d-4fe8-9be9-480025fc2047	6700d0e7-b3e8-40db-aecf-c13d6e72a886	da92ef24-f786-4cee-8018-72f565c14eed	today we have to work on frontend as per the admin's guidance	2026-08-31 14:20:02.172+05	2026-08-31 14:20:02.172+05
8185aaa6-b0c7-48da-982f-3d0257a82cef	c49269dc-402d-4fe8-9be9-480025fc2047	6700d0e7-b3e8-40db-aecf-c13d6e72a886	391ba1f0-99b6-4524-8614-93f68b897803	ok we will start today	2026-08-31 14:20:43.999+05	2026-08-31 14:20:43.999+05
db1bbb21-632c-4163-a8a1-8b34bcd94b86	c49269dc-402d-4fe8-9be9-480025fc2047	926a916e-1e7b-4854-bc01-3941c1af270c	391ba1f0-99b6-4524-8614-93f68b897803	if you have any questions do ask me	2026-08-31 14:21:22.102+05	2026-08-31 14:21:22.102+05
e460e729-f7ff-45b2-88fa-d223573c1f2a	c49269dc-402d-4fe8-9be9-480025fc2047	926a916e-1e7b-4854-bc01-3941c1af270c	da92ef24-f786-4cee-8018-72f565c14eed	not now	2026-08-31 14:21:53.522+05	2026-08-31 14:21:53.522+05
e0eaff48-f884-48d5-9166-9678639fa730	c49269dc-402d-4fe8-9be9-480025fc2047	926a916e-1e7b-4854-bc01-3941c1af270c	92a4bccb-0bfe-4fca-ba25-bc44487065c6	ok so lets start	2026-08-31 14:27:13.219+05	2026-08-31 14:27:13.219+05
d6b680c2-c7f8-4d15-b42c-6668509669ba	c49269dc-402d-4fe8-9be9-480025fc2047	a5b0e6b9-c2e4-4e47-9b96-9214384074f1	92a4bccb-0bfe-4fca-ba25-bc44487065c6	hi sara	2026-08-31 14:34:09.246+05	2026-08-31 14:34:09.246+05
5364f9c4-330e-4bbd-b886-a4be60707b01	c49269dc-402d-4fe8-9be9-480025fc2047	a5b0e6b9-c2e4-4e47-9b96-9214384074f1	da92ef24-f786-4cee-8018-72f565c14eed	hi sir	2026-08-31 14:34:19.25+05	2026-08-31 14:34:19.25+05
80b5bd09-331a-4120-8f20-0530d9199c78	c49269dc-402d-4fe8-9be9-480025fc2047	8f0159c9-9f99-430a-9067-941febe744ff	92a4bccb-0bfe-4fca-ba25-bc44487065c6	hi everyone	2026-08-31 14:34:47.264+05	2026-08-31 14:34:47.264+05
285a3473-eb25-4dd9-bd73-dcd4664b6f4a	c49269dc-402d-4fe8-9be9-480025fc2047	8f0159c9-9f99-430a-9067-941febe744ff	92a4bccb-0bfe-4fca-ba25-bc44487065c6	today we have to work on bug fixing	2026-08-31 14:35:00.448+05	2026-08-31 14:35:00.448+05
7d26d087-e982-41f5-84a9-5f2c067e55e6	c49269dc-402d-4fe8-9be9-480025fc2047	8f0159c9-9f99-430a-9067-941febe744ff	da92ef24-f786-4cee-8018-72f565c14eed	ok sir	2026-08-31 14:35:11.358+05	2026-08-31 14:35:11.358+05
0cd7f3ac-7fc4-409a-8d6a-ae8821733775	c49269dc-402d-4fe8-9be9-480025fc2047	8f0159c9-9f99-430a-9067-941febe744ff	92a4bccb-0bfe-4fca-ba25-bc44487065c6	please acknowledge everyone	2026-08-31 14:35:25.757+05	2026-08-31 14:35:25.757+05
cbc6e7d3-7c74-49f6-819f-00844dffce70	c49269dc-402d-4fe8-9be9-480025fc2047	8f0159c9-9f99-430a-9067-941febe744ff	391ba1f0-99b6-4524-8614-93f68b897803	acknowledge	2026-08-31 14:35:59.24+05	2026-08-31 14:35:59.24+05
fc24e06c-757e-420c-85fd-996729a7b20e	c49269dc-402d-4fe8-9be9-480025fc2047	926a916e-1e7b-4854-bc01-3941c1af270c	391ba1f0-99b6-4524-8614-93f68b897803	ok sir	2026-08-31 14:36:04.555+05	2026-08-31 14:36:04.555+05
6da02630-fc44-40ce-86fb-2db8cc43b5cc	c49269dc-402d-4fe8-9be9-480025fc2047	8f0159c9-9f99-430a-9067-941febe744ff	da92ef24-f786-4cee-8018-72f565c14eed	acknowledge	2026-08-31 15:15:37.648+05	2026-08-31 15:15:37.648+05
\.


--
-- TOC entry 5176 (class 0 OID 25199)
-- Dependencies: 221
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, token_hash, user_id, tenant_id, expires_at, revoked_at, created_at, updated_at) FROM stdin;
045c9645-c0eb-4138-a496-d889cb9aabc9	fb55a5eb94a944d16bc1f09fe975d665c6a389181b4d19a99f7438fbde40454e	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 10:18:54.357+05	2026-08-31 10:32:54.923+05	2026-08-31 10:18:54.358+05	2026-08-31 10:32:54.923+05
5936cc1e-6030-4fc1-8ca8-bbaf5729aa84	de34962d8b22750c0810b31755e2c4142b99093b17360776188cc23822bad2bf	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 10:32:54.93+05	2026-08-31 11:08:36.764+05	2026-08-31 10:32:54.93+05	2026-08-31 11:08:36.765+05
1ed5561b-5e69-4f3e-9714-0b1b20b6c292	13e8a6051460de76896a6d6c3d39bdc61c46cb7d00cae81bf79720da384ce5ab	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 11:08:36.883+05	\N	2026-08-31 11:08:36.884+05	2026-08-31 11:08:36.884+05
5318d5e3-e79f-455e-8bb7-e0840bcfacea	13ce4018192106a3e95c9be5079afecf5d7d061a4570882293e86548cf9c7a65	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 11:09:03.281+05	2026-08-31 11:11:24.652+05	2026-08-31 11:09:03.281+05	2026-08-31 11:11:24.669+05
3ddb6564-13a4-4eaf-92f6-a532dd71514a	d0bb418bb76cdfe9906aced079257a0dcbc77411c9bde32725ec92e459fbed41	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 11:11:57.118+05	2026-08-31 11:12:31.669+05	2026-08-31 11:11:57.118+05	2026-08-31 11:12:31.669+05
850773c0-408b-4461-8f30-52440e98730d	6fb10afd0c9baf080b543c9f73c3634ec6183cbded8979c6cb4cef4be9a6ccad	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 11:19:38.502+05	2026-08-31 11:33:39.376+05	2026-08-31 11:19:38.502+05	2026-08-31 11:33:39.376+05
9d21d321-4c9c-4564-bfaa-dff640ecf0a0	041820c353666465375ecc3f04d26ae4177ef2221d9bd09581c5993b28faed3f	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 11:32:37.686+05	2026-08-31 11:33:48.283+05	2026-08-31 11:32:37.687+05	2026-08-31 11:33:48.3+05
4f161f0e-a83a-4098-8f8d-c2f7c74c8817	3e94d2045aca02e93080fc6025f0c04bc5be31e91b71df395b90345b4e57a301	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 11:33:39.392+05	2026-08-31 11:34:40.075+05	2026-08-31 11:33:39.392+05	2026-08-31 11:34:40.075+05
0af43f26-4abc-4e2c-9be6-369d65bfb54c	45d57df3956d1b7987704243b729700f36eca4a1141456d50e1ad94bd499385b	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 11:35:23.789+05	2026-08-31 11:39:50.104+05	2026-08-31 11:35:23.789+05	2026-08-31 11:39:50.104+05
c48f2c9d-b532-4df2-b8da-4e69b4932d2e	bf591da75bc9d70da25073d5b24f4c9e649bfbfd5018a106fc592f66fb4bd9eb	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 11:35:49.029+05	2026-08-31 11:49:50.348+05	2026-08-31 11:35:49.03+05	2026-08-31 11:49:50.378+05
ca839bce-0465-4158-adf2-636c2abb605e	7966aa258cb9de0e00d0a7a28d1b7ba76200bc5e7217ee50806260feb639a46f	391ba1f0-99b6-4524-8614-93f68b897803	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:00:53.751+05	2026-08-31 12:03:05.757+05	2026-08-31 12:00:53.751+05	2026-08-31 12:03:05.784+05
b9c27939-8a96-4a92-bc21-7601136cda72	99f141ee2dbb5e26813e92a9cc8c6df947d3d4b814b8e5390d445ed084a7b7a2	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 11:49:50.891+05	2026-08-31 12:03:49.384+05	2026-08-31 11:49:50.928+05	2026-08-31 12:03:49.384+05
f930a511-9280-4da4-94eb-dbf351d8b6ca	7050569beee9274b41c2c5b03518dced6883a8b9998dc427b436869c6d19ff70	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:03:12.307+05	2026-08-31 12:04:08.77+05	2026-08-31 12:03:12.307+05	2026-08-31 12:04:08.77+05
532e98a0-55c5-4fca-9601-1b2df67dabbe	d91e171548737a8f92cbd08a07f564e76e58e1804c7282e3e48bae9604f5c110	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:03:49.388+05	2026-08-31 12:04:19.259+05	2026-08-31 12:03:49.388+05	2026-08-31 12:04:19.26+05
0bfa5c4b-2c6a-4b8b-b7cf-f0a408688a6d	cfcc9c1627a0dd22f4eb946922198b1ebd327554225b20115b47db99d9612538	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:04:51.38+05	2026-08-31 12:05:21.697+05	2026-08-31 12:04:51.38+05	2026-08-31 12:05:21.697+05
f2e5c086-d3f1-4ac2-a8f2-deda572abf06	10a005400ce19647876f48fad814fd596dd19fd7c82fff064e80795814ed966d	391ba1f0-99b6-4524-8614-93f68b897803	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:04:34.608+05	2026-08-31 12:05:26.442+05	2026-08-31 12:04:34.608+05	2026-08-31 12:05:26.442+05
446a54e3-574f-44ba-a3d0-a0d89b7ed3b0	b9fc58b0f23d39dae878d2499c2e0fe59d10919cc58ec5098205cfd9b009e1d9	391ba1f0-99b6-4524-8614-93f68b897803	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:19:28.534+05	2026-08-31 12:34:34.703+05	2026-08-31 12:19:28.534+05	2026-08-31 12:34:34.703+05
e63a4c03-861e-4e93-9ed7-b567b6a8e4e6	75d041ca3491486ee02767bc625f6e00ad1cefcceda3383ccc16efdb151dbb02	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:28:52.875+05	2026-08-31 12:42:53.636+05	2026-08-31 12:28:52.875+05	2026-08-31 12:42:53.638+05
13cd07b0-11c1-4be7-bdc1-41a4a9a084b7	66dfcac45d360660e8559907cf26454256ac5d5450a18cd7d892200a2437178a	391ba1f0-99b6-4524-8614-93f68b897803	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:34:34.724+05	2026-08-31 12:45:40.661+05	2026-08-31 12:34:34.724+05	2026-08-31 12:45:40.663+05
ed93f0ce-621e-408c-b104-9fa626a6bcd8	8175de906e2a346e753ffbf41c0abb2c11868308542e6e17cdb070a775cedd5c	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:42:53.661+05	2026-08-31 12:46:12.027+05	2026-08-31 12:42:53.661+05	2026-08-31 12:46:12.039+05
8f013ec3-971f-419a-b2e0-c7cf075a901e	bde57b24e806aac244587100a942b3013f1aaabb53c694f66a51cd13ea4e2cba	391ba1f0-99b6-4524-8614-93f68b897803	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:45:40.678+05	2026-08-31 12:47:08.993+05	2026-08-31 12:45:40.679+05	2026-08-31 12:47:08.993+05
00de9960-9ef9-4979-a02b-7490d7ed1af1	1cbe2f52889521a8290f518c7f508e28af7f680e57a26d207fb1e6443e5ea854	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:46:52.001+05	2026-08-31 12:49:43.959+05	2026-08-31 12:46:52.001+05	2026-08-31 12:49:43.959+05
53ab9a76-b28a-4c9b-adf7-4421077bda75	08852907e04b3678ad407481814fb0ed8c6f3c1e5f4dc4e1d1f7a3061ceb7a5c	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:49:51.691+05	2026-08-31 12:50:59.632+05	2026-08-31 12:49:51.691+05	2026-08-31 12:50:59.632+05
6ab1013f-0d68-4125-9aa3-bc35c4ca6d51	093089d5f8a84a15e70adcb0edf27e1474042d18e698d628a72505f15cca588b	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:47:20.149+05	2026-08-31 12:51:46.749+05	2026-08-31 12:47:20.149+05	2026-08-31 12:51:46.749+05
498613a3-06ed-4eaf-adf7-dee4610a32ee	3126ecd168cd6b563db0b800c02a13d1d714c997cf500fb9404e8fee234332b0	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:51:57.593+05	2026-08-31 12:53:50.647+05	2026-08-31 12:51:57.594+05	2026-08-31 12:53:50.647+05
6079defb-0cb1-4655-8d42-dbe619e1bfc1	936f742306ade8938c124e47a19c3c96a33cb48bed0236888fb262fe845cfd6c	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:54:51.888+05	2026-08-31 13:08:53.948+05	2026-08-31 12:54:51.888+05	2026-08-31 13:08:53.959+05
15a68d02-3f27-467b-bc67-420d51d06a07	0f1a64c16eabdba8a5701a3543355150f1110d3aed7bc34783a991b4ee7083c1	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 12:51:08.96+05	2026-08-31 13:09:03.225+05	2026-08-31 12:51:08.96+05	2026-08-31 13:09:03.225+05
c040f2eb-4a20-44ad-bd26-3da4ec160cc6	1c6f01b9d9510bb2f0e58add82370d11c65a86776b36d4ea36b23add8b7acfcd	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 13:08:54.066+05	2026-08-31 13:22:52.358+05	2026-08-31 13:08:54.067+05	2026-08-31 13:22:52.358+05
d4196923-022d-4189-a783-5a8210cbdde6	7050c6ce540f6217cc5ef96e26c62c24b30982f525f0947f251e65d30378d9e1	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 13:09:03.312+05	2026-08-31 13:23:02.905+05	2026-08-31 13:09:03.312+05	2026-08-31 13:23:02.906+05
d4849b98-40c7-4168-9981-46adb2d94c99	47aef5e7cc958440e5acb1ed267b925af218b268364ad72c293501b1750a6ccd	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 13:22:52.364+05	2026-08-31 13:36:52.492+05	2026-08-31 13:22:52.364+05	2026-08-31 13:36:52.492+05
7c142cb7-2ea2-4092-b335-a1da4fd0e0ec	1d5a206850412c10c8198d169218674f78cdf7c3af37713c6b2f822d19406dee	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 13:23:02.912+05	2026-08-31 13:37:03.347+05	2026-08-31 13:23:02.912+05	2026-08-31 13:37:03.347+05
d1220ff1-b01e-4494-a42c-41094223d9b4	d4dc2d723c2013edb3c3d983e2f1532b3a9964e20e2e3e8c4c74f03433a2ae08	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 13:36:52.495+05	2026-08-31 13:50:52.834+05	2026-08-31 13:36:52.496+05	2026-08-31 13:50:52.834+05
6786def2-391d-47fa-88ef-e2a5ad8d9b71	aadb4859e85732cc9b63454ef94dd0600c4ec2caee66428565e5639685bbf91d	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 13:37:03.35+05	2026-08-31 14:17:15.459+05	2026-08-31 13:37:03.35+05	2026-08-31 14:17:15.46+05
80b5fb02-4ea8-4c83-b012-bbff0af6bdc7	44ce8775fc564feab7d8457a4313cb8092d760d859e696a87ff23065adfa3884	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 13:50:53.069+05	2026-08-31 14:18:41.888+05	2026-08-31 13:50:53.069+05	2026-08-31 14:18:41.888+05
25090c9b-b8c4-4b96-b341-072799e8a4e4	34740f7b34738c4626c24570443a755dd3b6db70cd56e03810a99b4e59bfcefb	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 14:17:15.659+05	2026-08-31 14:20:13.76+05	2026-08-31 14:17:15.66+05	2026-08-31 14:20:13.76+05
0da92944-496e-4b54-9315-384773e9c1d5	72d23554ce55d71c7c9e94cf4e9d4fd6d542565c91cd34e71f8b09e895f57934	391ba1f0-99b6-4524-8614-93f68b897803	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 14:20:25.509+05	2026-08-31 14:26:33.128+05	2026-08-31 14:20:25.509+05	2026-08-31 14:26:33.128+05
4b8abad9-6a43-4033-9aa3-85ea68d198a4	ba6b77fe515b44268715745ac0cde04bfc00664647a55b43f5fac648c990cc7d	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 14:18:41.892+05	2026-08-31 14:32:42.375+05	2026-08-31 14:18:41.893+05	2026-08-31 14:32:42.375+05
6b65a1cb-bb2f-462e-943b-2370970fcbc9	486bdc36ff3152c67880b98fa5ec08ff82b8cf52e398e7933e32a39967ed8ffe	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 14:26:39.833+05	2026-08-31 14:35:31.423+05	2026-08-31 14:26:39.833+05	2026-08-31 14:35:31.423+05
2ae30b0a-5dd7-419d-b77c-38de4575372b	58a4757d3dadb421dd66c8426b1f0cd1d80de446b170db0b577a946a93212310	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 14:32:42.382+05	2026-08-31 14:46:42.366+05	2026-08-31 14:32:42.382+05	2026-08-31 14:46:42.366+05
64bb3397-b16e-49a5-a197-aa7bc58fb614	fa7e58220de94dc01328cea3c5a7cf798af0c877ae0dacf21ab0664e2c1e8710	391ba1f0-99b6-4524-8614-93f68b897803	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 14:35:46.191+05	2026-08-31 14:49:46.386+05	2026-08-31 14:35:46.192+05	2026-08-31 14:49:46.386+05
08fbac77-196e-4744-8a67-00487d4c9ead	695b144eaa4a928582d3943aa4b6c1f141c53b90ad29251420bcecc61b4d6bb0	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 14:46:42.371+05	2026-08-31 15:00:42.479+05	2026-08-31 14:46:42.371+05	2026-08-31 15:00:42.497+05
c54dcb64-34ea-47c1-9534-6a8605223a01	0d290b5d1e7bab2b65120c0360bbaa52556debc201fd226dbc21c6c97f833a9d	391ba1f0-99b6-4524-8614-93f68b897803	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 14:49:46.394+05	2026-08-31 15:02:57.031+05	2026-08-31 14:49:46.395+05	2026-08-31 15:02:57.031+05
1c2fa62a-65b5-4ec8-8ec5-5adf368244fd	058ea82327219ab4b12b551f25558c790b5738e094c1584ee098f0f2afd35977	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 15:00:42.519+05	2026-08-31 15:14:42.382+05	2026-08-31 15:00:42.52+05	2026-08-31 15:14:42.382+05
f938d92a-ff42-4924-aa95-875a40a59f49	cbbc73dbcc828c940526a56e2ac44aa64ae6fcf487d99d1d9955586e38951e76	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 15:03:04.95+05	2026-08-31 15:17:04.997+05	2026-08-31 15:03:04.95+05	2026-08-31 15:17:04.997+05
eff79f47-747e-41a3-a8fc-05761e4145f8	262ee93d2c42e024817c468ad3406657c2071b1b786ec0b7f634eb77c3223662	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 15:14:42.41+05	2026-08-31 15:29:34.497+05	2026-08-31 15:14:42.41+05	2026-08-31 15:29:34.497+05
c648ee9c-58b9-4251-bfe7-6b23d67dd796	ffb1b8e101d9794d3cef00c3ae28fcd8665d5d38197f29e8dd4f8a3e645bf59f	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 15:17:05.002+05	2026-08-31 15:31:05.369+05	2026-08-31 15:17:05.002+05	2026-08-31 15:31:05.369+05
a60bcbf5-901b-45fd-bb8b-d35eba79765f	87164035a09b5ea1a8d10e5ac38ca6f766e691c09b92b59daf182f34a3a83e6c	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 15:29:34.548+05	2026-08-31 15:43:34.399+05	2026-08-31 15:29:34.548+05	2026-08-31 15:43:34.399+05
1e56b482-c7fb-4181-a278-0a9d3dca7066	f294b32c25126e936a4cb1d8a4196a760247d2eedaa973c1dc287d1334150c22	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 15:31:05.376+05	2026-08-31 15:45:04.991+05	2026-08-31 15:31:05.376+05	2026-08-31 15:45:04.992+05
21f802b1-f8fa-41d9-9ebc-e757ccaabd83	691da97691464e95c25c4777dc334045078782a175457c06ee50850dac01efb9	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 15:43:34.484+05	2026-08-31 15:57:34.392+05	2026-08-31 15:43:34.485+05	2026-08-31 15:57:34.392+05
3d8adfaa-bef0-4481-a3ff-00ff3465a315	e0289a03f7642faf0a812811088dd066fe6bc655067fef9a9679d85837ed5d29	da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 15:57:34.426+05	\N	2026-08-31 15:57:34.426+05	2026-08-31 15:57:34.426+05
b4560295-5f2c-4cfa-9094-eeb4c1ee5fc8	8d14cc81026e45b6c8b7000f48a1a3b46a5f48ce436b7f414830f935b3f5c935	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 15:45:04.999+05	2026-08-31 15:59:05.365+05	2026-08-31 15:45:04.999+05	2026-08-31 15:59:05.365+05
3aa566cd-6d34-49b5-a1c3-bc6478f4e8e0	21bf962de1ab73af3d9c24bd549e565b077a69fe4cbae40a9b4d1f8d9ed90321	92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	2026-09-07 15:59:05.369+05	\N	2026-08-31 15:59:05.369+05	2026-08-31 15:59:05.369+05
\.


--
-- TOC entry 5179 (class 0 OID 25328)
-- Dependencies: 224
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, tenant_id, working_hours_per_day, working_days_per_week, idle_threshold_seconds, timezone, created_at, updated_at) FROM stdin;
684b4212-060d-4101-8280-fba2bd7377be	c49269dc-402d-4fe8-9be9-480025fc2047	8	5	300	UTC	2026-08-31 10:53:13.658+05	2026-08-31 10:53:13.658+05
\.


--
-- TOC entry 5180 (class 0 OID 25617)
-- Dependencies: 225
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, tenant_id, title, description, points, status, due_date, completed_at, assigned_to_id, created_by_id, created_at, updated_at) FROM stdin;
8ecf68e5-eeb9-4911-b94f-7ebb35160daa	c49269dc-402d-4fe8-9be9-480025fc2047	fix login	fix it and allow authorized access	4	Completed	2026-08-31	2026-08-31 12:05:03.506+05	391ba1f0-99b6-4524-8614-93f68b897803	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 12:04:00.262+05	2026-08-31 12:05:03.508+05
cd24c657-84e5-4550-a4cf-0f6905b1162d	c49269dc-402d-4fe8-9be9-480025fc2047	fix bugs in backend	fix backend problems and test	3	Completed	2026-08-31	2026-08-31 12:31:39.837+05	391ba1f0-99b6-4524-8614-93f68b897803	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 12:29:38.845+05	2026-08-31 12:31:39.84+05
8fa6654e-86b6-4759-b007-8834e96d0471	c49269dc-402d-4fe8-9be9-480025fc2047	bug fixing	fix errors	3	Completed	2026-08-31	2026-08-31 12:53:34.139+05	da92ef24-f786-4cee-8018-72f565c14eed	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 12:51:36.936+05	2026-08-31 12:53:34.243+05
\.


--
-- TOC entry 5175 (class 0 OID 25177)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, tenant_id, name, email, username, password_hash, role, team_id, manager_id, last_login_at, created_at, updated_at, points) FROM stdin;
ad0c83d3-3922-448c-8e12-861b88b4602a	c49269dc-402d-4fe8-9be9-480025fc2047	Test User	testuser99@test.com	testuser99	$2b$12$Lb0q0IEY2qQRIit5Cgz1j.DymUk/cio7oMr6kY8P./2y6WccYhHxC	EMPLOYEE	\N	\N	\N	2026-08-31 11:03:42.237+05	2026-08-31 11:03:42.237+05	0
da92ef24-f786-4cee-8018-72f565c14eed	c49269dc-402d-4fe8-9be9-480025fc2047	sara	sara@company.com	sara	$2b$12$e0hwVCimWZR8pEelTnWy6OEbZy9ghOzko1HrVEv.YeAdqjPoIRLY.	EMPLOYEE	\N	92a4bccb-0bfe-4fca-ba25-bc44487065c6	2026-08-31 12:54:51.746+05	2026-08-31 12:46:33.26+05	2026-08-31 12:54:51.746+05	3
391ba1f0-99b6-4524-8614-93f68b897803	c49269dc-402d-4fe8-9be9-480025fc2047	ahmed	ahmed@company.com	ahmed	$2b$12$10p9WeVfweyKfaW7qm9xCOjqDYjDySmI6M4/GqeF51YNmisfS.3/S	EMPLOYEE	\N	\N	2026-08-31 14:35:46.184+05	2026-08-31 12:00:36.129+05	2026-08-31 14:35:46.184+05	7
92a4bccb-0bfe-4fca-ba25-bc44487065c6	c49269dc-402d-4fe8-9be9-480025fc2047	Mahir	mahirprasla@gmail.com	Mahir	$2b$12$flsf8HEiKOTUFx/DLpoFxe4tziiIr/KjoUyO8qp9xU6zM8ZJ/cFku	COMPANY_ADMIN	\N	\N	2026-08-31 15:03:04.826+05	2026-08-31 10:18:45.859+05	2026-08-31 15:03:04.826+05	0
\.


--
-- TOC entry 5177 (class 0 OID 25233)
-- Dependencies: 222
-- Data for Name: work_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_sessions (id, tenant_id, user_id, task_id, started_at, ended_at, status, total_seconds, working_seconds, idle_seconds, non_productive_seconds, paused_seconds, last_activity_at, device_id, created_at, updated_at) FROM stdin;
d985d44e-57ff-49b0-966f-899d2e105b6b	c49269dc-402d-4fe8-9be9-480025fc2047	92a4bccb-0bfe-4fca-ba25-bc44487065c6	\N	2026-08-31 10:33:11.256+05	2026-08-31 10:33:23.804+05	COMPLETED	12	0	0	0	0	2026-08-31 10:33:11.256+05	desktop-agent	2026-08-31 10:33:11.257+05	2026-08-31 10:33:23.804+05
d732bae3-ac44-4dfe-bc97-d79cd6bd261b	c49269dc-402d-4fe8-9be9-480025fc2047	92a4bccb-0bfe-4fca-ba25-bc44487065c6	\N	2026-08-31 11:12:04.47+05	2026-08-31 11:12:23.874+05	COMPLETED	19	0	0	0	0	2026-08-31 11:12:04.47+05	desktop-agent	2026-08-31 11:12:04.47+05	2026-08-31 11:12:23.875+05
29a1f923-50f2-4eb5-bad6-b69464a9dae6	c49269dc-402d-4fe8-9be9-480025fc2047	92a4bccb-0bfe-4fca-ba25-bc44487065c6	\N	2026-08-31 11:23:05.724+05	2026-08-31 11:23:21.022+05	COMPLETED	15	0	0	0	0	2026-08-31 11:23:05.724+05	desktop-agent	2026-08-31 11:23:05.724+05	2026-08-31 11:23:21.022+05
695f74fe-cf95-41d2-bd97-1972d1e89fda	c49269dc-402d-4fe8-9be9-480025fc2047	92a4bccb-0bfe-4fca-ba25-bc44487065c6	\N	2026-08-31 11:32:45.241+05	2026-08-31 11:33:11.507+05	COMPLETED	26	25	0	0	0	2026-08-31 11:33:10.242+05	desktop-agent	2026-08-31 11:32:45.241+05	2026-08-31 11:33:11.507+05
375bcbec-e1d3-4ea9-8ad5-caabc9aa42ec	c49269dc-402d-4fe8-9be9-480025fc2047	da92ef24-f786-4cee-8018-72f565c14eed	\N	2026-08-31 12:52:04.079+05	2026-08-31 12:54:55.995+05	COMPLETED	171	80	0	30	0	2026-08-31 12:54:53.118+05	desktop-agent	2026-08-31 12:52:04.079+05	2026-08-31 12:54:55.995+05
678a45f6-f8f0-4012-9a09-6d3462edc231	c49269dc-402d-4fe8-9be9-480025fc2047	92a4bccb-0bfe-4fca-ba25-bc44487065c6	\N	2026-08-31 11:35:57.964+05	2026-08-31 11:36:31.516+05	COMPLETED	33	35	0	0	0	2026-08-31 11:36:30.656+05	desktop-agent	2026-08-31 11:35:57.964+05	2026-08-31 11:36:31.517+05
4f713fae-4c4c-4612-af5d-f3e51aba968d	c49269dc-402d-4fe8-9be9-480025fc2047	391ba1f0-99b6-4524-8614-93f68b897803	\N	2026-08-31 12:30:00.865+05	2026-08-31 12:31:35.069+05	COMPLETED	94	65	0	30	0	2026-08-31 12:31:34.496+05	desktop-agent	2026-08-31 12:30:00.865+05	2026-08-31 12:31:35.069+05
e45cfc03-65a5-4220-b296-ac8071e80a44	c49269dc-402d-4fe8-9be9-480025fc2047	da92ef24-f786-4cee-8018-72f565c14eed	\N	2026-08-31 12:47:25.643+05	2026-08-31 12:47:44.983+05	COMPLETED	19	20	0	0	0	2026-08-31 12:47:42.15+05	desktop-agent	2026-08-31 12:47:25.643+05	2026-08-31 12:47:44.983+05
5353a68d-b4d1-4f19-914a-62ef5c91e41f	c49269dc-402d-4fe8-9be9-480025fc2047	391ba1f0-99b6-4524-8614-93f68b897803	\N	2026-08-31 12:19:39.152+05	2026-08-31 12:24:40.755+05	COMPLETED	301	220	20	60	0	2026-08-31 12:24:38.79+05	desktop-agent	2026-08-31 12:19:39.153+05	2026-08-31 12:24:40.755+05
\.


--
-- TOC entry 4978 (class 2606 OID 25306)
-- Name: activity_events activity_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_events
    ADD CONSTRAINT activity_events_pkey PRIMARY KEY (id);


--
-- TOC entry 4934 (class 2606 OID 25169)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- TOC entry 5002 (class 2606 OID 27230)
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (id);


--
-- TOC entry 4997 (class 2606 OID 27208)
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- TOC entry 5006 (class 2606 OID 27256)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4941 (class 2606 OID 25210)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4944 (class 2606 OID 27047)
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- TOC entry 4946 (class 2606 OID 27049)
-- Name: refresh_tokens refresh_tokens_token_hash_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key1 UNIQUE (token_hash);


--
-- TOC entry 4948 (class 2606 OID 27063)
-- Name: refresh_tokens refresh_tokens_token_hash_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key10 UNIQUE (token_hash);


--
-- TOC entry 4950 (class 2606 OID 27041)
-- Name: refresh_tokens refresh_tokens_token_hash_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key11 UNIQUE (token_hash);


--
-- TOC entry 4952 (class 2606 OID 27051)
-- Name: refresh_tokens refresh_tokens_token_hash_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key2 UNIQUE (token_hash);


--
-- TOC entry 4954 (class 2606 OID 27053)
-- Name: refresh_tokens refresh_tokens_token_hash_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key3 UNIQUE (token_hash);


--
-- TOC entry 4956 (class 2606 OID 27055)
-- Name: refresh_tokens refresh_tokens_token_hash_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key4 UNIQUE (token_hash);


--
-- TOC entry 4958 (class 2606 OID 27045)
-- Name: refresh_tokens refresh_tokens_token_hash_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key5 UNIQUE (token_hash);


--
-- TOC entry 4960 (class 2606 OID 27057)
-- Name: refresh_tokens refresh_tokens_token_hash_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key6 UNIQUE (token_hash);


--
-- TOC entry 4962 (class 2606 OID 27059)
-- Name: refresh_tokens refresh_tokens_token_hash_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key7 UNIQUE (token_hash);


--
-- TOC entry 4964 (class 2606 OID 27043)
-- Name: refresh_tokens refresh_tokens_token_hash_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key8 UNIQUE (token_hash);


--
-- TOC entry 4966 (class 2606 OID 27061)
-- Name: refresh_tokens refresh_tokens_token_hash_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key9 UNIQUE (token_hash);


--
-- TOC entry 4986 (class 2606 OID 25344)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4988 (class 2606 OID 25346)
-- Name: settings settings_tenant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_tenant_id_key UNIQUE (tenant_id);


--
-- TOC entry 4991 (class 2606 OID 25635)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 4936 (class 2606 OID 25191)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4970 (class 2606 OID 25255)
-- Name: work_sessions work_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_sessions
    ADD CONSTRAINT work_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4979 (class 1259 OID 25323)
-- Name: activity_events_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_events_session_id ON public.activity_events USING btree (session_id);


--
-- TOC entry 4980 (class 1259 OID 27132)
-- Name: activity_events_session_id_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_events_session_id_timestamp ON public.activity_events USING btree (session_id, "timestamp");


--
-- TOC entry 4981 (class 1259 OID 25322)
-- Name: activity_events_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_events_tenant_id ON public.activity_events USING btree (tenant_id);


--
-- TOC entry 4982 (class 1259 OID 27131)
-- Name: activity_events_tenant_id_user_id_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_events_tenant_id_user_id_timestamp ON public.activity_events USING btree (tenant_id, user_id, "timestamp");


--
-- TOC entry 4983 (class 1259 OID 27130)
-- Name: activity_events_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_events_timestamp ON public.activity_events USING btree ("timestamp");


--
-- TOC entry 4984 (class 1259 OID 25324)
-- Name: activity_events_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_events_user_id ON public.activity_events USING btree (user_id);


--
-- TOC entry 5000 (class 1259 OID 27241)
-- Name: conversation_participants_conversation_id_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX conversation_participants_conversation_id_user_id ON public.conversation_participants USING btree (conversation_id, user_id);


--
-- TOC entry 5003 (class 1259 OID 27242)
-- Name: conversation_participants_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversation_participants_user_id ON public.conversation_participants USING btree (user_id);


--
-- TOC entry 4998 (class 1259 OID 27219)
-- Name: conversations_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversations_tenant_id ON public.conversations USING btree (tenant_id);


--
-- TOC entry 4999 (class 1259 OID 27220)
-- Name: conversations_tenant_id_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversations_tenant_id_type ON public.conversations USING btree (tenant_id, type);


--
-- TOC entry 5004 (class 1259 OID 27273)
-- Name: messages_conversation_id_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX messages_conversation_id_created_at ON public.messages USING btree (conversation_id, created_at);


--
-- TOC entry 5007 (class 1259 OID 27272)
-- Name: messages_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX messages_tenant_id ON public.messages USING btree (tenant_id);


--
-- TOC entry 4939 (class 1259 OID 27075)
-- Name: refresh_tokens_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_expires_at ON public.refresh_tokens USING btree (expires_at);


--
-- TOC entry 4942 (class 1259 OID 25224)
-- Name: refresh_tokens_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_tenant_id ON public.refresh_tokens USING btree (tenant_id);


--
-- TOC entry 4967 (class 1259 OID 25223)
-- Name: refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 4989 (class 1259 OID 25652)
-- Name: tasks_assigned_to_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tasks_assigned_to_id ON public.tasks USING btree (assigned_to_id);


--
-- TOC entry 4992 (class 1259 OID 27177)
-- Name: tasks_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tasks_status ON public.tasks USING btree (status);


--
-- TOC entry 4993 (class 1259 OID 25651)
-- Name: tasks_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tasks_tenant_id ON public.tasks USING btree (tenant_id);


--
-- TOC entry 4994 (class 1259 OID 25654)
-- Name: tasks_tenant_id_assigned_to_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tasks_tenant_id_assigned_to_id ON public.tasks USING btree (tenant_id, assigned_to_id);


--
-- TOC entry 4995 (class 1259 OID 27178)
-- Name: tasks_tenant_id_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tasks_tenant_id_status ON public.tasks USING btree (tenant_id, status);


--
-- TOC entry 4937 (class 1259 OID 27027)
-- Name: users_tenant_id_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_tenant_id_email ON public.users USING btree (tenant_id, email);


--
-- TOC entry 4938 (class 1259 OID 27029)
-- Name: users_tenant_id_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_tenant_id_username ON public.users USING btree (tenant_id, username);


--
-- TOC entry 4968 (class 1259 OID 27092)
-- Name: work_sessions_ended_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX work_sessions_ended_at ON public.work_sessions USING btree (ended_at);


--
-- TOC entry 4971 (class 1259 OID 27089)
-- Name: work_sessions_started_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX work_sessions_started_at ON public.work_sessions USING btree (started_at);


--
-- TOC entry 4972 (class 1259 OID 27095)
-- Name: work_sessions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX work_sessions_status ON public.work_sessions USING btree (status);


--
-- TOC entry 4973 (class 1259 OID 25266)
-- Name: work_sessions_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX work_sessions_tenant_id ON public.work_sessions USING btree (tenant_id);


--
-- TOC entry 4974 (class 1259 OID 27090)
-- Name: work_sessions_tenant_id_user_id_started_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX work_sessions_tenant_id_user_id_started_at ON public.work_sessions USING btree (tenant_id, user_id, started_at);


--
-- TOC entry 4975 (class 1259 OID 27096)
-- Name: work_sessions_tenant_id_user_id_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX work_sessions_tenant_id_user_id_status ON public.work_sessions USING btree (tenant_id, user_id, status);


--
-- TOC entry 4976 (class 1259 OID 25267)
-- Name: work_sessions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX work_sessions_user_id ON public.work_sessions USING btree (user_id);


--
-- TOC entry 5013 (class 2606 OID 27120)
-- Name: activity_events activity_events_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_events
    ADD CONSTRAINT activity_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.work_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5014 (class 2606 OID 27115)
-- Name: activity_events activity_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_events
    ADD CONSTRAINT activity_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5015 (class 2606 OID 27125)
-- Name: activity_events activity_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_events
    ADD CONSTRAINT activity_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5022 (class 2606 OID 27231)
-- Name: conversation_participants conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5023 (class 2606 OID 27236)
-- Name: conversation_participants conversation_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5020 (class 2606 OID 27214)
-- Name: conversations conversations_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5021 (class 2606 OID 27209)
-- Name: conversations conversations_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5024 (class 2606 OID 27262)
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5025 (class 2606 OID 27267)
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5026 (class 2606 OID 27257)
-- Name: messages messages_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.companies(id);


--
-- TOC entry 5009 (class 2606 OID 27070)
-- Name: refresh_tokens refresh_tokens_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5010 (class 2606 OID 27065)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5016 (class 2606 OID 27145)
-- Name: settings settings_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5017 (class 2606 OID 27180)
-- Name: tasks tasks_assigned_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_id_fkey FOREIGN KEY (assigned_to_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5018 (class 2606 OID 27185)
-- Name: tasks tasks_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5019 (class 2606 OID 27164)
-- Name: tasks tasks_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5008 (class 2606 OID 27021)
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5011 (class 2606 OID 27079)
-- Name: work_sessions work_sessions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_sessions
    ADD CONSTRAINT work_sessions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5012 (class 2606 OID 27084)
-- Name: work_sessions work_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_sessions
    ADD CONSTRAINT work_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-08-31 17:33:16

--
-- PostgreSQL database dump complete
--

\unrestrict KgH1xyxYcRbC9z3GeZtqq20zLAaEAd3g6ieA9RVTC6sGjhg4vJWpe9eduCFP6Y7

