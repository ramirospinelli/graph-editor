import { Redirect, Route, Switch, withRouter } from "react-router-dom"

import Demo from './pages/g6/index'
import Loadable from "./utils/loadable"
import Loading from "./components/loading";
import React from "react"
import { compose } from "redux"

// G6Editor
const G6Editor = Loadable({
    loader: () =>
        import("./pages/g6/editor/index"),
    loading: () => (<Loading />)
})

class RouteList extends React.Component {

    render() {
        return (
            <Switch>
                <Route path="/g6-editor" component={G6Editor} />
				<Redirect to="/g6-editor" />
				<Route path='/g6-editor/demo' component={Demo} />
            </Switch>
        )
    }
}

export default compose(
    withRouter,
)(RouteList)
