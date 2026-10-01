import { Router } from 'express';
import { listCenters, getCenterById } from '../controllers/centerController.js';

const router = Router();

// Public read-only
router.get('/', listCenters);
router.get('/:id', getCenterById);

export default router;
