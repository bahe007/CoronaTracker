$(window).ready(function() {
    const data = createData();
    const modelData1 = createExponentialLinearModel1(data.x, data.y);
    const modelData2 = createExponentialLinearModel2(data.x, data.y);

    $(".model-a").text(modelData1["model"][0].toFixed(6));
    $(".model-b").text(modelData1["model"][1].toFixed(2));
    $(".model-c").text(modelData1["model"][2].toFixed(2));
    $(".model-rmse").text(modelData1["rmse"].toFixed(2));

    createGraph(data.x, data.y, modelData1.x, modelData1.y, modelData2.x, modelData2.y);
});

function createData() {
    let data = {"x": [], "y": []};
    const datasets = $(".dataset");
    for (let i = 0; i < datasets.length; i++) {
        const dataset = datasets[i];
        const relativeDistance = 
        ((new Date($(dataset).find(".date").text())).getTime() 
        - (new Date($(datasets[0]).find(".date").text())).getTime())
        /(1000 * 3600 * 24);
        const numberOfInfections = parseInt($(dataset).find(".number").text());
        data["x"].push(relativeDistance);
        data["y"].push(numberOfInfections);
    }

    return data;
}

function createExponentialLinearModel1(x, y) {
    let A = [];
    for (let i = 0; i < x.length; i++) {
        const x_elem = x[i];
        A.push([Math.exp(x_elem), x_elem, 1]);
    }

    let points = [];
    for (let i = 0; i <= x[x.length-1]; i++) {
        points.push([Math.exp(i), i, 1]);
    }

    return createModel(x, y, A, points);
}

function createExponentialLinearModel2(x, y) {
    let A = [];
    for (let i = 0; i < x.length; i++) {
        const x_elem = x[i];
        A.push([Math.pow(Math.E/2, x_elem), x_elem, 1]);
    }

    let points = [];
    for (let i = 0; i <= x[x.length-1]; i++) {
        points.push([Math.pow(Math.E/2, i), i, 1]);
    }

    return createModel(x, y, A, points);
}

function createModel(x, y, A, points) {
    let b = y;
    const model = math.lusolve(
        math.multiply(math.transpose(A), A),
        math.multiply(math.transpose(A), b)
        );
    for (let i = 0; i < model.length; i++) {
        const entry = model[i];
        model[i] = entry[0];
    }
    
    let modelValues = {"x": [], "y": []};
    for (let i = 0; i <= x[x.length-1]; i++) {
        modelValues["x"].push(i);
        modelValues["y"].push(math.dot(model, points[i]));
    }

    let rmse = 0.0;
    for (let i = 0; i < x.length; i++) {
        const x_elem = x[i];
        rmse += Math.pow((modelValues["y"][x_elem]-y[i]), 2)
    }
    rmse = math.sqrt(rmse/x.length);
    modelValues["rmse"] = rmse;
    modelValues["model"] = model;    
    
    return modelValues;
}

function createGraph(x, y, xModel1, yModel1, xModel2, yModel2) {
    const x_y_combination = [];
    for (let i = 0; i <= x.length; i++) {
        const x_point = x[i];
        x_y_combination.push({"x": x_point, "y": y[i]});
    }

    const x_y_combination_model1 = [];
    const x_y_combination_model2 = [];
    for (let i = 0; i <= xModel1.length; i++) {
        x_y_combination_model1.push({"x": xModel1[i], "y": yModel1[i]});
        x_y_combination_model2.push({"x": xModel2[i], "y": yModel2[i]});
    }

    const ctx = document.getElementById('chart').getContext('2d');
    const _ = new Chart(ctx, {
        type: 'line',
        // The data for our dataset
        data: {
            datasets: [{
                label: 'Datapoints',
                fill: false,
                borderColor: 'rgb(255, 204, 102)',
                backgroundColor: 'rgb(255, 204, 102)',
                borderWidth: 5,
                borderDash: [1, 10000],
                data: x_y_combination,
            }, {
                label: 'f(x)',
                data: x_y_combination_model1,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgb(255, 99, 132)',
                lineWidth: 50,
                fill: false,
            }, {
                label: 'g(x)',
                data: x_y_combination_model2,
                borderColor: 'blue',
                backgroundColor: 'blue',
                lineWidth: 50,
                fill: false,
            }]
        },

    // Configuration options go here
    options: {
        scales: {
            xAxes: [{
                type: 'linear',
                position: 'bottom',
                ticks: {
                    // Include a dollar sign in the ticks
                    callback: function(value, index, values) {
                        const datasets = $(".dataset");
                        const dateAsTime = (new Date($(datasets[0]).find(".date").text())).getTime()+value*(1000 * 3600 * 24);
                        return new Date(dateAsTime).toLocaleDateString();
                    }
                }
            }]
        }
    }
});
}