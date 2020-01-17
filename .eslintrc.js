module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": [
        "airbnb-base",
        "plugin:@typescript-eslint/recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "settings": {
        "import/resolver": {
            "node": {
            "extensions": [".js", ".jsx", ".ts", ".tsx"]
            }
        }
    },
    "rules": {
        "import/extensions": [
            "error",
            "ignorePackages",
            {
              "js": "never",
              "jsx": "never",
              "ts": "never",
              "tsx": "never"
            }
         ],
         "lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
         "@typescript-eslint/type-annotation-spacing": "off",
         "@typescript-eslint/consistent-type-assertions": "off",
         "@typescript-eslint/interface-name-prefix": "off"
    }
};
