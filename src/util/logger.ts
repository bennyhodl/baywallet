import { logger, consoleTransport } from "react-native-logs";

const config = {
  levels: {
    info: 0,
    ldk: 1,
    nostr: 2,
    keys: 3,
    error: 4,
  },
  severity: "debug",
  transport: consoleTransport,
  transportOptions: {
    colors: {
      info: "brightBlue",
      ldk: "blue",
      nostr: "magenta",
      key: "yellow",
      warn: "yellowBright",
      error: "redBright",
    },
  },
  printLevel: true,
  enabled: true,
}

export const log = logger.createLogger<"info" | "ldk" | "nostr" | "keys" | "error">(config);

