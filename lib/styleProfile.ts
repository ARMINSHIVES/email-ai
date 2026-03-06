import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PROFILE_PATH = path.join(DATA_DIR, "style-profile.json");

export interface WritingSample {
  id: string;
  name: string;
  text: string;
  addedAt: string;
}

export interface StyleProfile {
  samples: WritingSample[];
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadProfile(): StyleProfile {
  ensureDataDir();
  if (!fs.existsSync(PROFILE_PATH)) {
    return { samples: [] };
  }
  return JSON.parse(fs.readFileSync(PROFILE_PATH, "utf-8"));
}

export function saveProfile(profile: StyleProfile) {
  ensureDataDir();
  fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2));
}

export function addSample(name: string, text: string): WritingSample {
  const profile = loadProfile();
  const sample: WritingSample = {
    id: Date.now().toString(),
    name,
    text,
    addedAt: new Date().toISOString(),
  };
  profile.samples.push(sample);
  saveProfile(profile);
  return sample;
}

export function deleteSample(id: string) {
  const profile = loadProfile();
  profile.samples = profile.samples.filter((s) => s.id !== id);
  saveProfile(profile);
}

export function getSamplesText(): string {
  const profile = loadProfile();
  return profile.samples.map((s) => s.text).join("\n\n---\n\n");
}
