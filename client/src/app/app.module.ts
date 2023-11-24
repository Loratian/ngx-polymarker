import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgxPolymarkerComponent, NgxPolymarkerService } from 'projects/ngx-polymarker/dist/ngx-polymarker';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxPolymarkerComponent
  ],
  providers: [NgxPolymarkerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
