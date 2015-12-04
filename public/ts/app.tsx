///<reference path="_references.ts"/>
"use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from "jquery";
import * as Components from "./components";
import * as api from "./api";

@Components.renderIn("app-container")
class AppComponent extends React.Component<any, {version: string}> {
	api = new api.BossTalkApi();
	
	constructor(props?: any, context?: any) {
		super(props, context);
		this.state = {
			version: "?"
		};
		
		this.api.version(ver => this.setState(ver));
	}
	
	render() {
		const row = Components.Row;
		return (
			<Components.Row>
				Hello, Boss! (version {this.state.version})
			</Components.Row>
		);
	}
}