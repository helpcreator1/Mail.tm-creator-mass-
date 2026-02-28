# Mail.TM Bulk Account Creator

A command-line tool to create multiple temporary email accounts on mail.tm.

## Requirements

- **Node.js** version 20 or higher — Download from https://nodejs.org

## Setup

1. Download and extract the project to a folder on your PC
2. Open **Command Prompt** or **PowerShell**
3. Navigate to the project folder:
   ```
   cd C:\path\to\your\folder
   ```
4. Install dependencies:
   ```
   npm install
   ```

## How to Run

```
npx tsx create-accounts.ts
```

The script will ask you:

1. **How many accounts?** — Enter any number (1 or more)
2. **Which domain?** — Pick from the available list by number, or type the domain (with or without @)
3. **What password?** — Must be at least 6 characters
4. **What base username?** — For example, if you type `myuser`, it creates `myuser01`, `myuser02`, `myuser03`, etc.

After all accounts are created, the credentials are saved to **accounts.txt** in the same folder.

## Notes

- The script handles rate limiting automatically — if mail.tm slows you down, it waits and retries
- If you enter something wrong, it asks again instead of crashing
- If a username already exists, it tells you and continues creating the rest
- You need an internet connection to run this
