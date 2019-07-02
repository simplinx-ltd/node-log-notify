import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

import { UserService } from './user.service';

@Injectable({
	providedIn: 'root'
})

export class NotificationService {

	constructor(private httpClient: HttpClient, private userService: UserService) { }

	getNotificationAll() {
		return this.httpClient.get('/api/notification', {
			headers: {
				'x-access-token': this.userService.getToken()
			}
		})
			.pipe(
				map(res => res),
				catchError(err => throwError(err))
			);
	}

	getNotificationCount() {
		return this.httpClient.get('/api/notification/count', {
			headers: {
				'x-access-token': this.userService.getToken()
			}
		})
			.pipe(
				map(res => res),
				catchError(err => throwError(err))
			);
	}

	getNotificationById(id: number) {
		return this.httpClient.get('/api/notification/' + id, {
			headers: {
				'x-access-token': this.userService.getToken()
			}
		})
			.pipe(
				map(res => res),
				catchError(err => throwError(err))
			);
	}

}
