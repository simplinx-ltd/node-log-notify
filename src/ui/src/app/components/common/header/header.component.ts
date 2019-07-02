import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

	constructor(private userService: UserService) { }

	ngOnInit() {
		
	}

	onLogout(): void {
		this.userService.logout();
	}

}
