import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';

import { INotification } from '../notification.component';

@Component({
	selector: 'app-notification-detail',
	templateUrl: './notification-detail.component.html',
	styleUrls: ['./notification-detail.component.css']
})

export class NotificationDetailComponent implements OnInit {
	dataLoaded: Promise<boolean>;
	notificationData: INotification;

	constructor(
		private route: ActivatedRoute,
		private notificationService: NotificationService,
		private router: Router
	) { }

	ngOnInit() {
		this.getNotificationDetails();
	}

	getIdParam(): Promise<number> {
		return new Promise(resolve => {
			this.route.params.subscribe(param => {
				resolve(param.id);
			});
		});
	}

	async getNotificationDetails(): Promise<any> {
		const notificationId = await this.getIdParam();
		this.notificationService.getNotificationById(notificationId)
			.subscribe((data: INotification) => {
				if (!data) {
					return this.router.navigate(['notification']);
				}
				this.notificationData = data;
				this.dataLoaded =  Promise.resolve(true);
			});
	}
}