// https://observablehq.com/@nunesdavidson000/taxa-de-desemprego-nos-eua-em-agosto-de-2016-parte-2@154
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Taxa de desemprego nos EUA em agosto de 2016 (Parte 2)`
)});
  main.variable(observer("buildvis")).define("buildvis", ["d3","DOM","green","topojson","us","colorScale","rateById","showTooltip"], function(d3,DOM,green,topojson,us,colorScale,rateById,showTooltip)
{
  const width = 960
  const height = 600
  const svg = d3.select(DOM.svg(width, height))
  let path = d3.geoPath()
  
  let quantize = d3.scaleQuantize()
      .domain([0,10])
      .range(green);
  
  
  
  svg.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
    .attr("fill", d => colorScale(rateById.get(d.id)))
    .attr("d", path)

  
  svg.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
    .attr("fill", function(d) {return quantize(rateById.get(d.id));})
    //.attr("fill", function(d) { return quantize(country.get(d.id)); })
    .attr("d", path)
    //se nao tirar esta linha ele so pega essa e nao aceita o css
    //.append("title").text(d => "Taxa de desemprego: "+rateById.get(d.id)+ "%")// + county_names.get(d.name))
    
  
  
    // .on("mouseover", function(d){
    // d3.select(this) // seleciona o elemento atual
    // .style("cursor", "pointer")
    // .attr("stroke-width", 3)
    // .attr("stroke","#FFF5B1")
    // })
  
  //highlight
      .on("mouseover", function(d){
       d3.select(this)
          .style("cursor", "pointer")
          .attr("stroke-width", 3)
          .attr("stroke","#FFF5B1")
      let coordinates = [0, 0]
      coordinates = d3.mouse(this) // obtém a posição do mouse relativa a this
      const x = coordinates[0] + 10
      const y = coordinates[1] + 20 // descontando a posição do svg

    showTooltip(d.id, x, y)
    })  
  
    // desliga highlight
  
    .on("mouseout", function(d){
    d3.select(this)
    .style("cursor", "default")
    .attr("stroke-width", 0)
    .attr("stroke","none"); //volta ao valor padrão
    })

    
//     .on("mouseout", function(d){
//     d3.select(this)
//       .style("cursor", "default")
//       .attr("stroke-width", 0)
//       .attr("stroke","none");
//     hideTooltip();
//     });
  
  
  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path)
  // Once we append the vis elments to it, we return the DOM element for Observable to display above.
  return svg.node()
}
);
  main.variable(observer("tooltip")).define("tooltip", ["d3"], function(d3)
{
  d3.select("#tooltip").remove()
  let node = d3.select("body")
    .append("div")
    //começa a div escondida
    .attr("id", "tooltip")
    .attr("class","hidden")
    .append("p")
    //template para jogar a taxa de desemprego
    .html("<b><span id= 'county'></span></b>")
    .append("p")
    .html("Taxa de desemprego:<span id='taxa'></span>%")
  return node
}
);
  main.variable(observer("colorScale")).define("colorScale", ["d3"], function(d3){return(
d3.scaleQuantize()
                .domain([1,10])
                .range(d3.schemeGreens[9])
)});
  main.variable(observer("rateById")).define("rateById", ["d3"], function(d3){return(
d3.tsv("https://gist.githubusercontent.com/emanueles/7fbdcd8ee412e3e63904114cf9d7ee3a/raw/af4fd93db1be3f9033caff46d4a574a54bf9363f/unemployment.tsv").then(function (data) {
  let rateMap = d3.map()
  data.forEach(function(d) {
    rateMap.set(d.id, +d.rate)
  })
  return rateMap
})
)});
  main.variable(observer("us")).define("us", ["d3"], function(d3){return(
d3.json("https://gist.githubusercontent.com/emanueles/ee2997bc6237f3dcab952ae8becaf6bf/raw/afdb12d4ef89bb239998b295c94d960e8d89c19e/us.json")
)});
  main.variable(observer("country")).define("country", ["d3"], function(d3){return(
d3.csv("https://gist.githubusercontent.com/emanueles/19cf3828bab232612c2b1599d831f690/raw/ddbaf62af22512a39360cc6741b40f5588b44aa0/county_names.csv").then(function (data) {
 let rateMap = d3.map()
 data.forEach(function(d) {
   rateMap.set(d.id, d.name)
 })
 return rateMap
})
)});
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula contém os estilos da visualização.
<style>

		.counties {
		  fill: none;
		}

		.states {
		  fill: none;
		  stroke: #eee;
		  stroke-linejoin: round;
		}
     #tooltip {
          position: absolute;
          width: 240px;
          height: auto;
          padding: 10px;
          background-color: white;
          -webkit-border-radius: 10px;
          -moz-border-radius: 10px;
          border-radius: 10px;
          -webkit-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
          -moz-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
          box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
          pointer-events: none;
      }


      #tooltip.hidden {
          display: none;
          }
          
      #tooltip p {
          margin: 0;
          font-family: sans-serif;
          font-size: 16px;
          line-height: 20px;
          }

	</style>`
)});
  main.variable(observer("topojson")).define("topojson", ["require"], function(require){return(
require("topojson-client@3")
)});
  main.variable(observer("green")).define("green", ["d3"], function(d3){return(
d3.schemeGreens[9]
)});
  main.variable(observer("showTooltip")).define("showTooltip", ["d3","rateById","country"], function(d3,rateById,country){return(
function showTooltip(county_id, x, y){
    d3.select("#tooltip")
      .style("left", x + "px")
      .style("top", y + "px")
      .select("#taxa")
      .text(rateById.get(county_id));
    
    d3.select("#county")
      .text(country.get(county_id));
  
    d3.select("#tooltip")
      .classed("hidden", false)
}
)});
  main.variable(observer("hideTooltip")).define("hideTooltip", ["d3"], function(d3){return(
function hideTooltip(){
    d3.select("#tooltip")
    .classed("hidden", true)
}
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3@5')
)});
  return main;
}
