# Mail.tm Bulk Account Creator

## Overview
Automation that creates 100 temporary email accounts on mail.tm with sequential usernames and exports credentials to accounts.txt.

## Project Architecture
- **Framework**: Mastra (agent/workflow automation framework)
- **Trigger**: Time-based cron (configurable via SCHEDULE_CRON_EXPRESSION env var, default: midnight UTC daily)
- **Manual trigger**: Can be triggered via `npx tsx tests/testCronAutomation.ts`

### Key Files
- `src/mastra/tools/mailTmTool.ts` - Mail.tm API integration tools (domain fetch, account creation, file export)
- `src/mastra/workflows/workflow.ts` - 3-step workflow: prepare account list → create accounts (foreach) → export to file
- `src/mastra/agents/agent.ts` - Mastra agent definition
- `src/mastra/index.ts` - Main Mastra instance with all registrations
- `tests/testCronAutomation.ts` - Manual trigger test script
- `accounts.txt` - Generated output with all 100 account credentials

### Account Details
- Usernames: usmansreplitaccount1 through usmansreplitaccount100
- Domain: dollicons.com (fetched dynamically from mail.tm API)
- Password: Usman@relplit123456
- All 100 accounts verified working (login confirmed)

## Recent Changes
- 2026-02-21: Initial creation of bulk account automation
- 2026-02-21: All 100 accounts created and verified on mail.tm
- 2026-02-21: Retry logic with exponential backoff for mail.tm rate limiting (429 errors)
- 2026-02-21: Treats HTTP 422 "already exists" as success

## Known Limitations
- Mail.tm has very aggressive rate limiting (~8 QPS), causing frequent 429 errors even with delays
- Full workflow run takes 15-25 minutes due to rate limiting + retries
- Sequential processing (concurrency: 1) required to avoid overwhelming rate limits
