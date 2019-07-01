import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class LoginService {

	constructor(private httpClient: HttpClient) { }

	getSomeData() {
		return this.httpClient.post('http://localhost:8085/api/auth/login',
			{ username: 'eren', password: 'qwerty' }
		);
	}
}
