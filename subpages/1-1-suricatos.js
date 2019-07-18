Array.prototype.firstOrDefault = function (id) {
  for (let i = 0; i < this.length; i++)
    if (this[i].id === id)
      return this[i];
  return null;
}

Array.prototype.indexFirstOrDefault = function (id) {
  for (let i = 0; i < this.length; i++)
    if (this[i].id === id)
      return i;
  return null;
}

function gSheetDoData(json) {
  let graph = convertGraph(makeGraph(json.feed.entry));
  console.log(graph);

  var container = document.getElementById('network');
  var data = {
    nodes: new vis.DataSet(graph.nodes),
    edges: new vis.DataSet(graph.edges)
  };
  var options = {};
  var network = new vis.Network(container, data, options);
}

function makeGraph(data) {

  let nodes = [];
  let edges = [];

  for (let i = 3; i < data.length; i += 3) {
    const source = data[i]["gs$cell"]["$t"].toLowerCase();
    const target = data[i + 1]["gs$cell"]["$t"].toLowerCase();
    const date = data[i + 2]["gs$cell"]["$t"].toLowerCase();

    const dir = '../fotos-suricatos/'

    let s = nodes.firstOrDefault(source);

    if (!s) {
      nodes.push({
        id: source,
        date,
        image: dir + source + '.jpg'
      });
    }
    else if (!s.date) {
      s.date = date;
    }
    else if (date) {
      s.date = s.date > date ? date : s.date;
    }

    let t = nodes.firstOrDefault(target);
    if (!t) {
      nodes.push({
        id: target,
        date: null,
        image: dir + target + '.jpg'
      });
    }

    edges.push({
      source,
      target,
      date
    });
  }

  nodes = nodes.sort((a, b) => {
    return a.id.localeCompare(b.id);
  });

  return { nodes, edges };
}

function convertGraph(graph) {
  let nodes = [];
  let edges = [];

  for (let i = 0; i < graph.nodes.length; i++) {
    nodes.push({
      id: i,
      label: graph.nodes[i].id.replace('.', '\n'),
      color: gSheetGetNodeColor(graph.nodes[i].date),
      image: graph.nodes[i].image,
      shape: 'circularImage'
    });
  }

  for (let i = 0; i < graph.edges.length; i++) {
    const edge = graph.edges[i];
    const isource = graph.nodes.indexFirstOrDefault(edge.source);
    const itarget = graph.nodes.indexFirstOrDefault(edge.target);
    edges.push({
      from: isource,
      to: itarget,
      color: {
        color: gSheetGetNodeColor(graph.edges[i].date)
      }
    });
  }

  return { nodes, edges };
}

function gSheetGetNodeColor(date) {

  if (!date)
    return '#d3d3d3';

  var date1 = new Date(date);
  var date2 = new Date();
  var timeDiff = Math.abs(date2.getTime() - date1.getTime());
  var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (diffDays <= 14)
    return '#09AA51';
  if (diffDays <= 21)
    return '#93E247';
  if (diffDays <= 28)
    return '#FFC239';
  if (diffDays <= 35)
    return '#EA7439';
  return '#ED1E2E';

}