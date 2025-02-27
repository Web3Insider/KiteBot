# KiteAI Bot

A Node.js bot for interacting with the KiteAI testnet platform, featuring a clean terminal user interface and automated interactions with AI agents.

## Features

- Interactive terminal dashboard using blessed/blessed-contrib
- Multiple wallet support
- Automated interactions with AI agents (Professor, Crypto Buddy, Sherlock)
- Real-time statistics and progress tracking
- Rate limiting and error handling
- Groq AI integration for dynamic question generation

## Prerequisites

- Node.js v16 or higher
- A KiteAI testnet account [Register](https://testnet.gokite.ai?r=H7CKh96f)
- A Groq API key Get it from https://console.groq.com

## Installation

1. Clone the repository:

```bash
git clone https://codeberg.org/Galkurta/KiteAI-BOT.git
cd KiteAI-BOT
```

2. Install dependencies:

```bash
npm install
```

3. Create a data.txt file in the root directory and add your wallet addresses (one per line):

```
0xwallet1address
0xwallet2address
```

4. Update your Groq API key in src/config/config.js:

```javascript
export const groqConfig = {
  apiKey: "your-groq-api-key-here",
  model: "mixtral-8x7b-32768",
  temperature: 0.7,
};
```

## Usage

Start the bot:

```bash
node main.js
```

### Controls

- Press `Ctrl+C` or `q` to exit
- The dashboard will show:
  - Current wallet and cycle status
  - Agent interactions log
  - Statistics (total requests, success rate)
  - Progress indicator

## Dashboard Components

- **Banner**: Shows project information and links
- **Agent Interactions**: Real-time log of questions and answers
- **Status**: Shows active wallet, current cycle, and running time
- **Statistics**: Displays request counts and success rate
- **Progress**: Visual indicator of cycle progress (resets every 10 cycles)

## Error Handling

The bot includes robust error handling for:

- Network timeouts
- Rate limiting
- Invalid responses
- API errors

## Configuration

You can modify the following settings in src/config/config.js:

```javascript
export const rateLimitConfig = {
  maxRetries: 5,
  baseDelay: 2000,
  maxDelay: 10000,
  requestsPerMinute: 15,
  intervalBetweenCycles: 15000,
};
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Links

- [Codeberg](https://codeberg.org/Galkurta)
- [Telegram](https://t.me/galkurtarchive)
- [KiteAI Testnet](https://testnet.gokite.ai?r=H7CKh96f)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
