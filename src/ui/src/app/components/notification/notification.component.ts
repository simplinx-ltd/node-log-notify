import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';

import { NotificationService } from 'src/app/services/notification.service';

declare var $;
@Component({
	selector: 'app-notification',
	templateUrl: './notification.component.html',
	styleUrls: ['./notification.component.css']
})

export class NotificationComponent implements OnInit {
	@ViewChild('dataTable', { static: false }) table;

	dataTable: any;

	notificationData: INotification[] = [];
	nDataLoaded: Promise<boolean>;

	constructor(private notificationService: NotificationService, private chRef: ChangeDetectorRef) { }

	async ngOnInit(): Promise<void> {
		await this.getAllNotifications();
	}

	getAllNotifications(): void {
		this.notificationService.getNotificationAll()
			.subscribe((data: INotification[]) => {
				this.notificationData = data;

				this.chRef.detectChanges();

				this.dataTable = $(this.table.nativeElement);
				this.dataTable.dataTable();
				this.nDataLoaded = Promise.resolve(true);
			});
	}

}

export interface INotification {
	id: number,
	createdAt: Date,
	emailFrom: string,
	emailSubject: string,
	emailTo: string,
	includeInDailyReport: boolean,
	maxMessagePerDay: number,
	message: string,
	processName: string,
	status: string
	text2Watch: any,
	type: string,
	updatedAt: Date,
	when2Notify: string
}
