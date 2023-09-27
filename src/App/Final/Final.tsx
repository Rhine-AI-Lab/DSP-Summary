import React, {useEffect} from 'react'
import Style from './Final.module.scss'
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'
import {Graph, Item, Tooltip, TreeGraph} from "@antv/g6";
import {NodeConfig} from "@antv/g6-core/lib/types";

let SHOW_COMPONENT_EFFECT_TIMES = 0


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
        ).then((res) => res.json()).then(ds => {

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

            let data = ds

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


