export const rateLimitConfig = {
  maxRetries: 5,
  baseDelay: 2000,
  maxDelay: 10000,
  requestsPerMinute: 15,
  intervalBetweenCycles: 15000,
  walletVerificationRetries: 3,
};

export const agents = {
  deployment_r89ftdnxa7jwwhyr97wq9lkg: "Professor",
  deployment_fsegykivcls3m9nrpe9zguy9: "Crypto Buddy",
  deployment_xkerjnnbdtazr9e15x3y7fi8: "Sherlock",
};

export const groqConfig = {
  apiKey: "Your API KEY",
  model: "mixtral-8x7b-32768",
  temperature: 0.7,
};
