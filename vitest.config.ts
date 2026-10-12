import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      OPENAI_API_KEY: "test-key",
      OPENAI_BASE_URL: "http://openai.test/v1",
    },
  },
});
