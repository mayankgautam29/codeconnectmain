import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base configs for Next.js and TypeScript
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Custom rule overrides
  {
    rules: {
      // TypeScript ESLint
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",

      // JavaScript / general ESLint
      "no-unused-vars": "off",
      "no-undef": "off",

      // React-specific rules
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",

      // Next.js-specific rules
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default eslintConfig;
