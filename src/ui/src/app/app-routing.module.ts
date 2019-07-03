import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth.guard';

import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ResourceComponent } from './components/resource/resource.component';
import { ResourceDetailComponent } from './components/resource/resource-detail/resource-detail.component';
import { NotificationComponent } from './components/notification/notification.component';
import { NotificationDetailComponent } from './components/notification/notification-detail/notification-detail.component';
import { ConfigComponent } from './components/config/config.component';

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
				path: 'resource',
				component: ResourceComponent
			},
			{
				path: 'resource/:type/:id',
				component: ResourceDetailComponent
			},
			{
				path: 'notification',
				component: NotificationComponent
			},
			{
				path: 'notification/:id',
				component: NotificationDetailComponent
			},
			{
				path: 'config',
				component: ConfigComponent
			},
			{
				path: '**',
				component: ResourceComponent
			}
		]
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
