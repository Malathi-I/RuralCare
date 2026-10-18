import HealthcareCenter from '../models/HealthcareCenter.js';
import { safeContainsRegExp } from '../utils/schedule.js';

/**
 * GET /api/healthcare-centers
 * Public, read-only list with optional location filter.
 */
export const listCenters = async (req, res, next) => {
  try {
    const { location } = req.query;

    const filter = {};
    if (location) filter.location = safeContainsRegExp(location);

    const centers = await HealthcareCenter.find(filter).sort({ name: 1 });

    return res.json({ count: centers.length, centers });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/healthcare-centers/:id
 * Public, read-only single center.
 */
export const getCenterById = async (req, res, next) => {
  try {
    const center = await HealthcareCenter.findById(req.params.id);

    if (!center) {
      return res.status(404).json({ message: 'Healthcare center not found' });
    }

    return res.json({ center });
  } catch (error) {
    return next(error);
  }
};
