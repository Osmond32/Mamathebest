import bdd from '../config/db.js';

// JOIN per verificare che il bambino appartenga all'user_id
export const getAllPesateByBambino = async (bambino_id, user_id) => {
    const query = `
        SELECT p.id_pesate, p.bambino_id, p.peso_kg, p.data_pesata 
        FROM pesate p
        JOIN bambini b ON p.bambino_id = b.id_bambini
        WHERE p.bambino_id = ? AND b.user_id = ? 
        ORDER BY p.data_pesata DESC;
    `;
    const [rows] = await bdd.query(query, [bambino_id, user_id]);
    return rows;
};

export const createPesata = async (bambino_id, user_id, peso_kg, data_pesata) => {
    // Prima verifichiamo che il bambino appartenga davvero all'utente
    const checkQuery = `SELECT id_bambini FROM bambini WHERE id_bambini = ? AND user_id = ?`;
    const [bambini] = await bdd.query(checkQuery, [bambino_id, user_id]);
    
    if (bambini.length === 0) throw new Error("Accesso negato o bambino non trovato");

    if (data_pesata) {
        const query = `INSERT INTO pesate (bambino_id, peso_kg, data_pesata) VALUES (?, ?, ?);`;
        const [result] = await bdd.query(query, [bambino_id, peso_kg, data_pesata]);
        return result;
    } else {
        const query = `INSERT INTO pesate (bambino_id, peso_kg) VALUES (?, ?);`;
        const [result] = await bdd.query(query, [bambino_id, peso_kg]);
        return result;
    }
};

export const updatePesata = async (id, user_id, peso_kg, data_pesata) => {
    // Usiamo la JOIN direttamente nell'UPDATE
    const query = data_pesata 
        ? `UPDATE pesate p JOIN bambini b ON p.bambino_id = b.id_bambini 
           SET p.peso_kg = ?, p.data_pesata = ? 
           WHERE p.id_pesate = ? AND b.user_id = ?`
        : `UPDATE pesate p JOIN bambini b ON p.bambino_id = b.id_bambini 
           SET p.peso_kg = ? 
           WHERE p.id_pesate = ? AND b.user_id = ?`;

    const params = data_pesata ? [peso_kg, data_pesata, id, user_id] : [peso_kg, id, user_id];
    const [result] = await bdd.query(query, params);
    return result;
};

export const deletePesata = async (id, user_id) => {
    const query = `
        DELETE p FROM pesate p
        JOIN bambini b ON p.bambino_id = b.id_bambini
        WHERE p.id_pesate = ? AND b.user_id = ?;
    `;
    const [result] = await bdd.query(query, [id, user_id]);
    return result;
};

export default {
    getAllPesateByBambino,
    createPesata,
    updatePesata,
    deletePesata
};