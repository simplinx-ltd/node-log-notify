import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { NgChartjsModule } from 'ng-chartjs';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HeaderComponent } from './components/common/header/header.component';
import { FooterComponent } from './components/common/footer/footer.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotificationComponent } from './components/notification/notification.component';
import { NotificationDetailComponent } from './components/notification/notification-detail/notification-detail.component';
import { ResourceComponent } from './components/resource/resource.component';
import { ResourceDetailComponent } from './components/resource/resource-detail/resource-detail.component';
import { HttpAuthTokenInterceptor } from './http-auth.interceptor';
import { ConfigComponent } from './components/config/config.component';
import { ProcessListComponent } from './components/config/process-list/process-list.component';

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		HeaderComponent,
		FooterComponent,
		LayoutComponent,
		DashboardComponent,
		NotificationComponent,
		NotificationDetailComponent,
		ResourceComponent,
		ResourceDetailComponent,
		ConfigComponent,
		ProcessListComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		ReactiveFormsModule,
		NgChartjsModule.registerPlugin([]),
		FormsModule
	],
	providers: [{
		provide: HTTP_INTERCEPTORS,
		useClass: HttpAuthTokenInterceptor,
		multi: true
	}],
	bootstrap: [AppComponent]
})
export class AppModule { }
