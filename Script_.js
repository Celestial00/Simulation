// Function to run the simulation
function runSimulation() {
    const numCustomers = parseInt(document.getElementById('numCustomers').value);
    const arrivalTimes = document.getElementById('arrivalTimes').value.split(',').map(Number);
    const serviceTimes = document.getElementById('serviceTimes').value.split(',').map(Number);

    if (numCustomers !== arrivalTimes.length || numCustomers !== serviceTimes.length) {
        alert('Please make sure the number of customers matches the number of arrival and service times provided.');
        return;
    }

    const s = [];
    let totalWaitingTime = 0, totalIdleTime = 0, waitCount = 0, totalServiceTime = 0;

    for (let i = 0; i < numCustomers; i++) {
        s[i] = {
            cust_no: i + 1,
            rd_ar: arrivalTimes[i],
            intr_arr_time: 0,
            arr_time: 0,
            rd_se: serviceTimes[i],
            service_time: 0,
            service_begin: 0,
            time_ser_end: 0,
            waiting_time: 0,
            idle_time: 0,
            spend: 0
        };

        if (i > 0) {
            s[i].intr_arr_time = calculateInterArrivalTime(s[i].rd_ar);
            s[i].arr_time = s[i - 1].arr_time + s[i].intr_arr_time;
        }

        s[i].service_time = calculateServiceTime(s[i].rd_se);
        totalServiceTime += s[i].service_time;

        if (i > 0) {
            s[i].service_begin = Math.max(s[i].arr_time, s[i - 1].time_ser_end);
            s[i].waiting_time = s[i].service_begin - s[i].arr_time;
            if (s[i].waiting_time > 0) waitCount++;
        }

        s[i].time_ser_end = s[i].service_begin + s[i].service_time;
        s[i].idle_time = i > 0 ? Math.max(s[i].arr_time - s[i - 1].time_ser_end, 0) : 0;
        s[i].spend = s[i].service_time + s[i].waiting_time;

        totalWaitingTime += s[i].waiting_time;
        totalIdleTime += s[i].idle_time;
    }

    displayResults(s, numCustomers, totalServiceTime, totalWaitingTime, totalIdleTime, waitCount);
}

// Function to calculate inter-arrival time
function calculateInterArrivalTime(rd, customValues) {
    if (customValues) {
        const values = customValues.split(',').map(Number);
        if (rd >= 0 && rd < values.length) return values[rd];
    }
    if (rd > 0 && rd < 126) return 1;
    else if (rd > 125 && rd < 251) return 2;
    else if (rd > 250 && rd < 376) return 3;
    else if (rd > 375 && rd < 501) return 4;
    else if (rd > 500 && rd < 626) return 5;
    else if (rd > 625 && rd < 751) return 6;
    else if (rd > 750 && rd < 876) return 7;
    else if (rd > 875 && rd < 1001) return 8;
    else return 0;
}

// Function to calculate service time
function calculateServiceTime(rd, customValues) {
    if (customValues) {
        const values = customValues.split(',').map(Number);
        if (rd >= 0 && rd < values.length) return values[rd];
    }
    if (rd > 0 && rd < 11) return 1;
    else if (rd > 10 && rd < 31) return 2;
    else if (rd > 30 && rd < 61) return 3;
    else if (rd > 60 && rd < 86) return 4;
    else if (rd > 85 && rd < 96) return 5;
    else if (rd > 95 && rd < 101) return 6;
    else return 0;
}

// Function to display results
function displayResults(s, n, totalServiceTime, totalWaitingTime, totalIdleTime, waitCount) {
    let output = `
    <table>
        <thead>
            <tr>
                <th>Cust. No.</th>
                <th>RD for Arrival</th>
                <th>Inter Arrival Time</th>
                <th>Arrival Time</th>
                <th>RD for Service</th>
                <th>Service Time</th>
                <th>Service Begin</th>
                <th>Service End</th>
                <th>Waiting Time</th>
                <th>Idle Time</th>
                <th>Spend in System</th>
            </tr>
        </thead>
        <tbody>`;

    s.forEach(c => {
        output += `
            <tr>
                <td>${c.cust_no}</td>
                <td>${c.rd_ar}</td>
                <td>${c.intr_arr_time}</td>
                <td>${c.arr_time}</td>
                <td>${c.rd_se}</td>
                <td>${c.service_time}</td>
                <td>${c.service_begin}</td>
                <td>${c.time_ser_end}</td>
                <td>${c.waiting_time}</td>
                <td>${c.idle_time}</td>
                <td>${c.spend}</td>
            </tr>`;
    });

    output += `</tbody></table>`;

    const avgWaitingTime = (totalWaitingTime / n).toFixed(2);
    const probabilityWait = (waitCount / n).toFixed(2);
    const probabilityOfIdleServer = (totalIdleTime / s[n - 1].time_ser_end).toFixed(2);
    const avgServiceTime = (totalServiceTime / n).toFixed(2);
    const avgTimeBetweenArrival = (s[n - 1].arr_time / (n - 1)).toFixed(2);
    const avgWaitingTimeForThoseWhoWait = (waitCount > 0 ? (totalWaitingTime / waitCount).toFixed(2) : 0);
    const avgTimeSpentInSystem = (s.reduce((sum, c) => sum + c.spend, 0) / n).toFixed(2);

    output += `
        <div class="summary">
            <p>Average Waiting Time: ${avgWaitingTime}</p>
            <p>Probability of Wait: ${probabilityWait}</p>
            <p>Probability of Idle Server: ${probabilityOfIdleServer}</p>
            <p>Average Service Time: ${avgServiceTime}</p>
            <p>Average Time Between Arrival: ${avgTimeBetweenArrival}</p>
            <p>Average Waiting Time for Those Who Wait: ${avgWaitingTimeForThoseWhoWait}</p>
            <p>Average Time Spent in System: ${avgTimeSpentInSystem}</p>
        </div>
    `;

    document.getElementById('output').innerHTML = output;
    renderChart(s);
}

// Function to render the chart
function renderChart(customers) {
    const ctx = document.getElementById('resultsChart').getContext('2d');

    // Extracting data for each metric
    const labels = customers.map(c => `Customer ${c.cust_no}`);
    const avgWaitingTimes = customers.map(c => c.waiting_time);
    const serverIdleTimes = customers.map(c => Math.max(c.idle_time, 0)); // Ensure non-negative values
    const timesSpentInSystem = customers.map(c => c.spend);

    // Data structure for chart
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Waiting Time',
                data: avgWaitingTimes,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            },
            {
                label: 'Server Idle Time',
                data: serverIdleTimes,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                label: 'Time Spent in System',
                data: timesSpentInSystem,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to export results to CSV
function exportCSV() {
    const numCustomers = parseInt(document.getElementById('numCustomers').value);
    const arrivalTimes = document.getElementById('arrivalTimes').value.split(',').map(Number);
    const serviceTimes = document.getElementById('serviceTimes').value.split(',').map(Number);

    if (numCustomers !== arrivalTimes.length || numCustomers !== serviceTimes.length) {
        alert('Please make sure the number of customers matches the number of arrival and service times provided.');
        return;
    }

    const s = [];
    for (let i = 0; i < numCustomers; i++) {
        s[i] = {
            cust_no: i + 1,
            rd_ar: arrivalTimes[i],
            intr_arr_time: 0,
            arr_time: 0,
            rd_se: serviceTimes[i],
            service_time: 0,
            service_begin: 0,
            time_ser_end: 0,
            waiting_time: 0,
            idle_time: 0,
            spend: 0
        };

        if (i > 0) {
            s[i].intr_arr_time = calculateInterArrivalTime(s[i].rd_ar);
            s[i].arr_time = s[i - 1].arr_time + s[i].intr_arr_time;
        }

        s[i].service_time = calculateServiceTime(s[i].rd_se);

        if (i > 0) {
            s[i].service_begin = Math.max(s[i].arr_time, s[i - 1].time_ser_end);
            s[i].waiting_time = s[i].service_begin - s[i].arr_time;
        }

        s[i].time_ser_end = s[i].service_begin + s[i].service_time;
        s[i].idle_time = i > 0 ? Math.max(s[i].arr_time - s[i - 1].time_ser_end, 0) : 0;
        s[i].spend = s[i].service_time + s[i].waiting_time;
    }

    const csvContent = "data:text/csv;charset=utf-8,"
        + "Cust. No.,RD for Arrival,Inter Arrival Time,Arrival Time,RD for Service,Service Time,Service Begin,Service End,Waiting Time,Idle Time,Spend in System\n"
        + s.map(c => [
            c.cust_no,
            c.rd_ar,
            c.intr_arr_time,
            c.arr_time,
            c.rd_se,
            c.service_time,
            c.service_begin,
            c.time_ser_end,
            c.waiting_time,
            c.idle_time,
            c.spend
        ].join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'simulation_results.csv');
    document.body.appendChild(link);
    link.click();
}

// Add event listener to the button
document.getElementById('runButton').addEventListener('click', runSimulation);
document.getElementById('exportButton').addEventListener('click', exportCSV);
