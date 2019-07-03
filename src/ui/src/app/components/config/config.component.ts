import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-config',
	templateUrl: './config.component.html',
	styleUrls: ['./config.component.css']
})

export class ConfigComponent implements OnInit {
	downloadData: any;
	jsonData: string = "text/json;charset=utf-8,";
	data: object;

	constructor() { }

	ngOnInit() {

	}

	appendToDownloadData() {
		this.jsonData += encodeURIComponent(JSON.stringify(this.data));
	}

}
