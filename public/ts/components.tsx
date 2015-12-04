///<reference path="_references.ts"/>
"use strict";

import * as React from "react";
import * as ReactDom from "react-dom";
import * as $ from "jquery";

export function renderIn(containerId: string): ClassDecorator {
	return <TFunction extends Function>(target: TFunction) => {
		$(() => {
			const container = document.getElementById(containerId);
			if (container != null) {
				const instantiableTarget = target as any as React.ComponentClass<HTMLElement>;
				ReactDom.render(React.createElement(instantiableTarget, {}), container);
			}	
			else {
				console.error("Cannot locate container #" + containerId)
			}
		});
		
		return target;
	}
}

export class Row extends React.Component<any, any> {
	render() {
		return (
			<div className="row">
				{this.props.children}
			</div>
		)
	}
}