import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableModule } from "primeng/table";
import { TreeTableModule } from "primeng/treetable";
// import { DataTableModule } from 'primeng/datatable';
import { FieldsetModule } from "primeng/fieldset";
import { MenuModule } from "primeng/menu";
import { CardModule } from "primeng/card";
import { AccordionModule } from "primeng/accordion";
import { ToastModule } from "primeng/toast";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { ProgressBarModule } from "primeng/progressbar";
import { DropdownModule } from "primeng/dropdown";
import { TabViewModule } from "primeng/tabview";
import { MenubarModule } from "primeng/menubar";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { InputTextareaModule } from "primeng/inputtextarea";
import { InputTextModule } from "primeng/inputtext";
import { TieredMenuModule } from "primeng/tieredmenu";
import { SelectButtonModule } from "primeng/selectbutton";
import { PanelModule } from "primeng/panel";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { DragDropModule } from "primeng/dragdrop";
import { CalendarModule } from "primeng/calendar";
import { RadioButtonModule } from "primeng/radiobutton";
import { ContextMenuModule } from "primeng/contextmenu";
import { MultiSelectModule } from "primeng/multiselect";
import { TabMenuModule } from "primeng/tabmenu";
import { SlideMenuModule } from "primeng/slidemenu";
import { SplitButtonModule } from "primeng/splitbutton";
import { StepsModule } from "primeng/steps";
import { CheckboxModule } from "primeng/checkbox";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { FileUploadModule } from "primeng/fileupload";
import { SidebarModule } from "primeng/sidebar";
import { DynamicDialogModule, DialogService } from "primeng/dynamicdialog";
import { FullCalendarModule } from "primeng/fullcalendar";
import { ListboxModule } from "primeng/listbox";
import { AutoCompleteModule } from "primeng/autocomplete";
import { TooltipModule } from "primeng/tooltip";
import { InputSwitchModule } from "primeng/inputswitch";
import { SliderModule } from "primeng/slider";
import { RatingModule } from "primeng/rating";
// import {AvatarGroupModule} from 'primeng/avatargroup';
// import { AvatarModule } from "primeng/avatar";

@NgModule({
  declarations: [],
  imports: [CommonModule, DropdownModule, TableModule],
  exports: [
    TableModule,
    AccordionModule,
    ToastModule,
    AutoCompleteModule,
    DynamicDialogModule,
    TreeTableModule,
    SliderModule,
    // DataTableModule,
    FieldsetModule,
    DialogModule,
    PanelModule,
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
    FileUploadModule,
    FullCalendarModule,
    SidebarModule,
    MenubarModule,
    OverlayPanelModule,
    InputTextareaModule,
    InputTextModule,
    ListboxModule,
    AutoCompleteModule,
    TooltipModule,
    TieredMenuModule,
    InputSwitchModule,
    DragDropModule,
    SelectButtonModule,
    RatingModule,
    ScrollPanelModule,
    // AvatarModule
  ],
  providers: [DialogService],
})
export class PrimengModule {}
