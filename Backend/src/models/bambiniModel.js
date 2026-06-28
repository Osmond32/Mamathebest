import bdd from '../config/db.js';

export const getAllBambiniByUser = async (user_id) => {
    const query = `
        SELECT id_bambini, user_id, nome, data_di_nascita 
        FROM bambini 
        WHERE user_id = ? 
        ORDER BY nome ASC;
    `;
    const [rows] = await bdd.query(query, [user_id]);
    return rows;
};

// Aggiunto controllo user_id per sicurezza
export const getBambinoById = async (id, user_id) => {
    const query = `
        SELECT id_bambini, user_id, nome, data_di_nascita 
        FROM bambini 
        WHERE id_bambini = ? AND user_id = ?;
    `;
    const [rows] = await bdd.query(query, [id, user_id]);
    return rows[0] || null;
};

export const createBambino = async (user_id, nome, data_di_nascita) => {
    const query = `
        INSERT INTO bambini (user_id, nome, data_di_nascita)
        VALUES (?, ?, ?);
    `;
    const [result] = await bdd.query(query, [user_id, nome, data_di_nascita]);
    return result;
};

// Aggiunto controllo user_id
export const updateBambino = async (id, user_id, nome, data_di_nascita) => {
    const query = `
        UPDATE bambini 
        SET nome = ?, data_di_nascita = ? 
        WHERE id_bambini = ? AND user_id = ?;
    `;
    const [result] = await bdd.query(query, [nome, data_di_nascita, id, user_id]);
    return result;
};

// Aggiunto controllo user_id
export const deleteBambino = async (id, user_id) => {
    const query = `DELETE FROM bambini WHERE id_bambini = ? AND user_id = ?;`;
    const [result] = await bdd.query(query, [id, user_id]);
    return result;
};

export default {
    getAllBambiniByUser,
    getBambinoById,
    createBambino,
    updateBambino,
    deleteBambino
};