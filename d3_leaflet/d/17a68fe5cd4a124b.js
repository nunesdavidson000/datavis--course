// https://observablehq.com/d/17a68fe5cd4a124b@238
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# D3 com Crossfilter e DC.js (Com Mapa)`
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<code>css</code> <link rel="stylesheet" 
href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.0/css/bootstrap.min.css" integrity="sha384-          PDle/QlgIONtM1aqA2Qemk5gPOE7wFq8+Em+G/hmo5Iq0CCmYZLv3fVRDJ4MMwEA" crossorigin="anonymous">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css"
  integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
  crossorigin=""/>`
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.csv("https://gist.githubusercontent.com/emanueles/65a308ffa630689c11a031252998ef8d/raw/a004c770786229d54264406118ae21ba7e4c51a8/earthquakes.csv").then(function(data){
  //forma de quebrar os dados ano mes 
  /*publicid,eventtype,origintime,modificationtime,*longitude,*latitude,*magnitude,*depth,magnitudetype,depthtype,evaluationmethod,evaluationstatus,evaluationmode,earthmodel,usedphasecount,usedstationcount,magnitudestationcount,minimumdistance,azimuthalgap,originerror,magnitudeuncertainty*/
  
  /*mascara de formatacao ate segundos, ignora os milisegundos Observe que os dados estão em UTC (use d3.utcParse)#####*/
  let parseDate = d3.utcParse('%Y-%m-%dT%H:%M:%S')
  /*visualização ficar mais limpa, formate a magnitude para ter apenas uma casa decimal (use d3.format(".1f")) e o depth para ser inteiro (d3.format("d")).#####*/
  let magFormat = d3.format(".1f")
  
  let depthFormat = d3.format('d')
  
  data.forEach(function(d,i){
      //Use d.origintime.substr(0,19) e guarde o resultado em um novo campo (dtg).  ######
      d.dtg = parseDate(d.origintime.substr(0,19))
      d.latitude = +d.latitude
      d.longitude = +d.longitude
      d.magnitude = magFormat(+d.magnitude)
      d.depth = depthFormat(+d.depth)
      //soma d.magnitude = magFormat(+d.magnitude) ####
   })
  return data
})
)});
  main.variable(observer("facts")).define("facts", ["crossfilter","dataset"], function(crossfilter,dataset){return(
crossfilter(dataset)
)});
  main.variable(observer("dateDim")).define("dateDim", ["facts"], function(facts){return(
facts.dimension(d => d.dtg)
)});
  main.variable(observer("magnitudeDim")).define("magnitudeDim", ["facts"], function(facts){return(
facts.dimension(d => d.magnitude)
)});
  main.variable(observer("terremotoByMagnitude")).define("terremotoByMagnitude", ["magnitudeDim"], function(magnitudeDim){return(
magnitudeDim.group()
)});
  main.variable(observer("depthDim")).define("depthDim", ["facts"], function(facts){return(
facts.dimension(d => d.depth)
)});
  main.variable(observer("terremotoByDepth")).define("terremotoByDepth", ["depthDim"], function(depthDim){return(
depthDim.group()
)});
  main.variable(observer("hourDim")).define("hourDim", ["facts","d3"], function(facts,d3){return(
facts.dimension(d => d3.timeHour(d.dtg))
)});
  main.variable(observer("terremotoByHour")).define("terremotoByHour", ["hourDim"], function(hourDim){return(
hourDim.group()
)});
  main.variable(observer("buildvis")).define("buildvis", ["md","container","dc","dateDim","d3","magnitudeDim","width","terremotoByMagnitude","depthDim","terremotoByDepth","dataset","terremotoByHour"], function(md,container,dc,dateDim,d3,magnitudeDim,width,terremotoByMagnitude,depthDim,terremotoByDepth,dataset,terremotoByHour)
{
  let view = md`${container()}`
  /*Dentro da célula buildvis, crie uma variável do tipo dc.dataTable usando como placeholder (identificador traducao espaco reservado) o div com id dc-table-graph.*/
  let dataTable= dc.dataTable(view.querySelector("#dc-table-graph"))  
  
 /* width: 960
  height: 800
  dimension: dateDimension
  group: dataTable eh um caso especial de grafico dc (grupo não faz sentido) 
  (todos os atributos valores podem ser mostrados).
  */
  
  dataTable.width(960)
           .height(800)
           .dimension(dateDim)
           /*função anônima e que retorna apenas uma string contendo "List of all earthquakes corresponding to               the filters". .group(d => "List of all earthquakes corresponding to the filters")
           */
           .group(d => "List of all earthquakes corresponding to the filters")
           .size(10)
  
          /* Colunas:  .columns([ 'dtg',...]) // os nomes dos atributos
            Ordenação:
            .sortBy(d => d.dtg)
            .order(d3.ascending)*/
           .columns(['dtg','latitude','longitude','magnitude','depth'])
           .sortBy(d => d.dtg)
           .order(d3.ascending)
  
    /*width: 480, height: 150
      x dimension domain: [0, 8] (escala linear)
      gap: 56  numero obscuro. Parece depender de largura do grafico e do numero de dimensões. tentativa e erro.
      elasticY como true
    */
  
  let barChartMag = dc.barChart(view.querySelector("#magnitude-chart"))
  barChartMag.width(480)
          .height(150)
          .dimension(magnitudeDim)
          .x(d3.scaleLinear()
               .range([0,width])
               .domain([0,8]))
          .xUnits(dc.units.integers)
          .gap(56)
          .elasticY(true)
          .group(terremotoByMagnitude) 
  
  /*width: 480, height: 150
   x dimension domain: [0, 100] (escala linear)
   gap: 1
   set elasticY to true
  */ 
  
  let barChartDepth = dc.barChart(view.querySelector("#depth-chart"))
  barChartDepth.width(480)
          .height(150)
          .dimension(depthDim)
          .x(d3.scaleLinear()
               .range([0,width])
               .domain([0,100]))
          .xUnits(dc.units.integers)
          .gap(1)
          .elasticY(true)
          .group(terremotoByDepth) 

  /*width: 960, height: 150
   x dimension domain: construa uma scaleTime a partir dosdados: 
   d3.scaleTime().domain(d3.extent(dataset, d => d.dtg))
  */
  
  let lineChart = dc.lineChart(view.querySelector("#time-chart"))
  lineChart.width(960)
           .height(150)
           .dimension(depthDim)
           .x(d3.scaleTime().domain(d3.extent(dataset, d => d.dtg)))
           .group(terremotoByHour) 
  
  dc.renderAll()
  return view
}
);
  main.variable(observer("map")).define("map", ["buildvis","L"], function(buildvis,L)
{
  buildvis;
  let mapInstance = L.map('mapid').setView([-41.05,172.93], 5)
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 17
    }).addTo(mapInstance)
  return mapInstance
}
);
  main.variable(observer("circlesLayer")).define("circlesLayer", ["L","map"], function(L,map){return(
L.layerGroup().addTo(map)
)});
  main.variable(observer("circles")).define("circles", ["circlesLayer","dataset","L"], function(circlesLayer,dataset,L)
{
  circlesLayer.clearLayers()
  dataset.forEach( function(d) {
    let circle = L.circle([d.latitude, d.longitude], 10000, {
          color: '#fd8d3c',
          weight: 2,
          fillColor: '#fecc5c',
          fillOpacity: 0.5
          })
    //adiciona o circulo
    circlesLayer.addLayer(circle)
    //prepara o texto para o popup
    let texto = "Magnitude: "+d.magnitude+"<br>Tempo: "+d.dtg
    //popup para os objetos do mapa circle.bindPopup(texto para exibir)
    circle.bindPopup(texto)
  })
}
);
  main.variable(observer("container")).define("container", function(){return(
function container() { 
  return `
<main role="main" class="container">

    <div class="row">
      <h4> Earthquakes in New Zealand</h4>
    </div>

    <div class='row'>
        <div id="mapid" class="col-6">
        </div>
        <div class="col-6">
          <div id='magnitude-chart'>
            <h5> Number of Events by Magnitude </h5>
          </div>

          <div id='depth-chart'>
            <h5> Events by Depth (km) </h5>
          </div>
        </div>
    </div>

    <div class='row'>
      <div id='time-chart' class="single-col">
        <h5> Events per hour </h5>
      </div>
    </div>

    <table class="table table-hover" id="dc-table-graph">
        <thead>
            <tr class="header">
                <th>DTG</th>
                <th>Magnitude</th>
                <th>Depth</th>
                <th>Latitude</th>
                <th>Longitude</th>
            </tr>
        </thead>
    </table>

   <p>Earthquake data via <a href="https://quakesearch.geonet.org.nz/">Geonet</a>.</p>

  </main>
 `
}
)});
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula inclui o css do dc.
<style>
.dc-chart path.dc-symbol, .dc-legend g.dc-legend-item.fadeout {
  fill-opacity: 0.5;
  stroke-opacity: 0.5; }

.dc-chart rect.bar {
  stroke: none;
  cursor: pointer; }
  .dc-chart rect.bar:hover {
    fill-opacity: .5; }

.dc-chart rect.deselected {
  stroke: none;
  fill: #ccc; }

.dc-chart .pie-slice {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }
  .dc-chart .pie-slice.external {
    fill: #000; }
  .dc-chart .pie-slice :hover, .dc-chart .pie-slice.highlight {
    fill-opacity: .8; }

.dc-chart .pie-path {
  fill: none;
  stroke-width: 2px;
  stroke: #000;
  opacity: 0.4; }

.dc-chart .selected path, .dc-chart .selected circle {
  stroke-width: 3;
  stroke: #ccc;
  fill-opacity: 1; }

.dc-chart .deselected path, .dc-chart .deselected circle {
  stroke: none;
  fill-opacity: .5;
  fill: #ccc; }

.dc-chart .axis path, .dc-chart .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges; }

.dc-chart .axis text {
  font: 10px sans-serif; }

.dc-chart .grid-line, .dc-chart .axis .grid-line, .dc-chart .grid-line line, .dc-chart .axis .grid-line line {
  fill: none;
  stroke: #ccc;
  shape-rendering: crispEdges; }

.dc-chart .brush rect.selection {
  fill: #4682b4;
  fill-opacity: .125; }

.dc-chart .brush .custom-brush-handle {
  fill: #eee;
  stroke: #666;
  cursor: ew-resize; }

.dc-chart path.line {
  fill: none;
  stroke-width: 1.5px; }

.dc-chart path.area {
  fill-opacity: .3;
  stroke: none; }

.dc-chart path.highlight {
  stroke-width: 3;
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart g.state {
  cursor: pointer; }
  .dc-chart g.state :hover {
    fill-opacity: .8; }
  .dc-chart g.state path {
    stroke: #fff; }

.dc-chart g.deselected path {
  fill: #808080; }

.dc-chart g.deselected text {
  display: none; }

.dc-chart g.row rect {
  fill-opacity: 0.8;
  cursor: pointer; }
  .dc-chart g.row rect:hover {
    fill-opacity: 0.6; }

.dc-chart g.row text {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }

.dc-chart g.dc-tooltip path {
  fill: none;
  stroke: #808080;
  stroke-opacity: .8; }

.dc-chart g.county path {
  stroke: #fff;
  fill: none; }

.dc-chart g.debug rect {
  fill: #00f;
  fill-opacity: .2; }

.dc-chart g.axis text {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .node {
  font-size: 0.7em;
  cursor: pointer; }
  .dc-chart .node :hover {
    fill-opacity: .8; }

.dc-chart .bubble {
  stroke: none;
  fill-opacity: 0.6; }

.dc-chart .highlight {
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart .fadeout {
  fill-opacity: 0.2;
  stroke-opacity: 0.2; }

.dc-chart .box text {
  font: 10px sans-serif;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .box line {
  fill: #fff; }

.dc-chart .box rect, .dc-chart .box line, .dc-chart .box circle {
  stroke: #000;
  stroke-width: 1.5px; }

.dc-chart .box .center {
  stroke-dasharray: 3, 3; }

.dc-chart .box .data {
  stroke: none;
  stroke-width: 0px; }

.dc-chart .box .outlier {
  fill: none;
  stroke: #ccc; }

.dc-chart .box .outlierBold {
  fill: red;
  stroke: none; }

.dc-chart .box.deselected {
  opacity: 0.5; }
  .dc-chart .box.deselected .box {
    fill: #ccc; }

.dc-chart .symbol {
  stroke: none; }

.dc-chart .heatmap .box-group.deselected rect {
  stroke: none;
  fill-opacity: 0.5;
  fill: #ccc; }

.dc-chart .heatmap g.axis text {
  pointer-events: all;
  cursor: pointer; }

.dc-chart .empty-chart .pie-slice {
  cursor: default; }
  .dc-chart .empty-chart .pie-slice path {
    fill: #fee;
    cursor: default; }

.dc-data-count {
  float: right;
  margin-top: 15px;
  margin-right: 15px; }
  .dc-data-count .filter-count, .dc-data-count .total-count {
    color: #3182bd;
    font-weight: bold; }

.dc-legend {
  font-size: 11px; }
  .dc-legend .dc-legend-item {
    cursor: pointer; }

.dc-hard .number-display {
  float: none; }

div.dc-html-legend {
  overflow-y: auto;
  overflow-x: hidden;
  height: inherit;
  float: right;
  padding-right: 2px; }
  div.dc-html-legend .dc-legend-item-horizontal {
    display: inline-block;
    margin-left: 5px;
    margin-right: 5px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-horizontal.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-vertical {
    display: block;
    margin-top: 5px;
    padding-top: 1px;
    padding-bottom: 1px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-vertical.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-color {
    display: table-cell;
    width: 12px;
    height: 12px; }
  div.dc-html-legend .dc-legend-item-label {
    line-height: 12px;
    display: table-cell;
    vertical-align: middle;
    padding-left: 3px;
    padding-right: 3px;
    font-size: 0.75em; }

.dc-html-legend-container {
  height: inherit; }
</style>`
)});
  main.variable(observer("dc")).define("dc", ["require"], function(require){return(
require('dc')
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require('crossfilter2')
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3')
)});
  main.variable(observer("L")).define("L", ["require"], function(require){return(
require('leaflet@1.5.1')
)});
  main.variable(observer("$")).define("$", ["require"], function(require){return(
require('jquery').then(jquery => {
  window.jquery = jquery;
  return require('popper@1.0.1/index.js').catch(() => jquery);
})
)});
  main.variable(observer("bootstrap")).define("bootstrap", ["require"], function(require){return(
require('bootstrap')
)});
  return main;
}
