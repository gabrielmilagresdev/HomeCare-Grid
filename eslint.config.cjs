const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
module.exports = defineConfig([
  expo,
  { ignores: ['dist/**', 'coverage/**', '.cache/**', '.runtime/**', 'artifacts/**'] },
  { files: ['src/domain/**/*.ts'], rules: { 'no-restricted-imports': ['error', { patterns: ['react', 'react-native', 'expo*', '@supabase/*', '@/features/*'] }] } },
  { files: ['app/**/*.tsx'], rules: { 'no-restricted-imports': ['error', { patterns: ['@supabase/*', 'openai'] }] } }
]);
