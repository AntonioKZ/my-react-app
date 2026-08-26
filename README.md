# AI Transformation OS

Single-company guided operating system for mapping inefficiencies, processes, tasks and AI/automation opportunities.

## Current release — v0.2

- Guided methodology: Discover → Assess → Map → Score → Business Case → PoC → Scale & Review
- Company profile and functional map
- Process inventory with lead time / touch time
- Task inventory with annual workload and capacity value
- Opportunity scoring engine
- Use case portfolio and indicative ROI
- Integrated F01 Organization Discovery questionnaire
- Integrated F03 Task & Productivity questionnaire
- Survey submission log
- Company Intelligence Report: printable PDF + Markdown + structured JSON
- Full localStorage backup export to JSON
- JSON restore/import to move all data between browsers/devices
- Data completeness and missing-owner checks

## Data portability

Use **Dati & Backup**:

1. Export JSON before changing browser/device.
2. Save the generated `ai-transformation-os-backup-YYYY-MM-DD.json` file.
3. Open AI Transformation OS in the new browser.
4. Choose **Importa JSON** and select the saved file.
5. The complete workspace is restored into localStorage.

The backup contains company, functions, processes, tasks, opportunities, use cases, questionnaire submissions and derived metadata.

## Company Intelligence Report

At any time choose **Genera report azienda** to generate:

- printable/PDF human report;
- `company-intelligence-report.md` for LLM/RAG use;
- `company-snapshot.json` for structured future AI analysis.

## Architecture

Current MVP: React + Vite with browser localStorage persistence. The data model is intentionally vendor-neutral. Database/authentication can be added later without changing the core methodology.

## Development

```bash
npm install
npm run dev
npm run build
```

CI runs on GitHub Actions for every push.
