import 'antd/es/menu/style/css'

import { Input } from "antd"
import React from 'react'
import { useStores } from "../../../utils/mobx";

const NodeContextMenu = ({ x = -300, y = 0, nodeId }) => {
	const { editorStore } = useStores()
	const { changeColor } = editorStore
	
	return (
		<div style={{position: 'relative', top: '-85%', left: '90%'}}>
		<Input
                type={"color"}
				onChange={(e) => changeColor(nodeId, e.target.value)}
				style={{ width: '5%' }}
			/>
			</div>
	)
}

export default NodeContextMenu