import { describe, expect, it } from "vitest";
import { decideAccess, GUEST_COOKIE } from "./route-guard";

const visitor = { account: false, guest: false };
const guest = { account: false, guest: true };
const account = { account: true, guest: false };

describe("decideAccess for the player", () => {
  const pathname = "/game/asteroids/play";

  it("sends a visitor to the login with the path to come back to", () => {
    expect(decideAccess({ pathname, ...visitor })).toEqual({
      allow: false,
      redirect: "/login?next=%2Fgame%2Fasteroids%2Fplay",
    });
  });

  it("lets a guest in", () => {
    expect(decideAccess({ pathname, ...guest })).toEqual({ allow: true });
  });

  it("lets an account in", () => {
    expect(decideAccess({ pathname, ...account })).toEqual({ allow: true });
  });

  it("covers every game id and a trailing slash", () => {
    expect(decideAccess({ pathname: "/game/brick-buster/play", ...visitor }).allow).toBe(false);
    expect(decideAccess({ pathname: "/game/froggy/play/", ...visitor }).allow).toBe(false);
  });
});

describe("decideAccess for the profile", () => {
  const pathname = "/profile";
  const toLogin = { allow: false, redirect: "/login?next=%2Fprofile" };

  it("sends a visitor to the login", () => {
    expect(decideAccess({ pathname, ...visitor })).toEqual(toLogin);
  });

  it("does not let a guest in", () => {
    expect(decideAccess({ pathname, ...guest })).toEqual(toLogin);
  });

  it("lets an account in", () => {
    expect(decideAccess({ pathname, ...account })).toEqual({ allow: true });
  });

  it("does not let a visitor in through a trailing slash", () => {
    expect(decideAccess({ pathname: "/profile/", ...visitor }).allow).toBe(false);
  });
});

describe("decideAccess for public paths", () => {
  it.each([
    "/",
    "/library",
    "/game/asteroids",
    "/hall-of-fame",
    "/about",
    "/login",
    "/api/contact",
    "/games/asteroids/index.html",
    "/profile-picture",
    "/game/asteroids/play/extra",
  ])("always allows %s", (pathname) => {
    for (const who of [visitor, guest, account]) {
      expect(decideAccess({ pathname, ...who })).toEqual({ allow: true });
    }
  });
});

describe("GUEST_COOKIE", () => {
  it("has the name of SPEC 17", () => {
    expect(GUEST_COOKIE).toBe("arcade-vault-guest");
  });
});
