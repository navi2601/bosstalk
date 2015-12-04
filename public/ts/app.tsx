///<reference path="_references.ts"/>
"use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from "jquery";
import * as Components from "./components";

@Components.renderIn("app-container")
class AppComponent extends React.Component<any, any> {
	render() {
		const row = Components.Row;
		return (
			<Components.Row>
				Hello, Boss!
			</Components.Row>
		);
	}
}