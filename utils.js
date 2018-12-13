const crypto = require('crypto');

const randomInInterval = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

const timeToSeconds = (time) => {
    const split = time.split(':');
    return split[0] * 60 * 60 + split[1] * 60;
}

const getId = () => {
    const currentDate = (new Date()).valueOf().toString();
    const random = Math.random().toString();
    return crypto.createHash('sha1').update(currentDate + random).digest('hex');
}

const toRealTime = (time) => {
    const s = (time / 3600).toString().split('.');
    const m = Math.round(Number((s[1] || '0').slice(0, 3)) * 59 / 1000);
    return `${s[0]}:${m.toString().length < 2 ? `0${m}` : m}`;
};

const getRandomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

module.exports = {
    randomInInterval,
    getId,
    toRealTime,
    getRandomColor,
    timeToSeconds
};
