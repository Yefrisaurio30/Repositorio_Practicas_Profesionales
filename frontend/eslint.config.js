import reactHooks from 'eslint-plugin-react-hooks'

// Calidad frontend (F6): reglas de hooks de React.
export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Adopción incremental (F6): el patrón fetch-on-mount funciona y es el
      // estándar del código actual; se migra a Suspense/query poco a poco.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]
