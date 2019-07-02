import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

	lineChartData: Array<Object> = [
		{
			label: 'CPU',
			fill: false,
			lineTension: 0.1,
			backgroundColor: 'rgba(75,192,192,0.4)',
			borderColor: 'rgba(75,192,192,1)',
			borderCapStyle: 'butt',
			borderDash: [],
			borderDashOffset: 0.0,
			borderJoinStyle: 'miter',
			pointBorderColor: 'rgba(75,192,192,1)',
			pointBackgroundColor: '#fff',
			pointBorderWidth: 1,
			pointHoverRadius: 5,
			pointHoverBackgroundColor: 'rgba(75,192,192,1)',
			pointHoverBorderColor: 'rgba(220,220,220,1)',
			pointHoverBorderWidth: 2,
			pointRadius: 1,
			pointHitRadius: 10,
			data: [65, 59, 80, 81, 56, 55, 40],
		},
		{
			label: 'MEMORY',
			fill: false,
			lineTension: 0.1,
			backgroundColor: 'rgba(75,192,192,0.4)',
			borderColor: 'rgba(75,192,192,1)',
			borderCapStyle: 'butt',
			borderDash: [],
			borderDashOffset: 0.0,
			borderJoinStyle: 'miter',
			pointBorderColor: 'rgba(75,192,192,1)',
			pointBackgroundColor: '#fff',
			pointBorderWidth: 1,
			pointHoverRadius: 5,
			pointHoverBackgroundColor: 'rgba(75,192,192,1)',
			pointHoverBorderColor: 'rgba(220,220,220,1)',
			pointHoverBorderWidth: 2,
			pointRadius: 1,
			pointHitRadius: 10,
			data: [15, 29, 30, 21, 16, 15, 40],
		}
	];
	lineChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June'];
	lineChartOptions: any = {
		responsive: true
	};
	lineChartLegend = true;
	lineChartType = 'line';
	inlinePlugin: any;
	textPlugin: any;

	constructor() { }

	ngOnInit() {
		// inline plugin
		this.textPlugin = [{
			id: 'textPlugin',
			beforeDraw(chart: any): any {
				const width = chart.chart.width;
				const height = chart.chart.height;
				const ctx = chart.chart.ctx;
				ctx.restore();
				const fontSize = (height / 114).toFixed(2);
				ctx.font = `${fontSize}em sans-serif`;
				ctx.textBaseline = 'middle';
				const text = 'CPU & MEMORY';
				const textX = Math.round((width - ctx.measureText(text).width) / 2);
				const textY = height / 2;
				ctx.fillText(text, textX, textY);
				ctx.save();
			}
		}];

		this.inlinePlugin = this.textPlugin;

	}

}
