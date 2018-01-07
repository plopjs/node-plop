import fs from 'fs';
import path from 'path';
import co from 'co'
import AvaTest from './_base-ava-test';
const {test, mockPath, testSrcPath, nodePlop} = new AvaTest(__filename);

const plop = nodePlop(`${mockPath}/plopfile.js`);
const moduleGenerator = plop.getGenerator('module');
const moduleFileGenerator = plop.getGenerator('module-file');



test('Check that the module index file has been created if module generator is run standalone', co.wrap(function*(t){
	yield moduleGenerator.runActions({moduleName: "sampleModule"});
	const indexPath = path.resolve(testSrcPath, 'sampleModule/index.txt');
	t.true(fs.existsSync(indexPath));
}));

test('Check that both index file and the module file are generaded', co.wrap(function*(t){
	yield moduleFileGenerator.runActions({moduleName: "myFirstModule", name: "myFile"});
	const indexPath = path.resolve(testSrcPath, 'myFirstModule/index.txt');
	t.true(fs.existsSync(indexPath));
	const moduleFilePath = path.resolve(testSrcPath, 'myFirstModule/files/myFile.txt');
	t.true(fs.existsSync(moduleFilePath));
}));
