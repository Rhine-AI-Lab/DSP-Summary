import React, {useEffect} from 'react'
import Style from './Show.module.scss'
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'
import {Graph, Item, Tooltip, TreeGraph} from "@antv/g6";
import {NodeConfig} from "@antv/g6-core/lib/types";

let SHOW_COMPONENT_EFFECT_TIMES = 0


function Show(props: any) {
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

            fetch(
                "/data/providers.json"
            ).then((res) => res.json()).then((data_providers) => {
                let container = containerRef.current
                if (graphRef.current || !container) return

                const width = container.scrollWidth
                const height = container.scrollHeight || 800

                let providers: any = {
                    id: '数据服务商',
                    direction: 'left',
                    level: 0,
                    children: []
                }
                for (const group of data_providers) {
                    let node: any = {
                        id: group.category,
                        level: 1,
                        collapsed: true,
                        children: []
                    }
                    if (node.id === '数据研究院' || node.id === '国家级数据交易所') {
                        node.collapsed = false
                    }
                    for (const p of group.providers) {
                        node.children.push({
                            id: p.name,
                            description: p.description,
                            level: 3,
                            link: p.link,
                        })
                    }
                    providers.children.push(node)
                }

                let data: any = {
                    id: '数据集',
                    level: 0,
                    children: []
                }
                for (const domain of data_source.domains) {
                    let node = {
                        id: domain,
                        level: 1,
                        collapsed: true,
                        children: [],
                    }
                    if (domain === '教育科技' || domain === '经济建设') {
                        node.collapsed = false
                    }
                    data.children.push(node)
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
                        // if (line.datasetName.length > 18) continue
                        if (i++ % 50 !== 0) continue
                        addedList.push(line.datasetName)
                        // console.log(line)
                        node.children.push({
                            id: line.datasetName,
                            level: 2,
                            style: {
                                type: 'modelRect'
                            },
                            message: {
                                orgName: line.orgName,
                                region: line.region,
                                couThemeCls: line.couThemeCls,
                                dataDomain: line.dataDomain,
                                dataLabel: line.dataLabel,
                                deptThemeCls: line.deptThemeCls,
                                openResType: line.openResType,
                            }
                        })
                    }
                }
                // console.log(data)


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
                            if (model.level <= 0) {
                                outDiv.innerHTML = `${model.id}`;
                            }else if (model.level === 1) {
                                outDiv.innerHTML = `${model.id}<br/>子节点量: ${model.children.length}`;
                            }else if (model.level === 2) {
                                outDiv.innerHTML = `${model.id}<br/>数据来源组织: ${model.message.orgName}<br/>地区: ${model.message.region}<br/>行业: ${model.message.dataDomain}<br/>数据标签: ${model.message.dataLabel}`;
                            }else if (model.level === 3) {
                                let description = model.description
                                if (description.length > 20) {
                                    description = description.substring(0, 20) + '...'
                                }
                                if (model.link !== 'none' && description.indexOf('网址') === -1) {
                                    description += `<br/>网址: ${model.link}`
                                }
                                outDiv.innerHTML = `${model.id}<br/>${description}`;
                            }
                        } else {
                            const source = e.item.getSource();
                            const target = e.item.getTarget();
                            outDiv.innerHTML = `From：${source.getModel().id}<br/>To：${target.getModel().id}`;
                        }
                        return outDiv;
                    },
                });

                let graph: Graph
                if (props.tree) {
                    graph = new TreeGraph({
                        container: container,
                        width: width,
                        height: height,
                        plugins: [tooltip],
                        modes: {
                            default: [
                                {
                                    type: 'collapse-expand',
                                    onChange: function onChange(item, collapsed) {
                                        if (!item) return
                                        const data = item.get('model');
                                        data.collapsed = collapsed;
                                        return true;
                                    },
                                },
                                'drag-canvas',
                                'zoom-canvas',
                                'activate-relations',
                            ],
                        },
                        defaultNode: {
                            size: 26,
                            anchorPoints: [
                                [0, 0.5],
                                [1, 0.5],
                            ],
                        },
                        defaultEdge: {
                            type: 'cubic-horizontal',
                        },
                        layout: {
                            type: 'mindmap',
                            direction: 'H',
                            getHeight: () => {
                                return 16;
                            },
                            getWidth: () => {
                                return 16;
                            },
                            getVGap: () => {
                                return 10;
                            },
                            getHGap: () => {
                                return 100;
                            },
                            getSide: (d: any) => {
                                if (d.id === '数据服务商') {
                                    return 'left';
                                }
                                return 'right';
                            },
                        },
                    });
                    let centerX = 0;
                    graph.node(function (node: any) {
                        if (node.id === 'Modeling Methods') {
                            centerX = node.x;
                        }

                        return {
                            label: node.id,
                            labelCfg: {
                                position:
                                    node.children && node.children.length > 0
                                        ? 'right'
                                        : node.x > centerX
                                            ? 'right'
                                            : 'left',
                                offset: 5,
                            },
                        };
                    });
                } else {
                    graph = new TreeGraph({
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
                                'activate-relations',
                            ],
                        },
                        defaultNode: {
                            size: [30, 30],
                            /* style for the keyShape */
                            style: {
                                lineWidth: 2,
                                fill: '#DEE9FF',
                                stroke: '#5B8FF9',
                            },
                        },
                        defaultEdge: {
                            /* style for the keyShape */
                            style: {
                                stroke: '#aaa',
                                lineAppendWidth: 2,
                                opacity: 0.3,
                            },
                        },
                        /* styles for different states, there are built-in styles for states: active, inactive, selected, highlight, disable */
                        nodeStateStyles: {
                            active: {
                                opacity: 1,
                            },
                            inactive: {
                                opacity: 0.2,
                            },
                        },
                        edgeStateStyles: {
                            active: {
                                stroke: '#999',
                            },
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
                }

                graph.data({
                    id: '数据 & 数商',
                    level: -1,
                    children: [data, providers]
                });
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


