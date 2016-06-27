import * as React from "react";
import * as ReactDom from "react-dom";
import * as $ from "jquery";

export class Row extends React.Component<any, any> {
	render() {
		return (
			<div className="row">
				{this.props.children}
				</div>
		);
	}
}

export class Col extends React.Component<{ sm?: number; md?: number; lg?: number, children?: any }, any> {
	render() {
		return (
			<div className={this.getClass() }>
				{this.props.children}
				</div>
		);
	}

	getClass(): string {
		const sm = this.props.sm;
		const md = this.props.md;
		const lg = this.props.lg;

		const buffer: string[] = [];
		if (sm != null) {
			buffer.push(`col-sm-${sm}`);
		}

		if (md != null) {
			buffer.push(`col-md-${md}`);
		}

		if (lg != null) {
			buffer.push(`col-lg-${lg}`);
		}

		return buffer.join(" ");
	}
}