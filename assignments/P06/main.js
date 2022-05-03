
/**
 * 
 * @param {What country to draw on the map} country 
 * @returns 
 */
function drawMultiPolyOnMap(country) {
    let aim = 500;
    console.log(country)
    let lowestX = 200;
    let lowestY = 200;
    let highestX = -200;
    let highestY = -200;
    //this gets us our lowest and highest point of our country
    for (let i = 0; i < country.coordinates.length; i++) {
        for (let j = 0; j < country.coordinates[i].length; j++) {
            for (let k = 0; k < country.coordinates[i][j].length; k++) {
                lowestX = lowestX > country.coordinates[i][j][k][0] ? country.coordinates[i][j][k][0] : lowestX;
                lowestY = lowestY > country.coordinates[i][j][k][1] ? country.coordinates[i][j][k][1] : lowestY;
                highestX = highestX < country.coordinates[i][j][k][0] ? country.coordinates[i][j][k][0] : highestX;
                highestY = highestY < country.coordinates[i][j][k][1] ? country.coordinates[i][j][k][1] : highestY;
            }
        }
    }
    //which is bigger x or y
    let longestSide = Math.abs(lowestX - highestX) > Math.abs(lowestY - highestY) ? Math.abs(lowestX - highestX) : Math.abs(lowestY - highestY);
    let scaleFactor = aim / longestSide;
    //Generate Scale Factor
    console.log(lowestX, lowestY, highestX, highestY, scaleFactor, aim, longestSide)
    for (let i = 0; i < country.coordinates.length; i++) {
        for (let j = 0; j < country.coordinates[i].length; j++) {
            let pointsString = "";
            for (let k = 0; k < country.coordinates[i][j].length; k++) {
                pointsString += (country.coordinates[i][j][k][0] - lowestX) * scaleFactor + ',';
                pointsString += (country.coordinates[i][j][k][1] - lowestY) * scaleFactor + ',';
            }
            //remove trailing common
            pointsString = pointsString.slice(0, -1);
            this.addPolygonToMap(pointsString);
        }
    }
}

/**
 * 
 * @param {What country to draw on the map} country 
 * @returns 
 */
function drawPolyOnMap(country) {
    let aim = 500;
    let lowestX = 200;
    let lowestY = 200;
    let highestX = -200;
    let highestY = -200;
    let pointsString = "";
    //Generate Scale Factor
    //this gets us our lowest and highest point of our country
    for (let i = 0; i < country.coordinates[0].length; i++) {
        lowestX = lowestX > country.coordinates[0][i][0] ? country.coordinates[0][i][0] : lowestX;
        lowestY = lowestY > country.coordinates[0][i][1] ? country.coordinates[0][i][1] : lowestY;
        highestX = highestX < country.coordinates[0][i][0] ? country.coordinates[0][i][0] : highestX;
        highestY = highestY < country.coordinates[0][i][1] ? country.coordinates[0][i][1] : highestY;
    }
    //which is bigger x or y
    let longestSide = Math.abs(lowestX - highestX) > Math.abs(lowestY - highestY) ? Math.abs(lowestX - highestX) : Math.abs(lowestY - highestY);
    let scaleFactor = aim / longestSide;
    console.log(lowestX, lowestY, highestX, highestY)
    for (let i = 0; i < country.coordinates[0].length; i++) {
        pointsString += (country.coordinates[0][i][0] - lowestX) * scaleFactor + ',';
        pointsString += (country.coordinates[0][i][1] - lowestY) * scaleFactor + ',';
    }
    //remove trailing common
    pointsString = pointsString.slice(0, -1);
    this.addPolygonToMap(pointsString);
}

/**
 * Addes a polygon to the "MAP" SVG element on the main html page
 * @param {The points of the polygon to draw} points 
 */
function addPolygonToMap(points) {
    let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttributeNS(null, "points", points);
    polygon.style = "fill:lime;stroke:purple;stroke-width:1";
    let element = document.getElementById("Map");
    element.appendChild(polygon);
}

function drawCountry(country) {
    let element = document.getElementById("Map");
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
    country.type == "Polygon" ? drawPolyOnMap(country) : drawMultiPolyOnMap(country);
}

function getGuess() {
    let text = document.getElementById("guessBox").value;
    //check if a valid value
    if (this.countriesNames.includes(text)) {
        drawCountry(this.countriesGeoData[text]);
        let distance = getDistance(this.countriesGeoData[text], this.countriesGeoData[this.targetCountry]);
        if (this.guessNum < 5 && text == this.targetCountry) {
            let p = document.createElement("p");
            p.style = "color: lightgreen";
            p.innerText = text;
            let element = document.getElementById("guessList");
            element.appendChild(p);
            this.alert("You guessed the right country, go you!")
        } else if (this.guessNum < 5) {
            let p = document.createElement("p");
            p.style = "color: red";
            p.innerText = text + `\t ${distance.toFixed(2)} Miles`;
            let element = document.getElementById("guessList");
            element.appendChild(p);
            if (guessNum >= 4) {
                alert("You've run out of guesses and lost, too bad, try again!")
            }
        } else {
            alert("You've run out of guesses and lost, too bad, try again!")
        }
        this.guessNum++;
    } else {
        alert("That is not valid country name")
    }
    console.log(text);
}

function getDistance(country1, country2) {
    let coors1 = getFirstPoint(country1);
    let coors2 = getFirstPoint(country2);
    console.log(coors1, coors2, Math.hypot((coors1[0] - coors2[0]), (coors1[1] - coors2[1])))
    return Math.abs(Math.hypot((coors1[0] - coors2[0]), (coors1[1] - coors2[1]))) * 69;
}

function getFirstPoint(country) {
    if (country.type == "Polygon") {
        return [country.coordinates[0][0][0], country.coordinates[0][0][1]];
    } else {
        return [country.coordinates[0][0][0][0], country.coordinates[0][0][0][1]]
    }
}

function setupInformation() {
    this.countriesGeoData = {};
    this.countriesNames = [];
    let datalistNames = "";
    //let's seperate and clean the data
    for (let i = 0; i < this.data.features.length; i++) {
        this.countriesGeoData[this.data.features[i].properties.ADMIN] = this.data.features[i].geometry;
        this.countriesNames.push(this.data.features[i].properties.ADMIN);
        this.datalistNames += "<option>" + this.data.features[i].properties.ADMIN + "</option>";

    }
    var my_list = document.getElementById("countriesNames");
    my_list.innerHTML = this.datalistNames;
    console.log()
}

function main() {
    //grab the data from countries data class
    this.data = new Countries().data;
    setupInformation();
    //starting game - pick a country
    this.targetCountry = this.countriesNames[Math.floor(Math.random() * this.countriesNames.length)];
    console.log(this.targetCountry)
    this.guessNum = 0;
}


main();