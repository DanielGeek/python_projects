<!--
Sync Impact Report
Version change: template → 1.0.0
Added principles: I. Static-First, II. Simplicity (YAGNI), III. Accessibility,
IV. Performance Budget, V. Responsive by Default
Added sections: Technical Constraints, Development Workflow, Governance
Templates requiring updates: none (plan/spec/tasks templates remain generic) ✅
Follow-up TODOs: none
-->

# Podsite Constitution

## Core Principles

### I. Static-First
The site MUST be deployable as plain static files (HTML, CSS, JS, assets) to any static host. No server-side runtime, database, or backend API is required to render pages.

### II. Simplicity (YAGNI)
Prefer vanilla HTML/CSS/JS. A framework, build tool, or dependency MUST be justified in the plan by a concrete need. Start with the smallest thing that works.

### III. Accessibility
Pages MUST use semantic HTML, provide alt text for images, keep sufficient color contrast, and be fully keyboard navigable (WCAG 2.2 AA target).

## Governance
This constitution supersedes other practices. Amendments require updating this file, bumping the version (MAJOR: principle removed/redefined; MINOR: principle/section added; PATCH: wording), and noting the change in the Sync Impact Report. Plans MUST include a Constitution Check against these principles.

**Version**: 1.0.0 | **Ratified**: 2026-11-09 | **Last Amended**: 2026-11-09
