import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["src/modules/**/*.js"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "../../*/models",
            "../../*/models/*",
            "../../../*/models",
            "../../../*/models/*",
            "../../../../*/models",
            "../../../../*/models/*",
          ],
          message:
            "Import other module data via that module's service API (services/index.js), not via models.",
        },
      ],
    },
  },
]);
