# AI Transformation OS — Survey Methodology V2

Status: DESIGN / NOT YET ACTIVE IN PRODUCTION
Date: 2026-08-27

## Design principle
Every question must produce a variable used by a KPI, diagnostic, risk signal, routing rule or downstream decision. The survey chain is:

F01 Organization Discovery → F02 AI & Digital Maturity → F03 Work Discovery → Opportunity Engine → F04 Process Deep-Dive → Business Case → Readiness → PoC → Benefits.

F03 remains substantially unchanged because it already captures operational evidence and adaptive drill-downs.

---

# F01 v2 — Organization & Function Discovery
Target: function owner / manager. Estimated time: 8–12 min.

## A. Identity and scope
1. Function / area name → function.name → Company Model / Coverage.
2. Function owner → function.owner → Governance / baseline readiness.
3. Number of people → function.people → Coverage / capacity baseline.
4. Mission of the function → function.mission → Company Model / AI context.
5. Main responsibilities (max 7) → responsibilities[] → responsibility map / overlap analysis.

## B. Outputs and customers
6. Main outputs/deliverables (max 5) → outputs[] → process discovery seeds.
7. Main internal/external customers → customers[] → value-chain map.
8. KPIs currently used → kpis[] → Business Case / Benefits baseline.
9. Which outputs/KPIs are hardest to meet and why? → performancePain → Opportunity signals.

## C. Interfaces and dependencies
10. Functions interacted with most → dependencies[] → organizational dependency graph.
11. Main inputs received from other functions → incomingInputs[] → handoff map.
12. Main information/documents sent to other functions → outgoingOutputs[] → handoff map.
13. Where do handoffs create delays/rework? → handoffPain → Opportunity Engine.
14. Critical external suppliers/partners → externalDependencies[] → operational risk.

## D. Systems, data and knowledge
15. Main applications/systems used → systems[] → Application Portfolio.
16. Critical spreadsheets/manual files → manualAssets[] → automation/data risk.
17. Critical data/documents managed → criticalData[] → Data Readiness.
18. Is there information known mainly by one/few people? [none/low/medium/high] → knowledgeConcentration → knowledge risk.
19. Are procedures documented and current? [1–5] → procedureMaturity → governance/process maturity.

## E. Change and priorities
20. Three main operational problems → topPain[] → Opportunity seeds.
21. Three most manual/repetitive areas → manualAreas[] → automation seeds.
22. Changes expected in next 12–24 months → expectedChanges[] → transformation context.
23. Improvement priorities → priorities[] → executive alignment.
24. Manager confidence in answers [1–5] → evidenceConfidence → data-quality weighting.

### F01 derived indicators
- Organizational Baseline Completeness
- Owner Coverage
- KPI Coverage
- Documentation Maturity
- Knowledge Concentration Risk
- Manual Work Signal
- Handoff Risk
- Function Dependency Graph

---

# F02 v2 — AI & Digital Maturity Assessment
Target: managers/key users with sufficient organizational knowledge. Estimated time: 10–15 min.

Scoring: each observable item 1–5 with anchored descriptions. Dimension score = weighted mean of its items. Overall maturity = weighted mean of dimensions. Never ask the respondent to directly choose the dimension score.

Common scale: 1=absent/ad hoc; 2=mostly manual/fragmented; 3=defined but inconsistent; 4=managed and measured; 5=systematic/optimized.

## Dimension A — People & Skills (15%)
A1. Digital skills required by the role are available.
A2. People receive structured training on digital/AI tools.
A3. The function can identify suitable AI use cases.
A4. There are internal people able to validate AI outputs.
A5. Knowledge is shared rather than concentrated in individuals.
Outputs: skillsScore, validationCapability, knowledgeRisk.

## Dimension B — Adoption & Change (15%)
B1. New digital tools are actually adopted after introduction.
B2. Users are involved in design/testing of new solutions.
B3. There is time/capacity allocated to improvement initiatives.
B4. Benefits of new tools are measured after adoption.
B5. Resistance/change barriers are actively managed.
Outputs: adoptionScore, changeReadiness, benefitDiscipline.

## Dimension C — Process (20%)
C1. Core processes are documented.
C2. Process owners are clearly identified.
C3. Lead time/volume/error KPIs are measured.
C4. Repetitive/manual steps are known.
C5. Exceptions and approval rules are explicit.
Outputs: processScore, processObservability, automationReadiness.

## Dimension D — Data (20%)
D1. Required data is available digitally.
D2. Authoritative sources/systems of record are known.
D3. Data is easy to find when needed.
D4. Data quality issues are measured/managed.
D5. Manual copying/re-entry between systems is limited.
D6. Access permissions and ownership are clear.
Outputs: dataScore, dataAvailability, dataQuality, integrationPain, ownershipReadiness.

## Dimension E — Technology & Integration (15%)
E1. Core applications are adequate for current work.
E2. Systems exchange data without excessive manual transfer.
E3. APIs/integration mechanisms are available where needed.
E4. Identity/access/security controls are managed.
E5. The architecture can support controlled AI experimentation.
Outputs: technologyScore, integrationReadiness, securityReadiness.

## Dimension F — Governance, Risk & AI Control (15%)
F1. Digital/AI initiatives have named owners.
F2. Privacy/security/compliance checks are defined before deployment.
F3. AI-generated outputs can be reviewed by a responsible human.
F4. Decisions and risks are formally tracked.
F5. Success criteria/KPIs are defined before PoC.
F6. There is a fallback/escalation mechanism if AI fails.
Outputs: governanceScore, responsibleAIReadiness, pocControlReadiness.

## Evidence confidence
For each dimension optionally request: evidence available? [none / anecdotal / documented / measured]. This generates evidenceConfidence and prevents a high self-rating from being treated as hard evidence.

### F02 derived indicators
- Overall AI & Digital Maturity 0–100
- Six dimension scores 0–100
- Evidence Confidence 0–100
- Readiness gaps by dimension
- Function-to-function maturity comparison
- Reassessment delta over time
- Automatic Readiness Gate preconditions

---

# F04 v2 — Process Deep-Dive
Target: process owner + key user. Trigger primarily for processes identified as high-value/high-pain after F03 and Opportunity Engine. Estimated time: 12–18 min.

## A. Process identity
1. Process name → process.name.
2. Process owner → process.owner.
3. Purpose / desired outcome → purpose.
4. Trigger / start event → trigger.
5. Final output/customer → output/customer.
6. Functions involved → functions[] / cross-functional graph.

## B. Demand and workload
7. Frequency → frequency.
8. Cases/transactions per period → volume.
9. Seasonality/peaks → seasonality.
10. People normally involved → people.
11. Average touch time per case → touchMinutes.
12. Average end-to-end lead time → leadMinutes.
13. Average waiting time → waitMinutes.
Derived: processEfficiency = touch/lead; annualWorkloadHours = volume*touch/60; waitingRatio = wait/lead.

## C. Flow and handoffs
14. Main process steps → steps[].
15. Number of handoffs between people/functions → handoffs.
16. Number/type of approvals → approvals[].
17. Main queue/bottleneck → bottleneck.
18. Where does work wait longest? → waitPoint.
Derived: handoffComplexity, approvalBurden, bottleneck signal.

## D. Systems and data
19. Systems/tools used by step → systems[].
20. Inputs/data required → inputs[].
21. Outputs/data produced → outputs[].
22. Manual copy/re-entry points → manualTransfers[].
23. Spreadsheet/email/PDF dependent steps → unstructuredSteps[].
24. Data quality/availability problems → dataPain[].
Derived: integrationPain, unstructuredWorkRatio, dataReadiness.

## E. Quality, exceptions and risk
25. Error/rework frequency → errorRate.
26. Average rework time → reworkMinutes.
27. Most common exception types → exceptions[].
28. Operational/compliance consequences of failure [1–5] → impact.
29. Dependence on specific people [1–5] → keyPersonRisk.
30. Is there a documented procedure? [no/partial/yes-current] → procedureStatus.
Derived: annualReworkHours, processRisk, knowledgeRisk.

## F. Automation / AI suitability
31. Share of work governed by explicit rules [1–5] → ruleBased.
32. Share requiring professional judgement [1–5] → judgement.
33. Input mostly structured or unstructured? → inputStructure.
34. Is historical example data available? → trainingEvidence.
35. Can a human validate the output before consequential action? → humanValidation.
36. What would make this process materially better? → improvementOutcome.
Derived: automationSuitability, aiSuitability, humanInLoopFeasibility.

## G. Baseline KPI
37. Current SLA/target → sla.
38. Current cost/time/error KPI → baselineKpis[].
39. Desired target → targetKpis[].
40. Evidence source for baseline → evidenceSource.
Derived: Business Case baseline and Benefits Tracker pre-population.

### F04 derived indicators
- Process Efficiency = Touch Time / Lead Time
- Waiting Ratio
- Annual Workload Hours
- Annual Rework Hours
- Handoff Complexity
- Approval Burden
- Integration Pain
- Data Readiness
- Process Risk
- Key Person Risk
- Automation Suitability
- AI Suitability
- Baseline Evidence Confidence

---

# Routing logic
1. F01 is completed once per active function by its owner.
2. F02 is completed by selected managers/key users; use multiple respondents where possible and aggregate median/mean + dispersion.
3. F03 is sampled across actual workers/roles and remains the main source of bottom-up work evidence.
4. Opportunity Engine combines F01 pain/manual signals + F02 readiness gaps + F03 task evidence.
5. F04 is requested only for candidate processes that pass a configurable priority threshold or are manually selected.
6. F04 baseline feeds Business Case and Readiness Gate.
7. AFTER measures from PoC feed Benefits Tracker and close the evidence loop.

# Data quality rules
- Keep respondent self-assessment separate from observed/measured evidence.
- Store survey version on every response (e.g. F02@2.0).
- Never overwrite old responses when questionnaires evolve.
- Store sourceSurvey and sourceQuestion IDs for traceability.
- Add N/A where a respondent cannot reasonably know the answer; do not force artificial scores.
- Calculate confidence/coverage separately from maturity/performance.
- Preserve F01/F02/F04 v1 import compatibility.

# Implementation recommendation
Do not replace production forms in one commit. Implement versioned schemas first, then UI, then import mapping, then dashboards/scoring, then test with synthetic responses, and finally activate V2 while retaining V1 historical readability.
