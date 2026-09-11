# Cybercrime Response Center

A defensive cybercrime response website for reporting incidents, preserving evidence, and coordinating next steps.

## What is included

- Public incident reporting flow
- Evidence-preservation guidance
- Analyst dashboard with case queue, search, filters, and triage actions
- Case detail view with timeline, notes, and status controls
- Responsive interface for desktop and mobile
- Local demo data for the first-run experience

## Run locally

```bash
pnpm install
pnpm --filter @workspace/cybercrime-response-center run dev
```

The app uses the Replit artifact workflow for its `PORT` and `BASE_PATH` values.

## Safety

This project is for defensive incident reporting and response workflows. It does not provide malware, credential theft, unauthorized access, evasion, or exploitation tooling.