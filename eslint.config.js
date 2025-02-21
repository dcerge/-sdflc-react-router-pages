import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        process: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': 'off'  // Disabling the rule completely
    }
  },
  {
    ignores: [
      // Dotfiles
      '.eslintrc.js',
      '.huskyrc.js',
      '.lintstagedrc.js',
      '.prettierrc.js',
      '.babelrc.js',
      '.stylelintrc.js',
      // Config files
      'webpack.*.config.js',
      'vite.config.js',
      // Directories
      'public/**',
      'static/**',
      '.cache/**',
      'build/**',
      'dist/**',
      'content/**',
      'node_modules/**',
      'config/**',
      'scripts/**',
      'coverage/**'
    ]
  }
];