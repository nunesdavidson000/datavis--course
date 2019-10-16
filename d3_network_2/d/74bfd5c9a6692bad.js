// https://observablehq.com/d/74bfd5c9a6692bad@134
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# lesmiserables

Songs similar to one another according to [last.fm](http://www.last.fm/api) are linked together. Song nodes are sized based on playcounts, and colored by artist.

Data from [last.fm](http://www.last.fm/api/show/track.getSimilar). Some songs include additional links for effect.<br/>Popular songs are defined as those with playcounts above the median for all songs in network. This example is a simpler version of the [tutorial](http://flowingdata.com/2012/08/02/how-to-make-an-interactive-network-visualization/)</a> by [Jim Vallandingham](http://vallandingham.me/).`
)});
  main.variable(observer("buildvis")).define("buildvis", ["d3","DOM","dataset","forceSimulation","drag"], function(d3,DOM,dataset,forceSimulation,drag)
{
  const width = 960
  const height = 800
  
  //comeca no centro
  const svg = d3.select(DOM.svg(width, height))
                .attr("viewBox", [-width / 2, -height / 2, width, height])
  //Configura nodes e links
  const nodes = dataset.nodes  
  const links = dataset.links
  
  // cria constante simulation para receber a funcao forceSimulation e no envento on fazer o tick que esta em outra celula #FFD700
  const simulation = forceSimulation(nodes, links).on("tick",ticked)
  
  
  //funcao para gerar a escala que vai retornar o valor para o tamanho do circulo
  let circleRadius = d3.scaleSqrt()
                .range([2,20])
                .domain(d3.extent(nodes, d => d.group))
  
  let circleColor = d3.scaleLinear()
                      //####
                      .domain(d3.extent( nodes, d => contador(d.id) ))
                      .range(["#FFD700", "#FF4500"]); 
 
  function contador(id){
    let total = 0
    for(var link of links)
      if(id == link.source.id) 
        total++
      if(id == link.target.id)
        total++
    return total
  }
 
  //elementos svg dentro do grupo e grarda na constante link
  const link = svg.append("g")
          .selectAll("line")
          .data(links)
          .enter()
          .append("line")
          .attr("class", "link")
    
  // mesma coisa com no 
  const node = svg.append("g")
          .selectAll("circle")
          .data(nodes)
          .enter()
          .append("circle")
          .attr("class", "node")
          .attr("r", d => circleRadius(contador(d.id)))
          .attr("fill", d => circleColor(contador(d.id)))
          .call(drag(simulation))
  
   
  
  //para criar string que aparece no no
  node.append("title").text((d) => 'Personagem:'+ d['id']+ ', Grupo:' +d['group'] + ', Num citacoes: ' + contador(d.id))
            
 // agora a funcao ticked que vai ser chamada no evento on e gera a constante

  function ticked() {

    // origem e destino da arestas ponto inicial e ponto final 
    link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)

    node.attr("cx", d => d.x)
        .attr("cy", d => d.y)
        
  }

  


  return svg.node()
}
);
  main.variable(observer("forceSimulation")).define("forceSimulation", ["d3"], function(d3){return(
function forceSimulation(nodes, links) {
        return d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(50))
            .force("charge", d3.forceManyBody().strength(-50).distanceMax(270))
            .force("center", d3.forceCenter())
}
)});
  main.variable(observer("drag")).define("drag", ["d3"], function(d3){return(
function drag(simulation){
  
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }
  
  function dragged(d) {
    d.fx = d3.event.x
    d.fy = d3.event.y
  }
  
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended)
}
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.json ("https://gist.githubusercontent.com/emanueles/1dc73efc65b830f111723e7b877efdd5/raw/2c7a42b5d27789d74c8708e13ed327dc52802ec6/lesmiserables.json")
)});
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula contém os estilos da visualização.
<style>
line.link {
  fill: none;
  stroke: #ddd;
  stroke-opacity: 0.8;
  stroke-width: 1.5px;
}
<style>`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3')
)});
  return main;
}
