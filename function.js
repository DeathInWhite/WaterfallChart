var years_final = []
var modo = "Normal"
var valores_slider
var periodos
    //https://www.d3-graph-gallery.com/graph/barplot_animation_start.html

d3.csv("data.csv", type, function(error, data) {
    let years = []
    for (let i = 0; i < data.length; i++) {
        years.push(data[i].year)
    }
    var uniqueYears = [];
    $.each(years, function(i, el) {
        if ($.inArray(el, uniqueYears) === -1) uniqueYears.push(el);
    });


    for (var i = 0; i < uniqueYears.length; i++) {
        years_final.push(uniqueYears[i])
        $('<option/>').val(uniqueYears[i]).html(uniqueYears[i]).appendTo('#years');
        // if (i == 0) {
        //     createChart(uniqueYears[i], 1)
        // }
    }

    let min = parseInt(years_final[0])
    let max = parseInt(years_final[years_final.length - 1])

    $("#slider-range").slider({
        range: true,
        min: min,
        max: max,
        values: [min, min+1],
        slide: function(event, ui) {
            if(ui.values[0]-ui.values[1]==0){
                return false
            }
            $("#amount").val(ui.values[0] + " - " + ui.values[1]);   
        }
    });

    $("#amount").val($("#slider-range").slider("values", 0) +
        " - " + $("#slider-range").slider("values", 1));


});

$("#slider-range").slider({
    change: function(event, ui) {
        d3.selectAll("svg > *").remove();

        valores_slider = $("#slider-range").slider("values");
        periodos = valores_slider[1] - valores_slider[0]
        periodos = periodos + 1
        createChart(valores_slider[0], periodos, modo)

    }
});

$("#chart_mode").click(function() {
    if (($(this).text() == "Normal")) {
        $(this).text('Cumulative');
        modo = 'Cumulative'
    } else {
        $(this).text('Normal');
        modo = 'Normal'
    }
    d3.selectAll("svg > *").remove();
    createChart(valores_slider[0], periodos, modo)
})

function type(d) {
    d.value = +d.value;
    return d;
}

function dollarFormatter(n) {
    n = Math.round(n);
    var result = n;
    if (Math.abs(n) > 1000) {
        result = Math.round(n / 1000) + 'K';
    }

    return result;
}

function createChart(value, periods, modo) {


    var margin = { top: 20, right: 30, bottom: 100, left: 45 },
        width = screen.width - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom,
        padding = 0.3;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], padding);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(function(d) { return dollarFormatter(d); });

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("body").append("div").attr("class", "toolTip");


    d3.csv("data.csv", type, function(error, data) {
        var years_to_for = []

        for (var i = 0; i < data.length; i++) {
            if (data[i].year >= value) {
                years_to_for.push(data[i].year)
            }
        }

        var uni_year = [];

        $.each(years_to_for, function(i, el) {
            if ($.inArray(el, uni_year) === -1) uni_year.push(el);
        });

        var data_final = []

        let valor_minimo = 0
        let sales_min = 0
        let total_values = 0

        if (modo == "Normal") {

            //Getting the min value for the Y axis of the chart

            for (var j = 0; j < data.length; j++) {
                //----------------------
                if (j == 0) {
                    sales_min = data[j].value
                }

                if (data[j].name == "Sales" && data[j].value < sales_min) {
                    sales_min = data[j].value
                } else if (data[j].name != "Sales") {
                    total_values = total_values + data[j].value
                }
            }
            // valor_minimo = Math.floor10(sales_min - total_values, 1)
            valor_minimo = Math.floor10(sales_min - 50, 1)

            //Getting the min value for the Y axis of the chart

            var acumulativos = []
            for (let i = 0; i < periods; i++) {
                var acumulativo = 0
                var total_data
                var positive_negative = []


                for (var j = 0; j < data.length; j++) {
                    if (data[j].year == uni_year[i] && data[j].name == "Sales") {
                        data[j].re_name = data[j].name
                        data[j].name = data[j].name + " " + uni_year[i]
                        data[j].start = 0
                        acumulativo += data[j].value;
                        acumulativos.push(data[j].value)
                        data[j].end = data[j].value; //Le da un valor del valor
                        data[j].class = 'total'

                        total_data = data[j]
                    }
                }

                if (i > 0) {
                    acumulativo = acumulativos[i - 1]
                }

                if (uni_year[i] != uni_year[0]) {
                    for (var j = 0; j < data.length; j++) {
                        if (uni_year[i] == data[j].year && data[j].re_name != "Sales") {
                            data[j].re_name = data[j].name
                            data[j].name = data[j].name + " " + uni_year[i]
                            data[j].start = acumulativo; //Le da un inicio del valor
                            acumulativo += data[j].value;
                            data[j].end = acumulativo; //Le da un valor del valor
                            data[j].class = (data[j].value >= 0) ? 'positive' : 'negative'

                            positive_negative.push(data[j])
                        }
                    }
                }

                if (uni_year[i] == uni_year[0]) {
                    data_final.push(total_data)
                } else {
                    positive_negative.forEach(element => {
                        data_final.push(element)
                    });
                    data_final.push(total_data)
                }

            }


        } else {

            for (var j = 0; j < data.length; j++) {
                if (j == 0) {
                    sales_min = data[j].value
                }

                if (data[j].name == "Sales" && data[j].value < sales_min) {
                    sales_min = data[j].value
                } else if (data[j].name != "Sales") {
                    total_values = total_values + data[j].value
                }
            }
            valor_minimo = Math.floor10(sales_min - 50, 1)



            let sales_prices = []
            let volume = 0
            let price = 0
            let fx = 0
            let manda = 0

            for (var i = 0; i < data.length; i++) {
                for (let j = 0; j < periods; j++) {
                    if (data[i].year == uni_year[j] && data[i].name == "Sales") {
                        sales_prices.push(data[i])
                    }
                    if (data[i].year == uni_year[j]) {
                        if (data[i].name == "Volume") {
                            volume = volume + data[i].value
                        }
                        if (data[i].name == "Price") {
                            price = price + data[i].value
                        }
                        if (data[i].name == "FX") {
                            fx = fx + data[i].value
                        }
                        if (data[i].name == "M&A") {
                            manda = manda + data[i].value
                        }
                    }
                }
            }

            sales_prices[0].re_name = sales_prices[0].name
            sales_prices[0].name = sales_prices[0].name + " " + sales_prices[0].year
            sales_prices[0].start = 0
            sales_prices[0].end = sales_prices[0].value;
            sales_prices[0].class = 'total'
            data_final.push(sales_prices[0])

            console.log(sales_prices)

            if (sales_prices.length > 1) {

                sales_prices[sales_prices.length - 1]
                sales_prices[sales_prices.length - 1].re_name = sales_prices[sales_prices.length - 1].name
                sales_prices[sales_prices.length - 1].name = sales_prices[sales_prices.length - 1].name + " " + sales_prices[sales_prices.length - 1].year
                sales_prices[sales_prices.length - 1].start = 0
                sales_prices[sales_prices.length - 1].end = sales_prices[sales_prices.length - 1].value; //Le da un valor del valor
                sales_prices[sales_prices.length - 1].class = 'total'

                let obj_volume = {
                    "re_name": "",
                    "name": "",
                    "start": 0,
                    "end": 0,
                    "value": 0,
                    "class": ""
                }
                let obj_price = {
                    "re_name": "",
                    "name": "",
                    "start": 0,
                    "end": 0,
                    "value": 0,
                    "class": ""
                }
                let obj_fx = {
                    "re_name": "",
                    "name": "",
                    "start": 0,
                    "end": 0,
                    "value": 0,
                    "class": ""
                }
                let obj_manda = {
                    "re_name": "",
                    "name": "",
                    "start": 0,
                    "end": 0,
                    "value": 0,
                    "class": ""
                }

                obj_volume.re_name = "Volume"
                obj_volume.name = "Volume"
                obj_volume.start = sales_prices[0].end
                obj_volume.end = obj_volume.start + volume;
                obj_volume.value = (obj_volume.end) - (obj_volume.start)
                obj_volume.class = (volume >= 0) ? 'positive' : 'negative'
                data_final.push(obj_volume)

                obj_price.re_name = "Price"
                obj_price.name = "Price"
                obj_price.start = obj_volume.end
                obj_price.end = obj_volume.end + price;
                obj_price.value = (obj_price.end) - (obj_price.start)
                obj_price.class = (price >= 0) ? 'positive' : 'negative'
                data_final.push(obj_price)

                obj_fx.re_name = "FX"
                obj_fx.name = "FX"
                obj_fx.start = obj_price.end
                obj_fx.end = obj_price.end + fx;
                obj_fx.value = (obj_fx.end) - (obj_fx.start)
                obj_fx.class = (fx >= 0) ? 'positive' : 'negative'
                data_final.push(obj_fx)

                obj_manda.re_name = "M&A"
                obj_manda.name = "M&A"
                obj_manda.start = obj_fx.end
                obj_manda.end = obj_fx.end + manda; //Le da un valor del valor
                obj_manda.value = (obj_manda.end) - (obj_manda.start)
                obj_manda.class = (manda >= 0) ? 'positive' : 'negative'
                data_final.push(obj_manda)

                data_final.push(sales_prices[sales_prices.length - 1])
            }

        }

        x.domain(data_final.map(function(d) { return d.name; }));
        y.domain([valor_minimo, d3.max(data_final, function(d) { return d.end; })]);

        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis).selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"
            })

        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("USD Millions");

        chart.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 55) + ")")
            .style("text-anchor", "middle")
            .text("Parameters")

        var bar = chart.selectAll(".bar")
            .data(data_final)
            .enter().append("g")
            .attr("class", function(d) { return "bar " + d.class })
            .attr("transform", function(d) { return "translate(" + x(d.name) + ",0)"; })
            .on("mousemove", function(d) {
                tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .html((d.value));
            })
            .on("mouseout", function(d) { tooltip.style("display", "none"); });;


        bar.append("rect")
            .attr("y", function(d) {
                return y(Math.max(d.start, d.end));
            })
            .attr("height", function(d) {
                if (d.class == "total") {
                    return Math.abs(y(d.start + valor_minimo) - y(d.end));
                } else {
                    return Math.abs(y(d.start) - y(d.end));
                }

            })
            .attr("width", x.rangeBand());

        bar.append("text")
            .attr("x", x.rangeBand() / 2)
            .attr("y", function(d) {
                let y_val = (d.class == 'negative') ? -20 : 10
                return y(d.end) - y_val;
            })
            .attr("dy", function(d) { return ((d.class == 'negative') ? '-' : '') + ".75em" })
            .style('fill', 'black')
            .text(function(d) { return dollarFormatter(d.end - d.start); });


        bar.filter(function(d) { return d.class != "total" }).append("line") //return d.class != "total"
            .attr("class", "connector")
            .attr("x1", x.rangeBand() + 5)
            .attr("y1", function(d) { return y(d.end) })
            .attr("x2", x.rangeBand() / (1 - padding) - 5)
            .attr("y2", function(d) { return y(d.end) })


    })

}


(function() {

    /**
     * Ajuste decimal de un número.
     *
     * @param	{String}	type	El tipo de ajuste.
     * @param	{Number}	value	El número.
     * @param	{Integer}	exp		El exponente(el logaritmo en base 10 del ajuste).
     * @returns	{Number}			El valor ajustado.
     */
    function decimalAdjust(type, value, exp) {
        // Si el exp es indefinido o cero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // Si el valor no es un número o el exp no es un entero...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Cambio
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Volver a cambiar
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Redondeo hacia abajo
    if (!Math.floor10) {
        Math.floor10 = function(value, exp) {
            return decimalAdjust('floor', value, exp);
        };
    }

})();