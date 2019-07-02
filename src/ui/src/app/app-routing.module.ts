import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';

import {AuthGuard} from './auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: '',
		component: LayoutComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: 'dashboard',
				component: DashboardComponent
			}
		]
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
