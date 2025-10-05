--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 17.5

-- Started on 2025-08-27 17:27:33 IST

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
-- TOC entry 8 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- TOC entry 4387 (class 0 OID 0)
-- Dependencies: 8
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';

-- Extension: "uuid-ossp"

CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    SCHEMA public
    VERSION "1.1";

--
-- TOC entry 226 (class 1255 OID 131492832)
-- Name: projects_update_trigger_fn(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.projects_update_trigger_fn() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        -- Reset the usage for the project
        IF OLD.subscription_current_period_start <> NEW.subscription_current_period_start THEN 
            UPDATE projects 
            SET 
                current_period_crashes_usage = (
                    SELECT 
                        COUNT(*) 
                    FROM crashes 
                    WHERE
                        crashes.project_id = NEW.id
                        AND crashes.created_at >= NEW.subscription_current_period_start

                )
            WHERE id = NEW.id;
            
        END IF; 

        RETURN NULL;
    END;
$$;


--
-- TOC entry 236 (class 1255 OID 131492840)
-- Name: projects_update_usage_trigger_fn(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.projects_update_usage_trigger_fn() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        -- Update the current_period_crashes_usage for the project
        UPDATE projects 
        SET 
            current_period_crashes_usage = (
                SELECT 
                    COUNT(*) 
                FROM crashes 
                WHERE
                    crashes.project_id = NEW.project_id
                    AND crashes.created_at >= (SELECT subscription_current_period_start FROM projects WHERE id = NEW.project_id LIMIT 1)
            )
        WHERE id = NEW.project_id;
            
        RETURN NULL;
    END;
$$;


SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 55058697)
-- Name: crashes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crashes (
    id text DEFAULT public.uuid_generate_v4() NOT NULL,
    html text NOT NULL,
    screenshot text NOT NULL,
    message text NOT NULL,
    stack text,
    crashed_user_email text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    metadata jsonb NOT NULL,
    url text NOT NULL,
    project_id text NOT NULL,
    share_token text,
);


--
-- TOC entry 224 (class 1259 OID 131492819)
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id text DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    billing_plan text NOT NULL,
    billing_period text NOT NULL,
    access_token text NOT NULL,
    stripe_subscription_id text,
    name text NOT NULL,
    subscription_status text,
    subscription_trial_end timestamp with time zone,
    subscription_current_period_end timestamp with time zone,
    subscription_current_period_start timestamp with time zone,
    status text NOT NULL,
    subscription_cancel_at timestamp with time zone,
    stripe_customer_id text,
    crashes_limit bigint DEFAULT 0 NOT NULL,
    current_period_crashes_usage bigint DEFAULT 0 NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 55058715)
-- Name: session_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_tokens (
    id text DEFAULT public.uuid_generate_v4() NOT NULL,
    access_token text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    refresh_token text NOT NULL,
    role text NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    user_id text NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 131493639)
-- Name: user_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_projects (
    id text DEFAULT public.uuid_generate_v4() NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    project_id text NOT NULL,
    user_id text NOT NULL
);


--
-- TOC entry 222 (class 1259 OID 55058746)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    role text NOT NULL,
    email text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    has_payment_method boolean DEFAULT false NOT NULL,
    metadata jsonb
);


--
-- TOC entry 223 (class 1259 OID 55058758)
-- Name: verify_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verify_codes (
    id text DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    code text NOT NULL,
    method text NOT NULL,
    address text NOT NULL
);


--
-- TOC entry 4207 (class 2606 OID 55058765)
-- Name: crashes crashes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crashes
    ADD CONSTRAINT crashes_pkey PRIMARY KEY (id);


--
-- TOC entry 4224 (class 2606 OID 131492828)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- TOC entry 4211 (class 2606 OID 55058771)
-- Name: session_tokens session_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_tokens
    ADD CONSTRAINT session_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4228 (class 2606 OID 131493646)
-- Name: user_projects user_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_pkey PRIMARY KEY (id);


--
-- TOC entry 4216 (class 2606 OID 55058781)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4220 (class 2606 OID 55058783)
-- Name: verify_codes verify_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verify_codes
    ADD CONSTRAINT verify_codes_pkey PRIMARY KEY (id);


--
-- TOC entry 4205 (class 1259 OID 55058784)
-- Name: crashes_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX crashes_created_at_index ON public.crashes USING btree (created_at DESC NULLS LAST);


--
-- TOC entry 4208 (class 1259 OID 131492839)
-- Name: crashes_project_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX crashes_project_id_index ON public.crashes USING btree (project_id DESC NULLS LAST);


--
-- TOC entry 4208 (class 1259 OID 131492839)
-- Name: crashes_share_token_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX crashes_share_token_index ON public.crashes USING btree (share_token DESC NULLS LAST);


--
-- TOC entry 4221 (class 1259 OID 131492829)
-- Name: projects_access_token_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX projects_access_token_index ON public.projects USING btree (access_token DESC NULLS LAST);


--
-- TOC entry 4222 (class 1259 OID 131492830)
-- Name: projects_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_created_at_index ON public.projects USING btree (created_at DESC NULLS LAST);


--
-- TOC entry 4225 (class 1259 OID 131492831)
-- Name: projects_stripe_subscription_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_stripe_subscription_id_index ON public.projects USING btree (stripe_subscription_id DESC NULLS LAST);


--
-- TOC entry 4209 (class 1259 OID 55058791)
-- Name: session_tokens_access_token_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_tokens_access_token_index ON public.session_tokens USING btree (access_token DESC NULLS LAST);


--
-- TOC entry 4212 (class 1259 OID 55058792)
-- Name: session_tokens_refresh_token_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_tokens_refresh_token_index ON public.session_tokens USING btree (refresh_token DESC NULLS LAST);


--
-- TOC entry 4226 (class 1259 OID 131493657)
-- Name: user_projects_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_projects_created_at_index ON public.user_projects USING btree (created_at DESC NULLS LAST);


--
-- TOC entry 4229 (class 1259 OID 131493658)
-- Name: user_projects_project_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_projects_project_id_index ON public.user_projects USING btree (project_id DESC NULLS LAST);


--
-- TOC entry 4230 (class 1259 OID 131493659)
-- Name: user_projects_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_projects_user_id_index ON public.user_projects USING btree (user_id DESC NULLS LAST);


--
-- TOC entry 4213 (class 1259 OID 55058809)
-- Name: users_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_created_at_index ON public.users USING btree (created_at DESC NULLS LAST);


--
-- TOC entry 4214 (class 1259 OID 55058810)
-- Name: users_email_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_index ON public.users USING btree (email DESC NULLS LAST);


--
-- TOC entry 4217 (class 1259 OID 55058811)
-- Name: users_role_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_index ON public.users USING btree (role DESC NULLS LAST);


--
-- TOC entry 4218 (class 1259 OID 55058812)
-- Name: verify_codes_address_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX verify_codes_address_index ON public.verify_codes USING btree (address DESC NULLS LAST);


--
-- TOC entry 4236 (class 2620 OID 131492833)
-- Name: projects projects_update_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER projects_update_trigger AFTER UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.projects_update_trigger_fn();


--
-- TOC entry 4235 (class 2620 OID 131492841)
-- Name: crashes projects_update_usage_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER projects_update_usage_trigger AFTER INSERT ON public.crashes FOR EACH ROW EXECUTE FUNCTION public.projects_update_usage_trigger_fn();


--
-- TOC entry 4231 (class 2606 OID 131492834)
-- Name: crashes crashes_project_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crashes
    ADD CONSTRAINT crashes_project_id FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- TOC entry 4232 (class 2606 OID 55058828)
-- Name: session_tokens session_tokens_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_tokens
    ADD CONSTRAINT session_tokens_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4233 (class 2606 OID 131493647)
-- Name: user_projects user_projects_project_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_project_id FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- TOC entry 4234 (class 2606 OID 131493652)
-- Name: user_projects user_projects_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2025-08-27 17:28:02 IST

--
-- PostgreSQL database dump complete
--

