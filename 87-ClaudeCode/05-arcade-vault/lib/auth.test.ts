import { describe, expect, it } from "vitest";
import { LIMITS, validateSignIn, validateSignUp, type SignUpInput } from "./auth";

const valid: SignUpInput = { username: "ada_99", email: "ada@example.com", password: "12345678" };

describe("validateSignUp", () => {
  it("returns no errors for valid input", () => {
    expect(validateSignUp(valid)).toEqual({});
  });

  it("trims username and email", () => {
    expect(validateSignUp({ ...valid, username: "  ada_99 ", email: " ada@example.com " })).toEqual(
      {},
    );
  });

  it.each(["", "ab", "a".repeat(13), "bad name", "ñandú", "a-b-c"])(
    "rejects the username %j",
    (username) => {
      expect(validateSignUp({ ...valid, username }).username).toBe(
        "Use 3 to 12 letters, numbers or underscores.",
      );
    },
  );

  it.each(["abc", "a".repeat(12), "A_1"])("accepts the username %j", (username) => {
    expect(validateSignUp({ ...valid, username }).username).toBeUndefined();
  });

  it.each(["guest", "GUEST", "Guest"])("rejects the reserved username %s", (username) => {
    expect(validateSignUp({ ...valid, username }).username).toBe("That username is reserved.");
  });

  it.each(["", "   ", "no-at.com", "a@b", "a b@c.com"])("rejects the email %j", (email) => {
    expect(validateSignUp({ ...valid, email }).email).toBeDefined();
  });

  it("rejects an email over the limit", () => {
    const email = `${"a".repeat(LIMITS.email)}@example.com`;
    expect(validateSignUp({ ...valid, email }).email).toBe(`Max ${LIMITS.email} characters.`);
  });

  it("enforces the password length bounds", () => {
    expect(validateSignUp({ ...valid, password: "1234567" }).password).toMatch(/at least 8/);
    expect(validateSignUp({ ...valid, password: "x".repeat(8) }).password).toBeUndefined();
    expect(
      validateSignUp({ ...valid, password: "x".repeat(LIMITS.passwordMax) }).password,
    ).toBeUndefined();
    expect(
      validateSignUp({ ...valid, password: "x".repeat(LIMITS.passwordMax + 1) }).password,
    ).toMatch(/Max 72/);
  });

  it("reports every invalid field at once", () => {
    expect(Object.keys(validateSignUp({ username: "", email: "", password: "" })).sort()).toEqual([
      "email",
      "password",
      "username",
    ]);
  });
});

describe("validateSignIn", () => {
  it("returns no errors for filled fields", () => {
    expect(validateSignIn({ email: "ada@example.com", password: "x" })).toEqual({});
  });

  it("does not apply the sign-up password rules", () => {
    expect(
      validateSignIn({ email: "ada@example.com", password: "short" }).password,
    ).toBeUndefined();
  });

  it("requires a valid email and a password", () => {
    expect(validateSignIn({ email: "nope", password: "" })).toEqual({
      email: "Enter a valid email address.",
      password: "Password is required.",
    });
  });
});
