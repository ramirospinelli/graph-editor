import React from "react"
import styles from "./index.module.less"
import { Button } from "antd"
import {useStores} from "../../../utils/mobx";

const GraphBar = () => {
    const { editorStore } = useStores()
    const { addPeerItem, addChildItem, changeModeToEdit } = editorStore
    const btns = [
        {
            label: "Edit",
            click: changeModeToEdit,
        },
        {
            label: "Add Perr Item",
            click: addPeerItem,
        },
        {
            label: "Add Child",
            click: addChildItem,
        },
    ]

    return (
        <div className={styles.graphBar}>
            {btns.map((item, index) => (
                <Button
                    key={index}
                    className={styles.btn}
                    onClick={item.click}
                >
                    {item.label}
                </Button>
            ))}
        </div>
    )
}

export default GraphBar
