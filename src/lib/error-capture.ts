let lastCapturedError: unknown = null;

if (typeof process !== "undefined" && typeof process.on === "function") {
  process.on("uncaughtException", (error) => {
    lastCapturedError = error;
  });
  process.on("unhandledRejection", (reason) => {
    lastCapturedError = reason;
  });
}

export function consumeLastCapturedError() {
  const error = lastCapturedError;
  lastCapturedError = null;
  return error;
}
