---
name: spec-impl-game
description: Implements an approved game spec (the ones /add-game and the game-jam agent write) by following /spec-impl exactly, then runs the skin-designer agent and, after it finishes, the mobile-porter agent on the new game. The two agents run one after the other, never in parallel.
disable-model-invocation: true
argument-hint: <NN-id-game>
allowed-tools: Read, Glob, Grep, Edit, Write, Agent, AskUserQuestion, Bash(git status:*), Bash(git branch:*), Bash(git checkout:*), Bash(git log:*), Bash(git diff:*), Bash(git stash:*), Bash(cat:*), Bash(ls:*), Bash(npm run lint:*), Bash(npm test:*), Bash(npm run build:*), mcp__supabase__list_migrations, mcp__supabase__list_tables, mcp__supabase__apply_migration, mcp__supabase__execute_sql, mcp__supabase__get_advisors
---

# /spec-impl-game — Implementer of approved game specs, plus skins and mobile

## Session context

Current repository state:
!`git status --short`

Current branch:
!`git branch --show-current`

Specs available in this folder:
!`ls specs/ 2>/dev/null || echo "The specs/ folder does not exist"`

Branch-creation config:
!`cat specs/.spec-config.yml 2>/dev/null || echo "AutoCreateBranch: true (default, no config file)"`

Ids in the catalog right now:
!`grep -hE '^\s+id: "' lib/games.ts 2>/dev/null`

---

## What this command is

`/spec-impl` followed by two agents. The implementation is `/spec-impl`, unchanged. This skill adds a check before it and a phase after it.

The argument is: `$ARGUMENTS`

`/spec-impl` has `disable-model-invocation: true`, so it cannot be called through the Skill tool. Its instructions are read from the file and followed here, so any update to `/spec-impl` applies to this command too. Nothing is copied.

---

## Phase 0 — Check that the spec adds a game

1. Read `.agents/skills/spec-impl/SKILL.md` in full.
2. Run its **Phase 1** (identify the spec from `$ARGUMENTS`) and its **Phase 2** (the state must mean "Approved"), exactly as written there, including the standard error message.
3. Read the spec. It is a game spec when its scope creates `public/games/<id>/` and adds a `GAMES` entry in `lib/games.ts`.
   - If it is not, stop and tell the user to run `/spec-impl <name>` instead. Do not create a branch.
   - Take `<id>` from the `id:` of the catalog entry in the spec's data model. If there is none, use the file name `NN-<id>-game`. If it is still unclear, ask with AskUserQuestion. Do not guess.
4. Keep `<id>` and the spec path for Phase 5.

---

## Phases 1–4 — Implement the spec

Follow Phases 3 and 4 of `.agents/skills/spec-impl/SKILL.md` to the letter, with every rule of that file:

- the clean-tree check and the branch (`AutoCreateBranch`);
- the summary of objective, scope, plan and criteria;
- the confirmation before Step 1;
- one step at a time, with its manual test, the acceptance criteria ticked in the spec as each step verifies them, a pause for the user to review the diff, and the ambiguity and out-of-scope rules;
- never commit.

**One change.** When the last step is done, do not print the closing block of `/spec-impl` yet. Go to Phase 5.

---

## Phase 5 — Skins, then mobile

Starts by itself after the last step, with no question to the user. The two agents run **in order and never in parallel**: the second one is launched only after the first one has finished and its report is in this conversation.

1. **Check the catalog.** `<id>` must now be in `GAMES` (`lib/games.ts`). Both agents refuse an id that is not there. If it is missing, stop and report.
2. **Skins.** Launch the `skin-designer` agent (`.claude/agents/skin-designer.md`) with a prompt that names the game:
   - "Add and check the skins for the game `<id>` only; the spec is `specs/<file>`. Do not touch any other game."
   - Ask for its normal final report.
3. **Wait** for it to finish. Do not launch anything else in the meantime. Relay its report: what changed, the contrast numbers that were close, and what it could not check. If it failed, or it stopped with questions, show them and stop here. Do not launch `mobile-porter` until the user has answered.
4. **Mobile.** Launch the `mobile-porter` agent (`.claude/agents/mobile-porter.md`) with a prompt that names exactly two routes:
   - "Check and fix `/game/<id>` and `/game/<id>/play`, and no other route."
   - Ask for its normal final report.
5. **Wait** for it to finish and relay its report, including anything it says needs a `/spec`, and what it could not check. A test on a real phone is always left to the user.
6. **Verify again.** Both agents changed files after the spec steps. Run `npm run lint`, `npm test` and `npm run build` and report the real result. Then re-check the acceptance criteria the agents could have changed, such as "the folder contains exactly …" or "`git diff` is empty for …".
   - If an agent's work breaks a criterion that was ticked, untick it in the spec and report it. Do not hide it.
   - If a criterion is now out of date because of the skins (for example the file list of `public/games/<id>/`), say so and propose the change to the spec. The spec is the contract: change it only with the user's agreement.

---

## Closing

When Phase 5 is over, print:

```
✅ All steps of the plan are implemented, and the polish agents have run.

Spec:      specs/NN-<id>-game.md
Branch:    <prefix>/<slug>
Skins:     <summary of skin-designer>  → references/game-with-themes.md
Mobile:    <summary of mobile-porter>  → references/mobile-porting.md
Checks:    lint <ok|fail> · test <ok|fail> · build <ok|fail>

Next step: verify the acceptance criteria that are still open and tick each one.
If none is left open, update the spec's state to "Implemented" and make the final
commit before merging this branch. Do not mark the spec as "Implemented" while
any criterion is unticked.
```

Then list the files each agent touched (`git status --short`). Do not commit.

---

## Rules

- The implementation follows `/spec-impl` exactly. This skill adds Phase 0 and Phase 5 and nothing else.
- Sequence: `skin-designer` first, `mobile-porter` second. Never in the same message, never in parallel.
- Each agent gets only this game: the id for the skins, the two routes for mobile. Never "all games" and never other routes.
- The agents write their own memory files (`references/game-with-themes.md`, `references/mobile-porting.md`). This skill does not edit them.
- Never commit, per step or at the end, unless the user asks.
- Replies to the user are in the language they write in. Specs, code and agent prompts' file content stay in English.
