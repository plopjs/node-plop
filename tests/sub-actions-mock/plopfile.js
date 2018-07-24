module.exports = function(plop) {
	'use strict';

	plop.setActionType(
		'component-with-tests-and-stories',
		(answers, config, { runActions }) => {
			return runActions(
				[
					{
						type: 'add',
						path: './src/components/{{name}}.js',
						templateFile: config.componentTemplate
					},
					{
						type: 'add',
						path: './src/components/stories/{{name}}.story.js',
						templateFile: config.storyTemplate
					},
					{
						type: 'add',
						path: './src/components/tests/{{name}}.test.js',
						templateFile: config.testTemplate
					}
				],
				answers
			);
		}
	);

	plop.setGenerator('component', {
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: 'What\'s the component name?'
			}
		],
		actions: [
			{
				type: 'component-with-tests-and-stories',
				componentTemplate: 'plop-templates/component.js',
				testTemplate: 'plop-templates/component.test.js',
				storyTemplate: 'plop-templates/component.story.js'
			}
		]
	});
};
