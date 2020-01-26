$(window).ready(function() {
    const data = createData();
    const modelData = createModel(data.x, data.y)

    $(".model-a").text(modelData["model"][0].toFixed(6));
    $(".model-b").text(modelData["model"][1].toFixed(2));
    $(".model-c").text(modelData["model"][2].toFixed(2));
    $(".model-rmse").text(modelData["rmse"].toFixed(2));

    createGraph(data.x, data.y, modelData.x, modelData.y);
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

function createModel(x, y) {
    let A = [];
    let b = y;
    for (let i = 0; i < x.length; i++) {
        const x_elem = x[i];
        A.push([Math.exp(x_elem), x_elem, 1]);
    }
    const model = math.lusolve(
        math.multiply(math.transpose(A), A),
        math.multiply(math.transpose(A), b)
        );
    
    let modelValues = {"x": [], "y": []};
    for (let i = 0; i <= x[x.length-1]; i++) {
        modelValues["x"].push(i);
        modelValues["y"].push(model[0][0]*Math.exp(i)+model[1][0]*i+model[2][0]);
    }

    let rmse = 0.0;
    for (let i = 0; i < x.length; i++) {
        const x_elem = x[i];
        rmse += Math.pow((modelValues["y"][x_elem]-y[i]), 2)
    }
    rmse = math.sqrt(rmse/x.length);
    modelValues["rmse"] = rmse;
    modelValues["model"] = [model[0][0], model[1][0], model[2][0]];    
    
    return modelValues;
}

function createGraph(x, y, xModel, yModel) {
    const x_y_combination = [];
    for (let i = 0; i <= x.length; i++) {
        const x_point = x[i];
        x_y_combination.push({"x": x_point, "y": y[i]});
    }

    const x_y_combination_model = [];
    for (let i = 0; i <= xModel.length; i++) {
        const x_point = xModel[i];
        x_y_combination_model.push({"x": x_point, "y": yModel[i]});
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
                borderWidth: 5,
                borderDash: [1, 10000],
                data: x_y_combination,
            }, {
                label: 'Model',
                data: x_y_combination_model,
                borderColor: 'rgb(255, 99, 132)',
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