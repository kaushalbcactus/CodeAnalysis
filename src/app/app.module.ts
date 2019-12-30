import { BrowserModule , Title } from '@angular/platform-browser';
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { Http, HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// FIle upload
import { FileUploadModule  } from 'ng2-file-upload';
import { DataService } from './Services/data.service';
import { TimelineHistoryComponent } from './timeline/timeline-history/timeline-history.component';
import { MessageService } from 'primeng/api';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { PrimengModule } from './primeng/primeng.module';


@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FileUploadModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    HttpModule,
    CommonModule,
    NgbModule,
    PrimengModule
  ],
  declarations: [
    AppComponent,
    PageNotFoundComponent,
  ],
  providers: [DataService, TimelineHistoryComponent, DatePipe, MessageService, Title],
  bootstrap: [AppComponent]
})
export class AppModule { }
