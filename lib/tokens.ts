import fs from "fs";
import path from "path";

const TOKENS_PATH = path.join(process.cwd(), "data", "tokens.json");

export interface TokenStore {
  gmail?: {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
    email?: string;
  };
  outlook?: {
    access_token: string;
    refresh_token?: string;
    expires_at: number;
    email?: string;
  };
}

function ensureDataDir() {
  const dir = path.dirname(TOKENS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadTokens(): TokenStore {
  ensureDataDir();
  if (!fs.existsSync(TOKENS_PATH)) return {};
  return JSON.parse(fs.readFileSync(TOKENS_PATH, "utf-8"));
}

export function saveTokens(tokens: TokenStore) {
  ensureDataDir();
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
}

export function updateGmailTokens(
  tokens: TokenStore["gmail"]
) {
  const store = loadTokens();
  store.gmail = tokens;
  saveTokens(store);
}

export function updateOutlookTokens(tokens: TokenStore["outlook"]) {
  const store = loadTokens();
  store.outlook = tokens;
  saveTokens(store);
}
