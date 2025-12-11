import express from "express";
import {
  searchFlights,
  searchAirports,
} from "../controllers/flightController.js";

const router = express.Router();

router.post("/search", searchFlights);
router.get("/airports", searchAirports);

export default router;
