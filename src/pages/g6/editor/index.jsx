/* eslint-disable */

import React, { useEffect, useRef, useState } from "react"

import G6 from "../register"
import GraphBar from "../graphbar"
import NodeContextMenu from "./contextMenu"
import Toolbar from "../toolbar"
import classNames from "classnames"
import { cloneDeep } from "lodash"
import insertCss from 'insert-css';
import { message } from "antd"
import styles from "./index.module.less"
import { useStores } from "../../../utils/mobx";

insertCss(`
  #contextMenu {
    position: absolute;
    list-style-type: none;
    padding: 10px 8px;
    left: -150px;
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid #e2e2e2;
    border-radius: 4px;
    font-size: 12px;
    color: #545454;
  }
  #contextMenu li {
    cursor: pointer;
	list-style-type:none;
    list-style: none;
    margin-left: 0px;
  }
  #contextMenu li:hover {
    color: #aaa;
  }
`);

const Editor = () => {
    const inputEditRef = useRef()
	const graphRef = useRef(null)	

    const { editorStore } = useStores()
    const {
        setEditorGraph,
        setCurrentType,
        treeData,
        setData,
        setCurrentId,
        currentId,
        fontSize,
        addChildItem,
		setTreeData,
		changeLabel,
		changeColor,
		editEdge
    } = editorStore

	const collapseIcon = (x, y, r) => {
		return [
			['M', x - r, y],
			['a', r, r, 0, 1, 0, r * 2, 0],
			['a', r, r, 0, 1, 0, -r * 2, 0],
			['M', x - r + 4, y],
			['L', x - r + 2 * r - 4, y],
		];
};
const expandIcon = (x, y, r) => {
  return [
    ['M', x - r, y],
    ['a', r, r, 0, 1, 0, r * 2, 0],
    ['a', r, r, 0, 1, 0, -r * 2, 0],
    ['M', x - r + 4, y],
    ['L', x - r + 2 * r - 4, y],
    ['M', x - r + r, y - r + 4],
    ['L', x, y + r - 4],
  ];
};

G6.registerCombo(
	'cCircle',
	{
	  drawShape: function draw(cfg, group) {
		const self = this;
		// Get the shape style, where the style.r corresponds to the R in the Illustration of Built-in Rect Combo
		const style = self.getShapeStyle(cfg);
		// Add a circle shape as keyShape which is the same as the extended 'circle' type Combo
		const circle = group.addShape('circle', {
		  attrs: {
			...style,
			x: 0,
			y: 0,
			r: style.r,
		  },
		  draggable: true,
		  name: 'combo-keyShape',
		});
		// Add the marker on the bottom
		const marker = group.addShape('marker', {
		  attrs: {
			...style,
			fill: '#fff',
			opacity: 1,
			x: 0,
			y: style.r,
			r: 10,
			symbol: collapseIcon,
		  },
		  draggable: true,
		  name: 'combo-marker-shape',
		});
  
		return circle;
	  },
	  // Define the updating logic for the marker
	  afterUpdate: function afterUpdate(cfg, combo) {
		const self = this;
		// Get the shape style, where the style.r corresponds to the R in the Illustration of Built-in Rect Combo
		const style = self.getShapeStyle(cfg);
		const group = combo.get('group');
		// Find the marker shape in the graphics group of the Combo
		const marker = group.find((ele) => ele.get('name') === 'combo-marker-shape');
		// Update the marker shape
		marker.attr({
		  x: 0,
		  y: style.r,
		  // The property 'collapsed' in the combo data represents the collapsing state of the Combo
		  // Update the symbol according to 'collapsed'
		  symbol: cfg.collapsed ? expandIcon : collapseIcon,
		});
	  },
	},
	'circle',
  );

    const [graph, setGraph] = useState(graphRef.current) // 设置画布
    const [editFlag, setEditFlag] = useState(false)
	const [editValue, setEditValue] = useState("")
	const [showNodeContextMenu, setShowNodeContextMenu] = useState(false)
  	const [nodeContextMenuX, setNodeContextMenuX] = useState(0)
	const [nodeContextMenuY, setNodeContextMenuY] = useState(0)
	const [selectedNodeId, setSelectedNodeId] = useState('')

	const contextMenu = new G6.Menu({
		getContent(evt) {
			setSelectedNodeId(evt.item._cfg.id)
		  let header;
		  if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
			header = 'Canvas ContextMenu';
		  } else if (evt.item) {
			const itemType = evt.item.getType();
			header = `${itemType.toUpperCase()} ContextMenu`;
		  }
		  return `
		  <h3>${header}</h3>
		  <ul>
			<li id='edit-label' styles={{cursor: 'pointer'}}>Edit Color</li>
		  </ul>`;
		},
		handleMenuClick: (target, item) => {
			switch (target.id) {
				case 'edit-label': {
					setShowNodeContextMenu(true)
					break;
				}
				case 'edit-color': {
					editEdge('1')
					//changeColor(item._cfg.id)
					break;
				}
				default: {
					break;
				}
			}
		},
		offsetX: nodeContextMenuX,
		offsetY: nodeContextMenuY,
		itemTypes: ['node', 'edge', 'canvas'],
	});
	
	const toolbar = new G6.ToolBar({});

	const minimap = new G6.Minimap({
		size: [300, 300],
	  });

    const setGraphObj = () => {
        const graph = new G6.Graph({
            container: 'container',
            width: 1200,
			height: 600,
			plugins: [contextMenu, toolbar, minimap],
			//groupByTypes: false,
			fitView: true,
			enabledStack: true,
			defaultCombo: {
				type: 'cCircle',
				labelCfg: {
				refY: 2,
				},
			},
			comboStateStyles: {
				dragenter: {
				lineWidth: 4,
				stroke: '#FE9797',
				},
			},
			modes: {
				default: ['drag-combo', 'drag-node', 'drag-canvas', 'click-select', {
					type: 'create-edge',
					key: 'shift', 
				  }],
			  },
            defaultNode: {
                type: "rect",
                size: [80, 30]
            },
			defaultEdge: {
				type: 'line-dash',
				style: {
				  lineWidth: 2,
				  stroke: '#bae7ff',
				},
			  },
            nodeStateStyles: {
                selected: {
                    stroke: "blue"
                }
			},
			 layout: {
				type: 'mds',
				linkDistance: 100,
			},
		});

		graph.on('aftercreateedge', (e) => {
			graph.save().edges;
		  });
		
		graph.on('combo:click', (e) => {
			if (e.target.get('name') === 'combo-marker-shape') {
			  // graph.collapseExpandCombo(e.item.getModel().id);
			  graph.collapseExpandCombo(e.item);
			  if (graph.get('layout')) graph.layout();
			  else graph.refreshPositions();
			}
		  });
		  
		  graph.on('combo:dragend', (e) => {
			graph.getCombos().forEach((combo) => {
			  graph.setItemState(combo, 'dragenter', false);
			});
		  });
		  graph.on('node:dragend', (e) => {
			graph.getCombos().forEach((combo) => {
			  graph.setItemState(combo, 'dragenter', false);
			});
		  });
		  
		  graph.on('combo:dragenter', (e) => {
			graph.setItemState(e.item, 'dragenter', true);
		  });
		  graph.on('combo:dragleave', (e) => {
			graph.setItemState(e.item, 'dragenter', false);
		  });
		  
		  graph.on('combo:mouseenter', (evt) => {
			const { item } = evt;
			graph.setItemState(item, 'active', true);
		  });
		  
		  graph.on('combo:mouseleave', (evt) => {
			const { item } = evt;
			graph.setItemState(item, 'active', false);
		  });

        graph.on("node:click", (evt) => {
			const { item } = evt
			
			const { states } = item._cfg
                if (states.includes("selected")) {
                    graph.setItemState(item, "selected", true)
                    graph.setItemState(item, "unselected", false)
                    setCurrentId(null)
                    setCurrentType(null)
				} else {
					const model = item.getModel()
                    graph.setItemState(item, "selected", false)
                    graph.setItemState(item, "unselected", true)
                    setCurrentId(model.id)
                    setCurrentType("node")
				}				
		})
		
		graph.on('edge:click', (evt) => {
			const { item } = evt
			const { states } = item._cfg
			const model = item.getModel()
			console.log(item)
			graph.update(item, {
				style: {
					stroke: 'red'
				},
			}, true)

			graph.update(item, model)
            graph.paint()
			/*if (states.includes("active")) {
				console.log('selected')
				graph.setItemState(item, "selected", true)
				graph.setItemState(item, "unselected", false)
			} else {
				graph.setItemState(item, "selected", false)
				graph.setItemState(item, "unselected", true)
			}*/		
			})

        graph.on("node:drag", (evt) => {
            const { item, clientX, clientY } = evt
            const point = graph.getPointByClient(clientX, clientY)
            const model = item.getModel()
            item.toFront()
            item.updatePosition(point)

            if (model.id !== "1") {
				let source = item.getNeighbors("source")
				
                source = source[0]
				const targetEdges = source.getEdges()
				console.log(targetEdges)
				let tartgetEdge = targetEdges.filter(i => {
					if (i.getModel()) {
						
					const m = i.getModel()
					if (m.target === model.id) {
						return i
					}
					}
                })
                tartgetEdge = tartgetEdge[0]
                const tM = tartgetEdge.getModel()
                const tEndPoint = tM.endPoint
                const sNode = graph.findById(tM.source)
                const sLinkPoint = sNode.getLinkPoint(tEndPoint)
				const sAnchorIndex = sLinkPoint.anchorIndex
				console.log(tartgetEdge)
                graph.update(tartgetEdge, {
					sourceAnchor: sAnchorIndex,
                }, true)
            }
            graph.update(item, model)
            graph.paint()
		})

		
		graph.on('node:contextmenu', evt => {
			console.log(evt)
			const { item } = evt
			const model = item.getModel()
			const { x, y } = model
			const point = graph.getCanvasByPoint(x, y)
			setCurrentId(model.id)
			setNodeContextMenuX(point.x)
			setNodeContextMenuY(point.y)
		})

		graph.on('node:mouseenter', (e) => {
			graph.setItemState(e.item, 'active', true);
		  });
		
		graph.on('node:mouseleave', (e) => {
			setShowNodeContextMenu(false)
			graph.setItemState(e.item, 'active', false);
		})
		
		graph.on('edge:mouseenter', (e) => {
			graph.setItemState(e.item, 'active', true);
		  });
		
		graph.on('edge:mouseleave', (e) => {
			setShowNodeContextMenu(false)
			graph.setItemState(e.item, 'active', false);
		  })

        graphRef.current = graph
        setGraph(graphRef.current)
        setEditorGraph(graphRef.current)
    }

    useEffect(() => {
        setGraphObj() // 初始化画布
    }, [])

    useEffect(() => {
        if (graph && treeData) {
            renderGraph() // 渲染画布
        }
    }, [treeData, graph])

    const renderGraph = () => {
        graph.clear(); // 清除画布
        graph.data(treeData); // 传递数据
        graph.render(); // 渲染画布
        graph.fitView(); // 适应视图
    }

    const initEdit = (target, type) => {
        const edit = inputEditRef.current
        const canvasXY = graphRef.current.getCanvasByPoint(target.x, target.y)
        setEditValue(() => "")
        edit.value = ""
        if (type === "node") {
            edit.style.left =
                `${canvasXY.x - (target.size[0] / 2) + 1}px`
            edit.style.top =
                `${canvasXY.y - (target.size[1] / 2) + 1}px`
            edit.style.width = `${target.size[0] - 2}px`
            edit.style.height = `${target.size[1] - 2}px`
            edit.style.fontSize = `${fontSize}px`
            edit.style.borderRadius = `6px`
            edit.style.background = `#FFF`
        }
        edit.focus()
    }

    useEffect(() => {
        // 当编辑文本的内容改变时  更新数据的label
        // 根据文本的字数 修改节点的宽度
        if (!editFlag && currentId) {
            const item = graph.findById(currentId)
            const model = item.getModel()
            const fontSize = model.labelCfg.style.fontSize
            if (editValue) {
                graph.updateItem(item, {
                    label: editValue,
                    size: [ (editValue.length + 2) * fontSize ,model.size[1]]
                }, true)
                setData(treeData)
            }
        }
    }, [editFlag, currentId, editValue])

    document.onkeydown = (e) => {
        // 键盘按下操作
        e.preventDefault()
        const { keyCode } = e
        if (keyCode === 9 && editorStore.currentId) {
            // tab键 添加子节点
            addChildItem()
        }
        if (keyCode === 13 && editorStore.currentId) {
            // 回车时 找到目标节点 显示文本编辑框
            const model = graph.findDataById(editorStore.currentId)
            textShow()
            setCurrentId(model.id)
            setCurrentType("node")
            initEdit(model, "node")
        }

        if (keyCode === 8 && editorStore.currentId) {
            // 按下Backspace按钮时删除节点
            if (editorStore.currentId === "1") {
                message.warning("Root node cannot be deleted")
                return
            }
            graph.removeChild(editorStore.currentId)
            graph.paint()
            setTreeData(graph.findDataById("1"))
        }
    }

    return (
        <div className={styles.editorContainer}>
                <div className={styles.editBox} id={"container"} >
					{ showNodeContextMenu && <NodeContextMenu x={nodeContextMenuX} y={nodeContextMenuY} nodeId={selectedNodeId} /> }
                </div>
        </div>

    )
}

export default Editor
