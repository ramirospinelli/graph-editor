import { Dropdown, Input, Menu, Popover, message } from "antd"
import React, { useRef, useState } from "react"

import classNames from "classnames"
import styles from "./index.module.less"
import {useStores} from "../../../utils/mobx";

const PopContent = ({content}) => {
    return (
        <div className={styles.popContent}>{content}</div>
    )
}

const Toolbar = () => {
	const fontColorRef = useRef()
	const strokeColorRef = useRef()
	const fontColorIconRef = useRef()
	const strokeColorIconRef = useRef()
    const { editorStore } = useStores()
    const { changeLabelCfg, changeLabel, changeStrokeCfg, setCurrentLayout, changeColor } = editorStore

    const [layoutVisible, setLayoutVisible] = useState(false)
    const [menuVisible, setMenuVisible] = useState(false)
	const [currentFontColor, setCurrentFontColor] = useState("#000")
	const [currentStrokeColor, setCurrentStrokeColor] = useState("#000")
    const [currentFontSize, setCurrentFontSize] = useState(14)
    const [inputValue, setInputValue] = useState(null)

    const fontColorChange = (e) => {
        const value = e.target.value
        fontColorIconRef.current.style.color = value
        setCurrentFontColor(value)
		//changeLabelCfg(value, "fill")
		
		changeColor('1', value)
	}
	
	const strokeColorChange = (e) => {
        const value = e.target.value
        strokeColorIconRef.current.style.color = value
        setCurrentStrokeColor(value)
        //changeStrokeCfg(value, "stroke")
		changeLabel(1)
    }

    const showFontColor = () => {
		fontColorRef.current.input.click()
	}
	
	const showStrokeColor = () => {
		strokeColorRef.current.input.click()
    }

    const setFontSize = (fontSize, type) => {
        const numReg = /^\d*$/
        if (type === "custom") {
            if (numReg.test(fontSize)) {
                setInputValue(fontSize)
                setCurrentFontSize(fontSize)
                changeLabelCfg(fontSize, "fontSize")
            }
        } else {
            setCurrentFontSize(fontSize)
            changeLabelCfg(fontSize, "fontSize")
            changeMenuStatus(false)
        }
    }

    const changeMenuStatus = (flag) => {
        if (!editorStore.currentId) {
            message.warning("Primero seleccione el node destino")
            return
        }
        setMenuVisible(flag)
    }

    const fontSizeKeyUp = (e) => {
        const { keyCode } = e
        const value = e.target.value
        setInputValue(value)
        setCurrentFontSize(value)
        if (keyCode === 13) {
            changeLabelCfg(value, "fontSize")
            changeMenuStatus(false)
        }
    }

    const fontSizeBlur = (e) => {
        const value = e.target.value
        changeLabelCfg(value, "fontSize")
        changeMenuStatus(false)
    }

    const changeLayoutMenuStatus = (flag) => {
        setLayoutVisible(flag)
    }

    const setLayout = (value) => {
        setCurrentLayout(value)
        changeLayoutMenuStatus(false)
    }

    const menuList = [
        {label: 12, value: 0},
        {label: 14, value: 1},
        {label: 16, value: 2},
        {label: 18, value: 3},
        {label: 20, value: 4},
        {label: 22, value: 5},
        {label: 24, value: 6},
    ]

    const menu = (
        <Menu>
            <Menu.Item key={"customSize"}>
                <Input
                    onKeyUp={fontSizeKeyUp}
                    value={inputValue}
                    placeholder={"Personalizar"}
                    onBlur={fontSizeBlur}
                    onChange={(e) => setFontSize(e.target.value, "custom")}
                />
            </Menu.Item>
            {menuList.map(item => (
                <Menu.Item key={item.label}>
                    <span
                        className={styles.fontSizeMenuItem}
                        onClick={() => setFontSize(item.label)}
                    >
                        {item.label}
                    </span>
                </Menu.Item>
            ))}
        </Menu>
    );

    const layoutMenuList = [
        {label: "TB", value: 0},
        {label: "BT", value: 1},
        {label: "LR", value: 2},
        {label: "RL", value: 3},
        {label: "H", value: 4},
        {label: "V", value: 5},
    ]

    const layoutMenu = (
        <Menu>
            {layoutMenuList.map(item => (
                <Menu.Item key={item.label}>
                    <span
                        className={styles.fontSizeMenuItem}
                        onClick={() => setLayout(item.label)}
                    >
                        {item.label}
                    </span>
                </Menu.Item>
            ))}
        </Menu>
    );

    return (
        <div className={styles.toolbar}>
            <Input
                type={"color"}
                onChange={fontColorChange}
                className={styles.colorInput}
                ref={fontColorRef}
            />
            <Popover content={<PopContent content={"color de fuente"}/>}>
                <i
                    ref={fontColorIconRef}
                    className={classNames("iconfont amin-color", styles.colorIcon)}
                    onClick={showFontColor}
                    style={{color: currentFontColor}}
                />
			</Popover>
			 <Input
                type={"color"}
                onChange={strokeColorChange}
                className={styles.colorInput}
                ref={strokeColorRef}
            />
            <Popover content={<PopContent content={"color de borde"}/>}>
                <i
                    ref={strokeColorIconRef}
                    className={classNames("iconfont amin-color", styles.colorIcon)}
                    onClick={showStrokeColor}
                    style={{color: currentStrokeColor}}
                />
            </Popover>
            <div className={styles.fontSizeBox}>
                <Dropdown
                    overlay={menu}
                    trigger={"click"}
                    placement={"topLeft"}
                    visible={menuVisible}
                >
                    <Popover content={<PopContent content={"tamanio de fuente"}/>}>
                        <i
                            className={classNames(
                                "iconfont amin-fonsize ant-dropdown-link",
                                styles.fontSizeIcon
                            )}
                            onClick={() => {
                                changeMenuStatus(true)
                            }}
                        />
                    </Popover>
                </Dropdown>
            </div>

            <div>
                <Dropdown
                    overlay={layoutMenu}
                    trigger={"click"}
                    placement={"topLeft"}
                    visible={layoutVisible}
                >
                    <Popover content={<PopContent content={"Disenio"}/>}>
                        <i
                            className={classNames(
                                "iconfont amin-buju",
                                styles.layoutIcon
                            )}
                            onClick={() => {
                                changeLayoutMenuStatus(true)
                            }}
                        />
                    </Popover>
                </Dropdown>
            </div>
        </div>
    )
}

export default Toolbar
