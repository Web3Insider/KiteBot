import fs from "fs";

class WalletService {
  loadWallets() {
    try {
      return fs
        .readFileSync("data.txt", "utf-8")
        .split("\n")
        .filter((wallet) => wallet.trim())
        .map((wallet) => wallet.trim().toLowerCase());
    } catch (error) {
      console.error("Error: data.txt not found");
      return [];
    }
  }
}

export default new WalletService();
