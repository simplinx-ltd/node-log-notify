import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	dd: any = null;

	constructor(private loginService: LoginService) { }


	ngOnInit() {
		this.test();
	}


	test():void {
		this.loginService.getSomeData().subscribe(x => {
			console.log('#-------------------#');
			console.log(x);
			console.log('#-------------------#');
		})
	}

}
