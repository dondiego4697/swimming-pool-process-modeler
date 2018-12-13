/*
    1 ms ~ 1 min
*/

const fs = require('fs');
const {randomInInterval, getId, toRealTime, timeToSeconds} = require('./utils');
const generateHTML = require('./html-generator');

// -------------------------metrics-------------------------
const CONFIG = {
    totalVisitorsCount: 0,
    leaveQueueCount: 0,
    enterThrowPoolCount: 0
};
const LOGS = [];
// ---------------------------------------------------------

const config = JSON.parse(fs.readFileSync('./config.json').toString());
const {
    sessionDuration, maxCountOnRows, rowsCount, workingTime,
    countIntervalVisitorsComing, timeIntervalVisitorsComing,
    prepareBeforeSessionInterval, waitingTimeInQueueInterval
} = config;
// ---------------------------------------------------------

const generateVisitors = async () => {
    const sleep = (ms) => {
        return new Promise((res) => setTimeout(res, ms));
    };

    const ms = randomInInterval(...timeIntervalVisitorsComing);
    await sleep(ms);
    return {
        visitors: randomInInterval(...countIntervalVisitorsComing),
        time: ms
    };
}

const createRows = (rowsCount) => {
    const rows = [];
    for (let i = 0; i < rowsCount; i++) {
        rows.push(new Map());
    }
    return rows;
};

const enterClientInPool = (row, id) => {
    return new Promise((res) => {
        row.set(id, true);
        const preparingTime = randomInInterval(...prepareBeforeSessionInterval);
        setTimeout(() => setTimeout(() => {
            row.delete(id);
            CONFIG.enterThrowPoolCount += 1;
            res();
        }, sessionDuration), preparingTime);
    });
};

const enterClientInQueue = (id, queue) => {
    const client = { id: id, isLeave: false };
    client.promise = new Promise((res) => {
        setTimeout(() => {
            client.isLeave = true;
            res();
        }, randomInInterval(...waitingTimeInQueueInterval));
    });
    queue.push(client);
};

const getClientFromQueue = (queue) => {
    let id = null;
    while (queue.length > 0) {
        const client = queue.pop();
        if (!client.isLeave) {
            client.promise = null;
            id = client.id;
            break;
        } else {
            CONFIG.leaveQueueCount += 1;
        }
    }
    return id;
};

const print = (time, rows, queue) => {
    const data = { time: toRealTime(time), rows: [] };
    rows.forEach((row, i) => {
        data.rows.push(row.size);
    });
    data.queueLength = queue.length;
    console.log([data.time, ...data.rows, data.queueLength].join(' '));
    LOGS.push(data);
};

const getMaxFreeRow = (rows) =>  {
    let min = Infinity;
    let minI = null;
    for (let j = 0; j < rows.length; j++) {
        const row = rows[j];
        if (row.size < min) {
            minI = j;
            min = row.size;
        }
    }

    if (min < maxCountOnRows) {
        return rows[minI];
    }

    return null;
};

// main
(async () => {
    const rows = createRows(rowsCount);
    const queue = [];

    let time = workingTime[0] * 3600;
    const endTime = workingTime[1] * 3600;
    while (time < endTime) {
        const { visitors: visitorsCount, time: timeWait } = await generateVisitors();
        CONFIG.totalVisitorsCount += visitorsCount;
        for (let i = 0; i < visitorsCount; i++) {
            enterClientInQueue(getId(), queue);
        }

        while (true) {
            const row = getMaxFreeRow(rows);
            if (row) {
                const id = getClientFromQueue(queue);
                if (id) {
                    enterClientInPool(row, id);
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        time += timeWait * 60;
        print(time, rows, queue);
    }

    generateHTML(beautyLogs(LOGS), CONFIG, rowsCount);
})();

function beautyLogs(LOGS) {
    const result = [];
    const map = new Map();

    LOGS.forEach((d) => {
        map.set(d.time, d);
    });

    map.forEach((value, key) => {
        const s = timeToSeconds(key);
        if (s % 600 === 0) {
            result.push(value);
        }
    });
    return result;
}
