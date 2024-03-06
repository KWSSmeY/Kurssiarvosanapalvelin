const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();

const csvFilePath = 'kurssiarvosanat.csv';
const jsonFilePath = 'kurssitulokset.json';

const parseCSVtoJSON = () => {
    const results = [];
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2));
            console.log('CSV-tiedosto luettu ja tallennettu JSON-muotoon.');
        });
};

parseCSVtoJSON();

app.get('/', (req, res) => {
    res.send(`
        <h1>Tervetuloa!</h1>
        <p>Käytä alla olevaa lomaketta tiedon hakemiseen.</p>
        <form action="/haku" method="get">
            <label for="kurssi">Kurssi:</label>
            <input type="text" id="kurssi" name="kurssi"><br><br>
            <label for="opiskelija">Opiskelija:</label>
            <input type="text" id="opiskelija" name="opiskelija"><br><br>
            <input type="submit" value="Hae">
        </form>
    `);
});

app.get('/haku', (req, res) => {
    const kurssi = req.query.kurssi;
    const opiskelija = req.query.opiskelija;
    const data = JSON.parse(fs.readFileSync(jsonFilePath));

    let result;

    if (!kurssi && !opiskelija) {
        res.status(400).send('Anna vähintään joko kurssin tai opiskelijan nimi.');
        return;
    }

    if (kurssi && opiskelija) {
        result = data.filter(item => item.kurssi === kurssi && item.opiskelija === opiskelija);
    } else if (kurssi) {
        result = data.filter(item => item.kurssi === kurssi);
    } else {
        result = data.filter(item => item.opiskelija === opiskelija);
    }

    if (result.length === 0) {
        res.status(404).send('Tietoja ei löytynyt annetuilla hakuehdoilla.');
    } else {
        res.json(result);
    }
});

app.listen(3000, () => {
    console.log('Palvelin käynnissä portissa 3000.');
});
