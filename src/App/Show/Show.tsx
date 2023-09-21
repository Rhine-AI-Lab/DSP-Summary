import React, {useEffect} from 'react'
import Style from './Show.module.scss'
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'
import {Graph, Item, TreeGraph} from "@antv/g6";
import {NodeConfig} from "@antv/g6-core/lib/types";

let SHOW_COMPONENT_EFFECT_TIMES = 0

function Show() {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const graphRef = React.useRef<Graph>();

    useEffect(() => {

        SHOW_COMPONENT_EFFECT_TIMES++
        if (process.env.NODE_ENV === 'development') {
            if (SHOW_COMPONENT_EFFECT_TIMES % 2 === 1) return;
        }

        let container = containerRef.current
        if (graphRef.current || !container) return

        fetch(
            "/data/data.json"
        ).then((res) => res.json()).then((data_source) => {
            let container = containerRef.current
            if (graphRef.current || !container) return

            const width = container.scrollWidth
            const height = container.scrollHeight || 800

            let data: any = {
                id: '各行业数据',
                children: []
            }
            for (const domain of data_source.domains) {
                data.children.push({
                    id: domain,
                    children: [],
                })
            }
            function getDomainNode(id: string) {
                for (const node of data.children) {
                    if (node.id === id) {
                        return node
                    }
                }
            }

            let addedList: any[] = []
            let i = 0
            for (const line of data_source.data) {
                let node = getDomainNode(line.dataDomain)
                if (node) {
                    if (addedList.indexOf(line.datasetName) > -1) continue
                    if (line.datasetName.length > 18) continue
                    if (i++ % 60 !== 0) continue
                    addedList.push(line.datasetName)
                    node.children.push({
                        id: line.datasetName,
                    })
                    // console.log('add', line.datasetName)
                }
            }
            console.log(data)

            const graph = new TreeGraph({
                container: container,
                width: width,
                height: height,
                linkCenter: true,
                modes: {
                    default: [
                        {
                            type: 'collapse-expand',
                            onChange: function onChange(item?: Item, collapsed?: boolean) {
                                const data = item?.get('model');
                                data.collapsed = collapsed;
                                return true;
                            },
                        },
                        'drag-canvas',
                        'zoom-canvas',
                    ],
                },
                defaultNode: {
                    size: 30,
                },
                layout: {
                    type: 'dendrogram',
                    direction: 'LR',
                    nodeSep: 500,
                    rankSep: 180,
                    radial: true,
                },
            });

            graph.node(function (node: NodeConfig) {
                return {
                    label: node.id,
                };
            });

            graph.data(data);
            graph.render();
            graph.fitView();

            if (typeof window !== 'undefined') {
                window.onresize = () => {
                    if (!graph || graph.get('destroyed')) return
                    if (!container || !container.scrollWidth || !container.scrollHeight) return
                    graph.changeSize(container.scrollWidth, container.scrollHeight)
                }
            }
        })


    }, []);

  return (
    <div className={Style.Show}>
      <div className={Style.holder}>
          <div className={Style.container} ref={containerRef}></div>
      </div>
    </div>
  )
}

export default Show


