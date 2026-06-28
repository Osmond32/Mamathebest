import PesateModel from '../models/pesateModel.js';

const getUserId = (req) => {
    return req.auth?.userId || req.user?.id || req.headers['x-user-id'] || req.body.user_id || req.query.user_id;
};

// GET: Recupera tutte le pesate per un determinato bambino
export const getAllPesateByBambino = async (req, res) => {
    try {
        const { bambino_id } = req.params;
        const user_id = getUserId(req);
        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }
        const data = await PesateModel.getAllPesateByBambino(bambino_id, user_id);
        res.status(200).json(data);
    } catch (error) {
        console.error("Errore nel controller pesate (getAll):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

// POST: Aggiunge una nuova pesata
export const createPesata = async (req, res) => {
    try {
        const { bambino_id, peso_kg, data_pesata } = req.body;
        const user_id = getUserId(req);

        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }
        if (!bambino_id || peso_kg === undefined) {
            return res.status(400).json({ message: "I campi bambino_id e peso_kg sono obbligatori." });
        }

        const result = await PesateModel.createPesata(bambino_id, user_id, peso_kg, data_pesata);
        res.status(201).json({ 
            message: "Pesata registrata con successo", 
            id_pesate: result.insertId 
        });
    } catch (error) {
        console.error("Errore nel controller pesate (create):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

// PUT: Modifica una pesata esistente
export const updatePesata = async (req, res) => {
    try {
        const { id } = req.params;
        const { peso_kg, data_pesata } = req.body;
        const user_id = getUserId(req);

        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }
        if (peso_kg === undefined) {
            return res.status(400).json({ message: "Il campo peso_kg è obbligatorio per la modifica." });
        }

        const result = await PesateModel.updatePesata(id, user_id, peso_kg, data_pesata);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Pesata non trovata o non autorizzata" });
        }
        res.status(200).json({ message: "Pesata aggiornata con successo" });
    } catch (error) {
        console.error("Errore nel controller pesate (update):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

// DELETE: Elimina una pesata
export const deletePesata = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = getUserId(req);

        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }

        const result = await PesateModel.deletePesata(id, user_id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Pesata non trovata o non autorizzata" });
        }
        res.status(200).json({ message: "Pesata eliminata con successo" });
    } catch (error) {
        console.error("Errore nel controller pesate (delete):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

export default {
    getAllPesateByBambino,
    createPesata,
    updatePesata,
    deletePesata
};
