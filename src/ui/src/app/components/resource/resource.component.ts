import { Component, NgZone } from "@angular/core";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import { ResourceService } from 'src/app/services/resource.service';
import { resolve } from 'q';

am4core.useTheme(am4themes_animated);

@Component({
	selector: 'app-resource',
	templateUrl: './resource.component.html',
	styleUrls: ['./resource.component.css']
})

export class ResourceComponent {
	private cpuChart: am4charts.XYChart;
	private memoryChart: am4charts.XYChart;
	private cpuData: Array<IResourceData> = null;
	private memoryData: Array<IResourceData> = null;

	constructor(private zone: NgZone, private resourceService: ResourceService) { }

	ngAfterViewInit() {
		this.initChart();
	}

	async getAllResources(): Promise<void> {
		this.cpuData = await this.getCPUResources();
		this.memoryData = await this.getMemoryResources();
	}

	getCPUResources(): Promise<IResourceData[]> {
		return new Promise((resolve, reject) => {
			this.resourceService.getCPUAll().subscribe((CPUData: Array<IResourceData>) => {
				this.cpuData = CPUData.map(item => {
					item.date = new Date(item.timestamp);
					return item;
				});
				resolve(this.cpuData);
			});
		})
	}

	getMemoryResources(): Promise<IResourceData[]> {
		return new Promise((resolve, reject) => {
			this.resourceService.getMemoryAll().subscribe((memoryData: Array<IResourceData>) => {
				this.memoryData = memoryData.map(item => {
					item.date = new Date(item.timestamp);
					return item;
				});
				resolve(memoryData);
			});
		});
	}

	async initChart() {
		//getChartDatas
		await this.getChartData();
		this.zone.runOutsideAngular(async () => {
			// memoryChart
			this.memoryChart = await this.generateChart('memoryChartDiv', this.memoryData, 'date', 'value');
			//cpuChart
			this.cpuChart = await this.generateChart('cpuChartDiv', this.cpuData, 'date', 'value');
		});
	}

	async generateChart(
		chartDivID: string,
		chartData: IResourceData[],
		dateFieldName: string = "timestamp",
		valueFieldName: string = "value"): Promise<am4charts.XYChart> {
		let chart = am4core.create(chartDivID, am4charts.XYChart);

		chart.paddingRight = 20;
		chart.colors.step = 2;

		chart.data = chartData;

		let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
		dateAxis.renderer.grid.template.location = 0;

		let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.tooltip.disabled = true;
		valueAxis.renderer.minWidth = 35;

		let series = chart.series.push(new am4charts.LineSeries());
		series.dataFields.dateX = dateFieldName;
		series.dataFields.valueY = valueFieldName;

		series.tooltipText = "{valueY.value}";
		chart.cursor = new am4charts.XYCursor();

		let scrollbarX = new am4charts.XYChartScrollbar();
		scrollbarX.series.push(series);
		chart.scrollbarX = scrollbarX;
		return chart;
	}

	async getChartData() {
		return await this.getAllResources();
	}

	ngDestroy() {
		this.zone.runOutsideAngular(() => {
			if (this.memoryChart && this.cpuChart) {
				this.memoryChart.dispose();
				this.cpuChart.dispose();
			}
		});
	}
}

interface IResourceData {
	id: number,
	timestamp: string,
	process: string,
	value: number,
	date?: Date
};