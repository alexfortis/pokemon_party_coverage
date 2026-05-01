import fs from "fs";
import jsdom from "jsdom";
const JSDOM = jsdom.JSDOM;

const VERBOSE = false;

const CHART_URL = "https://pokemondb.net/type/dual";

const CHART = {};

var TYPE_ORDER = null;

const QUEUE = [];

const OUTFILE = "typeChart.json";

function parseTableRow(tr, processUnused=false) {
    //Get the effectiveness of each attacking type on this defensive type
    if(tr.classList.contains("has-pkmn") || (processUnused && tr.classList.contains("no-pkmn"))) {
	if(TYPE_ORDER) {
	    let defTypeDiv = tr.querySelector("th > div")
	    let defTypeLinks = defTypeDiv.querySelectorAll("a");
	    let defTypes = Array.prototype.filter.call(defTypeLinks, a => !a.classList.contains("type-null")).map(cell => cell.firstChild.textContent);
	    //sort to prevent duplicate types
	    let defTypesStr = defTypes.toSorted().join("/");
	    if(!(defTypesStr in CHART)) {
		CHART[defTypesStr] = {};
		let cells = tr.getElementsByClassName("type-fx-cell");
		for(let i = 0; i < TYPE_ORDER.length; i++) {
		    let effectivenessClass = Array.prototype.filter.call(cells[i].classList, cname => !cname.includes("cell"))[0];
		    let effectiveness = Number(effectivenessClass.split("-").slice(-1)[0])/100;
		    CHART[defTypesStr][TYPE_ORDER[i]] = effectiveness;
		}
	    }
	}
	else {
	    QUEUE.push(tr);
	}
    }
    else if(tr.classList.contains("no-pkmn")) {
	let defTypeDiv = tr.querySelector("th > div")
	let defTypeLinks = defTypeDiv.querySelectorAll("a");
	let defTypes = Array.prototype.filter.call(defTypeLinks, a => !a.classList.contains("type-null")).map(cell => cell.firstChild.textContent);
	//sort to prevent duplicate types
	let defTypesStr = defTypes.toSorted().join("/");
	console.log(`There are no ${defTypesStr}-type pokemon, so it doesn't need to be covered`);
    }
    //Get the order of types in columns
    //This probably only has to be done once, but what if they change the order in the middle of the page???
    else {
	let attackingTypeCells = Array.prototype.filter.call(tr.getElementsByTagName("th"), cell => !cell.classList.contains("cell-atkdef"));
	TYPE_ORDER = attackingTypeCells.map(cell => cell.firstChild.title);
	while(0 < QUEUE.length) {
	    let row = QUEUE.shift();
	    parseTableRow(row);
	}
    }
}

function printChart(filename) {
    const printFn = filename ? function(line) {
	fs.writeFileSync(filename, line);
    } : console.log;
    printFn(JSON.stringify(CHART, null, 2));
}

fetch(CHART_URL).then(function(resp) {
    if(200 == resp.status) {
	return resp.text();  
    }
    return null;
}).then(function(text) {
    if(text) {
	const doc = new JSDOM(text);
	const table = doc.window.document.getElementById("dualtypechart");
	const rows = table.getElementsByTagName("tr");
	for(let row of rows) {
	    parseTableRow(row);
	}
	printChart(process.cwd() + "/" + OUTFILE);
    }
});
