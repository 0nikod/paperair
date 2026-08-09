import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { relative, resolve } from "node:path";
import { CONTENT_REPO, SITE_BRANCH, SITE_REPO } from "../config/deployment.ts";

const ROOT = resolve(import.meta.dirname, "..");
const CONTENT_DIR = resolve(ROOT, "src/content");
const COLLECTIONS = ["blog", "moments"];
const IS_PRODUCTION = process.argv.includes("--prod");

// CMS 配置
const CMS_TEMPLATE = resolve(ROOT, "public/admin/config.template.yml");
const CMS_OUTPUT = resolve(ROOT, "public/admin/config.yml");

function run(command: string, args: string[], capture = false): string {
  console.log(`[sync-content] $ ${command} ${args.join(" ")}`);
  return (
    execFileSync(command, args, {
      cwd: ROOT,
      encoding: capture ? "utf-8" : undefined,
      stdio: capture ? ["ignore", "pipe", "ignore"] : "inherit",
    }) ?? ""
  ).toString();
}

function isGitRepository(): boolean {
  try {
    run("git", ["rev-parse", "--is-inside-work-tree"], true);
    return true;
  } catch {
    return false;
  }
}

/** 确保内容子目录存在（即使为空也不影响 glob loader） */
function ensureContentDirs() {
  for (const name of COLLECTIONS) {
    const dir = resolve(CONTENT_DIR, name);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`[sync-content] 已创建空目录: src/content/${name}`);
    }
  }
}

/**
 * 在 YAML loader 转换日期前检查原始 frontmatter。
 * 这样可以阻止无时区时间先被解析成 Date 后绕过 schema 的字符串校验。
 */
function validateContentDates() {
  const errors: string[] = [];
  const timezoneSuffixPattern = /(?:Z|[+-]\d{2}:?\d{2})$/i;

  /** 提取简单 YAML 标量，同时保留引号内的 # 并忽略未加引号的行尾注释。 */
  function parseYamlScalar(source: string): string {
    const value = source.trim();
    const quote = value[0];
    if (quote === '"' || quote === "'") {
      const end = value.lastIndexOf(quote);
      return end > 0 ? value.slice(1, end) : value;
    }
    return value.replace(/\s+#.*$/, "").trim();
  }

  function visit(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        visit(path);
        continue;
      }
      if (!entry.isFile() || !/\.mdx?$/.test(entry.name)) continue;

      const source = readFileSync(path, "utf-8").replace(/^\uFEFF/, "");
      const frontmatter = source.match(
        /^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/,
      )?.[1];
      const file = relative(ROOT, path);
      if (!frontmatter) {
        errors.push(`${file}: 未找到有效的 YAML frontmatter`);
        continue;
      }

      for (const match of frontmatter.matchAll(
        /^(pubDate|updatedDate):\s*(.*?)\s*$/gm,
      )) {
        const field = match[1];
        const rawValue = match[2]?.trim();
        if (!field || !rawValue) continue;

        const value = parseYamlScalar(rawValue);
        if (!timezoneSuffixPattern.test(value)) {
          errors.push(`${file}: ${field} 必须包含 Z 或数字时区偏移`);
          continue;
        }
        if (Number.isNaN(new Date(value).valueOf())) {
          errors.push(`${file}: ${field} 不是有效日期`);
        }
      }
    }
  }

  visit(CONTENT_DIR);
  if (errors.length > 0) {
    throw new Error(`内容日期校验失败：\n- ${errors.join("\n- ")}`);
  }
}

/** 检查 submodule 是否已注册 */
function isSubmoduleRegistered(): boolean {
  if (!existsSync(resolve(ROOT, ".gitmodules"))) return false;

  try {
    const output = run(
      "git",
      [
        "config",
        "--file",
        ".gitmodules",
        "--get",
        "submodule.src/content.path",
      ],
      true,
    );
    return output.trim() === "src/content";
  } catch {
    return false;
  }
}

/** 根据配置生成 CMS config.yml */
function generateCmsConfig() {
  if (!existsSync(CMS_TEMPLATE)) {
    console.log("[sync-content] 未找到 CMS 模板文件，跳过配置生成");
    return;
  }

  let template = readFileSync(CMS_TEMPLATE, "utf-8");
  const cmsRepo = CONTENT_REPO.enabled ? CONTENT_REPO.repo : SITE_REPO;
  const cmsBranch = CONTENT_REPO.enabled ? CONTENT_REPO.branch : SITE_BRANCH;

  if (!cmsRepo) {
    throw new Error(
      "CMS 仓库为空：请设置 CMS_REPO，或在启用外部内容仓库时设置 CONTENT_REPO_NAME。",
    );
  }

  template = template.replace("__CONTENT_REPO__", cmsRepo);
  template = template.replace("__CONTENT_BRANCH__", cmsBranch);
  template = template.replace("__LOCAL_BACKEND__", (!IS_PRODUCTION).toString());

  const datetimeWidgetCount =
    template.match(/widget:\s*"datetime"/g)?.length ?? 0;
  const localPickerCount = template.match(/picker_utc:\s*false/g)?.length ?? 0;
  if (datetimeWidgetCount === 0 || datetimeWidgetCount !== localPickerCount) {
    throw new Error(
      "每个 CMS datetime 字段都必须显式配置 picker_utc: false，以使用编辑者浏览器本地时区",
    );
  }
  if (IS_PRODUCTION && !template.includes("local_backend: false")) {
    throw new Error("生产 CMS 配置不能启用 local_backend");
  }

  writeFileSync(CMS_OUTPUT, template, "utf-8");
  console.log(
    `[sync-content] 已生成 ${IS_PRODUCTION ? "生产" : "本地"} CMS 配置: public/admin/config.yml`,
  );
}

// ---- 主逻辑 ----

generateCmsConfig();

if (!CONTENT_REPO.enabled) {
  ensureContentDirs();
  validateContentDates();
  console.log("[sync-content] CONTENT_REPO 未启用，使用本地内容");
  process.exit(0);
}

if (!CONTENT_REPO.url || !CONTENT_REPO.repo) {
  console.error(
    "[sync-content] 外部内容仓库已启用，但 CONTENT_REPO_URL 或 CONTENT_REPO_NAME 为空",
  );
  process.exit(1);
}

if (!isGitRepository()) {
  console.error(
    "[sync-content] 外部内容仓库需要 Git 工作区；当前构建环境不是 Git 仓库",
  );
  process.exit(1);
}

if (isSubmoduleRegistered()) {
  console.log(
    `[sync-content] ${IS_PRODUCTION ? "初始化固定版本" : "更新远端版本"} submodule...`,
  );
  const args = ["submodule", "update", "--init"];
  if (!IS_PRODUCTION) args.push("--remote");
  args.push("src/content");
  run("git", args);
} else if (IS_PRODUCTION) {
  console.error(
    "[sync-content] 生产构建要求 src/content 已作为 submodule 提交；请先在本地注册并提交 .gitmodules 与 gitlink",
  );
  process.exit(1);
} else {
  console.log("[sync-content] 注册 submodule...");
  run("git", [
    "submodule",
    "add",
    "-b",
    CONTENT_REPO.branch,
    CONTENT_REPO.url,
    "src/content",
  ]);
}

ensureContentDirs();
validateContentDates();
console.log("[sync-content] 完成");
