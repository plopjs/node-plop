import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import handlebars from 'handlebars';
import _get from 'lodash.get';
import resolve from 'resolve';

import bakedInHelpers from './baked-in-helpers';
import generatorRunner from './generator-runner';
import {ActionType, CustomActionFunction, PlopGenerator, PlopCfg} from './types';
import {HelperDelegate as HelperFunction} from 'handlebars';

function nodePlop(plopfilePath = '', plopCfg: PlopCfg = {}) {

	let pkgJson = {};
	let defaultInclude: object = {generators: true};

	let welcomeMessage: string;
	const {destBasePath, force} = plopCfg;
	const generators: Record<string, PlopGenerator> = {};
	const partials: Record<string, string> = {};
	const actionTypes: Record<string, CustomActionFunction> = {};
	const helpers: Record<string, HelperFunction> = Object.assign({
		pkg: (propertyPath) => _get(pkgJson, propertyPath, '')
	}, bakedInHelpers);
	const baseHelpers = Object.keys(helpers);

	/**
	 * Registers a custom prompt type with inquirer.
	 * [Inquirer](https://github.com/SBoudrias/Inquirer.js) provides many types
	 * of prompts out of the box, but it also allows developers to build prompt
	 * plugins. If you'd like to use a prompt plugin, you can register it with
	 * `setPrompt`. For more details see the [Inquirer documentation for registering prompts](https://github.com/SBoudrias/Inquirer.js#inquirerregisterpromptname-prompt).
	 * Also check out the [plop community driven list of custom prompts](https://github.com/amwmedia/plop/blob/master/inquirer-prompts.md).
	 */
	const setPrompt = inquirer.registerPrompt;
	/**
	 * Customizes the displayed message that asks you to choose a generator when
	 * you run `plop`.
	 */
	const setWelcomeMessage = (message: string) => { welcomeMessage = message; };
	/**
	 * Setup handlebars helper.
	 * Directly corresponds to the handlebars method `registerHelper`.
	 * So if you are familiar with [handlebars partials](http://handlebarsjs.com/partials.html),
	 * then you already know how this works.
	 */
	const setHelper = (name: string, fn: HelperFunction) => { helpers[name] = fn; };
	/**
	 * Setup a handlebars partial.
	 * Directly corresponds to the handlebars method `registerPartial`.
	 * So if you are familiar with [handlebars helpers](http://handlebarsjs.com/expressions.html#helpers),
	 * then you already know how this works.
	 */
	const setPartial = (name: string, str: string) => { partials[name] = str; };
	/**
	 * Register a custom action type.
	 * Allows you to create your own actions (similar to `add` or `modify`) that
	 * can be used in your plopfiles. These are basically highly reusable
	 * [custom action functions](https://plopjs.com/documentation/#custom-action-function-).
	 */
	const setActionType = (name: string, fn: CustomActionFunction) => { actionTypes[name] = fn; };

	/**
	 * Runs `template` through the handlebars template renderer using `data`.
	 * @returns the rendered template.
	 */
	function renderString(template: string, data: any) {
		Object.keys(helpers).forEach(h => handlebars.registerHelper(h, helpers[h]));
		Object.keys(partials).forEach(p => handlebars.registerPartial(p, partials[p]));
		return handlebars.compile(template)(data);
	}

	const getWelcomeMessage = () => welcomeMessage;
	const getHelper = name => helpers[name];
	const getPartial = (name: string) => partials[name];
	const getActionType = (name: string): ActionType => actionTypes[name];
	/**
	 * Get the [GeneratorConfig](https://plopjs.com/documentation/#interface-generatorconfig) by name.
	 */
	const getGenerator = (name: string) => generators[name];
	/**
	 * Setup a generator.
	 * The config object needs to include `prompts` and `actions` (`description`
	 * is optional). The prompts array is passed to [inquirer](https://github.com/SBoudrias/Inquirer.js/#objects).
	 * The `actions` array is a list of actions to take (described in greater
	 * detail below).
	 * @returns [GeneratorConfig](https://plopjs.com/documentation/#interface-generatorconfig)
	 */
	function setGenerator(name = '', config: PlopGenerator = {} as any) {
		// if no name is provided, use a default
		name = name || `generator-${Object.keys(generators).length + 1}`;

		// add the generator to this context
		generators[name] = Object.assign(config, {
			name: name,
			basePath: plopfilePath
		});

		return generators[name];
	}

	const getHelperList = () => Object.keys(helpers).filter(h => !baseHelpers.includes(h));
	const getPartialList = () => Object.keys(partials);
	const getActionTypeList = () => Object.keys(actionTypes);
	/**
	 * Gets an array of generator names and descriptions.
	 */
	function getGeneratorList() {
		return Object.keys(generators).map(function (name) {
			const {description} = generators[name];
			return {name, description};
		});
	}

	/**
	 * Sets the default config that will be used for this plopfile if it is
	 * consumed by another plopfile using `plop.load()`.
	 */
	const setDefaultInclude = (inc: object) => defaultInclude = inc;
	/**
	 * Gets the default config that will be used for this plopfile if it is
	 * consumed by another plopfile using `plop.load()`.
	 */
	const getDefaultInclude = () => defaultInclude;
	/**
	 * @returns the base path that is used when creating files.
	 */
	const getDestBasePath = () => destBasePath || plopfilePath;
	/**
	 * @returns the absolute path to the plopfile in use.
	 */
	const getPlopfilePath = () => plopfilePath;
	/**
	 * Set the `plopfilePath` value which is used internally to locate resources
	 * like template files.
	 */
	const setPlopfilePath = (filePath: string) => {
		const pathStats = fs.statSync(filePath);
		if (pathStats.isFile()) {
			plopfilePath = path.dirname(filePath);
		} else {
			plopfilePath = filePath;
		}
	};

	/**
	 * Loads generators, helpers and/or partials from another plopfile or
	 * npm module.
	 */
	function load(targets: string | string[], loadCfg: PlopCfg = {}, includeOverride: boolean) {
		if (typeof targets === 'string') { targets = [targets]; }
		const config = Object.assign({
			destBasePath: getDestBasePath()
		}, loadCfg);

		targets.forEach(function (target) {
			const targetPath = resolve.sync(target, {basedir: getPlopfilePath()});
			const proxy = nodePlop(targetPath, config);
			const proxyDefaultInclude = proxy.getDefaultInclude() || {};
			const includeCfg = includeOverride || proxyDefaultInclude;
			const include = Object.assign({
				generators: false,
				helpers: false,
				partials: false,
				actionTypes: false
			}, includeCfg);

			const genNameList = proxy.getGeneratorList().map(g => g.name);
			loadAsset(genNameList, include.generators, setGenerator, proxyName => ({proxyName, proxy}));
			loadAsset(proxy.getPartialList(), include.partials, setPartial, proxy.getPartial);
			loadAsset(proxy.getHelperList(), include.helpers, setHelper, proxy.getHelper);
			loadAsset(proxy.getActionTypeList(), include.actionTypes, setActionType, proxy.getActionType);
		});
	}

	function loadAsset(nameList, include, addFunc, getFunc) {
		var incArr;
		if (include === true) { incArr = nameList; }
		if (include instanceof Array) {
			incArr = include.filter(n => typeof n === 'string');
		}
		if (incArr != null) {
			include = incArr.reduce(function (inc, name) {
				inc[name] = name;
				return inc;
			}, {});
		}

		if (include instanceof Object) {
			Object.keys(include).forEach(i => addFunc(include[i], getFunc(i)));
		}
	}

	function loadPackageJson() {
		// look for a package.json file to use for the "pkg" helper
		try { pkgJson = require(path.join(getDestBasePath(), 'package.json')); }
		catch(error) { pkgJson = {}; }
	}

	/////////
	// the API that is exposed to the plopfile when it is executed
	// it differs from the nodePlopApi in that it does not include the
	// generator runner methods
	//
	const plopfileApi = {
		// main methods for setting and getting plop context things
		setPrompt,
		setWelcomeMessage, getWelcomeMessage,
		setGenerator, getGenerator, getGeneratorList,
		setPartial, getPartial, getPartialList,
		setHelper, getHelper, getHelperList,
		setActionType, getActionType, getActionTypeList,

		// path context methods
		setPlopfilePath, getPlopfilePath,
		getDestBasePath,

		// plop.load functionality
		load, setDefaultInclude, getDefaultInclude,

		// render a handlebars template
		renderString,

		// passthrough properties
		inquirer, handlebars,

		// passthroughs for backward compatibility
		addPrompt: setPrompt,
		addPartial: setPartial,
		addHelper: setHelper
	};

	// the runner for this instance of the nodePlop api
	const runner = generatorRunner(plopfileApi, {force});
	const nodePlopApi = Object.assign({}, plopfileApi, {
		getGenerator(name) {
			var generator = plopfileApi.getGenerator(name);

			if (generator == null) { throw Error(`Generator "${name}" does not exist.`); }

			// if this generator was loaded from an external plopfile, proxy the
			// generator request through to the external plop instance
			if (generator.proxy) {
				return generator.proxy.getGenerator(generator.proxyName);
			}

			return Object.assign({}, generator, {
				runActions: (data, hooks) => runner.runGeneratorActions(generator, data, hooks),
				runPrompts: (bypassArr = []) => runner.runGeneratorPrompts(generator, bypassArr)
			});
		},
		setGenerator(name, config) {
			const g = plopfileApi.setGenerator(name, config);
			return this.getGenerator(g.name);
		}
	});

	if (plopfilePath) {
		plopfilePath = path.resolve(plopfilePath);
		const plopFileName = path.basename(plopfilePath);
		setPlopfilePath(plopfilePath);
		loadPackageJson();

		const plopFileExport = require(path.join(plopfilePath, plopFileName));
		const plop = typeof plopFileExport === 'function' ? plopFileExport : plopFileExport.default;

		plop(plopfileApi, plopCfg);
	} else {
		setPlopfilePath(process.cwd());
		loadPackageJson();
	}

	return nodePlopApi;
}

export type NodePlopAPI = ReturnType<typeof nodePlop>;

export default nodePlop;
