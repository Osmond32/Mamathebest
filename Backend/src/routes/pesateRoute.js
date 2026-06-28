import express from 'express';
import pesateController from '../controllers/pesateController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/:bambino_id', pesateController.getAllPesateByBambino);
router.post('/', pesateController.createPesata);
router.put('/:id', pesateController.updatePesata);
router.delete('/:id', pesateController.deletePesata);

export default router;
