const capacityOfHistory = 100;

class Calculator {
	constructor(previousOperandTextElement, currentOperandTextElement, array) {
		this.previousOperandTextElement = previousOperandTextElement;
		this.currentOperandTextElement = currentOperandTextElement;
		this.readyToReset = false;
		this.history = array;
		this.clear();
	}

	clear() {
		this.currentOperand = '';
		this.previousOperand = '';
		this.operation = undefined;
	}

	delete() {
		this.currentOperand = this.currentOperand.toString().slice(0, -1);
	}

	appendNumber(number) {
		if (number === '.' && this.currentOperand.includes('.')) return;

		if (number === '-' && this.currentOperand.toString() === '-'){
			this.currentOperand = '';
			return;
		}
		if (number === '-' && this.currentOperand.toString().includes('-')) {

			if (this.currentOperand.includes('%')){
				this.currentOperand = this.currentOperand.slice(1);
			}else {
				this.currentOperand = this.currentOperand * -1;
			}
			return;
		}

		if (Number(number) > -1 && this.currentOperand.toString().includes('%')){
			return;
		}

		if (number === '-'){
			this.currentOperand = number.toString() + this.currentOperand.toString();
		} else 
		this.currentOperand = this.currentOperand.toString() + number.toString();

	}

	chooseOperation(operation) {
		if (this.currentOperand === '') return;
		if (this.previousOperand !== '') {
			this.compute();
		}
		if (operation === 'Xn') {
			this.operation = '^';
		} else {	
			this.operation = operation;
		}
		this.previousOperand = this.currentOperand;
		this.currentOperand = '';
	}

	compute() {
		let computation;

		let prevHistory = this.previousOperand;
		let currHistory = this.currentOperand;

		let prev = this.convertPercent(this.previousOperand);
		let current = this.convertPercent(this.currentOperand);

		if (isNaN(prev) || isNaN(current)) return;
		switch (this.operation) {
			case '+':
			computation = parseFloat((prev + current).toFixed(14));
			break;
			case '-':
			computation = parseFloat((prev - current).toFixed(14));
			break;
			case '*':
			computation = parseFloat((prev * current).toFixed(14));
			break;
			case '÷':
			computation = parseFloat((prev / current).toFixed(14));
			break;
			case '^':
			computation = parseFloat((prev ** current).toFixed(14));
			break;
			default:
			return;
		}

		expandHistory(this.history, prevHistory, this.operation, currHistory, computation);

		this.readyToReset = true;
		this.currentOperand = computation;
		this.operation = null;
		this.previousOperand = '';
	}

	convertPercent(number){
		if (number.toString().includes('%')){
			let str = number.split('%')[0];
			str *= 0.01;
			return parseFloat(Number(str).toFixed(15));
		}else
			return parseFloat(Number(number).toFixed(15));
	}

	percent(){
		if (this.currentOperand != '' && this.currentOperand.indexOf('%') <= -1){
			this.currentOperand += '%';
		}
	}

	getDisplayNumber(number) {
		const stringNumber = number.toString();
		let integerDisplay;

		if (stringNumber === '-'){
			integerDisplay = '-';
			return integerDisplay;
		}
		if (stringNumber.indexOf('%') > -1){
			return stringNumber;
		}
		const integerDigits = parseFloat(stringNumber.split('.')[0]);
		const decimalDigits = stringNumber.split('.')[1];
		
		if (isNaN(integerDigits)) {
			integerDisplay = '';
		} else {
			integerDisplay = integerDigits.toLocaleString('en', {
				maximumFractionDigits: 0
			})
		}
		if (decimalDigits != null) {
			return `${integerDisplay}.${decimalDigits}`
		} else {
			return integerDisplay;
		}
	}

	updateDisplay() {
		this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
		if (this.operation != null) {
			this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;

		} else {
			this.previousOperandTextElement.innerText = '';
		}
	}

	sqrt() {
		const current = parseFloat(this.currentOperand);
		if (isNaN(current)) return;
		if (current < 0) {
			alert("Не стоит извлекать корень квадратный из отрицательного числа");
			expandHistory(this.history, null, 'sqrt', current, null);
			return;
		} else {
			this.currentOperand = Math.sqrt(current);
			expandHistory(this.history, null, 'sqrt', current, this.currentOperand);
			this.readyToReset = true;
			this.operation = null;
		}
	}
}


let loadHistory = () => {
	let history = document.getElementById('history_block');
	history.innerText = "";

	let array = JSON.parse(localStorage.getItem('array'));
	array.forEach(element => {
		let div = document.createElement('div');
		div.innerHTML = element;
		history.append(div);
	})

	history.scrollTop = history.scrollHeight;
}

let expandHistory = (history, prev, operation, curr, computation) => {
	if (history.length > capacityOfHistory) history.shift();
	if (operation == 'sqrt' && computation == null){
		history.push(`√(${curr}) = ошибка`);

	}else if (operation == 'sqrt' && computation != null){
		history.push(`√${curr} = ${computation}`);

	}else {
		history.push(`${prev} ${operation} ${curr} = ${computation}`);
	}

	localStorage.setItem('array', JSON.stringify(history));
	loadHistory();
}


document.addEventListener('DOMContentLoaded', () => {

	const numberButtons = document.querySelectorAll('[data-number]');
	const operationButtons = document.querySelectorAll('[data-operation]');
	const equalsButton = document.querySelector('[data-equals]');
	const deleteButton = document.querySelector('[data-delete]');
	const allClearButton = document.querySelector('[data-all-clear]');
	const previousOperandTextElement = document.querySelector('[data-previous-operand]');
	const currentOperandTextElement = document.querySelector('[data-current-operand]');
	const negativeButton = document.querySelector('[data-change-negative]');
	const sqrtButton = document.querySelector('[data-sqrt]');
	const powButton = document.querySelector('[data-pow]');
	const percentButton = document.querySelector('[data-percent]');

	if (localStorage.getItem('array') === null){
		localStorage.setItem('array', JSON.stringify([]));
	}

	let array = JSON.parse(localStorage.getItem('array'));
	const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement, array);

	numberButtons.forEach(button => {
		button.addEventListener('click', () => {
			calculator.appendNumber(button.innerText);
			calculator.updateDisplay();
		})
	})

	operationButtons.forEach( button => {
		button.addEventListener('click', () => {
			calculator.chooseOperation(button.innerText);
			calculator.updateDisplay();
		})
	})

	equalsButton.addEventListener('click', button => {
		calculator.compute();
		calculator.updateDisplay();
	})

	allClearButton.addEventListener('click', button => {
		calculator.clear();
		calculator.updateDisplay();
	})

	deleteButton.addEventListener('click', button => {
		calculator.delete();
		calculator.updateDisplay();
	})

	negativeButton.addEventListener('click', button => {
		calculator.appendNumber('-');
		calculator.updateDisplay();
	})

	sqrtButton.addEventListener('click', button => {
		calculator.sqrt();
		calculator.updateDisplay();
	}) 

	percentButton.addEventListener('click', button => {
		calculator.percent();
		calculator.updateDisplay();
	})

	loadHistory();
})
