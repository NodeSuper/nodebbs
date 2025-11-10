import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // 允许在 JSX 中使用未转义的引号
      "react/no-unescaped-entities": "off",
      // 将 React Hook 依赖警告降级为警告而非错误
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;
