import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// SPEC 17. Every table created in public must enable row level security in the migrations.
// Matches `create table` with or without `if not exists`, with or without quotes, with or without the schema.
const CREATE_TABLE =
  /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:"?public"?\.)?"?([a-z_][a-z0-9_]*)"?/gi;

function stripComments(sql: string): string {
  return sql.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

function tablesWithoutRls(sql: string): string[] {
  const clean = stripComments(sql);
  const created = [...clean.matchAll(CREATE_TABLE)].map((m) => m[1].toLowerCase());
  return [...new Set(created)].filter((name) => {
    const enable = new RegExp(
      `alter\\s+table\\s+(?:if\\s+exists\\s+)?(?:only\\s+)?(?:"?public"?\\.)?"?${name}"?\\s+enable\\s+row\\s+level\\s+security`,
      "i",
    );
    return !enable.test(clean);
  });
}

describe("tablesWithoutRls", () => {
  it("flags a public table created without enable row level security", () => {
    expect(tablesWithoutRls("create table public.leaky (id int);")).toEqual(["leaky"]);
  });

  it("flags the table when only another table enables RLS", () => {
    const sql = `
      create table public.a (id int);
      create table public.b (id int);
      alter table public.a enable row level security;`;
    expect(tablesWithoutRls(sql)).toEqual(["b"]);
  });

  it("accepts a table that enables RLS, in any spelling", () => {
    const sql = `
      create table if not exists "public"."a" (id int);
      ALTER TABLE ONLY public.a ENABLE ROW LEVEL SECURITY;`;
    expect(tablesWithoutRls(sql)).toEqual([]);
  });

  it("ignores a create table that sits in a comment", () => {
    expect(tablesWithoutRls("-- create table public.ghost (id int);")).toEqual([]);
  });
});

describe("supabase/migrations", () => {
  const dir = join(process.cwd(), "supabase", "migrations");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql"));

  it("finds the migrations", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("enables row level security on every table created in public", () => {
    const sql = files.map((f) => readFileSync(join(dir, f), "utf8")).join("\n");
    expect(tablesWithoutRls(sql)).toEqual([]);
  });
});
