import express from 'express';
import bambiniController from '../controllers/bambiniController.js';
import statisticheController from '../controllers/statisticheController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', bambiniController.getAllBambiniByUser);
router.get('/:bambino_id/statistiche', statisticheController.getBambinoStatistiche);
router.get('/:id', bambiniController.getBambinoById);
router.post('/', bambiniController.createBambino);
router.put('/:id', bambiniController.updateBambino);
router.delete('/:id', bambiniController.deleteBambino);

export default router;
