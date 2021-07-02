import { action, observable } from 'mobx';

import { message } from "antd"

class editorStore {
	@observable graph = null // 画布
	@observable currentType = null // 当前选中目标的类型 node edge
	@observable currentId = null // 当前选中ID
	@observable edit = false // 编辑状态
	@observable fontSize = 14 // 供修改的文字大小
	@observable defaultFontSize = 14 // 默认文字大小

	// 初始数据
	@observable treeData = {
		nodes: [{
			id: "node1",
			label: "node1",
		},
		{
			id: 'node2',
			label: "node2",
			},
		{
				id: 'node3',
				label: "node3",
			},
			{
				id: 'node4',
				label: "node4",
			}],
		edges: [
			{
				source: 'node1',
				target: 'node2'
			}, {
				source: 'node2',
				target: 'node3'
			}, {
				source: 'node3',
				target: 'node4'
			},{
				source: 'node4',
				target: 'node2'
			}
		],
		combos:[]
	}

	@action setTreeData = (data) => {
        this.treeData = data
    }

    @action setCurrentLayout = (direction) => {
        // 切换方向 粗略。。 不同类型不同样式布局 有空再整
        const layout = {
            type: 'mindmap',
            direction: direction,
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
        }
        this.graph.changeLayout(layout)
        this.graph.paint()
        this.graph.fitView()
    }

	@action changeColor = (nodeId, value) => {
		console.log(nodeId, value)
		const item = this.graph.findById(nodeId)
		
        if (nodeId) {
			this.graph.update(item._cfg.id, {
				labelCfg: {
                    style: {
						fill: value,
                    }
				},
				style: {
					fill: 'white',
					stroke: value
				}
			}, true)
            this.graph.setItemState(item, "selected", false)
			this.graph.setItemState(item, "unselected", true)
            this.graph.paint()
        }
	}

    @action setEditorGraph = (graph) => {
        this.graph = graph
    };

    @action setData = (data) => {
        this.data = data
    }

    @action addItem = (target) => {
        // 添加节点
        let id = null
        if (target.children && target.children.length > 0) {
            const tId = target.children[target.children.length - 1].id
            const cIds = tId.split("-")
            cIds[cIds.length - 1] = `${~~cIds[cIds.length - 1] + 1}`
            id = cIds.join("-")
        } else {
            // 子节点为空时 添加子节点
            id = target.id + '-' + 1
        }

        return {
            id: `${id}`,
            parent: `${target.id}`,
            label: "node",
            labelCfg: {
                style: {
                    fontSize: this.defaultFontSize
                }
            },
            style: {
                radius: 6,
            },
            // linkPoints: {
            //     top: true,
            //     bottom: true,
            //     left: true,
            //     right: true,
            //     size: 5,
            //     fill: '#fff',
            // },
            anchorPoints: [[0.5, 0], [0.5, 1], [0, 0.5], [1, 0.5]],
            children: []
        }
    }

    @action addChildItem = () => {
        if (!this.edit) {
            message.warning("Primero cambie el modo de edición")
            return
        }
        if (!this.currentId) {
            message.warning("Seleccione primero el nodo de destino")
            return
        }
        const target = this.graph.findDataById(this.currentId)
        // 添加子节点
        const data = this.addItem(target)
        this.graph.addChild(data, this.currentId)
        this.setTreeData(this.graph.findDataById("1"))
        this.graph.paint()
        this.graph.fitView()
    }

    @action addPeerItem = () => {
        if (!this.edit) {
            message.warning("Primero cambie el modo de edición")
            return
        }
        if (!this.currentId) {
            message.warning("Seleccione primero el nodo de destino")
            return
        }
        const target = this.graph.findDataById(this.currentId)
        // 获取父节点 添加子节点
        const parent = this.graph.findDataById(target.parent)
        if (!target.parent) {
            message.warning("El nodo raíz no puede agregar elementos del mismo nivel")
            return
        }
        const data = this.addItem(parent)
        this.graph.addChild(data, target.parent)
        this.setTreeData(this.graph.findDataById("1"))
        this.graph.paint()
        this.graph.fitView()
    }    
}

export default new editorStore();
