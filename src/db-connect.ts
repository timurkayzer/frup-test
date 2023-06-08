import { configDotenv } from "dotenv";
import getenv from "getenv";
import mongoose from "mongoose";

configDotenv();
const DB_URI = getenv("DB_URI");

export async function dbConnect(): Promise<void> {
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to DB");
  } catch (e) {
    throw new Error("Error connecting to DB," + e?.toString());
  }
}
