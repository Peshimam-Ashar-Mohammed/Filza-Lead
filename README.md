# FilzaLead Pro

FilzaLead Pro is a browser-based B2B lead intelligence and business discovery
workspace. Import a lead list, filter and segment results, inspect lead details,
and export the working dataset from one focused dashboard.

## Tech stack

- React 18
- Vite
- `xlsx` for spreadsheet import/export
- Lucide React for icons

## Getting started

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production build:

```bash
npm run build
npm run preview
```

## Deployment

Pushes to `main` automatically build and publish the site to GitHub Pages using
the workflow in `.github/workflows/deploy-pages.yml`.

Once GitHub Pages is enabled for the repository, the site is available at:

<https://peshimam-ashar-mohammed.github.io/Filza-Lead/>

## Data privacy

Lead files are processed in the browser. This frontend does not include a
backend or send imported spreadsheet data to a server.

