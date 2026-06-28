import StatisticheModel from '../models/statisticheModel.js';
import BambiniModel from '../models/bambiniModel.js';

const getUserId = (req) => {
    return req.auth?.userId || req.user?.id || req.headers['x-user-id'] || req.body.user_id || req.query.user_id;
};

export const getBambinoStatistiche = async (req, res) => {
    try {
        const { bambino_id } = req.params;
        const user_id = getUserId(req);

        if (!user_id) {
            return res.status(401).json({ message: "Non autorizzato. ID utente mancante." });
        }

        // 1. Verifica che il bambino appartenga all'utente
        const bambino = await BambiniModel.getBambinoById(bambino_id, user_id);
        if (!bambino) {
            return res.status(404).json({ message: "Bambino non trovato o non associato a questo account." });
        }

        // 2. Recupera la data specificata o usa oggi
        const dataSelezionata = req.query.data || new Date().toISOString().split('T')[0];

        // 3. Esegui le query del modello
        const totaleLatte24h = await StatisticheModel.getTotaleLatte24h(bambino_id);
        const datiGiorno = await StatisticheModel.getDatiAlimentazioneGiorno(bambino_id, dataSelezionata);
        const storicoPesate = await StatisticheModel.getStoricoPesate(bambino_id);

        // 4. Elabora la differenza di peso settimana su settimana
        let pesoAttuale = null;
        let differenzaSettimanale = null;

        if (storicoPesate.length > 0) {
            const latest = storicoPesate[0];
            pesoAttuale = latest.peso_kg;

            const latestTime = new Date(latest.data_pesata).getTime();
            const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

            let closestPrevious = null;
            let smallestDiff = Infinity;

            for (let i = 1; i < storicoPesate.length; i++) {
                const prevTime = new Date(storicoPesate[i].data_pesata).getTime();
                const elapsed = latestTime - prevTime;

                // Calcola la distanza temporale ideale da 7 giorni (oneWeekMs)
                const diffFromOneWeek = Math.abs(elapsed - oneWeekMs);

                // Consideriamo valide solo pesate avvenute da almeno 4 giorni
                if (elapsed >= 4 * 24 * 60 * 60 * 1000) {
                    if (diffFromOneWeek < smallestDiff) {
                        smallestDiff = diffFromOneWeek;
                        closestPrevious = storicoPesate[i];
                    }
                }
            }

            if (closestPrevious) {
                differenzaSettimanale = Number((pesoAttuale - closestPrevious.peso_kg).toFixed(3));
            }
        }

        // 5. Restituisci le statistiche strutturate
        res.status(200).json({
            data_riferimento: dataSelezionata,
            bambino: {
                id: bambino.id_bambini,
                nome: bambino.nome
            },
            alimentazione_24h: {
                totale_latte_ml: totaleLatte24h
            },
            alimentazione_giorno: {
                totale_latte_ml: datiGiorno.totale_latte,
                numero_poppate: datiGiorno.numero_poppate,
                numero_pappe_solide: datiGiorno.numero_pappe_solide
            },
            crescita_peso: {
                peso_attuale_kg: pesoAttuale,
                differenza_settimanale_kg: differenzaSettimanale,
                storico_pesate: storicoPesate
            }
        });

    } catch (error) {
        console.error("Errore nel controller statistiche:", error);
        res.status(500).json({ message: "Errore interno del server", error: error.message });
    }
};

export default {
    getBambinoStatistiche
};
