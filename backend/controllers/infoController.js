import HealthInformation from '../models/HealthInformation.js';
import { safeContainsRegExp } from '../utils/schedule.js';

/**
 * GET /api/health-information
 * Public, read-only list. Content is safe to cache for offline reading,
 * so the response is kept small and supports an optional language filter.
 */
export const listInformation = async (req, res, next) => {
  try {
    const { language, category } = req.query;

    const filter = {};
    if (language) filter.language = language;
    if (category) filter.category = safeContainsRegExp(category);

    const items = await HealthInformation.find(filter)
      .sort({ createdAt: -1 })
      .select('-__v');

    return res.json({ count: items.length, items });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/health-information/:id
 * Public, read-only single article.
 */
export const getInformationById = async (req, res, next) => {
  try {
    const item = await HealthInformation.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Health information not found' });
    }

    return res.json({ item });
  } catch (error) {
    return next(error);
  }
};
