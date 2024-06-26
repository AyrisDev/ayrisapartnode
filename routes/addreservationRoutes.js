import express from "express";
import { addReservationToNotion } from "../utils/addReservationToNotion.js";

const router = express.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the person
 *         phone:
 *           type: string
 *           description: The phone number of the person
 *       example:
 *         name: John Doe
 *         phone: "123456789"
 */

/**
 * @swagger
 * /reservations/add:
 *   post:
 *     summary: Add a new reservation
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reservation'
 *     responses:
 *       200:
 *         description: The reservation was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reservationId:
 *                   type: string
 *       500:
 *         description: Some server error
 */
router.post("/add", async (req, res) => {
  const data = req.body;
  try {
    const reservationId = await addReservationToNotion(
      data,
      process.env.NOTION_API_KEY,
      process.env.MAIN_DATABASE_ID
    );
    res.json({ reservationId });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

export default router;
