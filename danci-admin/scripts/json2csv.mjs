import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const defaultInput = join(dirname(fileURLToPath(import.meta.url)), "../temp/PEPXiaoXue3_1.json");
const inputPath = resolve(process.argv[2] || defaultInput);

// 兼容多种格式：标准 JSON（对象或数组）、逗号分隔的多个对象、纯换行分隔的多个对象
function parseRecords(text) {
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // 忽略，使用括号配对方式提取顶层对象
  }

  const records = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;
  let lineNumber = 1;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === "\n") lineNumber += 1;

    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        try {
          records.push(JSON.parse(text.slice(start, i + 1)));
        } catch {
          console.warn(`跳过无法解析的对象（结束于第 ${lineNumber} 行）`);
        }
        start = -1;
      }
    }
  }

  return records;
}

const escapeCsv = (value) => `"${String(value).replaceAll('"', '""')}"`;

const text = readFileSync(inputPath, "utf8");
const records = parseRecords(text);
if (!records.length) {
  console.error("没有解析到任何记录");
  process.exit(1);
}

const header = ["wordRank", "headWord", "content", "bookId"];
const rows = records.map(record => [
  record.wordRank,
  record.headWord,
  JSON.stringify(record.content ?? null),
  record.bookId,
].map(escapeCsv).join(","));

const csv = "\uFEFF" + [header.map(escapeCsv).join(","), ...rows].join("\r\n");
const outputPath = join(dirname(inputPath), `${resolve(inputPath).split(/[\\/]/).pop().replace(/\.json$/i, "")}.csv`);

writeFileSync(outputPath, csv, "utf8");
console.log(`共转换 ${records.length} 条记录`);
console.log(`已保存到 ${outputPath}`);
