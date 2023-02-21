let STOP = false;

const codeElem = document.getElementsByName('code')[0];
const inputElem = document.getElementsByName('input')[0];
const outputElem = document.getElementsByName('output')[0];
const dumpsElem = document.getElementsByName('dumps')[0];

const runElem = document.getElementsByName('run')[0];
const stopElem = document.getElementsByName('stop')[0];
// const stepElem  = document.getElementsByName('step')[0];
const clearElem = document.getElementsByName('clear')[0];
const resetElem = document.getElementsByName('reset')[0];

const speedElem = document.getElementsByName('speed')[0];
const splabelElem = document.getElementsByName('splabel')[0];

splabelElem.innerText = '실행 속도: ' + speedElem.value + 'ms당 1스텝';


runElem.onclick = () => run(codeElem.value, inputElem.value);
stopElem.onclick = () => STOP = true;
clearElem.onclick = () => {
	outputElem.value = '';
	dumpsElem.value = '';
};
resetElem.onclick = () => codeElem.value = '';
speedElem.oninput = () => splabelElem.innerText = '실행 속도: ' + speedElem.value + 'ms당 1스텝';

function run(code, input) {
	STOP = false;
	outputElem.value = '';
	runElem.disabled = true;
	speedElem.disabled = true;
	outputElem.style.borderColor = '';

	const statements = code.trim().split(code.includes('~') ? '~' : '\n').map(line => line.trim());
	const inputs = input.replace(/\n{1,}/g, ' ').replace(/\s{2,}/g, ' ').trim().split(' ').map(n => Number(n));
	if (statements[0] !== '짜잔 내가 돌아왔다' || !statements.slice(-1)[0].startsWith('이딴게 코드냐')) {
		runElem.disabled = false;
		speedElem.disabled = false;
		outputElem.style.borderColor = 'red';
		return outputElem.value = '코드가 틀림 ㅅㄱ';
	}

	const variables = [];
	let pointer = 0;
	let inputpointer = 0;
	
	function execute(statement) {
		if (statement.includes('진짜만약에') && statement.includes('물으시되')) { // IF GOTO
			const condition = evaluate(statement.substring(2, statement.lastIndexOf('물으시되')));
			if (condition === 0) return execute(statement.substr(statement.lastIndexOf('물으시되') + 1));
			return;
		}

		if (statement.includes('충격')) {
			const variablePointer = statement.split('충격')[0].split('저런').length;
			const setteeValue = evaluate(statement.split('충격')[1]);
			variables[variablePointer] = setteeValue;
		}

		if (statement.includes('하진신께서') && statement[statement.length - 1] === '히') {
			printOut(String(evaluate(statement.slice(1, -1))));
		}

		if (statement.includes('하진신께서') && statement[statement.length - 1] === '샍') {
			if (statement === '하진신께서샍') printOut('\n');
			printOut(stringify(evaluate(statement.slice(1, -1))));
		}

		if (statement.includes('비키라')) {
			pointer = evaluate(statement.split('비키라')[1]) - 1;
		}

		if (statement.indexOf('나가') === 0) {
			return evaluate(statement.split('나가')[1]);
		}
	}

	function parse() {
		if (statements[pointer].startsWith('이딴게 코드냐')) stop();
		if (STOP) {
			STOP = false;
			stop();
		}

		const statement = statements[pointer++];
		const evaluated = execute(statement);
		dumpsElem.value =
			'변수:\n' + variables.reduce((prev, curr, i) => prev + (i + 'ㅋ ' + curr) + '\n', '') +
			'\n\nㅇㄷ: (' + pointer + '/' + statements.length + ')\n' + (statements[pointer] || '') +
			(typeof evaluated !== 'undefined' ? '\n\n유턴: ' + evaluated : '');
		if (typeof evaluated !== 'undefined') stop();
	}

	const interval = setInterval(parse, speedElem.value);
	
	// --- utilities

	function printOut(str) {
		outputElem.value += str;
		outputElem.scrollTo(0, 9999);
	}

	function stop() {
		runElem.disabled = false;
		speedElem.disabled = false;
		clearInterval(interval);
	}
	
	function evaluate(x) {
		let n = 0;
		if (x.includes(' ')) return x.split(' ').map(evaluate).reduce((a, b) => Math.imul(a, b));
		while (x.includes('하진신께서물으시되')) {
			const answer = inputs[inputpointer++];
			x = x.replace('하진신께서물으시되', '');
			n += answer;
		}
		if (x.includes('저런')) n += variables[x.split('저런').length - 1] | 0;
		if (x.includes('ㅋ')) n += x.split('ㅋ').length - 1;
		if (x.includes('ㄷ')) n -= x.split('ㄷ').length - 1;
		return (n + 2158221066240) % 4294967296 - 2147483648;
	}
}

function stringify(unicode) {
	const char = String.fromCharCode(unicode);
	return char.match(/[\x00-\x1F]/) ? '' : char;
}
