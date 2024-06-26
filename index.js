import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./swagger/swaggerOptions.js";
import routes from "./routes/index.js";
import { startTelegramBot } from "./telegram/index.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// Telegram botunu başlat
startTelegramBot();
// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Routes
app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
