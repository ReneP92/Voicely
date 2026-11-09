# Product scope

**Status: approved product direction, with implementation planned.** This summary follows the [Voicely Linear project](https://linear.app/personal-rp501/project/voicely-ai-sales-and-support-agent-66ae94a7c2cb), which remains the source of truth. Update Linear and affected issues when decisions change, then synchronize repository documentation.

See the [root README](../README.md#current-implementation) for the implemented foundation, and [architecture](architecture.md) for approved choices and remaining validation.

## Audience and goal

Voicely helps B2C SMEs answer buying and post-purchase questions through a website chat widget. The first pilot targets **physical-product Shopify shops**. Sales and support are equal goals.

The initial market is **US English**. The fictional **Trailside Supply** outdoor clothing/accessories merchant supplies synthetic demos and test cases. It is not a committed design partner or evidence of commercial demand. See [demo fixtures](demo.md).

Support Shopify storefronts and custom-site widget embedding. Embedding on a custom website does not provide access to its operational systems automatically. Digital products, services, and subscription-specific workflows are later expansion candidates.

## Initial journeys

| Journey                    | Planned behavior                                                                                                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Buying advice              | Clarify needs and compare suitable products or variants using published content and current permitted commerce facts                                                                         |
| Order and delivery enquiry | Verify the shopper, retrieve authorized order/fulfillment facts, explain available evidence, and prepare an investigation request if needed                                                  |
| Return or exchange         | Verify the order/item, collect the reason and desired variant, apply the merchant's published policy with provenance, flag uncertainty or unavailable stock, and prepare a request for staff |

The baseline is **answers, authorized lookups, and request preparation**. Submitting a request does not issue a refund, apply a discount, replace an item, or complete an exchange. Selected automated operational actions require validated merchant rules, integrations, and individually specified follow-on work.

## Knowledge and customer context

- Merchants upload product descriptions, manuals, and policies through the admin panel. Content needs preview, publication/version control, and accessible citations.
- Anonymous shoppers receive approved public information. Private orders and CRM history require verified identity and record-level authorization.
- Shopify supplies commerce facts; HubSpot CRM comes first, Salesforce second. Exact connector fields and permissions remain specification work.
- Customer purchase history can personalize permitted answers. Tenant-specific aggregate sales patterns can inform recommendations after product suitability and compatibility checks.
- Current prices, stock, and fulfillment facts need operational sources with freshness rules. Product documents alone cannot establish them.
- A contact email confirmed for follow-up is distinct from identity proof for access to private order information.

## Escalation and email follow-up

Escalate when the AI cannot resolve the question, a change needs staff, or the shopper requests human help.

1. Collect or confirm the shopper's contact email and necessary request details.
2. Prepare a tenant-scoped request with a stable reference, summary, transcript, applicable policy/source evidence, desired outcome, missing information, and authorized customer/order/item context.
3. Let the shopper review and correct the prepared details.
4. Select the merchant's configured route:
   - **Helpdesk connected:** create a ticket in the existing helpdesk. Staff continue with the shopper by email through that system.
   - **No helpdesk connected:** email the merchant's support inbox from a Voicely-controlled authenticated address. Set `Reply-To` to the shopper's validated, confirmed contact address so the merchant can reply directly by email.
5. Show pending status while queued. Confirm submission only after acknowledged ticket creation or outbound email-provider acceptance. Expose failures honestly.
6. Human replies continue by email after the shopper leaves the site. They do not return to the widget in the MVP.

Use durable retries, duplicate prevention, and reconciliation for uncertain outcomes. A temporarily unavailable connected helpdesk is not the same as having no helpdesk configured. [PER-32](https://linear.app/personal-rp501/issue/PER-32) specifies no automatic cross-channel rerouting and no blind resend after uncertain acceptance. A future rerouting/force-resend feature needs a separate explicit decision.

### Delivery is not resolution

Track these separately:

- Request persisted and queued.
- Ticket or email accepted by the destination/provider.
- Recipient delivery, where observable.
- Human response or customer resolution, where supported by evidence.

Email-provider acceptance does not establish inbox delivery, reading, or resolution. For merchant-email fallback, resolution remains unknown unless explicit pilot follow-up supplies evidence. A connected helpdesk may provide additional outcome signals depending on its adapter. Conversation abandonment is not a resolved case.

## Merchant admin panel

The admin panel provides:

- Organisation onboarding, staff access, and role-based configuration/review permissions.
- Product/manual/policy uploads, versioning, publication, and ingestion health.
- Agent behavior/branding settings and cited preview conversations.
- Shopify, CRM, and helpdesk connection management or merchant support email setup.
- Widget installation guidance and test delivery.
- Tenant-scoped conversation review, feedback, unanswered topics, usage, and cost.
- Request references, destination references, delivery status, retry diagnostics, and known outcomes.

The **fallback admin support inbox is superseded**. Staff assignment/ownership, an internal reply composer, live staff replies in the widget, AI takeover/return controls, and two-way helpdesk chat are not MVP requirements. Configuration and conversation review remain part of the admin panel.

## Validation and pilot

There are no committed design partners or measured demand/economic results in the planning baseline. The founder's support scenarios are requirements candidates, not observed research.

Interview at least five physical-product Shopify merchants and recruit 2-3 design partners. Collect at least 100 permitted real questions balanced across sales and support, with expert reference answers and a held-out subset. Compare documents alone, documents plus commerce facts, and added CRM context. Test against an incumbent where access permits.

Proposed targets, to agree with partners:

- At least 90% expert-accepted answers in each sales/support track.
- At least 95% appropriate abstention or handoff on unsupported cases.
- At least 10 percentage points additional acceptance on CRM-dependent cases over the document-plus-commerce baseline, with sufficient samples and uncertainty reported.
- p95 first useful response within 5 seconds under an agreed pilot load.
- Correct helpdesk/email routing, complete requests, accurate status, and retry-safe delivery in end-to-end checks.

Measure qualified sales outcomes, confirmed support resolution, delivery, latency, cost, onboarding effort, and operator effort separately. Unknown outcomes must remain explicit. Prices and paid-pilot intent require conversations with actual budget owners.

## First integrated slice

[PER-33](https://linear.app/personal-rp501/issue/PER-33) owns the local runtime/adapters and synthetic commerce; [PER-34](https://linear.app/personal-rp501/issue/PER-34) owns complete local acceptance under the [PER-32 v2 local-first amendment](https://linear.app/personal-rp501/issue/PER-32). [PER-17](https://linear.app/personal-rp501/issue/PER-17) owns local synthetic guest proof; [PER-27](https://linear.app/personal-rp501/issue/PER-27) owns actual provider proof.

**Approved local-first target, not yet implemented.** From a fresh checkout, a merchant logs into the React admin through local OIDC, uploads and publishes a return policy, configures and verifies a synthetic support destination, and opens the widget on the local storefront. A shopper receives buying advice, verifies access through a code sent to the trusted synthetic order contact, retrieves only the authorized order, and reviews/submits an exchange request. The worker captures the support email in Mailpit with the correct `Reply-To`; the UI reports the actual acceptance/capture evidence.

The stack uses Node/Fastify, pg-boss, PostgreSQL/pgvector, persistent filesystem-backed knowledge storage and SMTP/Mailpit. Local identity retains application membership and authorization checks. The synthetic Trailside commerce adapter uses production domain contracts. Preview remains non-dispatching; dispatch-capable local demo/runtime mail capture is restricted to synthetic tenants. SMTP acceptance or Mailpit capture does not establish delivery to a human inbox, a reply or resolution.

Interactive acceptance uses real model calls with user-configured provider credentials. Deterministic model doubles are for ordinary CI, not AI quality claims. Local does not mean fully offline. Browser E2E must cover the complete journey plus persistence after restart, tenancy/shopper isolation, lost responses, cancellation, duplicate submission, fencing and uncertain sends without blind resend or automatic rerouting.

No AWS account or deployment is required for this first version. Cognito, S3 and SES are later adapters under [PER-30](https://linear.app/personal-rp501/issue/PER-30), now in milestone06 and blocked by PER-34. Real Shopify and CRM integrations can run from local services with credentials and a tunnel where needed, and remain separate provider-validation gates. Validate the Shopify development-store journey and connected-helpdesk path before enabling those connectors for a pilot. The eventual merchant follow-up remains email outside the widget.

## Open decisions and Linear references

US English, the outdoor-products demo, HubSpot-first CRM and a fully functional local first version are selected. SMTP/Mailpit supports the synthetic local journey; SES email and AWS hosting remain later deployment choices. PER-32 specifies first-slice screens, contracts, review/submission states and failure behavior across adapters. Remaining validation includes actual pilot category fit, helpdesk capabilities, exact CRM coverage, guest verification, real merchant policies/response expectations, retention, recruitment, measured costs, ownership and timing. The founder has set no hard budget cap; optimize measured performance and quality per dollar.

| Topic                                                  | Authoritative issue                                      |
| ------------------------------------------------------ | -------------------------------------------------------- |
| Demand and design partners                             | [PER-10](https://linear.app/personal-rp501/issue/PER-10) |
| Answer quality and incremental CRM value               | [PER-11](https://linear.app/personal-rp501/issue/PER-11) |
| Admin scope                                            | [PER-18](https://linear.app/personal-rp501/issue/PER-18) |
| Pilot scope, economics, and founder scenario inventory | [PER-25](https://linear.app/personal-rp501/issue/PER-25) |
| Helpdesk/email delivery                                | [PER-26](https://linear.app/personal-rp501/issue/PER-26) |
| Live pilot outcomes                                    | [PER-15](https://linear.app/personal-rp501/issue/PER-15) |

The full milestone and dependency graph lives in Linear rather than this summary.
