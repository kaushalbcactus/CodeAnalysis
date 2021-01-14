import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
  SimpleChanges,
  OnDestroy,
} from "@angular/core";
import {
  MenuItem,
  DynamicDialogConfig,
  DynamicDialogRef,
  DialogService,
  Table,
} from "primeng";
import { DatePipe, CommonModule } from "@angular/common";
import { ConstantsService } from "src/app/Services/constants.service";

import { SPOperationService } from "src/app/Services/spoperation.service";
import { GlobalService } from "src/app/Services/global.service";
import { MyDashboardConstantsService } from "src/app/my-dashboard/services/my-dashboard-constants.service";
import { CommonService } from "src/app/Services/common.service";

import { FileUploadProgressDialogComponent } from "../file-upload-progress-dialog/file-upload-progress-dialog.component";
import { TagDocumentComponent } from "./tag-document/tag-document.component";
import { ViewChild } from "@angular/core";

@Component({
  selector: "app-view-upload-document-dialog",
  templateUrl: "./view-upload-document-dialog.component.html",
  styleUrls: ["./view-upload-document-dialog.component.css"],
  providers: [DialogService],
})
export class ViewUploadDocumentDialogComponent implements OnInit, OnDestroy {
  @ViewChild("dt", { static: false }) dt: Table;
  selectedTab: string;
  data: any;
  status: any;
  selectedTask: any;
  response: any[];
  taskMenu: MenuItem[];
  currentTask: any;
  batchContents: any;
  ProjectInformation: any;
  tempObject: any;
  allDocuments: any;
  ModifiedSelectedTaskName = "";
  DocumentArray: any = [];
  loaderenable: boolean;
  dbcols: { field: string; header: string }[];
  cols: { field: string; header: string }[];
  selectedDocuments: any = [];
  uploadedFiles: any[] = [];
  fileReader = new FileReader();
  prevTask: string;
  enableNotification = false;
  Emailtemplate: any;
  crDocs: any[];
  public queryConfig = {
    data: null,
    url: "",
    type: "",
    listName: "",
  };
  @Input() taskData: any;
  events: any;
  closeCRTaskEnable = false;
  globalService: any;
  constantsService: any;
  clientDocuments: any[];
  create_task_form: any;
  crTasks: any[];
  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private constants: ConstantsService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private spServices: SPOperationService,
    public sharedObject: GlobalService,
    private datePipe: DatePipe,
    public dialogService: DialogService,
    private spOperations: SPOperationService,
    private commonService: CommonService
  ) {}

  items: MenuItem[];
  activeItem: MenuItem;
  async ngOnInit() {
    this.loaderenable = true;
    this.DocumentArray = [];
    this.crTasks = [];
    this.crDocs = [];
    this.data = Object.keys(this.config.data ? this.config.data : this.config).length ? this.config.data : this.taskData;
    this.status = this.data.Status;
    this.enableNotification = this.data.emailNotificationEnable
      ? this.data.emailNotificationEnable
      : false;
    if (this.enableNotification) {
      this.getEmailTemplate();
    }
    this.selectedTask = this.config.data
      ? this.data.task
        ? this.data.task
        : this.data
      : this.taskData;
    const slotPNTask = await this.myDashboardConstantsService.getNextPreviousTask(
      this.selectedTask
    );
    const slotPTasks = slotPNTask.filter(
      (ele) => ele.TaskType === "Previous Task"
    );
    this.selectedTask.PrevTasks = "";
    slotPTasks.forEach((element, i) => {
      this.selectedTask.PrevTasks += element.Title;
      this.selectedTask.PrevTasks += i < slotPTasks.length - 1 ? ";#" : "";
    });
    this.ModifiedSelectedTaskName = this.selectedTask.Title.replace(
      this.selectedTask.ProjectCode,
      ""
    )
      .replace(this.selectedTask.Milestone, "")
      .trim();

    this.selectedTask.Task =
      this.ModifiedSelectedTaskName === "Client Review"
        ? "Client Review"
        : this.selectedTask.Task;

    this.closeCRTaskEnable =
      this.ModifiedSelectedTaskName === "Client Review"
        ? this.data.closeTaskEnable
        : false;

    if (this.selectedTask.PrevTasks) {
      this.items = [
        {
          label: "For " + this.selectedTask.Task,
          icon: "fa fa-tasks",
          command: (e) => this.onChange(e),
        },
        {
          label: "My Drafts",
          icon: "fa fa-envelope-open",
          command: (e) => this.onChange(e),
        },
        {
          label: "Source Docs",
          icon: "fa fa-folder-open",
          command: (e) => this.onChange(e),
        },
        {
          label: "References",
          icon: "fa fa-fw fa-book",
          command: (e) => this.onChange(e),
        },
        {
          label: "Client Comments",
          icon: "fa fa-comments-o",
          command: (e) => this.onChange(e),
        },
        {
          label: "Meeting Notes",
          icon: "fa fa-file-text-o",
          command: (e) => this.onChange(e),
        },
        {
          label: "Emails",
          icon: "fa fa-envelope",
          command: (e) => this.onChange(e),
        },
      ];
      this.activeItem = this.items[1];
      this.prevTask = this.items[0].label;
      this.selectedTab = "My Drafts";
    } else {
      if (this.selectedTask.IsSearchProject) {
        this.items = [
          {
            label: "Source Docs",
            icon: "fa fa-folder-open",
            command: (e) => this.onChange(e),
          },
          {
            label: "References",
            icon: "fa fa-fw fa-book",
            command: (e) => this.onChange(e),
          },
          {
            label: "Client Comments",
            icon: "fa fa-comments-o",
            command: (e) => this.onChange(e),
          },
          {
            label: "Meeting Notes",
            icon: "fa fa-file-text-o",
            command: (e) => this.onChange(e),
          },
          {
            label: "Emails",
            icon: "fa fa-envelope",
            command: (e) => this.onChange(e),
          },
        ];
        this.activeItem = this.items[0];
        this.selectedTab = "Source Docs";
      } else {
        if (this.ModifiedSelectedTaskName === "Client Review") {
          this.items = [
            {
              label: "My Drafts",
              icon: "fa fa-envelope-open",
              command: (e) => this.onChange(e),
            },
          ];
        } else {
          this.items = [
            {
              label: "My Drafts",
              icon: "fa fa-envelope-open",
              command: (e) => this.onChange(e),
            },
            {
              label: "Source Docs",
              icon: "fa fa-folder-open",
              command: (e) => this.onChange(e),
            },
            {
              label: "References",
              icon: "fa fa-fw fa-book",
              command: (e) => this.onChange(e),
            },
            {
              label: "Client Comments",
              icon: "fa fa-comments-o",
              command: (e) => this.onChange(e),
            },
            {
              label: "Meeting Notes",
              icon: "fa fa-file-text-o",
              command: (e) => this.onChange(e),
            },
            {
              label: "Emails",
              icon: "fa fa-envelope",
              command: (e) => this.onChange(e),
            },
          ];
        }
        this.activeItem = this.items[0];
        this.selectedTab = "My Drafts";
      }
    }

    this.dbcols = [
      { field: "Name", header: "Document Name" },
      { field: "taskName", header: "Task Name" },
      { field: "status", header: "Status" },
      { field: "modifiedUserName", header: "Modified By" },
      { field: "ModifiedDateString", header: "Modified Date" },
    ];

    this.getDocuments(this.selectedTask);
    this.loaderenable = true;
  }

  ngOnDestroy() {}

  // *****************************************************************************************************
  //  Switch tab on click
  // *****************************************************************************************************

  async onChange(event) {
    this.loaderenable = true;
    this.selectedDocuments = [];
    this.DocumentArray = [];
    this.selectedTab = event.item.label;
    const header = this.dbcols.slice(0);
    if (this.selectedTab !== "My Drafts") {
      if (this.selectedTab === this.prevTask) {
        header.splice(2, 1);
      } else if (this.selectedTab === "Client Comments") {
      } else {
        header.splice(1, 2);
      }
    } else {
      header.splice(1, 1);
    }
    const docObj = await this.getAllDocuments(this.selectedTab);
    this.loadDraftDocs(docObj.allDocs, docObj.crTasks);

    this.cols = header;
  }

  // ****************************************************************************************************
  //  Get Documents On tab switch
  // ****************************************************************************************************
  async getDocuments(task) {
    const header = this.dbcols.slice(0);
    header.splice(1, 1);
    this.cols = header;

    if (task.Title) {
      if (
        this.sharedObject.DashboardData.ProjectInformation.ProjectCode ===
        task.ProjectCode
      ) {
        this.ProjectInformation = this.sharedObject.DashboardData.ProjectInformation;
      } else {
        await this.getCurrentTaskProjectInformation(task.ProjectCode);
        this.ProjectInformation = this.sharedObject.DashboardData.ProjectInformation;
      }
      const docObj = await this.getAllDocuments(this.selectedTab);
      this.loadDraftDocs(docObj.allDocs, docObj.crTasks);
    }
  }

  // ***************************************************************************************************
  //  Get  current project information
  // ***************************************************************************************************

  async getCurrentTaskProjectInformation(ProjectCode) {
    const project = Object.assign(
      {},
      this.myDashboardConstantsService.mydashboardComponent.projectInfo
    );
    project.filter = project.filter.replace(/{{projectCode}}/gi, ProjectCode);
    this.commonService.SetNewrelic(
      "ViewDocuments",
      "viewUpladDoc",
      "getProjInfobyProjectCode",
      "GET"
    );
    const arrResult = await this.spServices.readItems(
      this.constants.listNames.ProjectInformation.name,
      project
    );
    this.sharedObject.DashboardData.ProjectInformation = arrResult.length
      ? arrResult[0]
      : {};
  }

  async getCRTasks() {
    const schedulesInfo = Object.assign(
      {},
      this.myDashboardConstantsService.mydashboardComponent
        .ClientReviewSchedules
    );
    schedulesInfo.filter = schedulesInfo.filter.replace(
      /{{projectCode}}/gi,
      this.selectedTask.ProjectCode
    );
    this.commonService.SetNewrelic(
      "ViewDocuments",
      "viewUpladDoc",
      "GetCRDocuments",
      "GET"
    );
    const crTasks = await this.spServices.readItems(
      this.constants.listNames.Schedules.name,
      schedulesInfo
    );
    return crTasks.length > 0 ? crTasks : [];
  }

  async getAllDocuments(selectedTab) {
    let documentsUrl = "";
    let completedCRList = [];
    switch (selectedTab) {
      case "Source Docs":
        documentsUrl = "/Source Documents";
        break;
      case "References":
        documentsUrl = "/References";
        break;
      case "Meeting Notes":
        documentsUrl = "/Communications";
        break;
      case "Emails":
        documentsUrl = "/Emails";
        break;
      default:
        documentsUrl = "/Drafts/Internal/" + this.selectedTask.Milestone;
    }
    const folderUrl = this.ProjectInformation.ProjectFolder;
    let completeFolderRelativeUrl = '';
    completedCRList = await this.getCRTasks();
    if (selectedTab === 'Client Comments' && completedCRList.length) {
      this.crTasks = [...completedCRList];
      const dbMilestones = this.ProjectInformation.Milestones ? this.ProjectInformation.Milestones.split(';#') : [];
      const Milestones = completedCRList.filter(c => dbMilestones.includes(c.Milestone)) ?
        completedCRList.filter(c => dbMilestones.includes(c.Milestone)).map(c => c.Milestone) : [];
      this.ProjectInformation.availableMilestones = Milestones;
      if (Milestones) {
        const options = {
          data: null,
          url: '',
          type: '',
          listName: ''
        };
        const batchURL = [];
        Milestones.forEach(element => {
          documentsUrl = '/Drafts/Internal/' + element;
          completeFolderRelativeUrl = folderUrl + documentsUrl;
          const documentGet = Object.assign({}, options);
          documentGet.url = this.spServices.getFilesFromFoldersURL(completeFolderRelativeUrl);
          documentGet.type = 'GET';
          documentGet.listName = element;
          batchURL.push(documentGet);
        });

        const FolderDocuments = await this.spServices.executeBatch(batchURL);
        if (FolderDocuments) {
          this.allDocuments = [].concat(...FolderDocuments.map(c => c.retItems.map(d => ({ ...d, Milestone: c.listName }))));
        }
      }
    } else {
      completeFolderRelativeUrl = folderUrl + documentsUrl;
      this.commonService.SetNewrelic(
        "ViewDocuments",
        "viewUpladDoc",
        "getDocumentsByTabType",
        "GET-BATCH"
      );
      this.response = await this.spServices.readFiles(
        completeFolderRelativeUrl
      );
      this.allDocuments = this.response.length ? this.response : [];
    }
    return {
      allDocs: this.allDocuments,
      crTasks: completedCRList,
    };
  }
  // **************************************************************************************************************************************
  //  Get  draft documents
  // **************************************************************************************************************************************

  async loadDraftDocs(allDocs, completedCRList) {
    this.DocumentArray = [];
    let crDocuments = [];
    this.allDocuments = allDocs;
    if (this.selectedTab === 'My Drafts') {
      this.DocumentArray = this.allDocuments.filter(c => c.ListItemAllFields.TaskName === this.selectedTask.Title);
    } else if (this.selectedTab === 'Client Comments' && completedCRList.length) {
      const validMilestones = this.ProjectInformation.availableMilestones.map(m => ({ label: m, value: m }));
      const CRTaskTitles = completedCRList.map(c => c.Title);
      this.DocumentArray = this.allDocuments.filter(c => CRTaskTitles.includes(c.ListItemAllFields.TaskName));
      const docs = this.DocumentArray.map(d => ({
        ...d,
        Name: d.Name,
        filenamewithoutExt: d.Name.substring(0, d.Name.lastIndexOf(".")),
        extension: d.Name.substring(d.Name.lastIndexOf(".")),
        newFileName: d.Name,
        Milestone: d.Milestone,
        TagMilestones: validMilestones,
        modifiedUserName: d.ModifiedBy.Title ? d.ModifiedBy.Title : "",
        selectedMilestone: d.Milestone,
        oldMilestone: d.Milestone,
        ModifiedDateString: this.datePipe.transform(
          d.TimeLastModified,
          "MMM d, y, h:mm a"
        ),
      }));
      this.clientDocuments = docs.sort((a, b) =>
        new Date(a.ModifiedDateString).getTime() <
        new Date(b.ModifiedDateString).getTime()
          ? 1
          : -1
      );
      const objMilestone = this.commonService.groupBy(docs, "Milestone");
      for (const [key, value] of Object.entries(objMilestone)) {
        const objDocs = {
          data: {
            Name: key,
            filenamewithoutExt: "",
            extension: "",
            newFileName: key,
            modifiedUserName: "",
            ModifiedDateString: "",
            selectedMilestone: key,
            oldMilestone: key,
          },
          children: value,
        };
        crDocuments.push(objDocs);
      }
      const structuredDocs = [];
      for (const milestone of this.ProjectInformation.availableMilestones) {
        const objMil = crDocuments.find((d) => d.data.Name === milestone);
        structuredDocs.push(objMil);
      }
      this.crDocs = [...structuredDocs];
    } else if (this.selectedTab === this.prevTask) {
      const previouTasks =
        this.selectedTask.PrevTasks.indexOf(";#") > -1
          ? this.selectedTask.PrevTasks.split(";#")
          : [this.selectedTask.PrevTasks];
      this.DocumentArray = this.allDocuments.filter(
        (c) => previouTasks.indexOf(c.ListItemAllFields.TaskName) > -1
      );
    } else {
      if (this.allDocuments) {
        this.DocumentArray = this.allDocuments;
      } else {
        this.DocumentArray = [];
      }
    }
    const Ids = this.DocumentArray.map(
      (c) => (c.DocIds = c.ListItemAllFields.EditorId)
    ).filter((el, i, a) => i === a.indexOf(el));
    let users;
    if (Ids.length > 0) {
      users = await this.getUsers(Ids);
    }

    this.loaderenable = false;
    this.DocumentArray.map(
      (c) =>
        (c.taskName =
          c.ListItemAllFields.TaskName != null
            ? c.ListItemAllFields.TaskName
            : "")
    );
    this.DocumentArray.map(
      (c) =>
        (c.modifiedUserName =
          users.find((d) => d.Id === c.ListItemAllFields.EditorId) !== undefined
            ? users.find((d) => d.Id === c.ListItemAllFields.EditorId).Title
            : "")
    );
    this.DocumentArray.map(
      (c) =>
        (c.status =
          c.ListItemAllFields.Status !== null ? c.ListItemAllFields.Status : "")
    );
    this.DocumentArray.map(
      (c) =>
        (c.isFileMarkedAsFinal =
          c.status.split(" ").splice(-1)[0] === "Complete" ? true : false)
    );
    this.DocumentArray.map(
      (c) =>
        (c.ModifiedDateString = this.datePipe.transform(
          c.ListItemAllFields.Modified,
          "MMM d, y, h:mm a"
        ))
    );

    if (this.DocumentArray.length) {
      if (this.selectedTab === this.prevTask) {
        this.DocumentArray = this.DocumentArray.filter(
          (c) => c.isFileMarkedAsFinal === true
        );
      }

      this.DocumentArray = this.DocumentArray.sort((a, b) =>
        new Date(a.ModifiedDateString).getTime() <
        new Date(b.ModifiedDateString).getTime()
          ? 1
          : -1
      );
    }
    this.selectedDocuments = [];
  }

  // **************************************************************************************************************************************
  //  fetch  user data for Document
  // **************************************************************************************************************************************

  async getUsers(Ids) {
    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();
    const batchUrl = [];
    Ids.forEach((element) => {
      const userObj = Object.assign({}, this.queryConfig);
      userObj.url = this.spServices.getUserURL(element);
      userObj.type = "GET";
      batchUrl.push(userObj);
      // const url = this.sharedObject.sharePointPageObject.serverRelativeUrl + '/_api/Web/GetUserById(' + element + ')';
      // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, url);
    });
    this.commonService.SetNewrelic(
      "ViewDocuments",
      "viewUpladDoc",
      "getUsersById",
      "GET-BATCH"
    );
    this.response = await this.spServices.executeBatch(batchUrl);
    this.response = this.response.length
      ? this.response.map((a) => a.retItems)
      : [];
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    return this.response;
  }

  // *************************************************************************************************
  //  Mark as final
  // *************************************************************************************************

  async markAsFinal() {
    if (this.selectedDocuments.length > 0) {
      let bSelectedNewFiles = false;
      const objPost = {
        __metadata: { type: "SP.ListItem" },
        Status: this.selectedTask.Task + " Complete",
      };
      const batchUrl = [];
      this.selectedDocuments.forEach(async (element) => {
        if (element.status.indexOf("Complete") === -1) {
          this.loaderenable = true;
          bSelectedNewFiles = true;
          const listName = element.ServerRelativeUrl.split("/")[3];
          const updateObj = Object.assign({}, this.queryConfig);
          updateObj.url = this.spServices.getItemURL(
            listName,
            +element.ListItemAllFields.ID
          );
          updateObj.data = objPost;
          updateObj.listName = listName;
          updateObj.type = "PATCH";
          batchUrl.push(updateObj);
        }
      });
      if (bSelectedNewFiles) {
        const jsonData = {
          __metadata: { type: this.constants.listNames.Schedules.type },
          FinalDocSubmit: true,
        };
        const taskObj = Object.assign({}, this.queryConfig);
        taskObj.url = this.spServices.getItemURL(
          this.constants.listNames.Schedules.name,
          +this.selectedTask.ID
        );
        taskObj.data = jsonData;
        taskObj.listName = this.constants.listNames.Schedules.name;
        taskObj.type = "PATCH";
        batchUrl.push(taskObj);
        this.selectedTask.FinalDocSubmit = true;
        this.commonService.SetNewrelic(
          "ViewDocuments",
          "viewUpladDoc",
          "UpdateSchedules",
          "POST-BATCH"
        );
        const response = await this.spServices.executeBatch(batchUrl);
        this.selectedDocuments = [];
        if (this.enableNotification) {
          await this.SendEmailNotification(this.selectedTask);
        }
        if (
          this.ModifiedSelectedTaskName === "Client Review" &&
          this.closeCRTaskEnable &&
          this.selectedTab === "My Drafts"
        ) {
          this.ref.close(true);
        } else {
          const docObj = await this.getAllDocuments(this.selectedTab);
          this.loadDraftDocs(docObj.allDocs, docObj.crTasks);
        }
      }
      if (!bSelectedNewFiles) {
        if (this.selectedDocuments.length > 1) {
          this.commonService.showToastrMessage(
            this.constants.MessageType.warn,
            "All the selected files are already marked as final.",
            false
          );
        } else {
          this.commonService.showToastrMessage(
            this.constants.MessageType.warn,
            "Selected file already marked as final.",
            false
          );
        }
        return false;
      }
    } else {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "Please Select Files.",
        false
      );
    }
  }

  // **************************************************************************************************
  //   Download Files
  // **************************************************************************************************

  downloadFile() {
    if (this.selectedDocuments.length > 0) {
      if (this.selectedTask.DisplayTitle) {
        this.commonService.SetNewrelic(
          "ViewDocuments",
          "viewUpladDoc",
          "downloadFile-DisplayTitle-createZip",
          "GET-BATCH"
        );
        this.spServices.createZip(
          this.selectedDocuments.map((c) => c.ServerRelativeUrl),
          this.selectedTask.DisplayTitle
        );
      } else if (this.selectedTask.ProjectName) {
        this.commonService.SetNewrelic(
          "ViewDocuments",
          "viewUpladDoc",
          "downloadFile-ProjectName-createZip",
          "GET-BATCH"
        );
        this.spServices.createZip(
          this.selectedDocuments.map((c) => c.ServerRelativeUrl),
          this.selectedTask.ProjectName +
            " " +
            this.selectedTask.Milestone +
            " " +
            this.selectedTask.Task
        );
      } else {
        const downloadName = this.selectedTask.WBJID ? this.selectedTask.ProjectCode + ' (' +
          this.selectedTask.WBJID + ' )' : this.selectedTask.ProjectCode;
        this.commonService.SetNewrelic('ViewDocuments', 'viewUpladDoc', 'downloadFile-createZip', "GET-BATCH");
        this.spServices.createZip(this.selectedDocuments
          .map(c => c.ServerRelativeUrl ? c.ServerRelativeUrl : c.data.ServerRelativeUrl), downloadName);
      }
    } else {
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        "Please Select Files.",
        false
      );
    }
  }

  // *************************************************************************************************
  //   upload documents
  // *************************************************************************************************

  uploadDocs(event, type) {
    if (
      this.ModifiedSelectedTaskName === "Client Review" &&
      this.closeCRTaskEnable &&
      this.selectedTab === "My Drafts"
    ) {
      const message =
        "Are you sure that you want to close current task with selected documents?";
      this.commonService
        .confirmMessageDialog(
          "Confirmation",
          message,
          null,
          ["Yes", "No"],
          false
        )
        .then(async (Confirmation) => {
          if (Confirmation === "Yes") {
            this.commonService.SetNewrelic(
              "ViewDocuments",
              "Client Review Tab",
              "close CR task",
              "POST-BATCH"
            );
            this.uploadDocuments(event, type);
          }
        });
    } else {
      if (this.selectedTab === "Client Comments") {
        this.commonService.SetNewrelic(
          "ViewDocuments",
          "Client Review Tab",
          "upload client comments",
          "POST-BATCH"
        );
        this.uploadClientDocs(event.files);
      } else {
        if (
          this.ModifiedSelectedTaskName === "Client Review" &&
          this.selectedTab === "My Drafts"
        ) {
          this.commonService.SetNewrelic(
            "ViewDocuments",
            "Client Review Tab",
            "upload task documents",
            "POST-BATCH"
          );
        }
        this.uploadDocuments(event, type);
      }
    }
  }

  uploadClientDocs(files) {
    const uploadFiles = [];
    for (const file of files) {
      const ufile = {
        file,
        selectedMilestone: this.ProjectInformation.Milestone,
        filenamewithoutExt: file.name.substring(0, file.name.lastIndexOf(".")),
        extension: file.name.substring(file.name.lastIndexOf(".")),
      };
      uploadFiles.push(ufile);
    }
    this.tagDocuments(uploadFiles);
  }

  tagDocuments(ufiles) {
    const ref = this.dialogService.open(TagDocumentComponent, {
      data: {
        files: ufiles,
        milestones: this.ProjectInformation.availableMilestones,
      },
      width: "65vw",
      header: "Tag to milestone",
      contentStyle: { "max-height": "90vh", "overflow-y": "auto" },
      closable: true,
    });
    ref.onClose.subscribe((updatedFiles: any) => {
      this.uploadClientDocuments(updatedFiles, "Client Comments");
    });
  }

  uploadClientDocuments(updatedFiles, type) {
    if (updatedFiles.length) {
      const existingFiles = this.allDocuments.map((c) => c.Name.toLowerCase());
      const objUpload = this.checkFileName(updatedFiles, existingFiles);
      if (objUpload.bUpload) {
        for (const file of objUpload.readers) {
          const docFolder =
            this.ProjectInformation.ProjectFolder +
            "/Drafts/Internal/" +
            file.selectedMilestone;
          file.folderPath = docFolder;
        }
        this.processUpload(objUpload.readers);
      } else {
        // if (!filesizeerror) {
        this.commonService.showToastrMessage(
          this.constants.MessageType.error,
          this.constants.Messages.SpecialCharMsg,
          false
        );
        // }
      }
    }
  }

  checkFileName(files, existingFiles) {
    const readers = [];
    let bUpload = true;
    let filesizeerror = false;
    files.forEach(async (element) => {
      const file = element.file;
      if (file.size > 0) {
        let filename = file.name;
        const sNewFileName = filename.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, "");
        if (filename !== sNewFileName) {
          bUpload = false;
          return;
        }
        if (existingFiles.includes(file.name.toLowerCase())) {
          filename =
            filename.split(/\.(?=[^\.]+$)/)[0] +
            "." +
            this.datePipe.transform(new Date(), "ddMMyyyyhhmmss") +
            "." +
            filename.split(/\.(?=[^\.]+$)/)[1];
        }
        const fileObj = {
          file,
          name: filename,
          selectedMilestone: element.selectedMilestone,
        };

        readers.push(fileObj);
        existingFiles.push(filename.toLowerCase());
      } else {
        filesizeerror = true;
        bUpload = false;
        this.commonService.showToastrMessage(
          this.constants.MessageType.warn,
          this.constants.Messages.ZeroKbFile.replace("{{fileName}}", file.name),
          false
        );
        return;
      }
    });
    return {
      bUpload,
      readers,
    };
  }

  processUpload(updatedFiles) {
    const ref = this.dialogService.open(FileUploadProgressDialogComponent, {
      header: "File Uploading",
      width: "70vw",
      data: {
        Files: updatedFiles,
        // libraryName: this.ProjectInformation.ProjectFolder + "/" + docFolder,
        overwrite: false,
      },
      contentStyle: {
        "max-height": "82vh",
        "overflow-y": "auto",
        "background-color": "#f4f3ef",
      },
      closable: false,
    });
    return ref.onClose.subscribe(async (uploadedfiles: any) => {
      if (uploadedfiles) {
        if (
          updatedFiles.length > 0 &&
          updatedFiles.length === uploadedfiles.length
        ) {
          this.loaderenable = true;
          if (
            this.selectedTab === "My Drafts" ||
            this.selectedTab === "Client Comments"
          ) {
            this.LinkDocumentToProject(uploadedfiles);
          } else {
            const docObj = await this.getAllDocuments(this.selectedTab);
            this.loadDraftDocs(docObj.allDocs, docObj.crTasks);
            this.commonService.showToastrMessage(
              this.constants.MessageType.success,
              "Document updated successfully.",
              false
            );
          }
        }
      }
    });
  }
  async uploadDocuments(event, type) {
    if (event.files.length) {
      let docFolder;
      const existingFiles = this.allDocuments.map((c) => c.Name.toLowerCase());
      switch (type) {
        case "Source Docs":
          docFolder = "Source Documents";
          break;
        case "References":
          docFolder = "References";
          break;
        case "meetingNotes" || "Meeting Notes":
          docFolder = "Communications";
          break;
        default:
          docFolder = "Drafts/Internal/" + this.selectedTask.Milestone;
          break;
      }
      const readers = [];
      let bUpload = true;
      let filesizeerror = false;
      event.files.forEach(async (element) => {
        if (element.size > 0) {
          const file = element;
          let filename = element.name;
          const sNewFileName = filename.replace(
            /[~#%&*\{\}\\:/\+<>?"'@/]/gi,
            ""
          );
          if (filename !== sNewFileName) {
            bUpload = false;
            return;
          }
          if (existingFiles.includes(element.name.toLowerCase())) {
            filename =
              filename.split(/\.(?=[^\.]+$)/)[0] +
              "." +
              this.datePipe.transform(new Date(), "ddMMyyyyhhmmss") +
              "." +
              filename.split(/\.(?=[^\.]+$)/)[1];
          }
          const fileObj = {
            file,
            name: filename,
          };

          readers.push(fileObj);
          existingFiles.push(filename.toLowerCase());
        } else {
          filesizeerror = true;
          bUpload = false;
          this.commonService.showToastrMessage(
            this.constants.MessageType.warn,
            this.constants.Messages.ZeroKbFile.replace(
              "{{fileName}}",
              element.name
            ),
            false
          );
          return;
        }
      });
      if (bUpload) {
        const ref = this.dialogService.open(FileUploadProgressDialogComponent, {
          header: "File Uploading",
          width: "70vw",
          data: {
            Files: readers,
            libraryName:
              this.ProjectInformation.ProjectFolder + "/" + docFolder,
            overwrite: false,
          },
          contentStyle: {
            "max-height": "82vh",
            "overflow-y": "auto",
            "background-color": "#f4f3ef",
          },
          closable: false,
        });
        return ref.onClose.subscribe(async (uploadedfiles: any) => {
          if (uploadedfiles) {
            if (
              event.files.length > 0 &&
              event.files.length === uploadedfiles.length
            ) {
              this.loaderenable = true;
              if (this.selectedTab === "My Drafts") {
                this.LinkDocumentToProject(uploadedfiles);
              } else {
                const docObj = await this.getAllDocuments(this.selectedTab);
                this.loadDraftDocs(docObj.allDocs, docObj.crTasks);
                this.commonService.showToastrMessage(
                  this.constants.MessageType.success,
                  "Document updated successfully.",
                  false
                );
              }
            }
          }
        });
      } else {
        if (!filesizeerror) {
          this.commonService.showToastrMessage(
            this.constants.MessageType.error,
            this.constants.Messages.SpecialCharMsg,
            false
          );
        }
      }
    }
  }

  // ************************************************************************************************
  //   link uploaded documents to projects
  // ************************************************************************************************

  async LinkDocumentToProject(uploadedFiles) {

    const batchUrl = [];
    uploadedFiles.forEach(async element => {
      const objPost = {
        __metadata: { type: 'SP.ListItem' },
        Status: this.selectedTab === 'Client Comments' ? 'Client Review Complete' : '-',
        TaskName: this.selectedTab === 'Client Comments' ?
        this.ProjectInformation.ProjectCode + ' ' + element.selectedMilestone + ' Client Review' : this.selectedTask.Title
      };
      // objPost.TaskName = this.selectedTab === 'Client Comments' ?
      //   this.ProjectInformation.ProjectCode + ' ' + element.selectedMilestone + ' Client Review' : objPost.TaskName;
      const listName = element.ServerRelativeUrl.split('/')[3];
      const taskObj = Object.assign({}, this.queryConfig);
      taskObj.url = this.spServices.getItemURL(
        listName,
        +element.ListItemAllFields.ID
      );
      taskObj.data = objPost;
      taskObj.listName = listName;
      taskObj.type = "PATCH";
      batchUrl.push(taskObj);
    });
    this.commonService.SetNewrelic(
      "ViewDocuments",
      "viewUpladDoc",
      "linkDocToProject",
      "POST-BATCH"
    );
    await this.spServices.executeBatch(batchUrl);

    if (
      this.ModifiedSelectedTaskName === "Client Review" &&
      this.selectedTab === "My Drafts"
    ) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.success,
        "Documents uploaded successfully.",
        false
      );
      this.selectedDocuments = uploadedFiles;
      this.selectedDocuments.map((c) => (c.status = "-"));
      this.markAsFinal();
    } else {
      const docObj = await this.getAllDocuments(this.selectedTab);
      this.loadDraftDocs(docObj.allDocs, docObj.crTasks);
      this.commonService.showToastrMessage(
        this.constants.MessageType.success,
        "Documents updated successfully.",
        false
      );
    }
  }

  SendEmailNotification(task) {
    const mailSubject = "New File Uploaded.";

    // ClosedTaskNotification
    if (task.NextTasks) {
      const nts = task.NextTasks.split(";#");
      nts.forEach(async (nextTask) => {
        const npInfo = await this.myDashboardConstantsService.getNextPreviousTask(
          task
        );
        const iterator = npInfo.find((item) => item.Title === nextTask);
        const ArrayTo = [];
        const objEmailBody = [];
        objEmailBody.push({
          key: "@@Val1@@", //  Next  Task Assign To
          value: iterator.AssignedTo ? iterator.AssignedTo.Title : "",
        });
        objEmailBody.push({
          key: "@@Val2@@", // Current Task Name
          value: task.Title,
        });
        objEmailBody.push({
          key: "@@Val21@@", // Current Task Assign To
          value: task.AssignedTo ? task.AssignedTo.Title : "",
        });
        objEmailBody.push({
          key: "@@Val3@@", // Next Task Name
          value: iterator.Title,
        });
        objEmailBody.push({
          key: "@@Val31@@", //  Next  Task Assign To
          value: iterator.AssignedTo ? iterator.AssignedTo.Title : "",
        });

        let mailBody = this.Emailtemplate;

        for (const data of objEmailBody) {
          mailBody = mailBody.replace(RegExp(data.key, "gi"), data.value);
        }
        this.commonService.SetNewrelic(
          "ViewDocuments",
          "viewUpladDoc",
          "SendMails",
          "POST-BATCH"
        );
        // Send  email
        this.spServices.sendMail(
          iterator.AssignedTo.EMail,
          task.AssignedTo.EMail,
          mailSubject,
          mailBody,
          task.AssignedTo.EMail
        );
      });
    }
  }

  async getEmailTemplate() {
    const batchURL = [];
    const options = {
      data: null,
      url: "",
      type: "",
      listName: "",
    };
    const mailQueryOptions = {
      select: "ContentMT",
      // tslint:disable-next-line: quotemark
      filter:
        "Title eq '" +
        this.constants.EMAIL_TEMPLATE_NAME.CLOSED_TASK_NOTIFICATION +
        "'",
    };
    const mailTemplateGet = Object.assign({}, options);
    mailTemplateGet.url = this.spServices.getReadURL(
      "" + this.constants.listNames.MailContent.name + "",
      mailQueryOptions
    );
    mailTemplateGet.type = "GET";
    mailTemplateGet.listName = this.constants.listNames.MailContent.name;
    batchURL.push(mailTemplateGet);

    this.commonService.SetNewrelic(
      "ViewDocuments",
      "viewUpladDoc",
      "getEmailTemplate",
      "GET"
    );
    const arrResults = await this.spServices.executeBatch(batchURL);

    if (arrResults[0].retItems) {
      this.Emailtemplate = arrResults[0].retItems[0].ContentMT;
    }
  }

  save(rowData) {
    this.loaderenable = true;
    setTimeout(async () => {
      const batchUrl = [];
      const fileUrl = rowData.ServerRelativeUrl
        ? rowData.ServerRelativeUrl
        : "";
      let moveFileUrl = fileUrl.replace(
        rowData.oldMilestone,
        rowData.selectedMilestone
      );
      if (rowData.newFileName) {
        moveFileUrl = moveFileUrl.replace(rowData.Name, rowData.newFileName);
      }
      const url =
        this.sharedObject.sharePointPageObject.webAbsoluteUrl +
        "/_api/web/getfilebyserverrelativeurl('" +
        fileUrl +
        "')/moveto(newurl='" +
        moveFileUrl +
        "',flags=1)";
      const moveItemObj = Object.assign({}, this.queryConfig);
      moveItemObj.url = url;
      moveItemObj.listName = "Move Item";
      moveItemObj.type = "POST";
      batchUrl.push(moveItemObj);
      // }
      this.commonService.SetNewrelic('ViewDocuments', 'Client Review Tab', 'Update CR docs name or milestone', "POST-BATCH");
      const moveToMilestoneRes: any = await this.spOperations.executeBatch(batchUrl);
      this.LinkDocumentToProject([rowData]);
      this.loaderenable = false;
    }, 300);
  }

  edit(rowdata) {
    const newrowdata = rowdata.data ? rowdata.data : rowdata;
    const newFileName = newrowdata.filenamewithoutExt + newrowdata.extension;
    if (rowdata.data) {
      rowdata.data.newFileName = newFileName;
      // this.save(rowdata.data);
    } else {
      rowdata.newFileName = newFileName;
      // this.save(rowdata);
    }
    this.commonService.showToastrMessage(
      this.constants.MessageType.info,
      "Please click on save icon to update file name changes.",
      false,
      false
    );
  }

  saveAll() {
    this.loaderenable = true;
    setTimeout(async () => {
      const alldocs = this.getArrDocs(this.crDocs);
      const batchUrl = [];
      for (const rowData of alldocs) {
        const fileUrl = rowData.ServerRelativeUrl
          ? rowData.ServerRelativeUrl
          : "";
        let moveFileUrl = fileUrl.replace(
          rowData.oldMilestone,
          rowData.selectedMilestone
        );
        if (rowData.newFileName) {
          moveFileUrl = moveFileUrl.replace(rowData.Name, rowData.newFileName);
        }
        const url =
          this.sharedObject.sharePointPageObject.webAbsoluteUrl +
          "/_api/web/getfilebyserverrelativeurl('" +
          fileUrl +
          "')/moveto(newurl='" +
          moveFileUrl +
          "',flags=1)";
        const moveItemObj = Object.assign({}, this.queryConfig);
        moveItemObj.url = url;
        moveItemObj.listName = "Move Item";
        moveItemObj.type = "POST";
        batchUrl.push(moveItemObj);
      }
      this.commonService.SetNewrelic('ViewDocuments', 'Client Review Tab', 'update task documents', "POST-BATCH");
      const moveToMilestoneRes: any = await this.spOperations.executeBatch(batchUrl);
      this.LinkDocumentToProject(alldocs);
      this.loaderenable = false;
    }, 300);
  }

  getArrDocs(objDocs) {
    const arrDocs = [];
    for (const [key, value] of Object.entries(objDocs)) {
      const childrens = value as any;
      if (childrens.children) {
        for (const doc of childrens.children) {
          if (doc.data) {
            arrDocs.push(doc.data);
          }
        }
      }
    }
    return arrDocs;
  }

  stopEdit(event) {
    event.stopPropagation();
    const element = this.dt.editingCell;
    element.classList.remove("ui-editing-cell");
    this.dt.onEditComplete.emit({ field: null, data: null });
    this.dt.editingCell = null;
  }
}
