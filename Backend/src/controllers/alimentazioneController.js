import AlimentazioneModel from '../models/alimentazioneModel.js';

const getUserId = (req) => {
    return req.auth?.userId || req.user?.id || req.headers['x-user-id'] || req.body.user_id || req.query.user_id;
};

// GET: Recupera tutte le registrazioni per un determinato bambino
export const getAllAlimentazioneByBambino = async (req, res) => {
    try {
        const { bambino_id } = req.params;
        const user_id = getUserId(req);
        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }
        const data = await AlimentazioneModel.getAllAlimentazioneByBambino(bambino_id, user_id);
        res.status(200).json(data);
    } catch (error) {
        console.error("Errore nel controller alimentazione (getAll):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

// POST: Crea un nuovo record di alimentazione
export const createAlimentazione = async (req, res) => {
    try {
        const { bambino_id, latte_ml, tipo_cibo, note, data_ora } = req.body;
        const user_id = getUserId(req);

        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }
        if (!bambino_id) {
            return res.status(400).json({ message: "Il bambino_id è obbligatorio." });
        }

        const result = await AlimentazioneModel.createAlimentazione(bambino_id, user_id, latte_ml, tipo_cibo, note, data_ora);
        res.status(201).json({ 
            message: "Record creato con successo", 
            id_alimentazione: result.insertId 
        });
    } catch (error) {
        console.error("Errore nel controller alimentazione (create):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

// PUT: Aggiorna un record esistente
export const updateAlimentazione = async (req, res) => {
    try {
        const { id } = req.params;
        const { latte_ml, tipo_cibo, note, data_ora } = req.body;
        const user_id = getUserId(req);

        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }

        const result = await AlimentazioneModel.updateAlimentazione(id, user_id, latte_ml, tipo_cibo, note, data_ora);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Record non trovato o non autorizzato" });
        }
        res.status(200).json({ message: "Record aggiornato con successo" });
    } catch (error) {
        console.error("Errore nel controller alimentazione (update):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

// DELETE: Elimina un record
export const deleteAlimentazione = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = getUserId(req);

        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }

        const result = await AlimentazioneModel.deleteAlimentazione(id, user_id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Record non trovato o non autorizzato" });
        }
        res.status(200).json({ message: "Record eliminato con successo" });
    } catch (error) {
        console.error("Errore nel controller alimentazione (delete):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

export default {
    getAllAlimentazioneByBambino,
    createAlimentazione,
    updateAlimentazione,
    deleteAlimentazione
};