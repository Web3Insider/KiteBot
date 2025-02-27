import { agents, rateLimitConfig } from "./src/config/config.js";
import agentService from "./src/services/agent.service.js";
import walletService from "./src/services/wallet.service.js";
import dashboard from "./src/ui/dashboard.js";
import { sleep, formatError } from "./src/utils/helpers.js";

let isRunning = true;
const stats = {
  total: 0,
  successful: 0,
  failed: 0,
};

const startTime = Date.now();

// Track interaction count and cooldown per wallet
const walletStates = new Map();

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

async function processWallet(wallet, cycleCount) {
  dashboard.log(`Processing wallet: ${wallet}`);
  dashboard.updateStatus(wallet, cycleCount, Date.now() - startTime);

  // Initialize wallet state if not exists
  if (!walletStates.has(wallet)) {
    walletStates.set(wallet, { interactions: 0, cooldownStart: null });
  }
  const state = walletStates.get(wallet);

  // Handle cooldown logic
  if (state.interactions >= 100) {
    const now = Date.now();
    if (state.cooldownStart === null) {
      state.cooldownStart = now;
      dashboard.log(`Wallet ${wallet} reached 100 interactions. Starting 24h cooldown.`);
      return;
    }

    const cooldownDuration = 24 * 60 * 60 * 1000; // 24 hours
    if (now - state.cooldownStart < cooldownDuration) {
      const remaining = cooldownDuration - (now - state.cooldownStart);
      const remainingHours = Math.ceil(remaining / (1000 * 60 * 60));
      dashboard.log(`Wallet ${wallet} in cooldown. ${remainingHours} hours remaining. Skipping.`);
      return;
    }

    // Reset if cooldown completed
    state.interactions = 0;
    state.cooldownStart = null;
    dashboard.log(`Wallet ${wallet} cooldown finished. Resuming interactions.`);
  }

  // Process agents
  for (const [agentId, agentName] of Object.entries(agents)) {
    if (!isRunning) break;

    await processAgentCycle(wallet, agentId, agentName);
    state.interactions++;

    // Check if reached interaction limit
    if (state.interactions >= 100) {
      state.cooldownStart = Date.now();
      dashboard.log(`Wallet ${wallet} reached 100 interactions. Cooldown started.`);
      break;
    }

    if (isRunning) {
      const waitTime = rateLimitConfig.intervalBetweenCycles / 1000;
      dashboard.log(`Waiting ${waitTime} seconds before next attempt...`);
      await sleep(rateLimitConfig.intervalBetweenCycles);
    }
  }
}

// Rest of the code remains unchanged
async function startContinuousProcess(wallets) {
  let cycleCount = 1;

  while (isRunning) {
    dashboard.log(`Starting Cycle #${cycleCount}`);

    for (const wallet of wallets) {
      if (!isRunning) break;
      await processWallet(wallet, cycleCount);
    }

    cycleCount++;
    dashboard.updateProgress((cycleCount % 10) * 10);
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

    await startContinuousProcess(wallets);
  } catch (error) {
    dashboard.log(`An error occurred: ${formatError(error)}`);
    process.exit(1);
  }
}

main();
