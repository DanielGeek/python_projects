import { describe, expect, it } from "vitest";
import { LIMITS, validateContact, type ContactInput } from "./contact";

const valid: ContactInput = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello from the vault.",
};

describe("validateContact", () => {
  it("returns no errors for valid input", () => {
    expect(validateContact(valid)).toEqual({});
  });

  it("trims whitespace around every field", () => {
    expect(
      validateContact({
        name: "  Ada  ",
        email: "  ada@example.com  ",
        message: "  Hi  ",
      }),
    ).toEqual({});
  });

  describe("required fields", () => {
    it.each([
      ["name", "Name is required."],
      ["email", "Email is required."],
      ["message", "Message is required."],
    ] as const)("rejects an empty %s", (field, error) => {
      expect(validateContact({ ...valid, [field]: "" })).toEqual({ [field]: error });
    });

    it.each(["name", "email", "message"] as const)("rejects a whitespace-only %s", (field) => {
      expect(validateContact({ ...valid, [field]: "   " })[field]).toMatch(/is required\.$/);
    });
  });

  describe("length limits", () => {
    it("accepts a name of exactly the limit and rejects one over it", () => {
      expect(validateContact({ ...valid, name: "a".repeat(LIMITS.name) })).toEqual({});
      expect(validateContact({ ...valid, name: "a".repeat(LIMITS.name + 1) })).toEqual({
        name: `Max ${LIMITS.name} characters.`,
      });
    });

    it("accepts a message of exactly the limit and rejects one over it", () => {
      expect(validateContact({ ...valid, message: "a".repeat(LIMITS.message) })).toEqual({});
      expect(validateContact({ ...valid, message: "a".repeat(LIMITS.message + 1) })).toEqual({
        message: `Max ${LIMITS.message} characters.`,
      });
    });

    it("accepts an email of exactly the limit and rejects one over it", () => {
      const domain = "@example.com";
      const atLimit = "a".repeat(LIMITS.email - domain.length) + domain;
      expect(atLimit).toHaveLength(LIMITS.email);
      expect(validateContact({ ...valid, email: atLimit })).toEqual({});
      expect(validateContact({ ...valid, email: `a${atLimit}` })).toEqual({
        email: `Max ${LIMITS.email} characters.`,
      });
    });

    it("measures length after trimming", () => {
      const padded = `  ${"a".repeat(LIMITS.name)}  `;
      expect(validateContact({ ...valid, name: padded })).toEqual({});
    });
  });

  describe("email format", () => {
    it.each(["a", "a@b", "a@b.", "@b.c", "a b@c.d", "a@b@c.d"])("rejects %j", (email) => {
      expect(validateContact({ ...valid, email })).toEqual({ email: "Enter a valid email." });
    });

    it.each(["a@b.co", "first.last+tag@sub.example.com"])("accepts %j", (email) => {
      expect(validateContact({ ...valid, email })).toEqual({});
    });
  });

  it("reports every invalid field at once", () => {
    expect(validateContact({ name: "", email: "nope", message: "" })).toEqual({
      name: "Name is required.",
      email: "Enter a valid email.",
      message: "Message is required.",
    });
  });
});
