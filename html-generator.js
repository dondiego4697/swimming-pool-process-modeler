const fs = require('fs');
const {getRandomColor} = require('./utils');

const generateHTML = (LOGS, CONFIG, rowsCount) => {
    const makeObj = (label, color) => {
        return {
            label: label,
            backgroundColor: color,
            borderColor: color,
            data: [],
            fill: false
        };
    }

    let htmlTemplate = fs.readFileSync('./template.html').toString();

    const labels = LOGS.map((d) => {
        return d.time;
    });
    htmlTemplate = htmlTemplate.replace('"%labels%"', JSON.stringify(labels));

    const stat = [];
    for (let i = 0; i < rowsCount; i++) {
        const j = i + 1;
        stat.push(makeObj(`row ${j}`, getRandomColor()));
    }

    stat.push(makeObj('queue', getRandomColor()));

    LOGS.forEach((d) => {
        d.rows.forEach((count, i) => {
            stat[i].data.push(count);
        });
        stat[stat.length - 1].data.push(d.queueLength);
    });

    htmlTemplate = htmlTemplate.replace('"%datasets%"', JSON.stringify(stat)).replace('"%config%"', JSON.stringify(CONFIG));

    fs.appendFileSync(
        `./logs/${(new Date()).toString().replace(/\s/gi, '_').split('_').slice(0, 5).join('_')}.html`,
        htmlTemplate
    );
}

module.exports = generateHTML;
