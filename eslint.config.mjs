import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends(
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
), {
    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: "./tsconfig.json",
            tsconfigRootDir: "/home/fabricevladimir/aragonette-polygon",

            ecmaFeatures: {
                jsx: true,
            },
        },
    },

    rules: {
        "react/jsx-boolean-value": ["warn", "always"],
        "no-console": "warn",
        "prefer-template": "warn",

        "@typescript-eslint/consistent-type-imports": ["warn", {
            fixStyle: "inline-type-imports",
        }],

        "@typescript-eslint/no-explicit-any": "off",

        "@typescript-eslint/no-unused-vars": ["warn", {
            ignoreRestSiblings: true,
        }],

        "@typescript-eslint/prefer-nullish-coalescing": "warn",
    },
}];