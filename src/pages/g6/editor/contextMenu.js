import 'antd/es/menu/style/css'

import { Icon, Menu } from 'antd'

import React from 'react'
import { useStores } from "../../../utils/mobx";

const { SubMenu } = Menu

const NodeContextMenu = ({ x = -300, y = 0, nodeId = 0 }) => {
	const { editorStore } = useStores()
    const {
		changeLabel,
		changeLabelCfg,
		changeStrokeCfg
    } = editorStore
	
  return <Menu style={{ width: 256, position: 'absolute', left: x, top: y }} mode="vertical">
	  <Menu.Item key="1" onClick={() => changeLabel('1')}>Option 1</Menu.Item>
	  <Menu.Item key="2" onClick={() => changeLabelCfg('red', 'fill')}>Option 2</Menu.Item>
	  <Menu.Item key="3" onClick={() => changeStrokeCfg('blue', 'fill')}>Option 3</Menu.Item>
  </Menu>
}

export default NodeContextMenu