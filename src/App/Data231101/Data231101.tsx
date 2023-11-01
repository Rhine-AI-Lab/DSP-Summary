import React, {useEffect} from 'react'
import Style from './Data231101.module.scss'
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'
import {Graph, Item, Tooltip, TreeGraph} from "@antv/g6";
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


function Data231101(props: any) {
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
            "/data/data231101.json"
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
                        if (e.item.getType() === 'node') {
                            if (model.type === 'company') {
                                outDiv.innerHTML = `<b style="font-weight: 600; font-size: 17px">${model.id}</b>`
                                if (model.create_date && model.create_date.length > 0) {
                                    outDiv.innerHTML += `<br/>成立日期: ${model.create_date}`
                                }
                                if (model.company_id && model.company_id.length > 0) {
                                    outDiv.innerHTML += `<br/>ID: ${model.company_id}`
                                }
                            } else if (model.type === 'product') {
                                outDiv.innerHTML = `<b style="font-weight: 600; font-size: 15px">${model.id}</b>`
                                if (model.business && model.business.length > 0) {
                                    outDiv.innerHTML += `<br/>业务: ${model.business}`
                                }
                                if (model.intoduction && model.intoduction.length > 0) {
                                    outDiv.innerHTML += `<br/>简介: ${model.intoduction}`
                                }
                            } else {
                                outDiv.innerHTML = `${model.id}`
                            }
                        } else {
                            const source = e.item.getSource();
                            const target = e.item.getTarget();
                            outDiv.innerHTML = `From：${source.getModel().id}<br/>To：${target.getModel().id}`;
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
                    size: 55,
                },
            });

            let middleCfg = {
                style: {
                    fontSize: 6,
                    fill: '#3f4a5e',
                    fontWeight: 400,
                },
            }
            let largeCfg = {
                style: {
                    fontSize: 7,
                    fill: '#2a313d',
                    fontWeight: 600,
                },
            }

            for(let node of data['nodes']) {
                node.labelCfg = middleCfg
                if (node.id.length > 4) {
                    node.label = node.id.slice(0, 4) + '...'
                } else {
                    node.label = node.id
                }
                if(node.type === 'company') {
                    node.style = {
                        'fill': colors[1],
                        'stroke': strokes[1],
                    }
                    node.size = 30
                } else if(node.type === 'product') {
                    node.style = {
                        'fill': colors[0],
                        'stroke': strokes[0],
                    }
                    node.size = 32
                } else {
                    node.style = {
                        'fill': colors[4],
                        'stroke': strokes[4],
                    }
                    node.size = 36
                }

            }

            for(let edge of data['edges']) {
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

    // const top100Films = [
    //     { title: '地域: 上海市', type: 'REGI0N' },
    //     { title: '地域: 杨浦区', type: 'REGI0N' },
    //     { title: '地域: 闵行区', type: 'REGI0N' },
    //     { title: '领域: 公共安全', type: 'DOMAIN' },
    //     { title: '领域: 经济建设', type: 'DOMAIN' },
    //     { title: '领域: 教育科技', type: 'DOMAIN' },
    //     { title: '平台: 公共数据开放平台', type: 'CATEGORY' },
    //     { title: '平台: 行业数据交易所', type: 'CATEGORY' },
    // ]

  return (
    <div className={Style.Final}>
      <div className={Style.holder}>
          <div className={Style.container} ref={containerRef}></div>
      </div>
        <div className={Style.filter} style={{display: 'none'}}>
            {/*<Autocomplete*/}
            {/*    multiple*/}
            {/*    id="filter-input"*/}
            {/*    sx={{minWidth: 280}}*/}
            {/*    options={top100Films}*/}
            {/*    getOptionLabel={(option) => option.title}*/}
            {/*    defaultValue={[]}*/}
            {/*    renderTags={(value, getTagProps) =>*/}
            {/*        value.map((option, index) => (*/}
            {/*            <Chip*/}
            {/*                variant="outlined"*/}
            {/*                label={option.title}*/}
            {/*                size="small"*/}
            {/*                {...getTagProps({ index })}*/}
            {/*            />*/}
            {/*        ))*/}
            {/*    }*/}
            {/*    renderInput={(params) => (*/}
            {/*        <TextField*/}
            {/*            {...params}*/}
            {/*            variant="filled"*/}
            {/*            label="Filter"*/}
            {/*            placeholder="添加过滤条件..."*/}
            {/*        />*/}
            {/*    )}*/}
            {/*/>*/}
        </div>
    </div>
  )
}



export default Data231101


