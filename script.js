/* =========================================
   CALCULATOR ELEMENTS
========================================= */

const currentDisplay = document.getElementById("current-display");
const previousDisplay = document.getElementById("previous-display");

const numberButtons = document.querySelectorAll("[data-number]");
const operatorButtons = document.querySelectorAll("[data-operator]");

const clearButton = document.querySelector('[data-action="clear"]');
const backspaceButton = document.querySelector('[data-action="backspace"]');
const equalsButton = document.querySelector('[data-action="calculate"]');


/* =========================================
   CALCULATOR STATE
========================================= */

let currentInput = "0";
let expression = "";
let justCalculated = false;


/* =========================================
   UPDATE CURRENT DISPLAY
========================================= */

function updateCurrentDisplay() {
    currentDisplay.textContent = currentInput;
}


/* =========================================
   SHOW PREVIOUS EXPRESSION
========================================= */

function updatePreviousDisplay() {
    previousDisplay.textContent = expression || "0";
}


/* =========================================
   ADD NUMBER / DECIMAL
========================================= */

function addNumber(value) {

    /*
        If the previous operation was completed
        and the user enters a new number,
        start a fresh calculation.
    */

    if (justCalculated) {
        currentInput = "0";
        expression = "";
        justCalculated = false;

        currentDisplay.classList.remove("error-display");
    }


    /*
        Decimal handling
    */

    if (value === ".") {

        // Do not allow more than one decimal
        if (currentInput.includes(".")) {
            return;
        }

        // If current input is 0, create 0.
        if (currentInput === "0") {
            currentInput = "0.";
        } else {
            currentInput += ".";
        }

    } else {

        /*
            Replace initial zero.

            Example:
            0 → 5

            Instead of:
            0 → 05
        */

        if (currentInput === "0") {
            currentInput = value;
        } else {
            currentInput += value;
        }
    }


    updateCurrentDisplay();
}


/* =========================================
   ADD OPERATOR
========================================= */

function addOperator(operator) {

    if (currentInput === "Error") {
        return;
    }


    /*
        If user has just calculated something:

        10 =
        10 +

        We want to continue from 10.
    */

    if (justCalculated) {
        expression = currentInput;
        justCalculated = false;
    }


    /*
        If an operator is already at the end,
        replace it.

        Example:

        5 +
        then user presses ×

        Result:

        5 ×
    */

    if (/[+\-×÷]$/.test(expression)) {

        expression =
            expression.slice(0, -1) + operator;

    } else {

        /*
            Add the current number and operator.

            Example:

            currentInput = 5
            operator = +

            expression becomes:

            5+
        */

        expression += currentInput + operator;
    }


    /*
        Reset current input so the next number
        starts fresh.

        Example:

        5 + 3

        After pressing +:

        currentInput = 0
        expression = 5+
    */

    currentInput = "0";


    updateCurrentDisplay();

    previousDisplay.textContent = expression;
}


/* =========================================
   CLEAR CALCULATOR
========================================= */

function clearCalculator() {

    currentInput = "0";
    expression = "";
    justCalculated = false;

    currentDisplay.classList.remove("error-display");

    updateCurrentDisplay();

    previousDisplay.textContent = "0";
}


/* =========================================
   BACKSPACE
========================================= */

function backspace() {

    /*
        If calculator currently shows an error,
        reset everything.
    */

    if (currentInput === "Error") {
        clearCalculator();
        return;
    }


    /*
        If a calculation has just finished,
        backspace starts a fresh input.
    */

    if (justCalculated) {

        currentInput = "0";
        expression = "";
        justCalculated = false;

        updateCurrentDisplay();

        previousDisplay.textContent = "0";

        return;
    }


    /*
        If only one character remains,
        return to zero.
    */

    if (currentInput.length <= 1) {

        currentInput = "0";

    } else {

        currentInput =
            currentInput.slice(0, -1);
    }


    /*
        Handle cases like:

        12.
        ↓
        12

        and:

        0.
        ↓
        0
    */

    if (currentInput === "") {
        currentInput = "0";
    }


    updateCurrentDisplay();
}


/* =========================================
   TOKENIZE EXPRESSION
========================================= */

function tokenize(input) {

    const tokens = [];

    let number = "";


    for (let i = 0; i < input.length; i++) {

        const character = input[i];


        /*
            Number or decimal
        */

        if (/[0-9.]/.test(character)) {

            number += character;

        }


        /*
            Operator
        */

        else if (
            character === "+" ||
            character === "-" ||
            character === "×" ||
            character === "÷"
        ) {

            /*
                Save the number before the operator.
            */

            if (number !== "") {

                tokens.push(Number(number));

                number = "";
            }


            tokens.push(character);
        }
    }


    /*
        Save the final number.
    */

    if (number !== "") {
        tokens.push(Number(number));
    }


    return tokens;
}


/* =========================================
   OPERATOR PRECEDENCE
========================================= */

function getPrecedence(operator) {

    if (
        operator === "×" ||
        operator === "÷"
    ) {
        return 2;
    }

    if (
        operator === "+" ||
        operator === "-"
    ) {
        return 1;
    }

    return 0;
}


/* =========================================
   APPLY OPERATION
========================================= */

function applyOperation(firstNumber, secondNumber, operator) {

    switch (operator) {

        case "+":
            return firstNumber + secondNumber;


        case "-":
            return firstNumber - secondNumber;


        case "×":
            return firstNumber * secondNumber;


        case "÷":

            /*
                Division by zero protection.
            */

            if (secondNumber === 0) {
                throw new Error("DIVISION_BY_ZERO");
            }

            return firstNumber / secondNumber;


        default:
            throw new Error("INVALID_OPERATOR");
    }
}


/* =========================================
   CALCULATE EXPRESSION
========================================= */

function calculateExpression(input) {

    const tokens = tokenize(input);


    /*
        Make sure there is a valid expression.
    */

    if (tokens.length === 0) {
        return 0;
    }


    /*
        We use two stacks:

        values     → numbers
        operators  → + - × ÷

        This allows us to handle operator
        precedence without using eval().
    */

    const values = [];
    const operators = [];


    /*
        Process every token.
    */

    tokens.forEach((token) => {

        /*
            Number
        */

        if (typeof token === "number") {

            values.push(token);

        }


        /*
            Operator
        */

        else {

            /*
                Process operators with higher
                or equal precedence first.
            */

            while (
                operators.length > 0 &&
                getPrecedence(
                    operators[operators.length - 1]
                ) >= getPrecedence(token)
            ) {

                const operator =
                    operators.pop();

                const secondNumber =
                    values.pop();

                const firstNumber =
                    values.pop();


                const result =
                    applyOperation(
                        firstNumber,
                        secondNumber,
                        operator
                    );


                values.push(result);
            }


            operators.push(token);
        }
    });


    /*
        Process remaining operators.
    */

    while (operators.length > 0) {

        const operator =
            operators.pop();

        const secondNumber =
            values.pop();

        const firstNumber =
            values.pop();


        const result =
            applyOperation(
                firstNumber,
                secondNumber,
                operator
            );


        values.push(result);
    }


    /*
        Final result.
    */

    return values[0];
}


/* =========================================
   FORMAT RESULT
========================================= */

function formatResult(result) {

    /*
        Prevent -0
    */

    if (Object.is(result, -0)) {
        result = 0;
    }


    /*
        Remove unnecessary decimal places.

        Example:

        10.000000 → 10
    */

    if (Number.isInteger(result)) {
        return result.toString();
    }


    /*
        Prevent extremely long decimal output.
    */

    return parseFloat(
        result.toFixed(10)
    ).toString();
}


/* =========================================
   CALCULATE BUTTON
========================================= */

function calculate() {

    /*
        Do nothing if an error is already shown.
    */

    if (currentInput === "Error") {
        return;
    }


    /*
        There must be an expression.

        Example:

        5

        Pressing = does nothing.
    */

    if (!expression) {
        return;
    }


    /*
        Create the complete expression.

        Example:

        expression = "5+"
        currentInput = "5"

        completeExpression = "5+5"
    */

    let completeExpression =
        expression + currentInput;


    /*
        Safety check:
        remove an accidental trailing operator.

        Example:

        5+

        becomes:

        5
    */

    if (/[+\-×÷]$/.test(completeExpression)) {

        completeExpression =
            completeExpression.slice(0, -1);
    }


    try {

        /*
            Perform calculation.
        */

        const result =
            calculateExpression(
                completeExpression
            );


        /*
            Format result.
        */

        const formattedResult =
            formatResult(result);


        /*
            Show completed expression.
        */

        previousDisplay.textContent =
            completeExpression + " =";


        /*
            Show result.
        */

        currentInput =
            formattedResult;


        /*
            Clear stored expression.
        */

        expression = "";


        /*
            Remember that calculation
            has finished.
        */

        justCalculated = true;


        /*
            Remove error styling.
        */

        currentDisplay.classList.remove(
            "error-display"
        );


        updateCurrentDisplay();

    }


    /*
        Handle errors.
    */

    catch (error) {

        currentInput = "Error";

        expression = "";

        justCalculated = true;


        /*
            Add error styling.
        */

        currentDisplay.classList.add(
            "error-display"
        );


        /*
            Show helpful error.
        */

        previousDisplay.textContent =
            "Cannot divide by zero";

        currentDisplay.textContent =
            "Error";
    }
}


/* =========================================
   NUMBER BUTTON EVENT LISTENERS
========================================= */

numberButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            const number =
                button.dataset.number;

            addNumber(number);
        }
    );
});


/* =========================================
   OPERATOR BUTTON EVENT LISTENERS
========================================= */

operatorButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            const operator =
                button.dataset.operator;

            addOperator(operator);
        }
    );
});


/* =========================================
   CLEAR BUTTON EVENT LISTENER
========================================= */

clearButton.addEventListener(
    "click",
    clearCalculator
);


/* =========================================
   BACKSPACE BUTTON EVENT LISTENER
========================================= */

backspaceButton.addEventListener(
    "click",
    backspace
);


/* =========================================
   EQUALS BUTTON EVENT LISTENER
========================================= */

equalsButton.addEventListener(
    "click",
    calculate
);


/* =========================================
   KEYBOARD SUPPORT
========================================= */

document.addEventListener(
    "keydown",
    (event) => {

        const key = event.key;


        /*
            Numbers and decimal
        */

        if (/^[0-9.]$/.test(key)) {

            addNumber(key);

            return;
        }


        /*
            Keyboard operators
        */

        const keyboardOperators = {

            "+": "+",
            "-": "-",
            "*": "×",
            "/": "÷"
        };


        if (keyboardOperators[key]) {

            event.preventDefault();

            addOperator(
                keyboardOperators[key]
            );

            return;
        }


        /*
            Enter or =
        */

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();

            return;
        }


        /*
            Backspace
        */

        if (key === "Backspace") {

            event.preventDefault();

            backspace();

            return;
        }


        /*
            Escape = Clear
        */

        if (key === "Escape") {

            clearCalculator();
        }
    }
);


/* =========================================
   INITIAL STATE
========================================= */

updateCurrentDisplay();

previousDisplay.textContent = "0";