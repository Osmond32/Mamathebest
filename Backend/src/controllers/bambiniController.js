import BambiniModel from '../models/bambiniModel.js';

const getUserId = (req) => {
    return req.auth?.userId || req.user?.id || req.headers['x-user-id'] || req.body.user_id || req.query.user_id;
};

// GET: Recupera tutti i bambini di un determinato utente
export const getAllBambiniByUser = async (req, res) => {
    try {
        const user_id = getUserId(req);
        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }
        const data = await BambiniModel.getAllBambiniByUser(user_id);
        res.status(200).json(data);
    } catch (error) {
        console.error("Errore nel controller bambini (getAllByUser):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

// GET: Recupera i dettagli di un singolo bambino
export const getBambinoById = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = getUserId(req);
        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }
        const data = await BambiniModel.getBambinoById(id, user_id);
        if (!data) {
            return res.status(404).json({ message: "Bambino non trovato o non autorizzato" });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error("Errore nel controller bambini (getById):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

// POST: Crea un nuovo record bambino
export const createBambino = async (req, res) => {
    try {
        const user_id = getUserId(req);
        const { nome, data_di_nascita } = req.body;
        
        if (!user_id || !nome || !data_di_nascita) {
            return res.status(400).json({ message: "I campi user_id, nome e data_di_nascita sono obbligatori." });
        }

        const result = await BambiniModel.createBambino(user_id, nome, data_di_nascita);
        res.status(201).json({ 
            message: "Bambino registrato con successo", 
            id_bambini: result.insertId 
        });
    } catch (error) {
        console.error("Errore nel controller bambini (create):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

// PUT: Aggiorna un record bambino esistente
export const updateBambino = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = getUserId(req);
        const { nome, data_di_nascita } = req.body;

        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }
        if (!nome || !data_di_nascita) {
            return res.status(400).json({ message: "I campi nome e data_di_nascita sono obbligatori per l'aggiornamento." });
        }

        const result = await BambiniModel.updateBambino(id, user_id, nome, data_di_nascita);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Bambino non trovato o non autorizzato" });
        }
        res.status(200).json({ message: "Bambino aggiornato con successo" });
    } catch (error) {
        console.error("Errore nel controller bambini (update):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

// DELETE: Elimina un record bambino
export const deleteBambino = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = getUserId(req);

        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }

        const result = await BambiniModel.deleteBambino(id, user_id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Bambino non trovato o non autorizzato" });
        }
        res.status(200).json({ message: "Bambino eliminato con successo" });
    } catch (error) {
        console.error("Errore nel controller bambini (delete):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

export default {
    getAllBambiniByUser,
    getBambinoById,
    createBambino,
    updateBambino,
    deleteBambino
};
