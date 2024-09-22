module.exports = {
  // root: 'false',
  extends: ['alloy', 'alloy/react', 'alloy/typescript'],
  // to fix typescript no-undef error with global types
  // e.g. namespace Derby in global.d.ts and HeadersInit or other ts global lib types
  // https://typescript-eslint.io/linting/troubleshooting/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
  env: {
    // Your environments (which contains several predefined global variables)
    //
    browser: true,
    node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // Your global variables (setting to false means it's not allowed to be reassigned)
    //
    // myGlobal: false
  },
  rules: {
    // Customize your rules
    'max-params': ['warn', 5],
    // WARN:NEED FIX
    // 代码圈复杂度检查 暂时设置很大，后续慢慢缩小来优化代码
    complexity: ['warn', { max: 50 }],
    'guard-for-in': 'off',
    'prefer-promise-reject-errors': 'off', // promise reject会报错  EXAMPLE: Promise.reject(<FormattedMessage id="common.required" />)
    '@typescript-eslint/prefer-for-of': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off', // &&, ||, 会报错 EXAMPLE: Mapping.tsx --> callback
    // https://github.com/jsx-eslint/eslint-plugin-react/issues/2584
    // ignore this to fix <>{condition && <div></div>}</> case
    'react/jsx-no-useless-fragment': [2, { allowExpressions: true }],
  },
};
