# Progetto: mamathebest - Riassunto Sviluppo

Questo documento riassume le decisioni tecniche prese per il progetto di monitoraggio neonatale "mamathebest", utile per mantenere la coerenza nelle sessioni future di sviluppo.

## 1. Obiettivi
* Creare un'applicazione web per madri per monitorare:
    * Alimentazione (latte e cibi solidi).
    * Storico pesate.
* Piattaforma: Web (React, Node.js, Aiven MySQL).

## 2. Architettura Database (MySQL)
È stato definito uno schema normalizzato su database `mamathebest` con le seguenti convenzioni:
* **PK (Primary Key):** `id_[nome_tabella]`
* **FK (Foreign Key):** `[nome_tabella]_id`
* **Relazioni:** `ON DELETE CASCADE` attivo per pulizia automatica dati.

### Tabelle:
1.  **bambini**: `id_bambini` (PK), `user_id` (Clerk), `nome`, `data_di_nascita`.
2.  **pesate**: `id_pesate` (PK), `bambino_id` (FK), `peso_kg`, `data_pesata`.
3.  **alimentazione**: `id_alimentazione` (PK), `bambino_id` (FK), `data_ora`, `latte_ml`, `tipo_cibo`, `note`.

## 3. Scelte Tecnologiche & Sicurezza
* **Autenticazione:** Clerk (per gestione identità sicura e conformità GDPR).
* **GDPR:** Minimizzazione dei dati (nessun dato sensibile salvato direttamente in DB, solo `user_id` di Clerk).
* **Sicurezza:** Utilizzo di Prepared Statements per prevenire SQL injection. Divieto di `SELECT *`.
* **Persistenza:** Database su Aiven (Cloud).

## 4. Prossimi Passi (To-Do)
1.  Configurazione ambiente di sviluppo (Node.js/React).
2.  Implementazione autenticazione con Clerk.
3.  Sviluppo API Endpoints (Node.js) con Prepared Statements per interagire con il DB.
4.  Creazione interfaccia frontend (React/Tailwind) per inserimento e visualizzazione dati.
5.  Implementazione logica "Senior": query di aggregazione (`SUM`, `COUNT`) direttamente lato SQL.
