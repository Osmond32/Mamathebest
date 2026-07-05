import bdd from '../config/db.js';

export const getAllEvacuazioniByBambino = async (bambino_id, user_id) => {
    const query = `
        SELECT e.id_evacuazioni, e.bambino_id, e.tipo, e.note, e.data_ora 
        FROM evacuazioni e
        JOIN bambini b ON e.bambino_id = b.id_bambini
        WHERE e.bambino_id = ? AND b.user_id = ? 
        ORDER BY e.data_ora DESC;
    `;
    const [rows] = await bdd.query(query, [bambino_id, user_id]);
    return rows;
};

export const createEvacuazione = async (bambino_id, user_id, tipo, note, data_ora) => {
    const checkQuery = `SELECT id_bambini FROM bambini WHERE id_bambini = ? AND user_id = ?`;
    const [bambini] = await bdd.query(checkQuery, [bambino_id, user_id]);
    
    if (bambini.length === 0) throw new Error("Accesso negato o bambino non trovato");

    if (data_ora) {
        const query = `INSERT INTO evacuazioni (bambino_id, tipo, note, data_ora) VALUES (?, ?, ?, ?);`;
        const [result] = await bdd.query(query, [bambino_id, tipo, note, data_ora]);
        return result;
    } else {
        const query = `INSERT INTO evacuazioni (bambino_id, tipo, note) VALUES (?, ?, ?);`;
        const [result] = await bdd.query(query, [bambino_id, tipo, note]);
        return result;
    }
};

export const deleteEvacuazione = async (id, user_id) => {
    const query = `
        DELETE e FROM evacuazioni e
        JOIN bambini b ON e.bambino_id = b.id_bambini
        WHERE e.id_evacuazioni = ? AND b.user_id = ?;
    `;
    const [result] = await bdd.query(query, [id, user_id]);
    return result;
};

export default {
    getAllEvacuazioniByBambino,
    createEvacuazione,
    deleteEvacuazione
};
