import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { TitleService } from 'src/app/services/title.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

	loginForm: FormGroup;
	loginErr: String;

	constructor(private formBuilder: FormBuilder, private userService: UserService, private router: Router, private titleService: TitleService) { }

	ngOnInit() {
		this.titleService.setTitle('Node Log Notify - Login');
		this.checkIsLoggedIn();
		this.initForm();
	}

	initForm(): void {
		this.loginForm = this.formBuilder.group({
			usernameCtrl: ['', Validators.required],
			passwordCtrl: ['', Validators.required],
			rememberMeCtrl: [false]
		});
	}

	onSubmit(): void {
		this.loginErr = null;
		const loginData: ILoginData = {
			username: this.loginForm.value['usernameCtrl'],
			password: this.loginForm.value['passwordCtrl'],
			rememberMe: this.loginForm.value['rememberMeCtrl']
		};
		this.userService.login(loginData).subscribe((res: ILoginResponse) => {
			this.userService.setToken(res.token);
			this.router.navigate(['']);
		}, err => {
			this.loginErr = err.statusText;
		});
	}

	checkIsLoggedIn(): void {
		if (this.userService.isLoggedIn()) this.router.navigate(['']);
	}

}

interface ILoginData {
	username: string,
	password: string,
	rememberMe: boolean
}

interface ILoginResponse {
	token: string
}