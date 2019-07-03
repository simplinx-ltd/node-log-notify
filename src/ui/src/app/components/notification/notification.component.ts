import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
	selector: 'app-notification',
	templateUrl: './notification.component.html',
	styleUrls: ['./notification.component.css']
})

export class NotificationComponent implements OnInit {
	notificationData: INotification[] = [];
	nDataLoaded: Promise<boolean>;

	constructor(private notificationService: NotificationService) { }

	ngOnInit() {
		this.getAllNotifications();
	}

	getAllNotifications(): void {
		this.notificationService.getNotificationAll()
			.subscribe((data: INotification[]) => {
				this.notificationData = data;
				this.nDataLoaded = Promise.resolve(true);
			});
	}

}

interface INotification {
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
