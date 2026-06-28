import bdd from '../config/db.js';

// Calcola la somma del latte assunto nelle ultime 24 ore rispetto al momento attuale
export const getTotaleLatte24h = async (bambino_id) => {
    const query = `
        SELECT COALESCE(SUM(latte_ml), 0) AS totale_24h 
        FROM alimentazione 
        WHERE bambino_id = ? 
          AND data_ora >= NOW() - INTERVAL 1 DAY;
    `;
    const [rows] = await bdd.query(query, [bambino_id]);
    return Number(rows[0].totale_24h);
};

// Calcola le statistiche di alimentazione (latte, poppate, pappe solide) per un giorno specifico
export const getDatiAlimentazioneGiorno = async (bambino_id, data) => {
    const query = `
        SELECT 
            COALESCE(SUM(latte_ml), 0) AS totale_latte,
            COUNT(CASE WHEN latte_ml > 0 THEN 1 END) AS numero_poppate,
            COUNT(CASE WHEN (latte_ml IS NULL OR latte_ml = 0) AND tipo_cibo IS NOT NULL AND tipo_cibo != '' THEN 1 END) AS numero_pappe_solide
        FROM alimentazione 
        WHERE bambino_id = ? 
          AND DATE(data_ora) = ?;
    `;
    const [rows] = await bdd.query(query, [bambino_id, data]);
    return {
        totale_latte: Number(rows[0].totale_latte || 0),
        numero_poppate: Number(rows[0].numero_poppate || 0),
        numero_pappe_solide: Number(rows[0].numero_pappe_solide || 0)
    };
};

// Recupera lo storico delle pesate per un bambino, ordinate per data decrescente
export const getStoricoPesate = async (bambino_id) => {
    const query = `
        SELECT id_pesate, peso_kg, data_pesata 
        FROM pesate 
        WHERE bambino_id = ? 
        ORDER BY data_pesata DESC;
    `;
    const [rows] = await bdd.query(query, [bambino_id]);
    return rows.map(r => ({
        id_pesate: r.id_pesate,
        peso_kg: Number(r.peso_kg),
        data_pesata: r.data_pesata
    }));
};

export default {
    getTotaleLatte24h,
    getDatiAlimentazioneGiorno,
    getStoricoPesate
};
