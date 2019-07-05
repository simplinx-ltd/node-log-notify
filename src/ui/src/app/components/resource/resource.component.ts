import { Component, NgZone } from "@angular/core";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import { ResourceService } from 'src/app/services/resource.service';
import * as bytes from 'bytes';
import { TitleService } from 'src/app/services/title.service';

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
	filterDate: any;

	constructor(private zone: NgZone, private resourceService: ResourceService, private titleService: TitleService) { }

	ngOnInit() {
		this.titleService.setTitle('Node Log Notify - Resources');
		this.filterDate = new Date().toISOString().slice(0, 10);
	}

	ngAfterViewInit() {
		this.initChart();
	}

	onChange(event) {
		this.filterDate = event.target.value;
		this.initChart();
	}

	async getAllResources(): Promise<void> {
		this.cpuData = await this.getCPUResources();
		this.memoryData = await this.getMemoryResources();
	}

	getCPUResources(): Promise<IResourceData[]> {
		return new Promise((resolve, reject) => {
			this.resourceService.getCPUFilterByDate(this.filterDate).subscribe((CPUData: Array<IResourceData>) => {
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
			this.resourceService.getMemoryFilterByDate(this.filterDate).subscribe((memoryData: Array<IResourceData>) => {
				this.memoryData = memoryData.map(item => {
					item.value = bytes(item.value);
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
			this.memoryChart = await this.generateChart('memoryChartDiv', this.memoryData, 'date', 'value', 'MB', { valueAxis: false });
			//cpuChart
			this.cpuChart = await this.generateChart('cpuChartDiv', this.cpuData, 'date', 'value', '%', { valueAxis: true, minimum: 0, maximum: 100 });
		});
	}

	async generateChart(
		chartDivID: string,
		chartData: IResourceData[],
		dateFieldName: string = "timestamp",
		valueFieldName: string = "value",
		valueLabel: string,
		valueOptions: IGenerateChartValueConfig): Promise<am4charts.XYChart> {
		let chart = am4core.create(chartDivID, am4charts.XYChart);

		chart.paddingRight = 20;
		chart.colors.step = 2;

		chart.data = chartData;

		let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
		dateAxis.renderer.grid.template.location = 0;

		let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.tooltip.disabled = true;
		valueAxis.renderer.minWidth = 35;

		if (valueOptions.valueAxis) {
			valueAxis.min = valueOptions.minimum;
			valueAxis.max = valueOptions.maximum;
		}

		valueAxis.renderer.labels.template.adapter.add("text", (label, target, key) => {
			return label + ' ' + valueLabel;
		});

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
	value: number | string,
	date?: Date
};

interface IGenerateChartValueConfig {
	valueAxis: boolean;
	minimum?: number;
	maximum?: number;
}