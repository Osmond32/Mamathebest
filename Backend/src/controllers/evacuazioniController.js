import EvacuazioniModel from '../models/evacuazioniModel.js';

const getUserId = (req) => {
    return req.auth?.userId || req.user?.id || req.headers['x-user-id'] || req.body.user_id || req.query.user_id;
};

export const getAllEvacuazioniByBambino = async (req, res) => {
    try {
        const { bambino_id } = req.params;
        const user_id = getUserId(req);
        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }
        const data = await EvacuazioniModel.getAllEvacuazioniByBambino(bambino_id, user_id);
        res.status(200).json(data);
    } catch (error) {
        console.error("Errore nel controller evacuazioni (getAll):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

export const createEvacuazione = async (req, res) => {
    try {
        const { bambino_id, tipo, note, data_ora } = req.body;
        const user_id = getUserId(req);

        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }
        if (!bambino_id || !tipo) {
            return res.status(400).json({ message: "I campi bambino_id e tipo sono obbligatori." });
        }

        const result = await EvacuazioniModel.createEvacuazione(bambino_id, user_id, tipo, note, data_ora);
        res.status(201).json({ 
            message: "Evacuazione registrata con successo", 
            id_evacuazioni: result.insertId 
        });
    } catch (error) {
        console.error("Errore nel controller evacuazioni (create):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

export const deleteEvacuazione = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = getUserId(req);

        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }

        const result = await EvacuazioniModel.deleteEvacuazione(id, user_id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Evacuazione non trovata o non autorizzata" });
        }
        res.status(200).json({ message: "Evacuazione eliminata con successo" });
    } catch (error) {
        console.error("Errore nel controller evacuazioni (delete):", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

export default {
    getAllEvacuazioniByBambino,
    createEvacuazione,
    deleteEvacuazione
};
