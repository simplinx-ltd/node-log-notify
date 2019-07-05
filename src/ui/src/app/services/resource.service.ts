import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError, filter } from 'rxjs/operators';

import { UserService } from './user.service';

@Injectable({
	providedIn: 'root'
})

export class ResourceService {

	constructor(private httpClient: HttpClient, private userService: UserService) { }

	getCPUAll(): Observable<Object> {
		return this.httpClient.get('/api/resource-cpu', {
			headers: {
				'x-access-token': this.userService.getToken()
			}
		})
			.pipe(
				map(res => res),
				catchError(err => throwError(err))
			);
	}

	getCPUCount(): Observable<Object> {
		return this.httpClient.get('/api/resource-cpu/count', {
			headers: {
				'x-access-token': this.userService.getToken()
			}
		})
			.pipe(
				map(res => res),
				catchError(err => throwError(err))
			);
	}

	getCPUById(id: number): Observable<Object> {
		return this.httpClient.get('/api/resource-cpu/' + id, {
			headers: {
				'x-access-token': this.userService.getToken()
			}
		})
			.pipe(
				map(res => res),
				catchError(err => throwError(err))
			);
	}

	getMemoryAll(): Observable<Object> {
		return this.httpClient.get('/api/resource-memory', {
			headers: {
				'x-access-token': this.userService.getToken()
			}
		})
			.pipe(
				map(res => res),
				catchError(err => throwError(err))
			);
	}

	getMemoryCount(): Observable<Object> {
		return this.httpClient.get('/api/resource-memory/count', {
			headers: {
				'x-access-token': this.userService.getToken()
			}
		})
			.pipe(
				map(res => res),
				catchError(err => throwError(err))
			);
	}

	getMemoryById(id: number): Observable<Object> {
		return this.httpClient.get('/api/resource-memory/' + id, {
			headers: {
				'x-access-token': this.userService.getToken()
			}
		})
			.pipe(
				map(res => res),
				catchError(err => throwError(err))
			);
	}

	getMemoryFilterByDate(date: Date | string): Observable<Object> {
		return this.httpClient.get('/api/resource-memory?where=' + this.createTimestampQueryString(date), {
			headers: {
				'x-access-token': this.userService.getToken()
			},
		})
			.pipe(
				map(res => res),
				catchError(err => throwError(err))
			);
	}

	getCPUFilterByDate(date: Date | string): Observable<Object> {
		return this.httpClient.get('/api/resource-cpu?where=' + this.createTimestampQueryString(date), {
			headers: {
				'x-access-token': this.userService.getToken()
			},
		})
			.pipe(
				map(res => res),
				catchError(err => throwError(err))
			);
	}

	createTimestampQueryString(date: Date | string): String {
		let startDate: Date = new Date(date);
		let endDate: Date = new Date(date);

		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);

		return JSON.stringify({ "timestamp": { "$gte": startDate, "$lte": endDate } });
	}
}
