import 'antd/es/menu/style/css'

import { Dropdown, Input, Menu, Popover, message } from "antd"

import React from 'react'
import classNames from "classnames"
import styles from "./index.module.less"
import { useStores } from "../../../utils/mobx";

const { SubMenu } = Menu

const NodeContextMenu = ({ x = -300, y = 0, nodeId = 0 }) => {
	const { editorStore } = useStores()
    const {
		changeColor
	} = editorStore

	const handleChangeColor = (value) => {
		
		changeColor(1, value)
	}
	
	return (
		<div>
		<Input
                type={"color"}
				onChange={(e) => handleChangeColor(e.target.value)}
				//className={styles.colorInput}
				style={{width: '5%'}}
            />
			</div>
	)
}

export default NodeContextMenu