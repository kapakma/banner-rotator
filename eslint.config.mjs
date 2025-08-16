import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs}"], 
    plugins: { 
      js
    }, 
    languageOptions: {
      globals: {
        ...globals.browser,
        $: "readonly",
        jQuery: "readonly",
      },
    },
    extends: [
      js.configs.recommended, 
    ],
    rules: {
      "no-console": "warn",
      "no-alert": "error",
      "eqeqeq": ["error", "always"],
      "no-implicit-globals": "error",
      "no-var": "error",
      "prefer-template": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "curly": ["error", "all"],
      "dot-notation": "error",
      "no-multi-spaces": "error",
      "no-return-await": "error",
      "yoda": "error",
      "indent": ["error", 4],
      "semi": ["error", "always"],
      "comma-dangle": ["error", "always-multiline"],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"],
      "func-call-spacing": ["error", "never"],
      "max-len": ["warn", { code: 120 }],
    },
  },
]);
