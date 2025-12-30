// server/routes/priceAlertRoutes.js
import express from 'express';
import {
  createPriceAlert,
  getUserPriceAlerts,
  getPriceAlert,
  updatePriceAlert,
  deletePriceAlert,
  togglePriceAlert,
} from '../controllers/priceAlertController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate, priceAlertSchema } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @swagger
 * /price-alerts:
 *   post:
 *     summary: Create a price alert
 *     description: Create a new price alert for a flight route
 *     tags: [Price Alerts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - route
 *               - targetPrice
 *             properties:
 *               route:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                   to:
 *                     type: string
 *                   departureDate:
 *                     type: string
 *                   returnDate:
 *                     type: string
 *               targetPrice:
 *                 type: number
 *               travelClass:
 *                 type: string
 *               passengers:
 *                 type: object
 *               frequency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Price alert created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', validate(priceAlertSchema), createPriceAlert);

/**
 * @swagger
 * /price-alerts:
 *   get:
 *     summary: Get user's price alerts
 *     description: Retrieve all price alerts for the authenticated user
 *     tags: [Price Alerts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of price alerts
 *       401:
 *         description: Unauthorized
 */
router.get('/', getUserPriceAlerts);

/**
 * @swagger
 * /price-alerts/{id}:
 *   get:
 *     summary: Get a specific price alert
 *     tags: [Price Alerts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Price alert details
 *       404:
 *         description: Alert not found
 */
router.get('/:id', getPriceAlert);

/**
 * @swagger
 * /price-alerts/{id}:
 *   put:
 *     summary: Update a price alert
 *     tags: [Price Alerts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Alert updated
 *       404:
 *         description: Alert not found
 */
router.put('/:id', updatePriceAlert);

/**
 * @swagger
 * /price-alerts/{id}:
 *   delete:
 *     summary: Delete a price alert
 *     tags: [Price Alerts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert deleted
 *       404:
 *         description: Alert not found
 */
router.delete('/:id', deletePriceAlert);

/**
 * @swagger
 * /price-alerts/{id}/toggle:
 *   patch:
 *     summary: Toggle price alert active status
 *     tags: [Price Alerts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert status toggled
 *       404:
 *         description: Alert not found
 */
router.patch('/:id/toggle', togglePriceAlert);

export default router;
