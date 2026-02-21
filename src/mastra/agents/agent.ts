import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { sharedPostgresStorage } from "../storage";
import {
  fetchMailTmDomains,
  createMailTmAccount,
  exportAccountsToFile,
} from "../tools/mailTmTool";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export const automationAgent = new Agent({
  name: "Mail.tm Account Manager",
  id: "automationAgent",
  instructions: `
    You are a mail.tm account management agent. Your job is to help create and manage
    temporary email accounts on the mail.tm service.

    You can:
    - Fetch available domains from mail.tm
    - Create new temporary email accounts
    - Export account details to text files

    When creating accounts, follow the naming pattern specified and use the provided password.
    Always report results clearly including how many accounts were created successfully and any failures.
  `,
  model: openai("gpt-4o-mini"),
  tools: {
    fetchMailTmDomains,
    createMailTmAccount,
    exportAccountsToFile,
  },
});
