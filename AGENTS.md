# AGENTS.md

## Purpose
This project uses Vue 3 + Nuxt + TypeScript. Follow Nuxt conventions, keep changes minimal, and prefer clarity over cleverness.

## Vue SFC Structure (required)
When editing or creating a Single File Component, keep this exact order:

1. `<template>`
2. `<script>` (or `<script setup>`)
3. `<style>`

Do not place `<script>` before `<template>`. Keep one top-level block of each type unless the file already uses multiple blocks.

## Vue + Nuxt Best Practices
- Prefer `<script setup lang="ts">` in new SFCs unless the file already uses options API.
- Use Nuxt composables (`useRuntimeConfig`, `useRoute`, `useFetch`, etc.) instead of custom wiring where available.
- Keep page components in `app/pages` thin; move reusable logic into `app/composables` and `app/components`.
- Use `definePageMeta` for page metadata.
- Avoid direct DOM manipulation; prefer Vue refs and lifecycle hooks.
- Keep styles scoped when possible; use project-wide styles in `app/assets/css`.

## TypeScript Practices
- Use explicit types for public APIs, props, emits, and composable returns.
- Avoid `any`; use `unknown` with runtime guards when needed.
- Prefer type inference for local variables when clear.
- Keep interfaces/types close to usage unless shared across multiple files.

## General Workflow
- Match existing code style and patterns in the repo.
- Avoid large refactors unless requested.
- Update or add tests only when behavior changes or regression risk is high.

