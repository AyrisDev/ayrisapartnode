import express from "express";
import checkDateRoute from "./checkDateRoute.js";
import notionDataRoute from "./notionDataRoute.js";
import personRoutes from "./personRoutes.js";
import addReservationRoute from "./addreservationRoutes.js";
import roomRoutes from "./roomRoutes.js";
import checkInDataRoute from "./checkInDataRoute.js";
import oksanaRoute from "./oksanaRoute.js";
import addPersonRoute from "./addPersonRoute.js";
import expenseRoutes from "./expenseRoutes.js";
const router = express.Router();

router.use("/checkdate", checkDateRoute);
router.use("/notion-data", notionDataRoute);
router.use("/persons", personRoutes);
router.use("/reservations", addReservationRoute);
router.use("/rooms", roomRoutes);
router.use("/check-in-data", checkInDataRoute);
router.use("/oksana", oksanaRoute);
router.use("/addPerson", addPersonRoute);
router.use("/expenses", expenseRoutes); // Add expense routes

export default router;
