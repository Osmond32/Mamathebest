import express from 'express';
import evacuazioniController from '../controllers/evacuazioniController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/:bambino_id', evacuazioniController.getAllEvacuazioniByBambino);
router.post('/', evacuazioniController.createEvacuazione);
router.delete('/:id', evacuazioniController.deleteEvacuazione);

export default router;
