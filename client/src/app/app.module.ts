import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgxPolymarkerComponent } from 'projects/ngx-polymarker/projects/ngx-polymarker/src/public-api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxPolymarkerComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
