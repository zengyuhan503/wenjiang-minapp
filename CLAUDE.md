# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **uni-app** project (Vue 3 + Composition API) targeting WeChat Mini Program as the primary platform. It is a commercial building service platform for Wenjiang District (温江区商务楼宇服务平台). The project was bootstrapped from the `hello-uniapp` template.

## Development Environment

This project is developed primarily through **HBuilderX**, DCloud's IDE. It does **not** use a modern CLI toolchain:

- No `vite.config.js` or `vue.config.js`
- No ESLint / Prettier configuration
- No test suite or CI/CD pipelines
- `package.json` scripts are minimal and not used for builds

To run the app, open the project in HBuilderX and use its built-in run/compile commands for the desired platform (e.g., WeChat DevTools, H5, App).

## Project Structure

- `pages/` — Main tab bar pages: `home`, `louyu/list`, `supply/index`, `policy/index`
- `package/` — Sub-package pages (non-tabBar), e.g., login, user settings, detail pages
- `components/` — Reusable Vue components (e.g., `customNavbar.vue`, `editLouyu.vue`)
- `utlis/` — Utility modules (note the folder name spelling)
  - `request.js` — HTTP request wrapper with automatic token refresh
  - `https.js` — API endpoint definitions organized by domain
- `uni_modules/` — Official DCloud UI components (uni-forms, uni-popup, etc.)
- `common/e-chart/` — ECharts wrapper for uni-app
- `static/` — Static assets including tab bar icons

## Request Layer & Auth

All API calls go through `utlis/request.js`:

- Base URL is hard-coded to the **test environment**: `https://louyutest.cdyunbu.com/prod/api/wxapp`
- Bearer token is read from `uni.getStorageSync('token')`
- Token refresh is handled automatically with a 1-minute preemptive expiration buffer
- On 401, the user is redirected to `/package/login/login`

APIs are organized in `utlis/https.js` by domain (`house`, `supply`, `company`, `policy`, `ai`, etc.).

## State Management

- Pinia is installed and mounted in `main.js`
- Local storage (`uni.getStorageSync` / `uni.setStorageSync`) is used for auth tokens and login state

## Global UI

`App.vue` provides global success/fail toast dialogs via Vue `provide/inject`:

- `provide("showSubmitSuccess", showSubmitSuccess)`
- `provide("showSubmitFail", showSubmitFail)`

Pages can consume these with `inject("showSubmitSuccess")` / `inject("showSubmitFail")`.

## Styling Conventions

- Uses `view` as the primary container element (uni-app convention)
- `App.vue` resets all `view` elements to `width: 100%` and `box-sizing: border-box`
- Styles are written in LESS or SCSS
- Global SCSS variables are defined in `uni.scss`

## Platform-Specific Notes

- `manifest.json` sets `vueVersion` to `3` and WeChat Mini Program `appid` to `wx36262063a5ea479f`
- H5 router uses `history` mode with a QQ Map SDK key configured
- Many pages use `"navigationStyle": "custom"` and rely on `customNavbar.vue` for navigation bars
