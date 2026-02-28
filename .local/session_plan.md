# Objective
Create a standalone CLI script (`create-accounts.ts`) that the user can run locally on their PC (via `npx tsx create-accounts.ts`). The script will interactively prompt the user for:
1. How many accounts to create (1 to any number)
2. Which domain to use (show available mail.tm domains or let them type one)
3. What password to set for all accounts
4. A base username — check if it already exists on mail.tm, if yes tell the user; if not, create accounts with sequential numbering (username01, username02, etc.)

All created accounts are exported to `accounts.txt`.

# Tasks

### T001: Create standalone CLI script `create-accounts.ts`
- **Blocked By**: []
- **Details**:
  - Create a single self-contained TypeScript file at the project root: `create-accounts.ts`
  - Use Node.js built-in `readline` for interactive prompts (no extra dependencies needed)
  - Prompt 1: "How many accounts do you want to create?" — validate it's a positive integer
  - Prompt 2: "Which domain?" — fetch available domains from `https://api.mail.tm/domains` and display them, let user pick or type one
  - Prompt 3: "What password do you want?" — accept any string
  - Prompt 4: "What base username?" — e.g. if user types `abc`, check if `abc@domain` exists via mail.tm API. If it exists, tell the user. If not, create accounts as `abc01@domain`, `abc02@domain`, etc.
  - Include rate limiting: 3s delay between requests, exponential backoff on 429 errors (up to 7 retries)
  - Export all successful accounts to `accounts.txt` with email and password
  - Show progress in terminal (e.g., "Creating account 5/100...")
  - Files: `create-accounts.ts` (new file)
  - Acceptance: Running `npx tsx create-accounts.ts` opens interactive prompts and creates accounts successfully

### T002: Test the CLI script
- **Blocked By**: [T001]
- **Details**:
  - Run the script and verify the prompts work correctly
  - Verify domain fetching works
  - Verify accounts.txt is generated
  - Files: `create-accounts.ts`, `accounts.txt`
  - Acceptance: Script runs end-to-end without errors
