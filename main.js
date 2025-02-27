import { agents, rateLimitConfig } from "./src/config/config.js";
import agentService from "./src/services/agent.service.js";
import walletService from "./src/services/wallet.service.js";
import dashboard from "./src/ui/dashboard.js";
import { sleep, formatError } from "./src/utils/helpers.js";

let isRunning = true;
const MAX_INTERACTIONS_PER_AGENT = 30;
const WAIT_TIME_24HRS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const stats = {
  total: 0,
  successful: 0,
  failed: 0,
};

const startTime = Date.now();

process.on("SIGINT", () => {
  dashboard.log("Stopping the script gracefully...");
  isRunning = false;
  setTimeout(() => {
    dashboard.log("Thank you for using Kite AI!");
    process.exit(0);
  }, 1000);
});

async function processAgentCycle(wallet, agentId, agentName) {
  try {
    dashboard.log(`Using Agent: ${agentName}`);

    const nanya = await agentService.sendQuestion(agentId);
    stats.total++;

    if (nanya) {
      dashboard.log(`Question: ${nanya.question}`);
      dashboard.log(`Answer: ${nanya?.response?.content ?? ""}`);

      const reported = await agentService.reportUsage(wallet, {
        agent_id: agentId,
        question: nanya.question,
        response: nanya?.response?.content ?? "No answer",
      });

      if (reported) {
        stats.successful++;
        dashboard.log("Usage data reported successfully!");
      } else {
        stats.failed++;
        dashboard.log("Usage report failed");
      }

      dashboard.updateStats(stats);
    } else {
      stats.failed++;
      dashboard.updateStats(stats);
    }
  } catch (error) {
    stats.failed++;
    dashboard.updateStats(stats);
    dashboard.log(`Error in agent cycle: ${formatError(error)}`);
  }
}

async function processWallet(wallet) {
  dashboard.log(`Processing wallet: ${wallet}`);

  for (let i = 0; i < MAX_INTERACTIONS_PER_AGENT; i++) {
    for (const [agentId, agentName] of Object.entries(agents)) {
      if (!isRunning) return;

      await processAgentCycle(wallet, agentId, agentName);

      if (isRunning) {
        const waitTime = rateLimitConfig.intervalBetweenCycles / 1000;
        dashboard.log(`Waiting ${waitTime} seconds before next attempt...`);
        await sleep(rateLimitConfig.intervalBetweenCycles);
      }
    }
  }
}

async function startProcess(wallets) {
  while (isRunning) {
    dashboard.log("Starting a new execution cycle...");

    for (const wallet of wallets) {
      if (!isRunning) return;
      await processWallet(wallet);
    }

    dashboard.log(`All agents completed ${agents.length * MAX_INTERACTIONS_PER_AGENT} interactions. Waiting 24 hours...`);
    await sleep(WAIT_TIME_24HRS);
  }
}

async function main() {
  try {
    const wallets = walletService.loadWallets();
    if (wallets.length === 0) {
      dashboard.log("No wallets found in data.txt. Stopping program.");
      process.exit(1);
    }

    dashboard.log(`Loaded ${wallets.length} wallets from data.txt`);
    dashboard.updateStatus("Initializing...");

    await startProcess(wallets);
  } catch (error) {
    dashboard.log(`An error occurred: ${formatError(error)}`);
    process.exit(1);
  }
}

main();
