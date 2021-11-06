module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/recommended',
    'eslint:recommended',
    '@vue/typescript',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/max-attributes-per-line': ['error', {
      'singleline': {
        'max': 4,
      },
      'multiline': {
        'max': 1,
      },
    }],
    'vue/component-name-in-template-casing': ['error', 'PascalCase', {
      'registeredComponentsOnly': false,
    }],
  },
  parserOptions: {
    parser: '@typescript-eslint/parser'
  }
}
