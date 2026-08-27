# AI Transformation OS — Survey Scoring & Decision Rules V2

Status: DESIGN / NOT ACTIVE IN PRODUCTION
Date: 2026-08-27
Companion: SURVEY-METHODOLOGY-V2.md

## 1. Core rule
Scores do not replace evidence. Every diagnostic exposes two independent values:
- SCORE: observed maturity/performance/suitability, 0–100.
- CONFIDENCE: strength and coverage of evidence, 0–100.
A high score with low confidence must not automatically pass a readiness gate.

## 2. Normalization
For 1–5 questions: normalized = (answer - 1) / 4 * 100.
N/A is excluded from the denominator, never converted to zero.
Reverse questions are normalized as 100 - normalized.
Free text produces signals/tags but no numeric score unless a defined rule exists.

## 3. Evidence confidence
Evidence levels:
- none = 0
- anecdotal = 35
- documented = 70
- measured = 100

Coverage factor = answered scorable questions / applicable scorable questions.
Respondent factor: 1 respondent=0.65; 2=0.80; 3=0.90; >=4=1.00.
Agreement factor for multiple respondents: 1 - min(0.30, normalized standard deviation / 100).
Confidence = evidenceMean * coverageFactor * respondentFactor * agreementFactor.
Cap confidence at 60 when no documented/measured evidence exists.

Confidence bands:
- 0–39 LOW
- 40–69 MEDIUM
- 70–84 GOOD
- 85–100 STRONG

## 4. F01 Organization Diagnostic
F01 is primarily evidence/context, not a maturity survey.

Derived metrics:
- Baseline completeness: owner 20%, people 10%, mission 10%, responsibilities 10%, outputs 10%, KPI 15%, systems 10%, dependencies 10%, confidence 5%.
- Owner coverage: active functions with owner / active functions.
- KPI coverage: active functions with >=1 KPI / active functions.
- Documentation maturity: procedureMaturity normalized 0–100.
- Knowledge risk: knowledgeConcentration normalized and reversed for readiness.
- Manual-work signal: manual/repetitive areas count + critical spreadsheets/manual files; expressed as diagnostic intensity, not maturity.
- Handoff risk: handoff pain + number of cross-function dependencies.

Baseline Gate:
PASS requires baseline completeness >=75, owner coverage=100%, and no active function without people count.
WARNING when completeness 60–74.
BLOCKER below 60 or missing owner on active function.

## 5. F02 AI & Digital Maturity
Dimension weights:
- People & Skills 15%
- Adoption & Change 15%
- Process 20%
- Data 20%
- Technology & Integration 15%
- Governance, Risk & AI Control 15%

Each dimension = arithmetic mean of applicable normalized observable items. Overall = weighted mean.

Maturity bands:
- 0–24 INITIAL — ad hoc / major prerequisites absent
- 25–44 EMERGING — isolated practices, weak repeatability
- 45–64 DEFINED — foundations exist but are inconsistent
- 65–79 MANAGED — controlled and measurable
- 80–100 OPTIMIZED — systematic, evidence-driven improvement

Do not show decimal precision to users; retain raw precision internally.

Critical floors for AI Readiness:
- Data >=45
- Governance >=45
- Technology >=40
- People & Skills >=40
If any critical floor fails, AI Readiness cannot be PASS even if overall maturity is high.

## 6. F03 Work Discovery signals
Keep current evidence extraction. Add normalized opportunity signals per activity:
- Workload = annualFrequency * minutes * people / 60.
- Repetition 0/50/100 for low/medium/high.
- Rule clarity 0/50/100 for no/partial/yes.
- Manual transfer 0/25/50/75/100 for never/rare/sometimes/often/always.
- Waiting same scale.
- Error signal 0/25/60/100 for never/rare/sometimes/often.
- Rework hours = annualFrequency * reworkMinutes * people / 60 when applicable.
- Knowledge-risk signal from global F03 response.

F03 quality remains separate from opportunity score. A weak-quality interview cannot create a high-confidence opportunity.

## 7. F04 Process Diagnostic
### Efficiency metrics
Process Efficiency = touchMinutes / leadMinutes * 100, capped 100.
Waiting Ratio = waitMinutes / leadMinutes * 100, capped 100.
Annual Workload Hours = annualVolume * touchMinutes / 60.
Annual Rework Hours = annualVolume * errorProbability * reworkMinutes / 60.

### Diagnostic scales
Handoff Complexity: 0 handoffs=100 readiness; 1–2=80; 3–4=55; 5–7=30; >7=10.
Approval Burden: 0=100; 1=80; 2=60; 3=40; >=4=20.
Procedure Readiness: no=0; partial=50; yes-current=100.
Key Person Readiness: reverse-normalized 1–5 key-person risk.
Risk Readiness: reverse-normalized operational/compliance impact 1–5.

### Automation Suitability 0–100
- repetition/workload intensity 20%
- explicit rule share 20%
- low judgement requirement 15%
- manual transfer intensity 15%
- error/rework burden 10%
- waiting/handoff burden 10%
- stable digital inputs 10%

### AI Suitability 0–100
- useful unstructured information/content 15%
- sufficient historical/example data 15%
- digital data availability/quality 15%
- task requires interpretation/judgement where AI can assist 15%
- human validation feasible 15%
- measurable target/KPI exists 10%
- integration feasibility 10%
- acceptable operational/compliance risk 5%

AI suitability is an opportunity indicator, NOT deployment permission.

## 8. Opportunity Engine V2
Generate candidate opportunity score using evidence from F01/F02/F03/F04.

VALUE 0–100 (35% total)
- annual workload/cost potential 40% of VALUE
- delay/rework burden 25%
- strategic/KPI pain 20%
- employee/manager pain corroboration 15%

FEASIBILITY 0–100 (30% total)
- data readiness 25%
- technology/integration readiness 20%
- rule/process clarity 20%
- human validation feasibility 15%
- skills/adoption readiness 10%
- owner availability 10%

RISK READINESS 0–100 (20% total)
- privacy/security readiness 30%
- governance readiness 25%
- operational risk 20%
- compliance impact 15%
- fallback feasibility 10%

EVIDENCE 0–100 (15% total)
- source coverage F01/F02/F03/F04 35%
- measured/documented evidence 35%
- respondent coverage/agreement 30%

Opportunity Priority Score = VALUE*.35 + FEASIBILITY*.30 + RISK_READINESS*.20 + EVIDENCE*.15.

Priority bands:
- >=75 PRIORITY A — candidate for business case / controlled PoC
- 60–74 PRIORITY B — promising, close evidence/readiness gaps
- 45–59 PRIORITY C — investigate further
- <45 BACKLOG — insufficient value/readiness/evidence

Hard rule: Evidence <40 prevents Priority A. Critical privacy/security/governance blocker prevents PoC regardless of score.

## 9. F04 routing threshold
Request F04 when any condition is true:
- Opportunity score >=60 and process baseline is incomplete;
- annual workload >=500 h/year;
- waiting/rework signal >=60;
- cross-functional handoff risk >=60;
- manager manually selects process for deep dive.
Do not send F04 to all employees.

## 10. Business Case preconditions
A use case can be marked BUSINESS CASE READY only when:
- named owner;
- baseline KPI + evidence source;
- annual volume/workload or equivalent baseline;
- implementation/setup estimate;
- recurring OPEX estimate;
- benefit hypothesis;
- target KPI;
- evidence confidence >=50.

Financial outputs:
Net Benefit Y1 = annualBenefit - setup - annualOpex.
ROI Y1 = Net Benefit Y1 / (setup + annualOpex) * 100.
Payback months = setup / max(monthlyBenefit - monthlyOpex, epsilon).
Keep estimated and realized values separate.

## 11. AI Readiness Gate V2
Hard blockers (any one => BLOCKER):
- no accountable owner;
- no baseline KPI/evidence;
- privacy/security critical requirement unresolved;
- legally/compliance-required human control absent;
- required data unavailable;
- no fallback for consequential workflow.

Weighted readiness dimensions after hard blockers:
- Data 20%
- Security & Privacy 20%
- Process & KPI 15%
- Integration 15%
- Human/Operating Model 15%
- Governance & Compliance 15%

PASS: score >=75 AND confidence >=60 AND no hard blocker.
CONDITIONAL: score 60–74 or confidence 40–59, no hard blocker.
BLOCKER: score <60, confidence <40, or any hard blocker.

## 12. Benefits evidence
Before = baseline value + date + source + owner.
After = measured value + date + source + validator.
Realized benefit must never be inferred solely from planned benefit.
Benefit status:
- HYPOTHESIS: business case only
- BASELINED: before evidence available
- MEASURED: after measurement available
- VALIDATED: named validator confirms measure
- SUSTAINED: >=2 measurements across defined monitoring interval

## 13. Cross-survey consistency checks
Flag rather than silently reconcile:
- F01 says documented procedures high, F02 process documentation <=2.
- F01 reports no manual areas, but F03 manual-transfer signal high.
- F02 data maturity >=80 while F03 shows frequent copy/re-entry or hard-to-find data.
- F04 lead time < touch time (invalid baseline).
- F04 waiting time > lead time (invalid baseline).
- F04 process owner not found among active function owners/key roles (warning).
- High maturity with confidence <40 (warning: unsupported self-assessment).

## 14. Dashboard presentation
Never show only a single composite score. Show:
1. score;
2. confidence;
3. evidence count/source;
4. top 3 drivers;
5. top 3 gaps;
6. recommended next action.

## 15. Calibration policy
Initial thresholds are engineering defaults, not scientifically validated benchmarks. Store scoringVersion='2.0-alpha'. After 2–3 real company assessments, inspect distributions, false positives/negatives and user feedback before freezing V2.0. Historical scores retain their original scoringVersion.

## 16. Implementation sequence
1. Versioned TypeScript schemas and scoring library with unit-test vectors.
2. F01 v2 UI + importer + baseline metrics.
3. F02 v2 UI + maturity/confidence engine + dashboard compatibility.
4. F04 v2 UI + process metrics.
5. Opportunity Engine V2 consumes evidence without overwriting current opportunities.
6. Readiness Gate V2.
7. Synthetic end-to-end regression test.
8. Activate V2 forms only after V1 remains readable/importable.
