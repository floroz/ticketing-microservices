async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    console.log("Attempt: ", attempt);
    try {
      return await operation();
    } catch (error) {
      console.error("Error: ", error);
      if (attempt === maxRetries - 1) {
        console.log("Throwing error - max attempt reached");
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Unexpected end of retry loop");
}

export { withRetry };
