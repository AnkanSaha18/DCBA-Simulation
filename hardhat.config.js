import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";

// ── টুনেবল প্যারামিটার ────────────────────────────────────────────────
// Try differnt experiment by changing values in this section

const EXPERIMENT = {

  // ── Experiment 1: Solidity Optimizer ──────────────────────────────
  // runs কম → deploy gas বেশি, কিন্তু runtime gas কম
  // runs বেশি → deploy gas কম, runtime gas ও কম
  // default ছিল 200. নিচের values try করো: 1, 200, 1000, 10000
  OPTIMIZER_RUNS: parseInt(process.env.OPTIMIZER_RUNS) || 200,

  // ── Experiment 2: Block Gas Limit ─────────────────────────────────
  // Ethereum mainnet: ~30,000,000
  // DCBA default: 60,000,000 (conservative)
  // কম করলে: SC5.submitOrder() (369,599 gas) কখন fail করে দেখা যায়
  // values to try: 500000, 1000000, 8000000, 30000000, 60000000
  BLOCK_GAS_LIMIT: 60000000, // lowest: 2400000

  // ── Experiment 3: Mining Mode ──────────────────────────────────────
  // "auto"     → প্রতিটা transaction-এর পর নতুন block mine করে
  // "interval" → নির্দিষ্ট সময় পর পর mine করে (realistic PoA simulation)
  // "manual"   → শুধু hardhat_mine call-এ mine করে
  MINING_MODE: "auto",
  MINING_INTERVAL_MS: 2000,   // interval mode-এ 2 seconds

  // ── Experiment 4: Base Fee ─────────────────────────────────────────
  // PoA network-এ 0 রাখাই best
  // বাড়ালে PoW-style network simulate করা যায়
  BASE_FEE_PER_GAS: 0,

  // ── Experiment 5: Chain ID ─────────────────────────────────────────
  // শুধু MetaMask/external tool connection-এর জন্য relevant
  CHAIN_ID: 31337,

  // ── Experiment 6: EVM Version ─────────────────────────────────────
  // "paris"    → EIP-1559, no PUSH0
  // "london"   → original Hardhat default
  // "shanghai" → PUSH0 opcode (gas efficient)
  // "cancun"   → latest, TSTORE/TLOAD opcodes
  EVM_VERSION: "paris",

  // ── Experiment 7: Account Setup ───────────────────────────────────
  COUNT: 20,          // কতটা test account (Default: 20)
  BALANCE_ETH: 10000, // প্রতিটায় কত ETH (Default : 10000)
};

// ─────────────────────────────────────────────────────────────────────

export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: EXPERIMENT.OPTIMIZER_RUNS,
      },
      evmVersion: EXPERIMENT.EVM_VERSION,
      // viaIR: true,  // IR-based compilation — আরো aggressive optimization
      // uncomment করলে gas আরো কমে কিন্তু compile অনেক slow হয়
    },
  },

  networks: {
    // ── Local Hardhat Network (primary experiment target) ────────────
    hardhat: {
      chainId: EXPERIMENT.CHAIN_ID,
      blockGasLimit: EXPERIMENT.BLOCK_GAS_LIMIT,
      gasPrice: "auto",
      initialBaseFeePerGas: EXPERIMENT.BASE_FEE_PER_GAS,
      accounts: {
        count: EXPERIMENT.COUNT,
        accountsBalance: (BigInt(EXPERIMENT.BALANCE_ETH) * BigInt("1000000000000000000")).toString(),
      },
      mining: EXPERIMENT.MINING_MODE === "interval"
        ? {
            auto: false,
            interval: EXPERIMENT.MINING_INTERVAL_MS,
          }
        : EXPERIMENT.MINING_MODE === "manual"
        ? { auto: false, interval: 0 }
        : { auto: true },   // default "auto" mode
      allowUnlimitedContractSize: false,  // true → 24KB contract limit disabled
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
    },

    // ── Named localhost (deploy.js এর জন্য) ──────────────────────────
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: EXPERIMENT.CHAIN_ID,
      gas: "auto",
    },
  },

  // ── Gas Reporter ──────────────────────────────────────────────────
  // npx hardhat test --gas এ বিস্তারিত gas breakdown দেখায়
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
};
