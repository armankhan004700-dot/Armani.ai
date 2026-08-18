# Armani AI Command Agent

A free, browser-based AI assistant inspired by cinematic command centers. It is not a literal copy of any fictional or proprietary system, but it gives you a polished local agent foundation that can chat, listen, speak, remember notes, calculate, summarize, set timers, and plan tasks.

## Features

- Futuristic command-center interface.
- Optional voice input and spoken responses through browser Web Speech APIs.
- Local task brain for planning, calculations, summaries, memory notes, daily briefs, and timers.
- Persistent notes stored in `localStorage`.
- No paid service is required for the included features.
- Simple extension point in `public/app.js` for connecting a hosted LLM later.

## Run locally

```bash
npm start
```

Open <http://localhost:3000> in a modern browser.

## Check syntax

```bash
npm run check
```

## Example commands

- `Create a mission plan for my day`
- `Calculate 18% of 245`
- `Remember my meeting is at 3 PM`
- `Set a timer for 1 minute`
- `Summarize Artificial intelligence is...`
