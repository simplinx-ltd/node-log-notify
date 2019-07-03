import { Injectable } from '@angular/core';
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor,
	HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable()
export class HttpAuthTokenInterceptor implements HttpInterceptor {
	constructor(private router: Router) { }

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(req).pipe(
			tap((event: any) => {
				if (event.status == 401 && event.statusText == 'Unauthorized') {
					this.clearTokenAndRedirectToAuth();
				}
			}, (error: any) => {
				if (error instanceof HttpErrorResponse) {
					if (error.status == 401 && error.statusText == 'Unauthorized') {
						this.clearTokenAndRedirectToAuth();
					}
				}
			})
		);
	}

	clearTokenAndRedirectToAuth(): void {
		localStorage.removeItem('auth');
		localStorage.removeItem('token');
		this.router.navigate(['login']);
	}
}