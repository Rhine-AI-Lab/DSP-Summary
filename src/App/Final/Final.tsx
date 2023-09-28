import React, {useEffect} from 'react'
import Style from './Final.module.scss'
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'
import {Graph, Item, Tooltip, TreeGraph} from "@antv/g6";
import {NodeConfig} from "@antv/g6-core/lib/types";
import {Autocomplete, Chip, TextField} from "@mui/material";

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
                        if (model.type === 'dataset') {
                            outDiv.innerHTML = `<b style="font-weight: 600; font-size: 17px">${model.name}</b>`
                                + `<br/>来源组织: ${model.orgName}`
                                + `<br/>地区: ${model.region}`
                                + `<br/>行业: ${model.domain}`
                                + `<br/>公开条件: ${model.openType}`
                                + `<br/>公开形式: ${model.openResType}`
                                + `<br/><br/>国家主题分类: ${model.couThemeCls}`
                                + `<br/>部门主题分类: ${model.deptThemeCls}`
                                + `<br/>数据标签: ${model.dataLabel}`
                                + `<br/><br/>创建时间: ${new Date(model.createDate).toLocaleString()}`
                                + `<br/>公开时间: ${new Date(model.openDate).toLocaleString()}`
                                + `<br/>更新时间: ${new Date(model.updateDate).toLocaleString()}`
                                + `<br/>更新频率: ${model.openRate}`
                        } else if (model.type === 'provider') {
                            let description = model.description
                            if (description.length > 300) {
                                description = description.substring(0, 300) + '...'
                            }
                            if (model.link !== 'none' && description.indexOf('网址') === -1) {
                                description += '网址：' + model.link + '<br/>' + description
                            }
                            outDiv.innerHTML = `<b style="font-weight: 600; font-size: 17px">${model.name}</b><br/><div style="display: inline-block; max-width: 280px; overflow: hidden">${description}</div>`;
                        } else if (model.type === 'category' || model.type === 'domain') {
                            outDiv.innerHTML = `<b style="font-weight: 600; font-size: 17px">${model.name}</b><br/>子节点量: ${model.cn}`;
                        } else {
                            outDiv.innerHTML = `${model.id}`
                        }
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

            let middleCfg = {
                style: {
                    fontSize: 13,
                    fill: '#3f4a5e',
                    fontWeight: 400,
                },
            }
            let largeCfg = {
                style: {
                    fontSize: 17,
                    fill: '#2a313d',
                    fontWeight: 600,
                },
            }

            for(let node of data['nodes']) {
                node.labelCfg = middleCfg
                if(node.type === 'root') {
                    node.label = node.name
                    node.labelCfg = largeCfg
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
                        node.fy = height / 2
                    } else if (node.name === '地区') {
                        node.fx = width / 6 * 5
                        node.fy = height / 4
                    }
                } else if(node.type === 'dataset') {
                    node.style = {
                        'fill': colors[0],
                        'stroke': strokes[0],
                    }
                    node.size = 10
                    console.log(node)
                } else if(node.type === 'provider') {
                    node.style = {
                        'fill': colors[1],
                        'stroke': strokes[1],
                    }
                    node.size = 20
                } else if(node.type === 'region') {
                    node.label = node.name
                    node.style = {
                        'fill': colors[3],
                        'stroke': strokes[3],
                    }
                    if (node.name === '中国') {
                        node.fx = width / 6 * 4
                        node.fy = height / 4
                        node.labelCfg = largeCfg
                        node.size = 65
                    } else {
                        node.size = 40
                    }
                } else if(node.type === 'domain') {
                    node.label = node.name
                    node.style = {
                        'fill': colors[6],
                        'stroke': strokes[6],
                    }
                    node.size = 40
                } else if(node.type === 'category') {
                    node.label = node.name
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

    const top100Films = [
        { title: '地域: 上海市', type: 'REGI0N' },
        { title: '地域: 杨浦区', type: 'REGI0N' },
        { title: '地域: 闵行区', type: 'REGI0N' },
        { title: '领域: 公共安全', type: 'DOMAIN' },
        { title: '领域: 经济建设', type: 'DOMAIN' },
        { title: '领域: 教育科技', type: 'DOMAIN' },
        { title: '平台: 公共数据开放平台', type: 'CATEGORY' },
        { title: '平台: 行业数据交易所', type: 'CATEGORY' },
    ]

  return (
    <div className={Style.Final}>
      <div className={Style.holder}>
          <div className={Style.container} ref={containerRef}></div>
      </div>
        <div className={Style.filter}>
            <Autocomplete
                multiple
                id="filter-input"
                sx={{minWidth: 280}}
                options={top100Films}
                getOptionLabel={(option) => option.title}
                defaultValue={[]}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            variant="outlined"
                            label={option.title}
                            size="small"
                            {...getTagProps({ index })}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="filled"
                        label="Filter"
                        placeholder="添加过滤条件..."
                    />
                )}
            />
        </div>
    </div>
  )
}



export default Final


