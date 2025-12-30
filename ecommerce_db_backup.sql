--
-- PostgreSQL database dump
--

\restrict JkatG7rMG2xPVNVy5Ma3zsTOKggsoKlvwoDaWYjXer4FFnaqIGnSBPFbwcXtLm3

-- Dumped from database version 15.15 (Debian 15.15-1.pgdg13+1)
-- Dumped by pg_dump version 15.15 (Debian 15.15-1.pgdg13+1)

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
-- Name: BATCH_JOB_EXECUTION_SEQ; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."BATCH_JOB_EXECUTION_SEQ"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."BATCH_JOB_EXECUTION_SEQ" OWNER TO postgres;

--
-- Name: BATCH_JOB_SEQ; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."BATCH_JOB_SEQ"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."BATCH_JOB_SEQ" OWNER TO postgres;

--
-- Name: BATCH_STEP_EXECUTION_SEQ; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."BATCH_STEP_EXECUTION_SEQ"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."BATCH_STEP_EXECUTION_SEQ" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: batch_job_execution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batch_job_execution (
    job_execution_id bigint NOT NULL,
    version bigint,
    job_instance_id bigint NOT NULL,
    create_time timestamp without time zone NOT NULL,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    status character varying(10),
    exit_code character varying(2500),
    exit_message character varying(2500),
    last_updated timestamp without time zone
);


ALTER TABLE public.batch_job_execution OWNER TO postgres;

--
-- Name: batch_job_execution_context; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batch_job_execution_context (
    job_execution_id bigint NOT NULL,
    short_context character varying(2500) NOT NULL,
    serialized_context text
);


ALTER TABLE public.batch_job_execution_context OWNER TO postgres;

--
-- Name: batch_job_execution_params; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batch_job_execution_params (
    job_execution_id bigint NOT NULL,
    parameter_name character varying(100) NOT NULL,
    parameter_type character varying(100) NOT NULL,
    parameter_value character varying(2500),
    identifying character(1) NOT NULL
);


ALTER TABLE public.batch_job_execution_params OWNER TO postgres;

--
-- Name: batch_job_execution_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.batch_job_execution_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.batch_job_execution_seq OWNER TO postgres;

--
-- Name: batch_job_instance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batch_job_instance (
    job_instance_id bigint NOT NULL,
    version bigint,
    job_name character varying(100) NOT NULL,
    job_key character varying(32) NOT NULL
);


ALTER TABLE public.batch_job_instance OWNER TO postgres;

--
-- Name: batch_job_instance_job_instance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.batch_job_instance_job_instance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.batch_job_instance_job_instance_id_seq OWNER TO postgres;

--
-- Name: batch_job_instance_job_instance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.batch_job_instance_job_instance_id_seq OWNED BY public.batch_job_instance.job_instance_id;


--
-- Name: batch_job_instance_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.batch_job_instance_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.batch_job_instance_seq OWNER TO postgres;

--
-- Name: batch_job_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.batch_job_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.batch_job_seq OWNER TO postgres;

--
-- Name: batch_step_execution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batch_step_execution (
    step_execution_id bigint NOT NULL,
    version bigint NOT NULL,
    step_name character varying(100) NOT NULL,
    job_execution_id bigint NOT NULL,
    create_time timestamp without time zone NOT NULL,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    status character varying(10),
    commit_count bigint,
    read_count bigint,
    filter_count bigint,
    write_count bigint,
    read_skip_count bigint,
    write_skip_count bigint,
    process_skip_count bigint,
    rollback_count bigint,
    exit_code character varying(2500),
    exit_message character varying(2500),
    last_updated timestamp without time zone
);


ALTER TABLE public.batch_step_execution OWNER TO postgres;

--
-- Name: batch_step_execution_context; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batch_step_execution_context (
    step_execution_id bigint NOT NULL,
    short_context character varying(2500) NOT NULL,
    serialized_context text
);


ALTER TABLE public.batch_step_execution_context OWNER TO postgres;

--
-- Name: batch_step_execution_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.batch_step_execution_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.batch_step_execution_seq OWNER TO postgres;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id bigint NOT NULL,
    address character varying(255),
    created_at timestamp(6) with time zone NOT NULL,
    email character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    password character varying(255),
    phone character varying(255)
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    client_id bigint,
    product_id bigint,
    quantity integer,
    status character varying(255),
    total_price double precision
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    amount double precision NOT NULL,
    card_number character varying(255),
    created_at timestamp(6) with time zone NOT NULL,
    cvv character varying(255),
    expiry_date character varying(255),
    method character varying(255) NOT NULL,
    order_id bigint NOT NULL,
    owner_name character varying(255),
    status character varying(255) NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.payments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    id bigint NOT NULL,
    available boolean NOT NULL,
    description character varying(255),
    image_url character varying(255),
    name character varying(255),
    price double precision NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public.product OWNER TO postgres;

--
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: batch_job_instance job_instance_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_job_instance ALTER COLUMN job_instance_id SET DEFAULT nextval('public.batch_job_instance_job_instance_id_seq'::regclass);


--
-- Data for Name: batch_job_execution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batch_job_execution (job_execution_id, version, job_instance_id, create_time, start_time, end_time, status, exit_code, exit_message, last_updated) FROM stdin;
1	2	1	2025-12-30 01:41:41.344871	2025-12-30 01:41:41.386015	2025-12-30 01:41:41.503794	COMPLETED	COMPLETED		2025-12-30 01:41:41.504176
2	2	1	2025-12-30 01:42:16.048764	2025-12-30 01:42:16.087323	2025-12-30 01:42:16.110545	COMPLETED	NOOP	All steps already completed or no steps configured for this job.	2025-12-30 01:42:16.111106
3	2	2	2025-12-30 01:42:22.254612	2025-12-30 01:42:22.266983	2025-12-30 01:42:22.340498	COMPLETED	COMPLETED		2025-12-30 01:42:22.340784
4	2	3	2025-12-30 01:43:15.79869	2025-12-30 01:43:15.8092	2025-12-30 01:43:15.850464	COMPLETED	COMPLETED		2025-12-30 01:43:15.850677
5	2	4	2025-12-30 01:45:02.061629	2025-12-30 01:45:02.073543	2025-12-30 01:45:02.137412	COMPLETED	COMPLETED		2025-12-30 01:45:02.137844
6	2	5	2025-12-30 01:45:22.404599	2025-12-30 01:45:22.413437	2025-12-30 01:45:22.46083	COMPLETED	COMPLETED		2025-12-30 01:45:22.461113
7	2	6	2025-12-30 01:45:47.854646	2025-12-30 01:45:47.86772	2025-12-30 01:45:47.920652	COMPLETED	COMPLETED		2025-12-30 01:45:47.921278
\.


--
-- Data for Name: batch_job_execution_context; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batch_job_execution_context (job_execution_id, short_context, serialized_context) FROM stdin;
1	rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAABdAANYmF0Y2gudmVyc2lvbnQABTUuMi4xeA==	\N
2	rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAABdAANYmF0Y2gudmVyc2lvbnQABTUuMi4xeA==	\N
3	rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAABdAANYmF0Y2gudmVyc2lvbnQABTUuMi4xeA==	\N
4	rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAABdAANYmF0Y2gudmVyc2lvbnQABTUuMi4xeA==	\N
5	rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAABdAANYmF0Y2gudmVyc2lvbnQABTUuMi4xeA==	\N
6	rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAABdAANYmF0Y2gudmVyc2lvbnQABTUuMi4xeA==	\N
7	rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAABdAANYmF0Y2gudmVyc2lvbnQABTUuMi4xeA==	\N
\.


--
-- Data for Name: batch_job_execution_params; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batch_job_execution_params (job_execution_id, parameter_name, parameter_type, parameter_value, identifying) FROM stdin;
3	time	java.lang.Long	1767058942240	Y
4	time	java.lang.Long	1767058995782	Y
5	time	java.lang.Long	1767059102047	Y
6	time	java.lang.Long	1767059122395	Y
7	time	java.lang.Long	1767059147835	Y
\.


--
-- Data for Name: batch_job_instance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batch_job_instance (job_instance_id, version, job_name, job_key) FROM stdin;
1	0	nightlyOrdersJob	d41d8cd98f00b204e9800998ecf8427e
2	0	nightlyOrdersJob	b51e3e0b7ad133e97ad921a57fe0fc30
3	0	nightlyOrdersJob	9838fcd75ad79dd2f059414490071720
4	0	nightlyOrdersJob	2159d9c630157d8f0b6a33479e89fe14
5	0	nightlyOrdersJob	2e20843888d344e4fc5edc2e52ae8d6e
6	0	nightlyOrdersJob	228ffb95cef878e137b2599467033f26
\.


--
-- Data for Name: batch_step_execution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batch_step_execution (step_execution_id, version, step_name, job_execution_id, create_time, start_time, end_time, status, commit_count, read_count, filter_count, write_count, read_skip_count, write_skip_count, process_skip_count, rollback_count, exit_code, exit_message, last_updated) FROM stdin;
1	3	nightlyStep	1	2025-12-30 01:41:41.420979	2025-12-30 01:41:41.439686	2025-12-30 01:41:41.486739	COMPLETED	1	0	0	0	0	0	0	0	COMPLETED		2025-12-30 01:41:41.492509
2	3	nightlyStep	3	2025-12-30 01:42:22.276602	2025-12-30 01:42:22.284573	2025-12-30 01:42:22.324768	COMPLETED	1	0	0	0	0	0	0	0	COMPLETED		2025-12-30 01:42:22.33041
3	3	nightlyStep	4	2025-12-30 01:43:15.822791	2025-12-30 01:43:15.827212	2025-12-30 01:43:15.839385	COMPLETED	1	0	0	0	0	0	0	0	COMPLETED		2025-12-30 01:43:15.843787
4	3	nightlyStep	5	2025-12-30 01:45:02.08525	2025-12-30 01:45:02.092821	2025-12-30 01:45:02.110854	COMPLETED	1	0	0	0	0	0	0	0	COMPLETED		2025-12-30 01:45:02.118548
5	3	nightlyStep	6	2025-12-30 01:45:22.423755	2025-12-30 01:45:22.429979	2025-12-30 01:45:22.445207	COMPLETED	1	0	0	0	0	0	0	0	COMPLETED		2025-12-30 01:45:22.450241
6	3	nightlyStep	7	2025-12-30 01:45:47.881503	2025-12-30 01:45:47.891604	2025-12-30 01:45:47.908351	COMPLETED	1	0	0	0	0	0	0	0	COMPLETED		2025-12-30 01:45:47.912563
\.


--
-- Data for Name: batch_step_execution_context; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batch_step_execution_context (step_execution_id, short_context, serialized_context) FROM stdin;
6	rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAADdAARYmF0Y2gudGFza2xldFR5cGV0AE5jb20uZWNvbW1lcmNlLmJhdGNoLnNlcnZpY2UuY29uZmlnLkJhdGNoQ29uZmlnJCRMYW1iZGEkMTEzMC8weDAwMDA3NDRlYmM4N2VmYjB0AA1iYXRjaC52ZXJzaW9udAAFNS4yLjF0AA5iYXRjaC5zdGVwVHlwZXQAN29yZy5zcHJpbmdmcmFtZXdvcmsuYmF0Y2guY29yZS5zdGVwLnRhc2tsZXQuVGFza2xldFN0ZXB4	\N
1	rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAADdAARYmF0Y2gudGFza2xldFR5cGV0AE5jb20uZWNvbW1lcmNlLmJhdGNoLnNlcnZpY2UuY29uZmlnLkJhdGNoQ29uZmlnJCRMYW1iZGEkMTEzMC8weDAwMDA3ODc2Zjg4N2YxZjB0AA1iYXRjaC52ZXJzaW9udAAFNS4yLjF0AA5iYXRjaC5zdGVwVHlwZXQAN29yZy5zcHJpbmdmcmFtZXdvcmsuYmF0Y2guY29yZS5zdGVwLnRhc2tsZXQuVGFza2xldFN0ZXB4	\N
2	rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAADdAARYmF0Y2gudGFza2xldFR5cGV0AE5jb20uZWNvbW1lcmNlLmJhdGNoLnNlcnZpY2UuY29uZmlnLkJhdGNoQ29uZmlnJCRMYW1iZGEkMTEzMC8weDAwMDA3NDRlYmM4N2VmYjB0AA1iYXRjaC52ZXJzaW9udAAFNS4yLjF0AA5iYXRjaC5zdGVwVHlwZXQAN29yZy5zcHJpbmdmcmFtZXdvcmsuYmF0Y2guY29yZS5zdGVwLnRhc2tsZXQuVGFza2xldFN0ZXB4	\N
3	rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAADdAARYmF0Y2gudGFza2xldFR5cGV0AE5jb20uZWNvbW1lcmNlLmJhdGNoLnNlcnZpY2UuY29uZmlnLkJhdGNoQ29uZmlnJCRMYW1iZGEkMTEzMC8weDAwMDA3NDRlYmM4N2VmYjB0AA1iYXRjaC52ZXJzaW9udAAFNS4yLjF0AA5iYXRjaC5zdGVwVHlwZXQAN29yZy5zcHJpbmdmcmFtZXdvcmsuYmF0Y2guY29yZS5zdGVwLnRhc2tsZXQuVGFza2xldFN0ZXB4	\N
4	rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAADdAARYmF0Y2gudGFza2xldFR5cGV0AE5jb20uZWNvbW1lcmNlLmJhdGNoLnNlcnZpY2UuY29uZmlnLkJhdGNoQ29uZmlnJCRMYW1iZGEkMTEzMC8weDAwMDA3NDRlYmM4N2VmYjB0AA1iYXRjaC52ZXJzaW9udAAFNS4yLjF0AA5iYXRjaC5zdGVwVHlwZXQAN29yZy5zcHJpbmdmcmFtZXdvcmsuYmF0Y2guY29yZS5zdGVwLnRhc2tsZXQuVGFza2xldFN0ZXB4	\N
5	rO0ABXNyABFqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0AAAAAAAAx3CAAAABAAAAADdAARYmF0Y2gudGFza2xldFR5cGV0AE5jb20uZWNvbW1lcmNlLmJhdGNoLnNlcnZpY2UuY29uZmlnLkJhdGNoQ29uZmlnJCRMYW1iZGEkMTEzMC8weDAwMDA3NDRlYmM4N2VmYjB0AA1iYXRjaC52ZXJzaW9udAAFNS4yLjF0AA5iYXRjaC5zdGVwVHlwZXQAN29yZy5zcHJpbmdmcmFtZXdvcmsuYmF0Y2guY29yZS5zdGVwLnRhc2tsZXQuVGFza2xldFN0ZXB4	\N
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, address, created_at, email, full_name, password, phone) FROM stdin;
1	\N	2025-12-30 01:14:52.613096+00	nassima@gmail.com	nassima	nassima123	\N
2	\N	2025-12-30 02:12:06.480934+00	elhattabinassima004@gmail.com	nassima017	nassima456	\N
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, client_id, product_id, quantity, status, total_price) FROM stdin;
4	1	3	1	PAID	1200
5	1	1	1	PAID	15000
6	1	3	1	PAID	1200
7	1	5	1	PAID	5000
8	1	4	1	PAID	500
2	1	2	1	DELIVERED	8000
1	1	1	2	DELIVERED	30000
9	1	2	1	PAID	8000
10	1	1	1	PAID	15000
11	1	3	1	PAID	1200
18	1	4	1	CONFIRMED	500
17	1	5	1	CONFIRMED	5000
16	1	3	1	CONFIRMED	1200
15	1	1	1	CONFIRMED	15000
14	1	2	1	CONFIRMED	8000
13	1	5	1	CONFIRMED	5000
12	1	4	1	CONFIRMED	500
19	1	2	1	CONFIRMED	8000
20	1	1	1	CONFIRMED	15000
21	2	1	1	CONFIRMED	15000
3	1	4	1	SHIPPED	500
22	2	3	1	CANCELED	1200
24	2	4	1	SHIPPED	500
25	2	1	1	PAID	15000
23	2	5	1	DELIVERED	5000
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, amount, card_number, created_at, cvv, expiry_date, method, order_id, owner_name, status) FROM stdin;
1	30000	\N	2025-12-30 01:15:17.306714+00	\N	\N	CREDIT_CARD	1	\N	PAID
2	8000	\N	2025-12-30 01:49:04.173813+00	\N	\N	CREDIT_CARD	2	\N	PAID
3	500	\N	2025-12-30 01:50:13.917434+00	\N	\N	CREDIT_CARD	3	\N	PAID
4	1200	\N	2025-12-30 01:50:32.922219+00	\N	\N	CREDIT_CARD	4	\N	PAID
5	15000	\N	2025-12-30 01:50:33.622815+00	\N	\N	CREDIT_CARD	5	\N	PAID
6	1200	\N	2025-12-30 01:50:56.039912+00	\N	\N	CREDIT_CARD	6	\N	PAID
7	5000	\N	2025-12-30 01:58:09.168513+00	\N	\N	CREDIT_CARD	7	\N	PAID
8	500	\N	2025-12-30 01:58:12.216654+00	\N	\N	CREDIT_CARD	8	\N	PAID
9	8000	123456789123456	2025-12-30 01:58:47.846238+00	123	03/29	CARD	2	nassima	PAID
10	30000	123456789123456	2025-12-30 01:59:06.2473+00	123	03/29	CARD	1	nassima	PAID
11	8000	\N	2025-12-30 02:04:58.411075+00	\N	\N	CREDIT_CARD	9	\N	PAID
12	15000	\N	2025-12-30 02:04:59.430038+00	\N	\N	CREDIT_CARD	10	\N	PAID
13	1200	\N	2025-12-30 02:05:00.069263+00	\N	\N	CREDIT_CARD	11	\N	PAID
14	500	\N	2025-12-30 02:05:00.471185+00	\N	\N	CREDIT_CARD	12	\N	PAID
15	5000	\N	2025-12-30 02:05:00.790783+00	\N	\N	CREDIT_CARD	13	\N	PAID
16	8000	\N	2025-12-30 02:05:52.180114+00	\N	\N	CREDIT_CARD	14	\N	PAID
17	15000	\N	2025-12-30 02:05:52.763925+00	\N	\N	CREDIT_CARD	15	\N	PAID
18	1200	\N	2025-12-30 02:05:53.029289+00	\N	\N	CREDIT_CARD	16	\N	PAID
19	5000	\N	2025-12-30 02:05:53.235447+00	\N	\N	CREDIT_CARD	17	\N	PAID
20	500	\N	2025-12-30 02:05:53.489672+00	\N	\N	CREDIT_CARD	18	\N	PAID
21	8000	\N	2025-12-30 02:09:49.700271+00	\N	\N	CREDIT_CARD	19	\N	PAID
22	15000	\N	2025-12-30 02:09:50.243173+00	\N	\N	CREDIT_CARD	20	\N	PAID
23	15000	\N	2025-12-30 02:12:19.705649+00	\N	\N	CREDIT_CARD	21	\N	PAID
24	1200	\N	2025-12-30 02:12:20.224016+00	\N	\N	CREDIT_CARD	22	\N	PAID
25	5000	\N	2025-12-30 02:12:20.459272+00	\N	\N	CREDIT_CARD	23	\N	PAID
26	500	\N	2025-12-30 02:19:38.361948+00	\N	\N	CREDIT_CARD	24	\N	PAID
27	15000	\N	2025-12-30 02:26:40.737679+00	\N	\N	CREDIT_CARD	25	\N	PAID
28	5000	\N	2025-12-30 02:37:48.705129+00	\N	\N	CASH	23	\N	PAID
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product (id, available, description, image_url, name, price, quantity) FROM stdin;
3	t	Active Noise Cancelling, transparency mode, and spatial audio for an immersive listening experience.	https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800	Wireless Earbuds	1200	95
5	t		https://plus.unsplash.com/premium_photo-1693169973609-342539dea9dc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z3VpdGFyfGVufDB8fDB8fHww	Guitar	5000	16
4	t	Ultra-lightweight gaming mouse with precision sensor and customizable RGB lighting.	https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=465&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D	Gaming Mouse	500	95
1	t	Precision-crafted aluminum body, high-resolution Retina display, and industry-leading performance.	https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800	Laptop Pro	15000	2
2	t	Experience the ultimate mobile technology with an edge-to-edge OLED display and pro-grade camera system.	https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800	Smartphone X	8000	16
\.


--
-- Name: BATCH_JOB_EXECUTION_SEQ; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."BATCH_JOB_EXECUTION_SEQ"', 1, false);


--
-- Name: BATCH_JOB_SEQ; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."BATCH_JOB_SEQ"', 1, false);


--
-- Name: BATCH_STEP_EXECUTION_SEQ; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."BATCH_STEP_EXECUTION_SEQ"', 1, false);


--
-- Name: batch_job_execution_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.batch_job_execution_seq', 7, true);


--
-- Name: batch_job_instance_job_instance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.batch_job_instance_job_instance_id_seq', 1, false);


--
-- Name: batch_job_instance_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.batch_job_instance_seq', 1, false);


--
-- Name: batch_job_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.batch_job_seq', 6, true);


--
-- Name: batch_step_execution_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.batch_step_execution_seq', 6, true);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_id_seq', 2, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 25, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 28, true);


--
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_id_seq', 5, true);


--
-- Name: batch_job_execution_context batch_job_execution_context_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_job_execution_context
    ADD CONSTRAINT batch_job_execution_context_pkey PRIMARY KEY (job_execution_id);


--
-- Name: batch_job_execution batch_job_execution_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_job_execution
    ADD CONSTRAINT batch_job_execution_pkey PRIMARY KEY (job_execution_id);


--
-- Name: batch_job_instance batch_job_instance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_job_instance
    ADD CONSTRAINT batch_job_instance_pkey PRIMARY KEY (job_instance_id);


--
-- Name: batch_step_execution_context batch_step_execution_context_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_step_execution_context
    ADD CONSTRAINT batch_step_execution_context_pkey PRIMARY KEY (step_execution_id);


--
-- Name: batch_step_execution batch_step_execution_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_step_execution
    ADD CONSTRAINT batch_step_execution_pkey PRIMARY KEY (step_execution_id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: batch_job_instance job_inst_un; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_job_instance
    ADD CONSTRAINT job_inst_un UNIQUE (job_name, job_key);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: clients uksrv16ica2c1csub334bxjjb59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT uksrv16ica2c1csub334bxjjb59 UNIQUE (email);


--
-- Name: batch_job_execution_context job_exec_ctx_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_job_execution_context
    ADD CONSTRAINT job_exec_ctx_fk FOREIGN KEY (job_execution_id) REFERENCES public.batch_job_execution(job_execution_id);


--
-- Name: batch_job_execution_params job_exec_params_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_job_execution_params
    ADD CONSTRAINT job_exec_params_fk FOREIGN KEY (job_execution_id) REFERENCES public.batch_job_execution(job_execution_id);


--
-- Name: batch_step_execution job_exec_step_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_step_execution
    ADD CONSTRAINT job_exec_step_fk FOREIGN KEY (job_execution_id) REFERENCES public.batch_job_execution(job_execution_id);


--
-- Name: batch_job_execution job_inst_exec_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_job_execution
    ADD CONSTRAINT job_inst_exec_fk FOREIGN KEY (job_instance_id) REFERENCES public.batch_job_instance(job_instance_id);


--
-- Name: batch_step_execution_context step_exec_ctx_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_step_execution_context
    ADD CONSTRAINT step_exec_ctx_fk FOREIGN KEY (step_execution_id) REFERENCES public.batch_step_execution(step_execution_id);


--
-- PostgreSQL database dump complete
--

\unrestrict JkatG7rMG2xPVNVy5Ma3zsTOKggsoKlvwoDaWYjXer4FFnaqIGnSBPFbwcXtLm3

