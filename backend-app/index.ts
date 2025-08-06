import express from "express";
import axios from "axios";
import { JSDOM } from "jsdom";
import cors from "cors";
import { amazonScraperRouter } from "./src/routes/amazon_scraper";

const app = express();
const PORT = 3333;



app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

app.use(cors());
app.use(express.json());
app.use('/api', amazonScraperRouter);
