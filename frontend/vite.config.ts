import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { Schema, ValidateEnv } from "@julr/vite-plugin-validate-env";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ValidateEnv({
      VITE_CONTRACT_ADDRESS: Schema.string(),
    }),
  ],
});
