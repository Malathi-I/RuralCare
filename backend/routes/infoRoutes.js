import { Router } from 'express';
import { listInformation, getInformationById } from '../controllers/infoController.js';

const router = Router();

// Public read-only
router.get('/', listInformation);
router.get('/:id', getInformationById);

export default router;
