module.exports = function(plop) {
	'use strict';

	plop.setGeneratorMixin('withModule', {
		description: 'adds module to the generator',
		prompts: prompts =>
			[
				{
					type: 'input',
					name: 'moduleName',
					message: 'What is the modulename?',
					validate: function(value) {
						if (/.+/.test(value)) {
							return true;
						}
						return 'moduleName is required';
					}
				}
			].concat(prompts),
		actions: baseActions => {
			const modulePath = 'src/{{moduleName}}';
			return [
				{
					type: 'add',
					path: modulePath + '/index.txt',
					templateFile: 'plop-templates/moduleIndex.txt',
					abortOnFail: true
				}
			].concat(
				// also extend `path` on every base action
				(baseActions || []).map(config =>
					Object.assign({}, config, { path: modulePath + '/' + config.path })
				)
			);
		}
	});

	plop.setGeneratorMixin('withLog', {
		description: 'logs actions',

		actions: baseActions => {
			const template =
				'created these files:\n\n' + baseActions.map(a => a.path).join('\n');
			const writeLog = {
				type: 'add',
				path: 'src/log.txt',
				template,
				abortOnFail: true
			};

			return baseActions.concat(writeLog);
		}
	});

	plop.setGenerator('module', {
		description: 'adds only the module',
		mixins: ['withModule']
	});

	plop.setGenerator('module-file', {
		description: 'adds a file inside a module',
		mixins: ['withModule'],
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: 'What is the file name?',
				validate: function(value) {
					if (/.+/.test(value)) {
						return true;
					}
					return 'name is required';
				}
			}
		],
		actions: [
			{
				type: 'add',
				path: 'files/{{name}}.txt',
				templateFile: 'plop-templates/moduleFile.txt',
				abortOnFail: true
			}
		]
	});

	plop.setGenerator('module-file-with-log', {
		description: 'adds a file inside a module',
		mixins: ['withModule', 'withLog'],
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: 'What is the file name?',
				validate: function(value) {
					if (/.+/.test(value)) {
						return true;
					}
					return 'name is required';
				}
			}
		],
		actions: [
			{
				type: 'add',
				path: 'files/{{name}}.txt',
				templateFile: 'plop-templates/moduleFile.txt',
				abortOnFail: true
			}
		]
	});
};
