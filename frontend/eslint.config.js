import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  { ignores: ["dist/**"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "warn",
      // Padrão de fetch-on-mount (setCarregando(true) no início do efeito,
      // depois busca async) é o que a skill react-style pede pros hooks de
      // dado — é o mesmo padrão dos exemplos oficiais do React, não um
      // anti-padrão real; regra nova e estrita demais pra esse caso.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["**/*.test.{js,jsx}", "src/test-setup.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        vi: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
      },
    },
  },
];
