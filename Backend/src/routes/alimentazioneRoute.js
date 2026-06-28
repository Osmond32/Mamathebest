import express from 'express';
import alimentazioneController from '../controllers/alimentazioneController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/:bambino_id', alimentazioneController.getAllAlimentazioneByBambino);
router.post('/', alimentazioneController.createAlimentazione);
router.put('/:id', alimentazioneController.updateAlimentazione);
router.delete('/:id', alimentazioneController.deleteAlimentazione);

export default router;