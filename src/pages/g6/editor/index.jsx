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
		changeLabel
    } = editorStore

    const [graph, setGraph] = useState(graphRef.current) // 设置画布
    const [editFlag, setEditFlag] = useState(false)
	const [editValue, setEditValue] = useState("")
	const [showNodeContextMenu, setShowNodeContextMenu] = useState(false)
  	const [nodeContextMenuX, setNodeContextMenuX] = useState(0)
  	const [nodeContextMenuY, setNodeContextMenuY] = useState(0)

    const textShow = () => {
        // 编辑文本是否显示
        setEditFlag(!editFlag)
    }

    const textChange = (event) => {
        // 设置改变的文本内容
		const val = event.target.value
		console.log(val)
        setEditValue(val)
    }

	const contextMenu = new G6.Menu({
		getContent(evt) {
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
			<li id='edit'>Edit Label</li>
			<li>Edit Stroke Color</li>
			<li>Edit Label COlor</li>
		  </ul>`;
		},
		handleMenuClick: (target, item) => {
			console.log(target.id);
			changeLabel(item._cfg.id)
			/*graph.update(item.cfg.id,{
				label: 'ramiro'
            }, true)*/
		},
		offsetX: 16 + 10,
		offsetY: 0,
		itemTypes: ['node', 'edge', 'canvas'],
	});
	
	const toolbar = new G6.ToolBar({
		getContent: () => {
		  return `
			<ul>
			  <li code='add'>Add Node</li>
			  <li code='undo'>Undo</li>
			</ul>
		  `
		},
		handleClick: (code, graph) => {
			console.log(code, graph)
		  if (code === 'add') {
			graph.addItem('node', {
			  id: 'ramiro',
			  label: 'node2',
			  x: 300,
			  y: 150
			})
		  } else if (code === 'undo') {
			toolbar.undo()
		  }
		}
	  });

    const setGraphObj = () => {
        const graph = new G6.TreeGraph({
            container: 'container',
            width: 1200,
			height: 600,
			//plugins: [contextMenu, toolbar],
            modes: {
                default: [
                    {
                        type: 'collapse-expand',
                        onChange: function onChange(item, collapsed) {
                            // const data = item.get('model').data;
                            // data.collapsed = collapsed;
                            const model = item.getModel()
                            model.collapsed = collapsed;
                            return true;
                        },
                    },
                    'drag-canvas',
                    'zoom-canvas',
                ],
                edit: []
            },
            defaultNode: {
                type: "rect",
                size: [80, 30]
            },
            defaultEdge: {
                type: "line",
                style: {
                    // endArrow: true,
                }
            },
            nodeStateStyles: {
                selected: {
                    stroke: "blue"
                }
            },
            // 布局
            layout: {
                type: 'mindmap',
                direction: 'LR',
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
                getSide: () => {
                    return 'right';
                },
            },
        });

        graph.on("node:click", (evt) => {
            const { item } = evt
            const model = item.getModel()
            const mode = graph.getCurrentMode()
            if (mode === "edit") {
                // 编辑模式 显示红框
                // 清除其他节点的选中状态
                if (editorStore.currentId && editorStore.currentId !== model.id) {
                    const oldItem = graph.findById(editorStore.currentId)
                    oldItem && graph.clearItemStates(oldItem, ["selected"])
                }
                const { states } = item._cfg
                if (states.includes("selected")) {
                    graph.setItemState(item, "selected", false)
                    graph.setItemState(item, "unselected", true)
                    setCurrentId(null)
                    setCurrentType(null)
                } else {
                    graph.setItemState(item, "selected", true)
                    graph.setItemState(item, "unselected", false)
                    setCurrentId(model.id)
                    setCurrentType("node")
                }
            }
        })

        graph.on("node:dblclick", (evt) => {
            const { item } = evt
            const model = item.getModel()
            const mode = graph.getCurrentMode()
            if (mode === "edit") {
                // 显示input编辑框  设置目标节点id 类型 初始化input样式
                textShow()
                setCurrentId(model.id)
                setCurrentType("node")
                initEdit(model, "node")
            }
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
                // 需要调整连接点的边
                let tartgetEdge = targetEdges.filter(i => {
                    const m = i.getModel()
                    if (m.target === model.id) {
                        return i
                    }
                })
                tartgetEdge = tartgetEdge[0]
                // 调整边的model
                const tM = tartgetEdge.getModel()
                // 调整边连接的终点坐标
                const tEndPoint = tM.endPoint
                // 调整边源节点  tM.sourceNode存在 但是获取不到 玄学
                const sNode = graph.findById(tM.source)
                // 获取源节点离终点坐标 最近的锚点
                const sLinkPoint = sNode.getLinkPoint(tEndPoint)
                // 获取最近的锚点的索引
                const sAnchorIndex = sLinkPoint.anchorIndex
                // 更新目标边的源锚点索引
                graph.update(tartgetEdge, {
                    sourceAnchor: sAnchorIndex
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
			setShowNodeContextMenu(true)
		})
		
		graph.on('node:mouseleave', () => {
			setShowNodeContextMenu(false)
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
        graph.data(cloneDeep(treeData)); // 传递数据
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
            <Toolbar />
            <div className={styles.canvasBox}>
                <GraphBar />
                <div className={styles.editBox} id={"container"} >
                    <input
                        type="text"
                        ref={inputEditRef}
                        className={classNames(
                            styles.inputEdit,
                            !editFlag && styles.inputEditHidden
                        )}
                        onChange={textChange}
                        onBlur={textShow}
					/>
					{ showNodeContextMenu && <NodeContextMenu x={nodeContextMenuX} y={nodeContextMenuY} /> }
                </div>
            </div>

        </div>

    )
}

export default Editor
