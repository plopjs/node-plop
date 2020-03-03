module.exports = {
	env: {
		es6: true,
		node: true
	},
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking'
	],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2018,
		project: './tsconfig.json'
	},
	rules: {
		'require-atomic-updates': 0,
		indent: ['error', 'tab'],
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'single'],
		semi: ['error', 'always'],

		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-use-before-define': 'off',
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/unbound-method': 'off',
		'no-var': 'off',
		'prefer-const': 'off',
		'@typescript-eslint/ban-ts-ignore': 'off'
	}
};
