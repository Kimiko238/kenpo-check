import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_RULE_CONFIG, parseRuleConfigJson } from "../../lib/kenpo-rules";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_PATH = path.join(DATA_DIR, "kenpo-rule-config.json");

async function readSharedConfig() {
  try {
    const stored = await readFile(CONFIG_PATH, "utf8");
    return parseRuleConfigJson(stored);
  } catch {
    return DEFAULT_RULE_CONFIG;
  }
}

async function writeSharedConfig(rawValue: string) {
  const parsed = parseRuleConfigJson(rawValue);
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(parsed, null, 2), "utf8");
  return parsed;
}

export async function GET() {
  const config = await readSharedConfig();
  return Response.json(config);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as unknown;
  const serialized = JSON.stringify(body);
  const config = await writeSharedConfig(serialized);
  return Response.json(config);
}

export async function DELETE() {
  try {
    await unlink(CONFIG_PATH);
  } catch {
    // 標準設定へ戻すだけなので、削除対象がなくても問題ありません。
  }

  return Response.json(DEFAULT_RULE_CONFIG);
}
