import inquirer = require('inquirer');
// @types/globby doesn't export types for GlobOptions, so we have to work a little bit to extract them:
// GlobOptions is the second parameter of the sync function, which can be extracted with the Parameters<T> type
import { GlobbyOptions } from 'globby';
import nodePlop, {NodePlopAPI} from './node-plop';

export type Actions = Array<ActionType | string>
export type DynamicActionFunction = (data?: any) => Actions

export type CustomActionFunction<TData extends object = object> = (
  /**
   * Answers to the generator prompts.
   */
  answers: object,
  /**
   * The object in the `actions` array for the generator.
   */
  config?: ActionConfig<TData>,
  /**
   * The plop api for the plopfile where this action is being run.
   */
  plopfileApi?: NodePlopAPI
) => Promise<string> | string; // Check return type?

export type ActionType<TData extends object = object> =
  | ActionConfig<TData>
  | AddActionConfig<TData>
  | AddManyActionConfig<TData>
  | ModifyActionConfig<TData>
  | AppendActionConfig<TData>
  | CustomActionFunction<TData>;

/**
 * There are several types of built-in actions you can use in your
 * [GeneratorConfig](https://plopjs.com/documentation/#interface-generatorconfig).
 * You specify which `type` of action (all paths are based on the location of
 * the plopfile), and a template to use.
 */
export interface ActionConfig<TData extends object = object> {
  /**
   * The type of action.
   */
  type: string;
  /**
   * Overwrites files if they exist.
   * @default false
   */
  force?: boolean;
  /**
   * @default {}
   */
  data?:
    | TData
    | ((...args: any[]) => TData | Promise<TData>);
  /**
   * @default true
   */
  abortOnFail?: boolean;
}

/**
 * The `add` action is used to (you guessed it) add a file to your project.
 * The file contents will be determined by the `template` or `templateFile`
 * property.
 */
export interface AddActionConfig<TData extends object = object>
  extends ActionConfig<TData> {
  /**
   * The type of action.
   */
  type: 'add';
  /**
   * A handlebars template that will be used to create the file by name.
   */
  path: string;
  /**
   * A handlebars template that should be used to build the new file.
   */
  template?: string;
  /**
   * Path to a file containing the `template`.
   */
  templateFile?: string;
  /**
   * Skips a file if it already exists (instead of failing).
   * @default false
   */
  skipIfExists?: boolean;
}

/**
 * The `addMany` action can be used to add multiple files to your project with
 * a single action.
 * @example {{ dashCase name }}.spec.js
 */
export interface AddManyActionConfig<TData extends object = object>
  extends Pick<
    AddActionConfig<TData>,
    Exclude<keyof AddActionConfig<TData>, 'type'>
  > {
  /**
   * The type of action.
   */
  type: 'addMany';
  /**
   * A handlebars template that will be used to identify the folder that the
   * generated files should go into.
   */
  destination: string;
  /**
   * Can be used to alter what section of the template paths should be omitted
   * when creating files.
   */
  base: string;
  /**
   * The paths located by this glob can use handlebars syntax in their
   * file/folder names if you'd like the added file names to be unique.
   * @type Glob
   */
  templateFiles: string | string[];
  /**
   * File extensions that should be stripped from `templateFiles` files names
   * while being added to the `destination`.
   * @default ['hbs']
   */
  stripExtensions?: string[];
  /**
   * Change how to match to the template files to be added.
   */
  globOptions: GlobbyOptions;
  /**
   * Print each successfully added file path.
   * @default true
   */
  verbose?: boolean;
}

/**
 * The `modify` action will use a `pattern` property to find/replace text in the
 * file located at the `path` specified. More details on modify can be found in
 * the example folder.
 */
export interface ModifyActionConfig<TData extends object = object>
  extends ActionConfig<TData> {
  /**
   * The type of action.
   */
  type: 'modify';
  /**
   * Handlebars template that (when rendered) is the path of the file to be
   * modified.
   */
  path: string;
  /**
   * Used to match text that should be replaced.
   * @default end-of-file
   */
  pattern: string | RegExp;
  /**
   * Handlebars template that should replace what was matched by the `pattern`.
   * Capture groups are available as `$1`, `$2`, etc.
   */
  template: string;
  /**
   * Path a file containing the `template`.
   */
  templateFile: string;
}

/**
 * The `append` action is a commonly used subset of `modify`. It is used to
 * append data in a file at a particular location.
 */
export interface AppendActionConfig<TData extends object = object>
  extends ActionConfig<TData> {
  /**
   * The type of action.
   */
  type: 'append';
  /**
   * Handlebars template that (when rendered) is the path of the file to be
   * modified.
   */
  path: string;
  /**
   * Used to match text where the append should happen.
   */
  pattern: string | RegExp;
  /**
   * Whether identical entries should be removed.
   * @default true
   */
  unique?: boolean;
  /**
   * The value that separates entries.
   * @default newline
   */
  separator?: string;
  /**
   * Handlebars template to be used for the entry.
   */
  template: string;
  /**
   * Path a file containing the template.
   */
  templateFile: string;
}

export interface PlopCfg {
  force?: boolean;
  destBasePath?: string;
}

export interface PlopGenerator {
	/**
	 * Short description of what this generator does.
	 */
	description: string;
	/**
	 * Questions to ask the user.
	 */
	prompts: inquirer.Question[];
	/**
	 * Actions to perform.
	 * If your list of actions needs to be dynamic, take a look at
	 * [using a dynamic actions array](https://plopjs.com/documentation/#using-a-dynamic-actions-array).
	 */
	actions: Actions | DynamicActionFunction;
	proxy?: NodePlopAPI;
	name: string;
	proxyName?: string;
}
