import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';


@Injectable({
	providedIn: 'root'
})

export class UserService {

	constructor(private http: HttpClient) { }

	isLoggedIn(): boolean {
		if (localStorage.getItem('auth') == '1' && localStorage.getItem('token') !== null) {
			return true;
		}
		return false;
	}

	setToken(token: string): void {
		localStorage.setItem('token', token);
		localStorage.setItem('auth', '1');
	}

	clearToken(): void {
		localStorage.removeItem('token');
		localStorage.removeItem('auth');
	}

	getToken(): string {
		return localStorage.getItem('token');
	}

	login(loginData: ILogin) {
		return this.http.post('/api/auth/login', loginData, {
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.pipe(
				map(res => res),
				catchError(err => throwError(err))
			);
	}

	logout(): void {
		this.clearToken();
	}

}

interface ILogin {
	username: string,
	password: string,
	rememberMe: boolean
}
