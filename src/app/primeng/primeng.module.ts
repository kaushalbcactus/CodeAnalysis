import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { DataTableModule } from 'primeng/datatable';
import { FieldsetModule } from 'primeng/fieldset';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService, ConfirmationService, DialogService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { MenubarModule, OverlayPanelModule, InputTextareaModule, InputTextModule } from 'primeng/primeng';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MultiSelectModule, } from 'primeng/multiselect';
import { TabMenuModule } from 'primeng/tabmenu';
import { SlideMenuModule } from 'primeng/slidemenu';
import { SplitButtonModule } from 'primeng/splitbutton';
import { StepsModule } from 'primeng/steps';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { SidebarModule } from 'primeng/sidebar';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { FullCalendarModule } from 'primeng/fullcalendar';
import {AutoCompleteModule} from 'primeng/autocomplete';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DropdownModule,
    TableModule
  ],
  exports: [TableModule,
    AccordionModule,
    ToastModule,
    DynamicDialogModule,
    TreeTableModule,
    DataTableModule,
    FieldsetModule,
    DialogModule,
    MenuModule,
    ButtonModule,
    CardModule,
    ProgressBarModule,
    DropdownModule,
    TabViewModule,
    ContextMenuModule,
    CalendarModule,
    CheckboxModule,
    ConfirmDialogModule,
    RadioButtonModule,
    ContextMenuModule,
    MultiSelectModule,
    TabMenuModule,
    SlideMenuModule,
    SplitButtonModule,
    StepsModule,
    CheckboxModule,
    ConfirmDialogModule,
    FileUploadModule,
    FullCalendarModule,
    SidebarModule,
    MenubarModule,
    OverlayPanelModule,
    InputTextareaModule,
    InputTextModule,
    AutoCompleteModule
  ],
  providers: [ConfirmationService, DialogService, MessageService]
})
export class PrimengModule { }
