///<reference path="_references.ts" />
import * as $ from "jquery";

export class BossTalkApi {
	version(cb: (versionInfo: {version: string})=>void){
		$.ajax({
			url: "/api/v1/version",
			method: "GET",
			success: data => cb(data),
			error: error => console.error(error)
		});
	}
}