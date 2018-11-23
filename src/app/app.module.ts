import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SimpleModule } from 'hxl-preview-ng-lib';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SimpleModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
