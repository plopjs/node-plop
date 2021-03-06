import AvaTest from './_base-ava-test';
import promptBypass from '../lib/prompt-bypass';

const {test, nodePlop} = (new AvaTest(__filename));
const plop = nodePlop();

const prompts = [{
	type:'input', name:'input', message:'inputMsg',
	validate: (value) => value === 'invalid' ? 'Is invalid' : true
}, {
	type:'input', name:'dependent-input', message:'dependent-inputMsg'
}];

test('verify valid bypass input', function (t) {
	const [, isValid] = promptBypass(prompts, ['valid'], plop);
	t.is(isValid.input, 'valid');
});

test('verify valid bypass input with access to answers', function (t) {
	prompts[1].validate = (value, answers) => {
		t.is(answers.input, 'valid');
		return !!value;
	};
	const [, isValid] = promptBypass(prompts, ['valid', 'also valid'], plop);
	t.is(isValid.input, 'valid');
	t.is(isValid['dependent-input'], 'also valid');
});

test('verify bad bypass input', function (t) {
	t.throws(() => promptBypass(prompts, ['invalid'], plop));
});