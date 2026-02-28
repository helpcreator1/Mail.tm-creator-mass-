import * as readline from "readline";
import * as fs from "fs";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchDomains(): Promise<string[]> {
  const res = await fetch("https://api.mail.tm/domains", {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch domains: ${res.status}`);
  const data = (await res.json()) as any;
  return data.map((d: any) => d.domain);
}

async function checkAccountExists(
  address: string,
  password: string,
): Promise<boolean> {
  try {
    const res = await fetch("https://api.mail.tm/token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ address, password }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function createAccount(
  address: string,
  password: string,
  retries = 7,
): Promise<{ address: string; password: string; success: boolean; message: string }> {
  let delay = 3000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch("https://api.mail.tm/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ address, password }),
      });

      if (res.ok) {
        return { address, password, success: true, message: "Created" };
      }

      const errorText = await res.text();

      if (res.status === 422 && errorText.includes("already used")) {
        return { address, password, success: true, message: "Already exists" };
      }

      if (res.status === 429) {
        console.log(
          `  ⏳ Rate limited on ${address}, retrying in ${delay / 1000}s (attempt ${attempt}/${retries})...`,
        );
        await sleep(delay);
        delay *= 2;
        continue;
      }

      return {
        address,
        password,
        success: false,
        message: `HTTP ${res.status}: ${errorText}`,
      };
    } catch (err: any) {
      if (attempt === retries) {
        return { address, password, success: false, message: err.message };
      }
      console.log(
        `  ⏳ Error on ${address}, retrying in ${delay / 1000}s (attempt ${attempt}/${retries})...`,
      );
      await sleep(delay);
      delay *= 2;
    }
  }

  return { address, password, success: false, message: "Max retries reached" };
}

function pad(num: number, size: number): string {
  let s = String(num);
  while (s.length < size) s = "0" + s;
  return s;
}

async function main() {
  console.log("\n========================================");
  console.log("   MAIL.TM BULK ACCOUNT CREATOR");
  console.log("========================================\n");

  console.log("Fetching available domains...\n");
  let domains: string[];
  try {
    domains = await fetchDomains();
  } catch (err: any) {
    console.log("❌ Could not fetch domains:", err.message);
    rl.close();
    return;
  }

  const countStr = await ask("How many accounts do you want to create? ");
  const count = parseInt(countStr, 10);
  if (isNaN(count) || count < 1) {
    console.log("❌ Please enter a valid number (1 or more).");
    rl.close();
    return;
  }

  console.log("\nAvailable domains:");
  domains.forEach((d, i) => console.log(`  ${i + 1}. ${d}`));
  console.log();
  const domainInput = await ask(
    "Which domain do you want to use? (enter number or type domain): ",
  );
  let domain: string;
  const domainIndex = parseInt(domainInput, 10);
  if (!isNaN(domainIndex) && domainIndex >= 1 && domainIndex <= domains.length) {
    domain = domains[domainIndex - 1];
  } else if (domainInput.includes(".")) {
    domain = domainInput;
  } else {
    console.log("❌ Invalid domain selection.");
    rl.close();
    return;
  }
  console.log(`  ✓ Using domain: ${domain}\n`);

  const password = await ask("What password do you want for all accounts? ");
  if (!password) {
    console.log("❌ Password cannot be empty.");
    rl.close();
    return;
  }

  const baseUsername = await ask(
    "\nWhat base username do you want? (e.g. 'abc' → abc01, abc02, ...): ",
  );
  if (!baseUsername) {
    console.log("❌ Username cannot be empty.");
    rl.close();
    return;
  }

  console.log(`\nChecking if "${baseUsername}@${domain}" already exists...`);
  const exists = await checkAccountExists(`${baseUsername}@${domain}`, password);
  if (exists) {
    console.log(
      `⚠️  "${baseUsername}@${domain}" already exists! Sequential accounts will still be created.\n`,
    );
  } else {
    console.log(`✓ "${baseUsername}@${domain}" is available.\n`);
  }

  const padSize = String(count).length < 2 ? 2 : String(count).length;

  console.log("========================================");
  console.log(`  Creating ${count} accounts...`);
  console.log(`  Username pattern: ${baseUsername}${pad(1, padSize)} - ${baseUsername}${pad(count, padSize)}`);
  console.log(`  Domain: ${domain}`);
  console.log("========================================\n");

  const results: {
    address: string;
    password: string;
    success: boolean;
    message: string;
  }[] = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 1; i <= count; i++) {
    const username = `${baseUsername}${pad(i, padSize)}`;
    const address = `${username}@${domain}`;

    process.stdout.write(`[${i}/${count}] Creating ${address}... `);

    const result = await createAccount(address, password);
    results.push(result);

    if (result.success) {
      successCount++;
      console.log(`✅ ${result.message}`);
    } else {
      failCount++;
      console.log(`❌ ${result.message}`);
    }

    if (i < count) {
      await sleep(3000);
    }
  }

  let fileContent = "====================================\n";
  fileContent += "  MAIL.TM ACCOUNTS - BULK EXPORT\n";
  fileContent += `  Generated: ${new Date().toISOString()}\n`;
  fileContent += "====================================\n\n";
  fileContent += `Total Created: ${successCount}\n`;
  fileContent += `Total Failed: ${failCount}\n\n`;
  fileContent += "--- ACCOUNTS ---\n\n";

  for (const r of results.filter((r) => r.success)) {
    fileContent += `Email: ${r.address}\n`;
    fileContent += `Password: ${r.password}\n`;
    fileContent += "---\n";
  }

  if (failCount > 0) {
    fileContent += "\n--- FAILED ---\n\n";
    for (const r of results.filter((r) => !r.success)) {
      fileContent += `Email: ${r.address}\n`;
      fileContent += `Reason: ${r.message}\n`;
      fileContent += "---\n";
    }
  }

  fs.writeFileSync("accounts.txt", fileContent, "utf-8");

  console.log("\n========================================");
  console.log("  DONE!");
  console.log(`  ✅ Created: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log("  📄 Saved to: accounts.txt");
  console.log("========================================\n");

  rl.close();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  rl.close();
  process.exit(1);
});
