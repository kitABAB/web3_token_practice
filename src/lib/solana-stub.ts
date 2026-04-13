// Stub for @solana/kit to prevent build errors
// This is needed because @wagmi/connectors includes Coinbase SDK which depends on Solana

export function createSolanaRpc() {
  throw new Error("Solana is not supported in this application");
}

export default {};
