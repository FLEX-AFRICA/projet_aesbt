import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: [".next", "next-env.d.ts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Composants vendus depuis les registres shadcn (Kokonut UI, Componentry)
    // et prototypes d'animation. On les garde tels quels pour rester
    // réinstallables via la CLI : leur code (canvas, bruit de Perlin,
    // Float32Array) indexe des tableaux de taille fixe, ce que le
    // `noUncheckedIndexedAccess` de ce projet signale à tort.
    files: [
      "src/components/kokonutui/**/*.{ts,tsx}",
      "src/components/hero-lab/mascots/registry.ts",
      "src/components/ui/case-study-flip-stack.tsx",
    ],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
  eslintPluginPrettier,
);
