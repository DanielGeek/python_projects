# OpenDayCare — Database schema

PostgreSQL table dictionary. Types in Postgres notation.
Convention: PK `id` type `uuid` (default `gen_random_uuid()`), and `created_at` / `updated_at` type `timestamptz`.

**Language convention:** everything persisted in the database is in **English** (enums, tags, codes). Labels visible to the user match the DB values directly.

---

## Enums used

| Enum                | Values                                                            |
| ------------------- | ----------------------------------------------------------------- |
| `user_role`         | `staff`, `parent`, `admin`                                        |
| `user_status`       | `pending`, `active`                                               |
| `relationship_type` | `father`, `mother`, `guardian`                                    |
| `invitation_status` | `pending`, `accepted`, `expired`, `cancelled`                     |
| `post_type`         | `meal`, `nap`, `activity`, `achievement`, `photo`, `announcement` |
| `child_status`      | `active`, `archived`                                              |

### UI labels

| Enum                | DB Value       | UI Label        |
| ------------------- | -------------- | --------------- |
| `relationship_type` | `father`       | Father          |
| `relationship_type` | `mother`       | Mother          |
| `relationship_type` | `guardian`     | Guardian        |
| `post_type`         | `meal`         | Meal            |
| `post_type`         | `nap`          | Nap             |
| `post_type`         | `activity`     | Activity        |
| `post_type`         | `achievement`  | Achievement     |
| `post_type`         | `photo`        | Photo           |
| `post_type`         | `announcement` | Announcement    |

---

## 1. `daycares`

The daycare as the root entity.

| Field        | Type          | Notes                             |
| ------------ | ------------- | --------------------------------- |
| `id`         | `uuid` PK     |                                   |
| `name`       | `text`        | E.g., "Sunshine Room Daycare".    |
| `created_at` | `timestamptz` |                                   |

---

## 2. `users`

Application profile linked to **Supabase Auth**. Parents and staff share the table, differentiated by `role`. Authentication (email, password, confirmation) lives in `auth.users`; this table only stores domain data.

| Field                       | Type                     | Notes                                                                                      |
| --------------------------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| `id`                        | `uuid` PK                | FK → `auth.users(id)` ON DELETE CASCADE. Same UUID as Supabase Auth.                       |
| `daycare_id`                | `uuid` FK → `daycares`   |                                                                                            |
| `role`                      | `user_role`              | `staff` / `parent` / `admin`.                                                              |
| `status`                    | `user_status`            | Default `active`. The pre-signup state is modeled in `invitations`.                        |
| `full_name`                 | `text`                   |                                                                                            |
| `avatar_url`                | `text`                   | Nullable.                                                                                  |
| `notify_on_post`            | `boolean` default `true` | Notifications when a post is published.                                                    |
| `daily_summary_enabled`     | `boolean` default `true` | Daily summary (19:00).                                                                     |
| `created_at` / `updated_at` | `timestamptz`            |                                                                                            |

> **Supabase implementation:** create the row with an `AFTER INSERT` trigger on `auth.users` (`SECURITY DEFINER` function). Pass `daycare_id`, `role`, and `full_name` via `raw_user_meta_data` on signup. Enable RLS on this table. Do not duplicate `email` or `password_hash` — Supabase already manages them in `auth.users`.

---

## 3. `rooms`

Daycare rooms (e.g., Sunshine, Rainbow).

| Field        | Type                   | Notes           |
| ------------ | ---------------------- | --------------- |
| `id`         | `uuid` PK              |                 |
| `daycare_id` | `uuid` FK → `daycares` |                 |
| `name`       | `text`                 | E.g., "Sunshine". |
| `created_at` | `timestamptz`          |                 |

---

## 4. `children`

Children enrolled in the daycare.

| Field                       | Type                     | Notes                                                    |
| --------------------------- | ------------------------ | -------------------------------------------------------- |
| `id`                        | `uuid` PK                |                                                          |
| `room_id`                   | `uuid` FK → `rooms`      | Nullable.                                                |
| `full_name`                 | `text`                   |                                                          |
| `birth_date`                | `date`                   | Date of birth.                                           |
| `enrolled_at`               | `date`                   | Enrollment date at the daycare.                          |
| `medical_notes`             | `text`                   | Allergies and medical notes (free text).                 |
| `allergy_tags`              | `text[]`                 | Tags in English, e.g., `{peanut}`. _See note._           |
| `photo_consent`             | `boolean` default `true` | Photo consent. _See note._                               |
| `status`                    | `child_status`           | `active` / `archived` (soft delete).                     |
| `created_at` / `updated_at` | `timestamptz`            |                                                          |

> **Note on `allergy_tags`:** Postgres array for simplicity. Values in English (`peanut`, `lactose`, `gluten`, etc.). If you want to normalize, extract it to an `allergies` table + `child_allergies`.

---

## 5. `parent_children` (parent ↔ child link)

Junction table. A parent can have multiple children and a child can have multiple guardians.

| Field          | Type                   | Notes                                  |
| -------------- | ---------------------- | -------------------------------------- |
| `id`           | `uuid` PK              |                                        |
| `parent_id`    | `uuid` FK → `users`    |                                        |
| `child_id`     | `uuid` FK → `children` |                                        |
| `relationship` | `relationship_type`    | Relationship of the guardian to the child. |
| `created_at`   | `timestamptz`          |                                        |
|                |                        | UNIQUE (`parent_id`, `child_id`).      |

---

## 6. `invitations`

Staff generates a code to link a parent with a child.

| Field          | Type                   | Notes                                             |
| -------------- | ---------------------- | ------------------------------------------------- |
| `id`           | `uuid` PK              |                                                   |
| `child_id`     | `uuid` FK → `children` | Which child to link to.                           |
| `invited_by`   | `uuid` FK → `users`    | Staff member who invites.                         |
| `full_name`    | `text`                 | Parent/guardian's name.                           |
| `email`        | `text`                 |                                                   |
| `relationship` | `relationship_type`    |                                                   |
| `code`         | `text` UNIQUE          | Short code, e.g., `7K4P9`.                        |
| `status`       | `invitation_status`    | `pending` / `accepted` / `expired` / `cancelled`. |
| `expires_at`   | `timestamptz`          |                                                   |
| `accepted_at`  | `timestamptz`          | Nullable.                                         |
| `created_at`   | `timestamptz`          |                                                   |

---

## 7. `posts`

A post can tag multiple children (`post_children`) or be a general announcement.

| Field                       | Type                | Notes                                                                   |
| --------------------------- | ------------------- | ----------------------------------------------------------------------- |
| `id`                        | `uuid` PK           |                                                                         |
| `author_id`                 | `uuid` FK → `users` | Staff member who publishes.                                             |
| `room_id`                   | `uuid` FK → `rooms` | Nullable — for room announcements.                                      |
| `type`                      | `post_type`         | `meal` / `nap` / `activity` / `achievement` / `photo` / `announcement`. |
| `title`                     | `text`              | Nullable (e.g., "General announcement").                                |
| `body`                      | `text`              | Description.                                                            |
| `published_at`              | `timestamptz`       |                                                                         |
| `created_at` / `updated_at` | `timestamptz`       |                                                                         |

---

## 8. `post_children` (children tagged in the post)

Junction table. This is the key to filtering the parent's feed.

| Field      | Type                   | Notes                                    |
| ---------- | ---------------------- | ---------------------------------------- |
| `post_id`  | `uuid` FK → `posts`    |                                          |
| `child_id` | `uuid` FK → `children` |                                          |
|            |                        | Composite PK (`post_id`, `child_id`).    |

> Parent's feed = posts with a `child_id` belonging to their children **+** posts of type `announcement` from their room. This is what `GET /posts` filtered by role resolves.

---

## 9. `post_photos` (post photos)

Photos attached to a post, with support for fullscreen view.

| Field              | Type                | Notes                                              |
| ------------------ | ------------------- | -------------------------------------------------- |
| `id`               | `uuid` PK           |                                                    |
| `post_id`          | `uuid` FK → `posts` |                                                    |
| `url`              | `text`              | URL of the uploaded file.                          |
| `width` / `height` | `int`               | Nullable — useful for fullscreen view.             |
| `position`         | `int`               | Order of the photo in the post.                    |
| `created_at`       | `timestamptz`       |                                                    |

---

## 10. `reactions`

Reactions from parents to posts (e.g., "Love it").

| Field        | Type                | Notes                                                     |
| ------------ | ------------------- | --------------------------------------------------------- |
| `id`         | `uuid` PK           |                                                           |
| `post_id`    | `uuid` FK → `posts` |                                                           |
| `user_id`    | `uuid` FK → `users` | Parent who reacts.                                        |
| `type`       | `text`              | E.g., `love`.                                             |
| `created_at` | `timestamptz`       |                                                           |
|              |                     | UNIQUE (`post_id`, `user_id`) — one reaction per user.    |

---

## 11. `comments`

Comments on posts.

| Field                       | Type                | Notes              |
| --------------------------- | ------------------- | ------------------ |
| `id`                        | `uuid` PK           |                    |
| `post_id`                   | `uuid` FK → `posts` |                    |
| `author_id`                 | `uuid` FK → `users` | Parent or staff.   |
| `body`                      | `text`              |                    |
| `created_at` / `updated_at` | `timestamptz`       |                    |

---

## 12. `daily_summaries`

One record per child per day.

| Field                       | Type                   | Notes                                   |
| --------------------------- | ---------------------- | --------------------------------------- |
| `id`                        | `uuid` PK              |                                         |
| `child_id`                  | `uuid` FK → `children` |                                         |
| `date`                      | `date`                 |                                         |
| `meals_count`               | `int`                  | Meals.                                  |
| `sleep_minutes`             | `int`                  | Sleep in minutes (e.g., 90 = 1h30m).    |
| `activities_count`          | `int`                  | Activities.                             |
| `mood`                      | `text`                 | Mood, e.g., "Happy and participative".  |
| `highlight`                 | `text`                 | "The best part of today".               |
| `created_at` / `updated_at` | `timestamptz`          |                                         |
|                             |                        | UNIQUE (`child_id`, `date`).            |

> Can be saved or **computed** by aggregating the day's `posts`. For a class demo, the saved table is easier to demonstrate.

---

## 13. `devices` _(optional — push notifications)_

Device tokens for push notifications, optional.

| Field        | Type                | Notes                      |
| ------------ | ------------------- | -------------------------- |
| `id`         | `uuid` PK           |                            |
| `user_id`    | `uuid` FK → `users` |                            |
| `token`      | `text`              | Device token.              |
| `platform`   | `text`              | `ios` / `android` / `web`. |
| `created_at` | `timestamptz`       |                            |

---

## Relationship map (summary)

```
daycares 1─┬─< rooms 1──< children
           └─< users

users  >──< children     (via parent_children, with relationship)
users  1──< posts        (author)
posts  >──< children     (via post_children — tagging)
posts  1──< post_photos
posts  1──< reactions >── users
posts  1──< comments  >── users
children 1──< daily_summaries
children 1──< invitations
```

**The three junction tables (many-to-many)** are the core of the model:

- `parent_children` → who is family of whom.
- `post_children` → which children each post belongs to (drives the parent's feed).
- (`invitations` as the bridge for the onboarding flow).
