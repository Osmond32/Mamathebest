import bdd from '../config/db.js';

export const getAllAlimentazioneByBambino = async (bambino_id, user_id) => {
    const query = `
        SELECT a.id_alimentazione, a.bambino_id, a.data_ora, a.latte_ml, a.tipo_cibo, a.note 
        FROM alimentazione a
        JOIN bambini b ON a.bambino_id = b.id_bambini
        WHERE a.bambino_id = ? AND b.user_id = ? 
        ORDER BY a.data_ora DESC;
    `;
    const [rows] = await bdd.query(query, [bambino_id, user_id]);
    return rows;
};

export const createAlimentazione = async (bambino_id, user_id, latte_ml, tipo_cibo, note, data_ora) => {
    // Verifica che il bambino appartenga all'utente prima dell'inserimento
    const checkQuery = `SELECT id_bambini FROM bambini WHERE id_bambini = ? AND user_id = ?`;
    const [bambini] = await bdd.query(checkQuery, [bambino_id, user_id]);
    
    if (bambini.length === 0) throw new Error("Accesso negato o bambino non trovato");

    if (data_ora) {
        const query = `
            INSERT INTO alimentazione (bambino_id, latte_ml, tipo_cibo, note, data_ora)
            VALUES (?, ?, ?, ?, ?);
        `;
        const [result] = await bdd.query(query, [bambino_id, latte_ml, tipo_cibo, note, data_ora]);
        return result;
    } else {
        const query = `
            INSERT INTO alimentazione (bambino_id, latte_ml, tipo_cibo, note)
            VALUES (?, ?, ?, ?);
        `;
        const [result] = await bdd.query(query, [bambino_id, latte_ml, tipo_cibo, note]);
        return result;
    }
};

export const updateAlimentazione = async (id, user_id, latte_ml, tipo_cibo, note, data_ora) => {
    if (data_ora) {
        const query = `
            UPDATE alimentazione a
            JOIN bambini b ON a.bambino_id = b.id_bambini
            SET a.latte_ml = ?, a.tipo_cibo = ?, a.note = ?, a.data_ora = ? 
            WHERE a.id_alimentazione = ? AND b.user_id = ?;
        `;
        const [result] = await bdd.query(query, [latte_ml, tipo_cibo, note, data_ora, id, user_id]);
        return result;
    } else {
        const query = `
            UPDATE alimentazione a
            JOIN bambini b ON a.bambino_id = b.id_bambini
            SET a.latte_ml = ?, a.tipo_cibo = ?, a.note = ? 
            WHERE a.id_alimentazione = ? AND b.user_id = ?;
        `;
        const [result] = await bdd.query(query, [latte_ml, tipo_cibo, note, id, user_id]);
        return result;
    }
};

export const deleteAlimentazione = async (id, user_id) => {
    const query = `
        DELETE a FROM alimentazione a
        JOIN bambini b ON a.bambino_id = b.id_bambini
        WHERE a.id_alimentazione = ? AND b.user_id = ?;
    `;
    const [result] = await bdd.query(query, [id, user_id]);
    return result;
};

export default {
    getAllAlimentazioneByBambino,
    createAlimentazione,
    updateAlimentazione,
    deleteAlimentazione
};