/** Terminal colours, disabled automatically when output is piped elsewhere. */
const on = process.stdout.isTTY && !process.env.NO_COLOR;
const wrap = (code: string) => (s: string | number) => (on ? `\x1b[${code}m${s}\x1b[0m` : String(s));

export const c = {
  bold: wrap("1"),
  dim: wrap("2"),
  red: wrap("31"),
  green: wrap("32"),
  yellow: wrap("33"),
  blue: wrap("34"),
  cyan: wrap("36"),
};

export const ok = (s: string) => `${c.green("✓")} ${s}`;
export const bad = (s: string) => `${c.red("✗")} ${s}`;
export const warn = (s: string) => `${c.yellow("!")} ${s}`;
export const info = (s: string) => `${c.dim("·")} ${s}`;
