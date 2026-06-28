# Blueprint Full-Stack Standard: Node.js (Express) + React (Vite) + MySQL

Questo documento rappresenta il **calco metodologico (template)** per lo sviluppo di applicazioni web full-stack moderne. È strutturato per separare nettamente le competenze (Separation of Concerns), garantire la massima sicurezza e offrire una struttura scalabile e riutilizzabile per qualsiasi progetto futuro.

L'architettura si divide in due macro-aree disaccoppiate:
1. **Backend**: API REST in Node.js (Express) + MySQL (ES Modules) con architettura a strati.
2. **Frontend**: Single Page Application (SPA) in React (Vite) con gestione dello stato globale e strato di servizio centralizzato.

---

## Indice
1. [Inizializzazione Progetto](#1-inizializzazione-progetto)
2. [Backend: Architettura a Strati](#2-backend-architettura-a-strati)
   - [Struttura Cartelle](#struttura-cartelle-backend)
   - [Configurazione Iniziale (.env, .gitignore, package.json)](#configurazione-iniziale-backend)
   - [Entrypoint (index.js)](#entrypoint-indexjs)
   - [Connessione Database (config/db.js)](#connessione-database-configdbjs)
   - [Middleware di Sicurezza (middlewares/authMiddleware.js)](#middleware-di-sicurezza)
   - [Rotte (routes/)](#rotte-routes)
   - [Controller (controllers/): Standardizzazione Try-Catch & CRUD](#controller-controllers)
   - [Modelli (models/): Query Preparate](#modelli-models)
   - [Test Unitari (tests/): Mocking con Jest](#test-unitari-tests)
3. [Frontend: Architettura React + Vite](#3-frontend-architettura-react-vite)
   - [Creazione del Frontend](#creazione-del-frontend)
   - [Struttura Cartelle](#struttura-cartelle-frontend)
   - [Entrypoint & Providers (main.jsx)](#entrypoint-providers-mainjsx)
   - [Regista dell'App (App.jsx)](#regista-dellapp-appjsx)
   - [Stato Globale (context/AuthContext.jsx)](#stato-globale-contextauthcontextexamplejsx)
   - [Strato di Servizio (services/)](#strato-di-servizio-services)
   - [Componenti vs Pagine](#componenti-vs-pagine)
4. [Flusso Operativo Consigliato per Nuovi Progetti](#4-flusso-operativo-consigliato-per-nuovi-progetti)

---

## 1. Inizializzazione Progetto
Ogni nuovo progetto deve essere strutturato creando una directory principale che conterrà due cartelle indipendenti:
```bash
mkdir mio-progetto
cd mio-progetto
mkdir backend
# Il frontend verrà creato successivamente con Vite
```

---

## 2. Backend: Architettura a Strati

### Struttura Cartelle Backend
```
backend/
├── config/             # Configurazione connessioni esterne (DB)
├── controllers/        # Logica di business ed elaborazione req/res
├── middlewares/        # Filtri intermedi (autenticazione, permessi)
├── models/             # Query SQL pure (nessun riferimento a req/res o HTTP)
├── routes/             # Definizione delle rotte e mapping con i controller
├── tests/              # Test automatici (Jest)
├── .env                # Variabili d'ambiente (locale - mai committare)
├── .gitignore          # File esclusi dal controllo versione
├── index.js            # Entrypoint principale dell'applicazione
└── package.json        # Script, dipendenze e configurazione modulo
```

### Configurazione Iniziale Backend

#### `package.json`
Assicurarsi di usare la sintassi moderna degli ES Modules aggiungendo `"type": "module"`.
```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "bcryptjs": "^3.0.0",
    "cors": "^2.8.5",
    "dotenv": "^17.0.0",
    "express": "^5.0.0",
    "jsonwebtoken": "^9.0.0",
    "mysql2": "^3.0.0",
    "nodemon": "^3.0.0"
  },
  "devDependencies": {
    "jest": "^30.0.0"
  }
}
```

#### `.gitignore`
```
node_modules/
.env
.DS_Store
coverage/
```

#### `.env` (Template standard)
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tua_password
DB_NAME=nome_database
DB_PORT=3306
JWT_SECRET=inserisci_qui_una_stringa_lunga_e_sicura
```

### Entrypoint (`index.js`)
Inizializza Express, abilita il parsing JSON, gestisce la policy CORS e carica le rotte in modo modulare.
```javascript
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Importazione delle Rotte Modulari
import userRoutes from './routes/userRoutes.js';
import elementoRoutes from './routes/elementoRoutes.js';

dotenv.config();

const app = express();

// Middlewares Globali
app.use(express.json());
app.use(cors()); // Consente al frontend disaccoppiato di comunicare con le API

// Definizione dei Prefissi delle Rotte
app.use('/users', userRoutes);
app.use('/elementi', elementoRoutes);

// Rotta di cortesia / Healthcheck
app.get('/', (req, res) => {
    res.send('API Server is Running... 🟢');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur avviato sulla porta ${PORT} 🚀`);
});
```

### Connessione Database (`config/db.js`)
Uso del **Pool di Connessioni** per massimizzare le performance e ottimizzare le risorse riutilizzando i socket esistenti. Viene impiegato `mysql2/promise` per supportare la sintassi `async/await`.
```javascript
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const bdd = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: {
        rejectUnauthorized: false // Indispensabile se si usano DB Cloud come Aiven, altrimenti opzionale
    }
});

export default bdd;
```

### Middleware di Sicurezza (`middlewares/authMiddleware.js`)
Intercetta la richiesta, valida il token **JWT** e inietta l'utente loggato all'interno di `req.user`. Gestisce anche i controlli dei ruoli in modo pulito.
```javascript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// 1. Verifica generica di autenticazione (Valida il Token)
export const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ message: "Accesso negato. Token non fornito." });
    }

    // Estrae il token dallo schema "Bearer <token>"
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Inietta i dati decodificati (es. id, ruolo) nella richiesta
        next(); // Prosegue verso il controller
    } catch (error) {
        return res.status(401).json({ message: "Token non valido o scaduto." });
    }
};

// 2. Controllo specifico del ruolo (es. Admin = Ruolo ID 4)
export const checkAdmin = (req, res, next) => {
    if (req.user && req.user.role === 4) {
        next();
    } else {
        return res.status(403).json({ message: "Accesso vietato. Richiesti privilegi di amministratore." });
    }
};
```

### Rotte (`routes/elementoRoutes.js`)
Mappatura pulita degli endpoint HTTP. Le rotte protette includono il middleware `checkAuth`.
```javascript
import express from 'express';
import * as elementoController from '../controllers/elementoController.js';
import { checkAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotte Pubbliche
router.get('/', elementoController.getAll);
router.get('/:id', elementoController.getById);

// Rotte Protette (Richiedono JWT valido)
router.post('/create', checkAuth, elementoController.create);
router.put('/update/:id', checkAuth, elementoController.update);
router.delete('/delete/:id', checkAuth, elementoController.remove);

export default router;
```

### Controller (`controllers/elementoController.js`)
Il controller gestisce la logica di ricezione e risposta. **Standard Cruciali**:
- Utilizzare sempre blocchi `try/catch`.
- Validare l'esistenza delle risorse.
- Verificare le autorizzazioni (l'utente proprietario della risorsa coincide con l'utente del token? O è un Admin?).
- Rispondere con gli status code corretti.

#### Struttura Standard CRUD
```javascript
import * as elementoModel from '../models/elementoModel.js';

// CREATE
export const create = async (req, res) => {
    try {
        const { titolo, descrizione, prezzo } = req.body;
        const userId = req.user.id; // Recuperato dal token tramite middleware checkAuth

        const result = await elementoModel.createElemento(titolo, descrizione, prezzo, userId);

        if (result.affectedRows === 1) {
            return res.status(201).json({ message: "Elemento creato con successo!", id: result.insertId });
        }
        return res.status(400).json({ message: "Impossibile creare l'elemento." });
    } catch (error) {
        console.error("Errore create:", error);
        return res.status(500).json({ message: "Errore interno del server durante la creazione." });
    }
};

// READ ALL
export const getAll = async (req, res) => {
    try {
        const elementi = await elementoModel.getAllElementi();
        return res.status(200).json(elementi);
    } catch (error) {
        console.error("Errore getAll:", error);
        return res.status(500).json({ message: "Errore durante il recupero dei dati." });
    }
};

// READ SINGLE
export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const elemento = await elementoModel.getElementById(id);

        if (!elemento || elemento.length === 0) {
            return res.status(404).json({ message: "Elemento non trovato." });
        }
        return res.status(200).json(elemento[0]); // Restituisce solo l'oggetto singolo
    } catch (error) {
        console.error("Errore getById:", error);
        return res.status(500).json({ message: "Errore durante il recupero dell'elemento." });
    }
};

// UPDATE (Con verifica sicurezza)
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { titolo, descrizione, prezzo } = req.body;
        const userIdToken = req.user.id;

        // 1. Verifica dell'esistenza
        const elemento = await elementoModel.getElementById(id);
        if (!elemento || elemento.length === 0) {
            return res.status(404).json({ message: "Elemento non trovato." });
        }

        // 2. Controllo di sicurezza: l'utente è il proprietario o è Admin (ruolo 4)?
        if (elemento[0].user_id !== userIdToken && req.user.role !== 4) {
            return res.status(403).json({ message: "Azione non autorizzata. Non sei il proprietario." });
        }

        // 3. Esecuzione dell'aggiornamento
        await elementoModel.updateElemento(id, titolo, descrizione, prezzo);
        return res.status(200).json({ message: "Elemento aggiornato con successo!" });
    } catch (error) {
        console.error("Errore update:", error);
        return res.status(500).json({ message: "Errore durante la modifica dell'elemento." });
    }
};

// DELETE (Con verifica sicurezza)
export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const userIdToken = req.user.id;

        // 1. Verifica dell'esistenza
        const elemento = await elementoModel.getElementById(id);
        if (!elemento || elemento.length === 0) {
            return res.status(404).json({ message: "Elemento non trovato." });
        }

        // 2. Controllo sicurezza
        if (elemento[0].user_id !== userIdToken && req.user.role !== 4) {
            return res.status(403).json({ message: "Cancellazione non autorizzata." });
        }

        // 3. Eliminazione
        await elementoModel.deleteElemento(id);
        return res.status(200).json({ message: "Elemento eliminato con successo." });
    } catch (error) {
        console.error("Errore remove:", error);
        return res.status(500).json({ message: "Errore durante l'eliminazione." });
    }
};
```

### Modelli (`models/elementoModel.js`)
Qui vengono isolate le query SQL. **Standard Cruciali**:
- Utilizzare sempre le **Query Preparate / Parametrizzate** (passando i valori nell'array dei parametri `[val1, val2]`). Questo garantisce l'immunità totale da attacchi di tipo **SQL Injection**.
- Non includere MAI logiche HTTP (`req`, `res`) o middleware in questo strato.

```javascript
import bdd from '../config/db.js';

export const createElemento = async (titolo, descrizione, prezzo, userId) => {
    const query = `
        INSERT INTO elementi (titolo, descrizione, prezzo, user_id, data_creazione)
        VALUES (?, ?, ?, ?, NOW());
    `;
    // I parametri sostituiscono i punti di domanda '?' in modo sicuro
    const [result] = await bdd.query(query, [titolo, descrizione, prezzo, userId]);
    return result;
};

export const getAllElementi = async () => {
    const query = `
        SELECT elementi.*, users.nome, users.email 
        FROM elementi
        JOIN users ON elementi.user_id = users.id_user
        ORDER BY elementi.data_creazione DESC;
    `;
    const [rows] = await bdd.query(query);
    return rows;
};

export const getElementById = async (id) => {
    const query = `
        SELECT * FROM elementi WHERE id_elemento = ?;
    `;
    const [rows] = await bdd.query(query, [id]);
    return rows;
};

export const updateElemento = async (id, titolo, descrizione, prezzo) => {
    const query = `
        UPDATE elementi 
        SET titolo = ?, descrizione = ?, prezzo = ? 
        WHERE id_elemento = ?;
    `;
    const [result] = await bdd.query(query, [titolo, descrizione, prezzo, id]);
    return result;
};

export const deleteElemento = async (id) => {
    const query = `
        DELETE FROM elementi WHERE id_elemento = ?;
    `;
    const [result] = await bdd.query(query, [id]);
    return result;
};
```

### Test Unitari (`tests/elementoController.test.js`)
Implementazione dei test isolando la logica del controller. Utilizziamo Jest per "fingere" (mockare) il modello evitando di dover interagire con un database reale.
```javascript
import { create } from '../controllers/elementoController.js';
import * as elementoModel from '../models/elementoModel.js';

// Simuliamo interamente il file modello
jest.mock('../models/elementoModel.js');

describe('Elemento Controller - Test Unitari', () => {
    it('Dovrebbe rispondere con 201 se l\'elemento viene creato correttamente', async () => {
        // Mock degli oggetti req e res
        const req = {
            body: { titolo: 'Progetto Test', descrizione: 'Descrizione test', prezzo: 150 },
            user: { id: 10 } // Simulazione utente iniettato dal middleware
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Mocking del comportamento del modello (risponde che è stata inserita 1 riga)
        elementoModel.createElemento.mockResolvedValue({ affectedRows: 1, insertId: 42 });

        // Esecuzione
        await create(req, res);

        // Verifiche delle aspettative (Expects)
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ 
            message: "Elemento creato con successo!", 
            id: 42 
        });
    });
});
```

---

## 3. Frontend: Architettura React + Vite

### Creazione del Frontend
Per avviare la sezione client, posizionarsi nella root del progetto ed eseguire l'inizializzatore di Vite:
```bash
# Crea un'app React con Vite in modalità non interattiva
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### Scelta della Libreria di Stile
Una volta completata l'installazione di base, è possibile arricchire l'interfaccia installando una biblioteca per lo stile.
*   **Se si sceglie Mantine (usata in NomadHub):**
    ```bash
    npm install @mantine/core @mantine/hooks @tabler/icons-react
    ```
*   **Se si sceglie Tailwind CSS:**
    Seguire la procedura ufficiale per la configurazione del file `tailwind.config.js`.

### Struttura Cartelle Frontend
```
frontend/src/
├── assets/             # Risorse statiche (immagini, loghi, illustrazioni)
├── components/         # Componenti dell'interfaccia riutilizzabili (Card, Modali, Forms)
├── context/            # Stati globali dell'applicazione (es. Contesto Autenticazione)
├── pages/              # Schermate principali agganciate al Router (Home, Login, Dashboard)
├── services/           # Interfaccia delle chiamate HTTP verso le API (Axios)
├── style/              # CSS globale o configurazioni specifiche di stile
├── App.jsx             # Regista dell'applicazione (definizione Rotte)
└── main.jsx            # Entrypoint (Iniezione di stili globali e Context Providers)
```

### Entrypoint & Providers (`main.jsx`)
Inietta i file CSS globali e avvolge l'intera applicazione nei vari fornitori di contesto (Theme Provider, Auth Context, Notifications).
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Esempio con stili globali e MantineProvider (opzionale)
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light">
      <AuthProvider>
        <App />
      </AuthProvider>
    </MantineProvider>
  </React.StrictMode>
);
```

### Regista dell'App (`App.jsx`)
Definisce la struttura delle pagine, garantisce che elementi globali come la `NavBar` o il `Footer` rimangano persistenti durante la navigazione e assegna le rotte client usando `react-router-dom`.
```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componenti Strutturali
import NavBar from './components/NavBar';
import Footer from './components/Footer';

// Pagine di Vista
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      {/* Elemento sempre visibile in cima */}
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      {/* Elemento sempre visibile in fondo */}
      <Footer />
    </Router>
  );
}

export default App;
```

### Stato Globale (`context/AuthContext.jsx`)
Centralizza l'autenticazione a livello globale. Gestisce il recupero delle informazioni dell'utente e il token memorizzati nel browser (`localStorage`) all'avvio dell'applicazione.
```jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ripristina la sessione dell'utente all'avvio
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const loginUser = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logoutUser = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, loginUser, logoutUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook personalizzato ed estremamente pratico da richiamare nei componenti
export const useAuth = () => useContext(AuthContext);
```

### Strato di Servizio (`services/elementoService.js`)
Isola le chiamate Axios. Non si deve mai inserire la logica di rete o l'endpoint stringa grezzo direttamente dentro un componente React.
```javascript
import axios from 'axios';

// Utilizza la variabile d'ambiente impostata in Vite (.env ha prefisso VITE_)
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/elementi`;

export const getAllElementi = async () => {
    try {
        const response = await axios.get(API_URL);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Errore getAllElementi:", error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const createNewElemento = async (payload) => {
    try {
        const token = localStorage.getItem('token'); // Recupera il JWT per l'autenticazione
        const response = await axios.post(`${API_URL}/create`, payload, {
            headers: {
                'Authorization': `Bearer ${token}` // Iniezione del JWT nell'Header
            }
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.message || error.message };
    }
};
```

### Componenti vs Pagine
*   **Componenti (`components/`)**: Elementi modulari autocontenuti e focalizzati. Accettano parametri (`props`) e si occupano di visualizzare singoli elementi grafici (es. `CardElemento.jsx`, `PulsantePrimario.jsx`).
*   **Pagine (`pages/`)**: Contenitori aggregate. Rappresentano la schermata completa caricata dal router (es. `Dashboard.jsx`). Si occupano di richiamare i servizi (`services/`), gestire lo stato iniziale con `useEffect` e disporre i vari componenti nella pagina.

---

## 4. Flusso Operativo Consigliato per Nuovi Progetti
Per massimizzare la velocità di sviluppo ed evitare blocchi logici, procedere seguendo questa sequenza bottom-up:

```
[1. Configurazione DB] 
       │
       ▼
[2. Modelli Backend (SQL)] 
       │
       ▼
[3. Middlewares & Sicurezza] 
       │
       ▼
[4. Controller & Rotte Backend] 
       │
       ▼
[5. Inizializzazione Frontend & Stile] 
       │
       ▼
[6. Strato dei Servizi & Context] 
       │
       ▼
[7. Composizione Pagine & Componenti React]
```

1.  **Pianificazione Dati**: Definire lo schema delle tabelle MySQL.
2.  **Infrastruttura Backend**: Configurare `.env`, `index.js` e la connessione del pool `config/db.js`.
3.  **Sviluppo Modelli (Models)**: Scrivere le query SQL grezze e sicure.
4.  **Sicurezza**: Scrivere il middleware `authMiddleware.js` per gestire e validare i JWT.
5.  **Logica di Controllo e Routing**: Scrivere i controller utilizzando il template try/catch e registrare le rotte agganciandovi i middleware.
6.  **Validazione API**: Testare tutti gli endpoint utilizzando Postman o scrivendo test automatici (`npm run test`).
7.  **Avvio Frontend**: Eseguire l'installazione rapida con Vite e configurare la libreria di stile desiderata.
8.  **Infrastruttura Frontend**: Creare l'istruttura delle cartelle, implementare l'**`AuthContext`** per la sessione globale e lo strato **`services/`** per dialogare con le API.
9.  **Sviluppo dell'Interfaccia**: Costruire prima le singole pagine aggregatrici e poi estrarre/isolare le sezioni riutilizzabili sotto forma di componenti React.
