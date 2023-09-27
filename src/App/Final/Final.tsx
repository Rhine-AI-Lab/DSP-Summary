import React, {useEffect} from 'react'
import Style from './Final.module.scss'
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'
import {Graph, Item, Tooltip, TreeGraph} from "@antv/g6";
import {NodeConfig} from "@antv/g6-core/lib/types";

let SHOW_COMPONENT_EFFECT_TIMES = 0

const colors = [
    '#c5d3f0',
    '#c5f0de',
    '#C2C8D5',
    '#FBE5A2',
    '#F6C3B7',
    '#B6E3F5',
    '#D3C6EA',
    '#FFD8B8',
    '#AAD8D8',
    '#FFD6E7',
];
const strokes = [
    '#5B8FF9',
    '#5AD8A6',
    '#5D7092',
    '#F6BD16',
    '#E8684A',
    '#6DC8EC',
    '#9270CA',
    '#FF9D4D',
    '#269A99',
    '#FF99C3',
];


function Final(props: any) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const graphRef = React.useRef<Graph>();

    useEffect(() => {

        SHOW_COMPONENT_EFFECT_TIMES++
        if (process.env.NODE_ENV === 'development') {
            if (SHOW_COMPONENT_EFFECT_TIMES % 2 === 1) return;
        }

        let container = containerRef.current
        if (graphRef.current || !container) return

        function refreshDragedNodePosition(e: any) {
            const model = e.item.get('model');
            model.fx = e.x;
            model.fy = e.y;
        }

        fetch(
            "/data/all.json"
        ).then((res) => res.json()).then(data => {

            const tooltip = new Tooltip({
                offsetX: 10,
                offsetY: 10,
                fixToNode: [1, 0.5],
                // the types of items that allow the tooltip show up
                // 允许出现 tooltip 的 item 类型
                itemTypes: ['node', 'edge'],
                // custom the tooltip's content
                // 自定义 tooltip 内容
                getContent: (e: any) => {
                    const outDiv = document.createElement('div');
                    outDiv.style.width = 'fit-content';
                    outDiv.style.height = 'fit-content';
                    outDiv.style.lineHeight = '2';
                    const model = e.item.getModel();
                    if (e.item.getType() === 'node') {
                        outDiv.innerHTML = `${model.id}`;
                    } else {
                        const source = e.item.getSource();
                        const target = e.item.getTarget();
                        outDiv.innerHTML = `From：${source.getModel().id}<br/>To：${target.getModel().id}`;
                    }
                    return outDiv;
                },
            });

            let container = containerRef.current
            if (graphRef.current || !container) return

            const width = container.scrollWidth
            const height = container.scrollHeight || 800

            let graph = new Graph({
                container: container,
                width: width,
                height: height,
                plugins: [tooltip],
                modes: {
                    default: [
                        'drag-canvas',
                        'zoom-canvas',
                        'activate-relations',
                    ],
                },
                layout: {
                    type: 'force',
                },
                defaultNode: {
                    size: 15,
                },
            });

            for(let node of data['nodes']) {
                if(node.type === 'root') {
                    node.style = {
                        'fill': colors[4],
                        'stroke': strokes[4],
                    }
                    node.size = 70
                    if (node.name === '数据集') {
                        node.fx = width / 6
                        node.fy = height / 2
                    } else if (node.name === '数据服务商') {
                        node.fx = width / 6 * 5
                        node.fy = height / 4
                    } else if (node.name === '地区') {
                        node.fx = width / 6 * 5
                        node.fy = height / 4 * 3
                    }
                } else if(node.type === 'dataset') {
                    node.style = {
                        'fill': colors[0],
                        'stroke': strokes[0],
                    }
                    node.size = 10
                } else if(node.type === 'provider') {
                    node.style = {
                        'fill': colors[1],
                        'stroke': strokes[1],
                    }
                    node.size = 20
                } else if(node.type === 'region') {
                    node.style = {
                        'fill': colors[3],
                        'stroke': strokes[3],
                    }
                    if (node.name === '中国') {
                        node.size = 60
                    } else {
                        node.size = 40
                    }
                } else if(node.type === 'domain') {
                    node.style = {
                        'fill': colors[6],
                        'stroke': strokes[6],
                    }
                    node.size = 40
                } else if(node.type === 'category') {
                    node.style = {
                        'fill': colors[8],
                        'stroke': strokes[8],
                    }
                    node.size = 40
                }
            }
            for(let edge of data['edges']) {
                if (edge.type === 'region-provider') {
                    edge.value = 5
                }
            }

            graph.data({
                nodes: data.nodes,
                edges: data.edges.map(function (edge: any, i: any) {
                    edge.id = 'edge' + i;
                    return Object.assign({}, edge);
                }),
            });
            graph.render();

            graph.on('node:dragstart', function (e) {
                graph.layout();
                refreshDragedNodePosition(e);
            });
            graph.on('node:drag', function (e) {
                const forceLayout = graph.get('layoutController').layoutMethods[0];
                forceLayout.execute();
                refreshDragedNodePosition(e);
            });
            graph.on('node:dragend', function (e: any) {
                e.item.get('model').fx = null;
                e.item.get('model').fy = null;
            });

            if (typeof window !== 'undefined') {
                window.onresize = () => {
                    if (!graph || graph.get('destroyed')) return;
                    if (!container || !container.scrollWidth || !container.scrollHeight) return;
                    graph.changeSize(container.scrollWidth, container.scrollHeight);
                };
            }

        })

    }, []);

  return (
    <div className={Style.Final}>
      <div className={Style.holder}>
          <div className={Style.container} ref={containerRef}></div>
      </div>
    </div>
  )
}



export default Final


