# Rapid Studios website sales improvements

Date: 2026-09-10

The user supplied seven sales strategy references and asked to apply them to Rapid Studios. This update uses the existing studio offers, portfolio, and verified Calendly event. The primary audience is business owners and service businesses; founders and product teams remain welcome. This is a positioning choice, not a finding from customer research.

## How the seven references were applied

| Reference | Website change |
| --- | --- |
| Sales strategy | Three recognizable offers: websites, iOS and Android apps, and AI automations. |
| Customer pain discovery | Name three useful starting problems: unclear next steps for visitors, inconvenient access to a service, and repetitive team tasks. These are hypotheses to validate in discovery calls, not attributed customer quotes. |
| Offer positioning | Describe the customer task each offer helps with and link directly to its scope. Preserve real portfolio evidence without inventing results. |
| Sales messaging | Replace abstract production language with clear benefits and a consistent invitation to a 15-minute project call. |
| Objection handling | Seven visible FAQs explain scope and cost, integrations, timing, ownership and licensing, support, the first call, and app-store submission. |
| Sales funnel | Home → relevant service or existing work → pricing and scope → direct booking or a project note → reviewed proposal and milestones. Fix false success when the team notification is not accepted. |
| Sustainable growth | Offer separately scoped ongoing support and post-launch improvements. Use the follow-through plan below to validate demand and prioritize repeat work. |

## Follow-through plan

1. **First two weeks — Travis:** Record the source, requested service, problem, and next step for each real inquiry in the existing lead workflow. Establish a baseline before claiming an improvement.
2. **Every discovery call — Travis:** Ask what the customer is trying to make easier, where the current process fails, who uses it, and which constraints matter. Use the customer's own language to refine page copy.
3. **Every proposal — Travis:** Specify deliverables, exclusions, milestones, price, third-party fees, and who supplies access or content. Agree a practical success measure with that customer.
4. **Weekly review — Travis:** Compare service interest, completed bookings, accepted project notes, qualified conversations, proposals, and wins. Investigate losses and drop-offs before adding more traffic or changing prices.
5. **After each launch — Travis and the customer:** Review agreed outcomes, unresolved issues, and feedback. Offer maintenance or the next useful improvement only where there is a clear need and scope.
6. **After a successful outcome — Travis:** Ask permission to publish an accurate case study or request a referral. Keep results traceable to evidence.

No outreach, recurring automation, discount, guarantee, or customer commitment was created by this update.

## Measurement and implementation

The existing `cta_click` event now distinguishes homepage service links and booking locations. The new `booking_scheduled` event accepts only the expected Calendly origin and the embedded iframe's message source, and sends the CTA location without invitee information. `contact_submit` records an accepted submission. A click is not a booking, and email provider acceptance is not proof of inbox delivery. Analytics dashboard collection and revenue impact still need observation with real traffic.

The managed homepage snapshot records `repository-edit` provenance with no worker job ID. Its closed content slots, content hash, and worker publication checks remain enforced. Visible services and FAQs share records with structured data; the rendered checks now expect five services and seven FAQs. Schema helps describe the site but does not guarantee rankings, AI recommendations, or rich results.

## Verification

- Production build and TypeScript checks passed.
- CMS contract/security and worker tests: 30 passed.
- Contact API/email tests: 8 passed with a mocked provider and no real messages sent.
- JSON-LD unit tests: 6 passed; rendered schema and canonical checks passed on all 10 public routes locally.
- Lint has no new warnings or errors; three existing prospect-script warnings remain.
- Desktop and mobile browser checks cover offer copy, service paths, FAQs, booking controls, and form validation. The mobile review found and prompted a fix for the booking panel appearing behind the page navigation.

Release evidence and screenshots are kept outside the repository in the local `rapid-studios-schema-audit` folder. No sales lift is claimed before measurement.
