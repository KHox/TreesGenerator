let settingsData = localStorage.getItem("SETTINGS");
const SETTINGS = settingsData ? JSON.parse(settingsData) : {
    autoRedraw: true,
    autoRandom: true,
    randoming: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
};
delete settingsData;


const cp = document.querySelector("#controll-panel");
const table = cp.querySelector("#gen");

const autoRedraw = cp.querySelector("#auto-redraw");
const autoRandom = cp.querySelector("#auto-randomize");
autoRedraw.checked = SETTINGS.autoRedraw;
autoRandom.checked = SETTINGS.autoRandom;

const BORDERS = [
    [0, 10, "Length"],        //0
    [0, 10, "Random Length"],        //1

    [1, 30, "From Size"],        //2
    [1, 30, "To Size"],      //3
    [0, 100, "Size From Parent"],       //4
    [0, 100, "Size From Level"],       //5

    [0, 255, "Red"],       //6
    [0, 255, "Blue"],       //7
    [0, 255, "Green"],       //8

    [-15, 15, "Red Changing"],      //9
    [-15, 15, "Blue Changing"],      //10
    [-15, 15, "Green Changing"],      //11

    [0, 100, "Color From Parent"],       //12
    [0, 50, "Random Color"],      //13

    [1, 2, "Branches"],        //14
    [0, 359, "Angle"],       //15
    [0, 60, "Random Angle"],        //16

    [0, 30, "Turn"],        //17
    [0, 30, "Random Turn"],        //18
    [-100, 100, "Directon"]     //19
];


let tree;
tree = getRandomTree();

{
    table.innerHTML = "";
    let tr = document.createElement("tr");
    tr.innerHTML = `<td>Gen Level:</td>`;
    for (let i = 0; i < tree.length; i++) {
        let td = document.createElement("td");
        td.textContent = i;
        tr.append(td);
    }

    table.append(tr);

    for (let i = 0; i < tree[0].length; i++) {
        let tr = document.createElement("tr");
        tr.innerHTML = `<td><span class="toggler"></span>${BORDERS[i][2]}:</td>`;
        for (let j = 0; j < tree.length; j++) {
            let td = document.createElement("td");
            td.innerHTML = `
            <div class="horizontal">
                <span class="value"></span>
                <span class="vertical">
                    <div class="btn inc"></div>
                    <div class="btn rand"></div>
                    <div class="btn dec"></div>
                </span>
            </div>
            `;

            //td.querySelector(".value").textContent = tree[j][i];
            tr.append(td);
        }
        table.append(tr);
    }
}

for (let i = 0; i < SETTINGS.randoming.length; i++) {
    if (!SETTINGS.randoming[i]) {
        table.rows[i + 1].classList.add("toggled");
    }
}

updateTable();


cp.addEventListener("input", e => {
    if (e.target == autoRedraw) {
        SETTINGS.autoRedraw = autoRedraw.checked;
        saveSetting();
    } else if (e.target == autoRandom) {
        SETTINGS.autoRandom = autoRandom.checked;
        saveSetting();
    }
});

cp.addEventListener("click", e => {
    if (e.target.closest(".button.draw")) {
        draw(tree);
    } else if (e.target.closest(".button.randomize")) {
        randomize();
        if (SETTINGS.autoRandom) {
            draw(tree);
        }
    } else if (e.target.closest(".button.save")) {
        saveTree();
    } else if (e.target.closest(".button.load")) {
        loadTree();
    } else if (e.target.closest(".button.copy")) {
        navigator.clipboard.writeText(JSON.stringify(tree));
    } else if (e.target.closest(".button.paste")) {
        navigator.clipboard.readText().then(text => {
            if (text) {
                let arr = JSON.parse(text);
                if (arr instanceof Array && arr[0] instanceof Array) {
                    tree = arr;
                    updateTable();
                }
            }
        });
    } else if (e.target.closest(".button.del")) {
        deleteTree();
    } else if (e.target.closest(".button.print")) {
        printTrees();
    } else if (e.target.closest(".toggler")) {
        let tr = e.target.closest("tr");
        tr.classList.toggle("toggled");
        SETTINGS.randoming[tr.rowIndex - 1] = !SETTINGS.randoming[tr.rowIndex - 1];
        saveSetting();
    } else if (e.target.closest(".btn")) {
        let btn = e.target.closest(".btn");
        buttonHandler(btn);
    } else if (e.target.closest("td")) {
        let td = e.target.closest("td");
        if (td.cellIndex != 0) {
            createInput(td);
        }
    }
});

function deleteTree() {
    let name = prompt("Введите название дерева");
    if (name === null) return;

    let saves = JSON.parse(localStorage.getItem("SAVED_TREES") || "{}");

    if (saves[name]) {
        if (!confirm("Уверены, что хотите удалить?")) return;
    } else {
        return alert("Дерева с таким именем не существует");
    }
        

    delete saves[name];
    localStorage.setItem("SAVED_TREES", JSON.stringify(saves));
}

function printTrees() {
    let saves = JSON.parse(localStorage.getItem("SAVED_TREES") || "{}");
    let str = "";
    for (let key in saves) {
        str += key + "\n";
    }
    alert(str);
}

function saveTree() {
    let name = prompt("Введите название дерева");
    if (name === null) return;

    let saves = JSON.parse(localStorage.getItem("SAVED_TREES") || "{}");

    if (saves[name] && !confirm("Дерево с таким именем существует, перезаписать?")) return;

    saves[name] = tree;
    localStorage.setItem("SAVED_TREES", JSON.stringify(saves));
}

function loadTree() {
    let name = prompt("Введите название дерева");
    if (name === null) return;

    let saves = JSON.parse(localStorage.getItem("SAVED_TREES") || "{}");
    if (saves[name]) {
        tree = saves[name];
        updateTable();
    } else {
        alert("Дерева с таким именем не существует");
    }
}

function buttonHandler(btn) {
    let td = btn.closest("td");
        let cell = td.cellIndex - 1;
        let row = td.parentElement.rowIndex - 1;

        if        (btn.classList.contains("inc")) {
            tree[cell][row]++;
        } else if (btn.classList.contains("rand")) {
            let r = BORDERS[row];
            tree[cell][row] = Math.floor(Math.random() * (r[1] - r[0] + 1)) + r[0];
        } else if (btn.classList.contains("dec")) {
            tree[cell][row]--;
        }
        updateTable();
}

function createInput(td) {
    if (!td.classList.contains("input")) {
        td.classList.add("input");
        let span = td.querySelector(".value");
        let value = span.textContent;
        span.innerHTML = `<input type="number" size="1">`;
        let input = span.firstElementChild;
        input.name = "inp";
        input.value = value;
        input.select();
        let cell = td.cellIndex;
        let row = td.parentElement.rowIndex;
        
        input.onblur = () => {
            td.classList.remove("input");
            tree[cell - 1][row - 1] = +input.value;
            span.innerHTML = input.value;
        }

        input.onkeydown = e => {
            if (e.key == "Enter") {
                input.blur();
            } else if (e.key == "Tab") {
                e.preventDefault();
                if (cell + 1 < table.rows[0].cells.length) {
                    input.blur();
                    createInput(table.rows[row].cells[cell + 1]);
                } else if (row + 1 < table.rows.length) {
                    input.blur();
                    createInput(table.rows[row + 1].cells[1]);
                } else {
                    input.blur();
                }
            } else if (e.key == "Escape") {
                input.blur();
                span.textContent = value;
            }
        }
    }
}

function randomize() {
    tree = getRandomTree();
    updateTable();
}

function updateTable() {
    for (let i = 0; i < tree[0].length; i++) {
        let tr = table.rows[i + 1];
        for (let j = 0; j < tree.length; j++) {
            let td = tr.cells[j + 1];
            td.querySelector(".value").textContent = tree[j][i];
        }
    }
}

function getRandomTree() {
    let _tree = new Array(10);
    
    for (let i = 0; i < 10; i++) {
        let arr = new Array(BORDERS.length);
        for (let j = 0; j < BORDERS.length; j++) {
            if (SETTINGS.randoming[j]) {
                let r = BORDERS[j];
                arr[j] = Math.floor(Math.random() * (r[1] - r[0] + 1)) + r[0];
            } else {
                if (tree) {
                    arr[j] = tree[i][j];
                } else {
                    arr[j] = 0;
                }
            }
        }
        _tree[i] = arr;
    }

    return _tree;
}

function saveSetting() {
    localStorage.setItem("SETTINGS", JSON.stringify(SETTINGS));
}

setTimeout(draw, 100, tree);