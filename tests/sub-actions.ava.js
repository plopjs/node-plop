import fs from 'fs';
import path from 'path';
import AvaTest from './_base-ava-test';
const {test, mockPath, testSrcPath, nodePlop} = (new AvaTest(__filename));

const plop = nodePlop(`${mockPath}/plopfile.js`);
const componentGenerator = plop.getGenerator('component');

test.before(() => {
	return componentGenerator.runActions({name: 'Header'});
});

test('Check that all three files have been created', t => {
	const componentFilePath = path.resolve(testSrcPath, 'components/Header.js');
	const componentTestFilePath = path.resolve(testSrcPath, 'components/tests/Header.test.js');
	const componentStoryFilePath = path.resolve(testSrcPath, 'components/stories/Header.story.js');


	// both files should have been created
	t.true(fs.existsSync(componentFilePath), componentFilePath);
	t.true(fs.existsSync(componentTestFilePath), componentTestFilePath);
	t.true(fs.existsSync(componentStoryFilePath), componentStoryFilePath);

});
