
function getAction(expression) {
    console.log("getting action from" + expression);
    if (expression.substring(0, 2) === "id") {
        return [1, "id"];
    }

    console.log("ugh");

    switch (expression.substring(0, 1)) {
        case "+":
            console.log("2!");
            return [2, "+"];
        case "*":
            console.log("3!");
            return [3, "*"];
        case "(":
            console.log("4!");
            return [4, "("];
        case ")":
            console.log("5!");
            return [5, ")"];
        case "$":
            console.log("6!");
            return [6, "$"];
        case "E":
            console.log("7!");
            return [7, "E"];
        case "T":
            console.log("8!");
            return [8, "T"];
        case "F":
            console.log("9!");
            return [9, "F"];
        default:
            console.log("Error, param \"" + expression.substring(0, 1) + "\" is invalid.");
    }

    return -1;
}

function getState(parsed) {
    if (parsed.substring(parsed.length - 2, parsed.length) === "11") {
        console.log("State eleven");
        return 11;
    } else if (parsed.substring(parsed.length - 2, parsed.length) === "10") {
        console.log("State ten");
        return 10;
    }

    console.log("Single digit state: " + parsed.substring(parsed.length - 1, parsed.length));
    return Number(parsed.substring(parsed.length - 1, parsed.length));
}

function getFromTable(expression, parsed) {
    const action = getAction(expression)[0];
    const state = getState(parsed.join(""));

    console.log("Grabbing from table. State: " + state + ". Action: " + action + ".");

    document.getElementById('parser').rows[state + 2].cells[action].style.backgroundColor = '#ffc3bf';


    if (sessionStorage.getItem("oldState")) {
        oldState = JSON.parse(sessionStorage.getItem("oldState"));
    }

    if (sessionStorage.getItem("oldAction")) {
        oldAction = JSON.parse(sessionStorage.getItem("oldAction"));
    }

    if (sessionStorage.getItem("oldState") && sessionStorage.getItem("oldAction")) {

        document.getElementById('parser').rows[parseInt(oldState) + 2].cells[parseInt(oldAction)].style.backgroundColor = '';

    }

    sessionStorage.setItem("oldState", JSON.stringify(state.toString()));
    sessionStorage.setItem("oldAction", JSON.stringify(action.toString()));




    return document.getElementById('parser').rows[state + 2].cells[action].textContent;




}

function shift(parsed, expression, number) {
    const action = getAction(expression)[1];

    console.log("Shifted: " + parsed + action + number);

    parsed = [getAction(expression)[1], number];

    expression = expression.substring(action.length + 1);

    return [parsed, expression];
}


function grammarReplacement(grammar) {
    console.log("Grammar evaluated: " + grammar);
    //console.log("parsed: " + parsed);

    switch (grammar) {
        case "1":
            return ["E", "+"];
        case "2":
            return ["E", ""];
        case "3":
            return ["T", "*"];
        case "4":
            return ["T", ""];
        case "5":
            return ["F", "("];
        case "6":
            return ["F", ""];
    }
}

function reduce(parsed, expression, number) {

    let newItem;
    let itemReplace;

    [newItem, itemReplace] = grammarReplacement(number);

    if (itemReplace === "") {
        parsed[parsed.length - 2] = newItem;
    } else {
        console.log("\n\nSpecial case!")
        console.log("Looking for " + itemReplace);
        for (let i = parsed.length; i >= 0; i--) {
            console.log("Evaluating " + parsed[i]);
            if (parsed[i] === itemReplace) {
                console.log(itemReplace + " found at position " + i);
                parsed = parsed.slice(0, i);
                if (itemReplace === "(") {
                    parsed[parsed.length] = "F";
                    parsed[parsed.length] = "-1";//TODO fix this patch
                }
                i = -1;
            }
        }
    }


    switch (parsed[parsed.length - 2]) {
        case "E":
            console.log("E!");
            console.log(parseInt(parseInt(parsed[parsed.length - 3])) + 2);
            parsed[parsed.length - 1] = document.getElementById('parser').rows[parseInt(parsed[parsed.length - 3]) + 2].cells[7].textContent;
            break;
        case "T":
            console.log("T!");
            console.log(parseInt(parseInt(parsed[parsed.length - 3])) + 2);
            parsed[parsed.length - 1] = document.getElementById('parser').rows[parseInt(parsed[parsed.length - 3]) + 2].cells[8].textContent;
            break;
        case "F":
            console.log("F!");
            parsed[parsed.length - 1] = document.getElementById('parser').rows[parseInt(parsed[parsed.length - 3]) + 2].cells[9].textContent;
            break;
    }

    return parsed;
}


function parse(parsed, expression) {


    const element = getFromTable(expression, parsed);

    console.log("The element: " + element);

    if (element === "accept") {
        console.log("Finished");
    } else if (element.substring(0, 1) === "S") {
        console.log("Shifting");
        let arrToAdd;
        [arrToAdd, expression] = shift(parsed, expression, element.substring(1, element.length));
        parsed = parsed.concat(arrToAdd);

    } else if (element.substring(0, 1) === "R") {
        console.log("Reducing");
        parsed = reduce(parsed, expression, element.substring(1, element.length));
    } else {
        console.log("Grammar");
        parsed = getGrammar(Number(element), parsed)[0];
    }


    return [parsed, expression];
}

function insertItem(table, element1, element2) {
    const row = table.insertRow(-1);
    const col1 = row.insertCell(0);
    const col2 = row.insertCell(1);
    col1.innerHTML = element1;
    col1.width = "125";
    col2.innerHTML = element2;
}


function step() {
    console.log("\n\n\nBEGIN NEXT PARSE");


    const table = document.getElementById("output");

    let parsedArray = [];
    if (sessionStorage.getItem("parsedArray")) {
        parsedArray = JSON.parse(sessionStorage.getItem("parsedArray"));
    }


    if (table.rows.length === 0) {
        insertItem(table, "0", document.getElementById("expression").value)
        parsedArray = [0];


    } else {
        console.log("Parsed array is now " + parsedArray);
        var expression = table.rows[table.rows.length - 1].cells[1].innerHTML;
        [parsedArray, expression] = parse(parsedArray, expression)

        if (parsedArray.join("") === "0E1" && expression === "$") {
            document.getElementById("step").disabled = true;
            document.getElementById("finishedMessage").style.display = 'block';

        }

        insertItem(table, parsedArray.join(""), expression)

    }

    sessionStorage.setItem("parsedArray", JSON.stringify(parsedArray));


}