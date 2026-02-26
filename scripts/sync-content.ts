import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { CONTENT_REPO } from "../consts.ts";

const ROOT = resolve(import.meta.dirname, "..");
const CONTENT_DIR = resolve(ROOT, "src/content");
const COLLECTIONS = ["blog", "moments"];

// CMS 配置
const CMS_TEMPLATE = resolve(ROOT, "public/admin/config.template.yml");
const CMS_OUTPUT = resolve(ROOT, "public/admin/config.yml");

function run(cmd: string) {
  console.log(`[sync-content] $ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
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

/** 检查 submodule 是否已注册 */
function isSubmoduleRegistered(): boolean {
  try {
    const output = execSync("git config --file .gitmodules --list", {
      cwd: ROOT,
      encoding: "utf-8",
    });
    return output.includes("submodule.src/content.");
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

  if (CONTENT_REPO.enabled && CONTENT_REPO.repo) {
    template = template.replace("__CONTENT_REPO__", CONTENT_REPO.repo);
    template = template.replace("__CONTENT_BRANCH__", CONTENT_REPO.branch);
  } else {
    // 默认指向主仓库
    template = template.replace("__CONTENT_REPO__", "0nikod/paperair");
    template = template.replace("__CONTENT_BRANCH__", "master");
  }

  writeFileSync(CMS_OUTPUT, template, "utf-8");
  console.log("[sync-content] 已生成 CMS 配置: public/admin/config.yml");
}

// ---- 主逻辑 ----

ensureContentDirs();
generateCmsConfig();

if (!CONTENT_REPO.enabled) {
  console.log("[sync-content] CONTENT_REPO 未启用，使用本地内容");
  process.exit(0);
}

if (!CONTENT_REPO.url) {
  console.error("[sync-content] CONTENT_REPO.enabled 为 true，但 url 为空");
  process.exit(1);
}

if (isSubmoduleRegistered()) {
  console.log("[sync-content] 更新 submodule...");
  run("git submodule update --init --remote src/content");
} else {
  console.log("[sync-content] 注册 submodule...");
  run(
    `git submodule add -b ${CONTENT_REPO.branch} ${CONTENT_REPO.url} src/content`,
  );
}

console.log("[sync-content] 完成");
