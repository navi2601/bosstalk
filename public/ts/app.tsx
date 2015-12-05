///<reference path="_references.ts"/>
"use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from "jquery";
import {Row, Col, renderIn} from "./components";
import * as api from "./api";

@renderIn("app-container")
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
		return (
			<Row>
				<Col sm={10} md={6} lg={3}>
					Hello, Boss! (version {this.state.version})
				</Col>
			</Row>
		);
	}
}