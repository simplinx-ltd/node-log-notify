import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

import { NgChartjsModule } from 'ng-chartjs';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HeaderComponent } from './components/common/header/header.component';
import { FooterComponent } from './components/common/footer/footer.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotificationsComponent } from './components/notifications/notifications.component';

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		HeaderComponent,
		FooterComponent,
		LayoutComponent,
		DashboardComponent,
		NotificationsComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		ReactiveFormsModule,
		NgChartjsModule.registerPlugin([])
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
