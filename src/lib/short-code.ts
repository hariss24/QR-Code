import { customAlphabet } from "nanoid";

const gen = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);
export const generateShortCode = () => gen();
