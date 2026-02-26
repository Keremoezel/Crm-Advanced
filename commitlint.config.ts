export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Formatting (no code change)
        'refactor', // Code restructure (no feature/fix)
        'perf', // Performance improvement
        'test', // Adding/updating tests
        'ci', // CI/CD changes
        'chore', // Maintenance tasks
        'revert', // Revert a commit
        'schema', // Database schema changes
        'security', // Security improvements
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-max-length': [2, 'always', 100],
  },
}
