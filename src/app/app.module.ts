import { BrowserModule, Title } from '@angular/platform-browser';
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from './Services/data.service';
import { TimelineHistoryComponent } from './timeline/timeline-history/timeline-history.component';
import { MessageService } from 'primeng/api';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { PrimengModule } from './primeng/primeng.module';
import { FileUploadProgressDialogComponent } from './shared/file-upload-progress-dialog/file-upload-progress-dialog.component';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    PrimengModule,
    ToastModule
  ],
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  entryComponents: [FileUploadProgressDialogComponent, ConfirmationDialogComponent],
  providers: [DataService, TimelineHistoryComponent, DatePipe, MessageService, Title],
  bootstrap: [AppComponent]
})
export class AppModule { }
