import { Component, OnInit, ViewEncapsulation, ComponentFactoryResolver, ViewContainerRef, ViewChild, HostListener, ApplicationRef, NgZone } from '@angular/core';
import { DialogService, Table } from 'primeng';
import { MenuItem } from 'primeng';
import { FormBuilder, FormGroup, Validators, FormControl, MaxLengthValidator } from '@angular/forms';
import { SPOperationService } from '../../Services/spoperation.service';
import { ConstantsService } from '../../Services/constants.service';
import { PubsuportConstantsService } from '../Services/pubsuport-constants.service';
import { GlobalService } from '../../Services/global.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CreateConferenceComponent } from './create-conference/create-conference.component';
import { CreateJournalComponent } from './create-journal/create-journal.component';
import { DatePipe, TitleCasePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { Subject } from 'rxjs';
import { AddAuthorComponent } from './add-author/add-author.component';
import { AuthorDetailsComponent } from './author-details/author-details.component';
import { CommonService } from 'src/app/Services/common.service';
import { JournalConferenceDetailsComponent } from '../../shared/journal-conference-details/journal-conference-details.component';

@Component({
    selector: 'app-pubsupport',
    templateUrl: './pubsupport.component.html',
    styleUrls: ['./pubsupport.component.css'],
    providers : [
        JournalConferenceDetailsComponent
    ],
    encapsulation: ViewEncapsulation.None
})
// tslint: disable
export class PubsupportComponent implements OnInit {
    SelectedFile: any[];
    FolderName: any;
    folderPath: string;
    type: any;
    projectCode: any;
    jcSubDetails: any = [];
    jcGalleyDetails: any = [];
      @ViewChild('jcDetails', { static: false })
    journalConfDetails: JournalConferenceDetailsComponent;
    
    @ViewChild('dt', { static: false })dt: Table;

    constructor(
        private formBuilder: FormBuilder,
        public spOperationsService: SPOperationService,
        public constantService: ConstantsService,
        public globalObject: GlobalService,
        public pubsupportService: PubsuportConstantsService,
        private router: Router,
        private dialogService: DialogService,
        private datePipe: DatePipe,
        private componentFactoryResolver: ComponentFactoryResolver,
        private titlecasePipe: TitleCasePipe,
        private platformLocation: PlatformLocation,
        private locationStrategy: LocationStrategy,
        _applicationRef: ApplicationRef,
        private common: CommonService,
        zone: NgZone,
        private route: ActivatedRoute,
    ) {

        // this.router.routeReuseStrategy.shouldReuseRoute = () => {
        //     return false;
        // };

        // subscribe to the router events - storing the subscription so
        // we can unsubscribe later.
        // this.navigationSubscription = this.router.events.subscribe((e: any) => {

        //     // If it is a NavigationEnd event re-initalise the component
        //     if (e instanceof NavigationEnd) {
        //         this.initialiseInvites();
        //     }
        // });

        this.overAllValues = [
            { name: 'Open', value: 'Open' },
            { name: 'Closed', code: 'Closed' }
        ];
        this.selectedOption = this.overAllValues[0];

        // Browser back button disabled & bookmark issue solution
        history.pushState(null, null, window.location.href);
        platformLocation.onPopState(() => {
            history.pushState(null, null, window.location.href);
        });

        router.events.subscribe((uri) => {
            zone.run(() => _applicationRef.tick());
        });

    }

    get isValidAddUpdateJCDetailsForm() {
        return this.journal_Conference_Detail_form.controls;
        // this.journal_Conf_form
    }

    get isValidEditJCDetailsForm() {
        return this.journal_Conference_Edit_Detail_form.controls;
        // this.journal_Conf_form
    }

    // convenience getter for easy access to form fields
    get isValidConferenceForm() {
        return this.journal_Conf_form.controls;
    }


    get isValidUpdateAuthorForm() {
        return this.update_author_form.controls;
    }

    get isValidUpdatePublicationForm() {
        return this.update_publication_form.controls;
    }

    get isValidGalleyForm() {
        return this.galley_form.controls;
    }

    get isValidDecisionForm() {
        return this.update_decision_details.controls;
    }

    get isValidUpdateJCRequirementForm() {
        return this.update_Journal_Requirement_form.controls;
    }

    get isValidReplaceDocumentForm() {
        return this.replace_Document_Form.controls;
    }

    pubsupportCols: any[] = [
        { field: 'ProjectCode', header: 'Project Code', visibility: true },
        { field: 'ClientLegalEntity', header: 'Client Legal Entity', visibility: true },
        { field: 'DeliverableType', header: 'Deliverable Type', visibility: true },
        { field: 'PrimaryPOC', header: 'Primary POC', visibility: true },
        { field: 'Status', header: 'Status', visibility: true },
        { field: 'PubSupportStatus', header: 'Pub Sup Status', visibility: true },
        { field: 'LastSubmissionDate', header: 'Last Submission', visibility: true },
        { field: '', header: 'Authors and Author Forms', visibility: true },
    ];

    expandedRows: any = {};

    updateAuthorModal_1: boolean;
    updateDecisionModal: boolean;
    updatePublicatoinModal: boolean;
    overrideGalleyModal: boolean;

    updatePI_JCSub: boolean;

    isSubmisssionDetails = false;
    // files: TreeNode[];
    items: MenuItem[];
    index = -1;

    pubSupportProjectInfoData = [];
    pubSupportProjectContactData = [];

    overAllValues = [];
    providedProjectCode = '';
    selectedOption: any;

    // Modals Field
    // tslint:disable
    journal_Conf_form: FormGroup;
    update_author_form: FormGroup;
    update_decision_details: FormGroup;
    update_publication_form: FormGroup;
    galley_form: FormGroup;
    journal_Conference_Detail_form: FormGroup;
    journal_Conference_Edit_Detail_form: FormGroup;
    update_Journal_Requirement_form: FormGroup;
    replace_Document_Form: FormGroup;
    // tslint:enable
    submitted = false;
    showProjectInput = false;
    // Progress Bar status
    value = 0;
    backgroundColor: any;

    // Loadder
    // isPSInnerLoaderHidden = false;

    // SHow Hide JCDetails
    showHideJC = false;


    // show/hide Add Author Component
    @ViewChild('addAuthorcontainer', { read: ViewContainerRef, static: false }) addAuthorcontainer: ViewContainerRef;
    // @ViewChild('authorDetailscontainer', { read: ViewContainerRef, static: false }) authorDetailscontainer: ViewContainerRef;

    // Year Range
    yearsRange = new Date().getFullYear() - 1 + ':' + (new Date().getFullYear() + 10);

    display = false;

    cols: any[];

    showDetails = false;
    selectedModal = '';
    myKey1: any;

    navigationSubscription;

    submitBtn: any = {
        isClicked: false
    };

    formSubmit: any = {
        isSubmit: false
    };

    loggedInUserInfo: any = [];
    loggedInUserGroup: any = [];

    projInfoResponse: any = [];


    jc_jcSubId: any = [];

    projectCodeRes: any = [];

    filesToCopy: any = [];
    fileSourcePath: any;
    fileDestinationPath: any;
    noFileMsg = '';

    // Update Author form field
    selectedType: any = '';

    // Popup click Function
    test = false;
    milestonesList: any = [];

    // For now we are not using
    decisions: Array<any> = [
        { label: 'Accepted', value: 'Accepted' },
        { label: 'Presented', value: 'Presented' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Resubmit to same journal', value: 'Resubmit to same journal' }
    ];

    batchContents: any = [];

    jcId: any;

    // showJournal_i: boolean = true;

    journal_Conf_data: any = [];
    selectedProject: any = {};

    // Show Hide Submission Details
    showSubDetailsIndex = 0;
    subResponse: any = [];

    // Download FIle
    blob: any = [];

    selectedFile: any;
    filePathUrl: any;
    fileReader: any;

    authorsData: any = [];

    authorsFiles: any = [];

    todayDate: any = {};

    documentTypes: any = [];
    addJCDetailsModal: boolean = false;
    editJCDetailsModal: boolean = false;
    updateJCRequirementModal: boolean = false;
    replaceDocument: boolean = false;
    milestoneListArray: any = [];

    journalConference_form: FormGroup;

    jcListArray: any = [];
    optionLabel: any = {
        title: ''
    };

    createJournalModal: boolean = false;
    createConferenceModal: boolean = false;

    tempClick: any;
    ref: any;
    cleDataArray: any = [];

    closedProjectCode: string;
    showDialog() {
        this.display = true;
    }

    async ngOnInit() {
        this.globalObject.currentTitle = 'Publication Support';
        this.currentUserInfo();
        this.todayDate = new Date();
        this.isSubmisssionDetails = false;
        this.journalConfFormField();
        this.updatejCRequirement();
        this.replaceDocumentForm();
        this.getDocuTypes();
        this.cols = [
            { field: 'No', header: 'No' },
            { field: 'Submission_Date', header: 'Submission Date' },
            { field: 'Submission_Package', header: 'Submission Package' },
            { field: 'Submission_Confirmation', header: 'Submission Confirmation' },
            { field: 'Decision', header: 'Decision' },
            { field: 'Decision_Date', header: 'Decision Date' },
            { field: 'Decision_Document', header: 'Decision Document' },
            // { field: '', header: '' }
        ];

        // PROGRESS Bar
        const interval = setInterval(() => {
            this.value = this.value + Math.floor(Math.random() * 10) + 1;
            if (this.value <= 25) {
                this.backgroundColor = 'background1';
            } else if (this.value > 25 && this.value <= 50) {
                this.backgroundColor = 'background2';
            } else if (this.value > 50 && this.value <= 75) {
                this.backgroundColor = 'background3';
            } else if (this.value > 75) {
                this.backgroundColor = 'background4';
            }

            if (this.value >= 100) {
                this.value = 100;
                // this.msgs = [{severity: 'info', summary: 'Success', detail: 'Process Completed'}];
                clearInterval(interval);
            }
        }, 2000);

        // Modal Form Creation
        // this.journalConfFormField();
        this.updateAuthorFormField();
        this.updateDeceionFormField();
        this.updatePublicationFormField();
        this.galleyFormField();
        this.jcDetailsForm();
        this.projectCode = this.route.snapshot.queryParams['ProjectCode'];
        if(this.projectCode) {
            setTimeout(()=>{
                this.dt.filter(this.projectCode, 'ProjectCode', 'contains');
            },100)
        }
    }

    getDocuTypes() {
        this.documentTypes = [
            { label: 'Select type', value: '' },
            { label: 'Journal', value: 'Journal' },
            { label: 'Conference', value: 'Conference' }
        ];
    }

    initialiseInvites() {
        // Set default values and re-fetch any data you need.

    }

    callGetProjects(isClosed) {
        if (this.loggedInUserGroup.findIndex(c => (c === 'Managers' || c === 'Project-FullAccess')) !== -1) {
            this.getProjectInfoData(true, isClosed);
        } else {
            this.getProjectInfoData(false, isClosed);
        }
    }

    async currentUserInfo() {
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
        this.loggedInUserInfo = [];
        this.loggedInUserGroup = [];
        this.common.SetNewrelic('PubSupport', 'pubsupport', 'GetCurrentUserInfo');
        const curruentUsrInfo = await this.spOperationsService.getUserInfo(this.globalObject.currentUser.userId);
        this.loggedInUserInfo = curruentUsrInfo.Groups.results;
        this.loggedInUserInfo.forEach(element => {
            if (element) {
                this.loggedInUserGroup.push(element.LoginName);
            }
        });
        this.callGetProjects(false);
    }

    async getProjectInfoData(isManager, isClosed) {
        // this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
        const arrEndPoints = [];
        const arrEndPointsArchive = [];
        this.projInfoResponse = [];
        let arrResults = [];
        let arrResultsArchive = [];
        let projectInfoEndpoint = '';
        if (isClosed) {
            const setProjectCode = this.providedProjectCode.trim();
            const obj = Object.assign({}, this.pubsupportService.pubsupportComponent.projectInfoClosed);
            obj.filter = obj.filter.replace('{{ProjectCode}}', setProjectCode);
            // this.pubsupportService.pubsupportComponent.projectInfoClosed.filter = this.pubsupportService.pubsupportComponent.projectInfoClosed.filter.replace('{{ProjectCode}}', setProjectCode);

            projectInfoEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.ProjectInformation.name + '', obj);
            arrEndPoints.push(projectInfoEndpoint);
            // this.spServices.getBatchBodyGet(batchContents, batchGuid, projectInfoEndpoint);
            // projectInfoEndpoint = this.spOperationsService.getReadURLArchive('' + this.constantService.listNames.ProjectInformation.name + '', obj);
            // arrEndPointsArchive.push(projectInfoEndpoint);
            // this.spServices.getBatchBodyGet(batchContents, batchGuid, projectInfoEndpoint);
        } else {
            if (isManager) {
                projectInfoEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.ProjectInformation.name + '', this.pubsupportService.pubsupportComponent.projectInfo);
            } else {
                this.pubsupportService.pubsupportComponent.projectInfoUser.filter = this.pubsupportService.pubsupportComponent.projectInfoUser.filter.replace(/{{ID}}/gi, this.globalObject.currentUser.userId.toString());
                projectInfoEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.ProjectInformation.name + '', this.pubsupportService.pubsupportComponent.projectInfoUser);
            }
            arrEndPoints.push(projectInfoEndpoint);
            // this.spServices.getBatchBodyGet(batchContents, batchGuid, projectInfoEndpoint);
        }

        const projectContactEndPoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.ProjectContacts.name + '', this.pubsupportService.pubsupportComponent.projectContact);
        const cleEndPoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.ClientLegalEntity.name + '', this.pubsupportService.pubsupportComponent.clientLegalEntity);
        arrEndPoints.push(projectContactEndPoint, cleEndPoint);

        let arrProjects = [], arrProjectContacts = [];
        const pipcObj = [
            {
                url: projectInfoEndpoint,
                type: 'GET',
                listName: this.constantService.listNames.ProjectInformation.name
            },
            {
                url: projectContactEndPoint,
                type: 'GET',
                listName: this.constantService.listNames.ProjectContacts.name
            },
            {
                url: cleEndPoint,
                type: 'GET',
                listName: this.constantService.listNames.ClientLegalEntity.name
            }
        ];

        const piObj = [{
            url: projectInfoEndpoint,
            type: 'GET',
            listName: this.constantService.listNames.ProjectInformation.name
        }];

        arrResults = await this.spOperationsService.executeBatch(pipcObj);
        if (arrEndPointsArchive.length) {
            // arrResultsArchive = await this.spServices.getDataByApi(this.globalObject.sharePointPageObject.webAbsoluteArchiveUrl, arrEndPointsArchive);
            this.common.SetNewrelic('PubSupport', 'pubsupport', 'GetProjectInfo');
            arrResultsArchive = await this.spOperationsService.executeBatch(piObj);
            if (arrResultsArchive.length && arrResultsArchive[0].length) {
                arrProjects = arrResultsArchive[0];
            } else {
                arrProjects = arrResults[0].retItems;
            }
            arrProjectContacts = arrResults[1].retItems;
            this.cleDataArray = arrResults[2].retItems;

        } else if (arrResults.length) {
            arrProjects = arrResults[0].retItems;
            arrProjectContacts = arrResults[1].retItems;
            this.cleDataArray = arrResults[2].retItems;
        }

        this.projectInfoFormatData(arrProjects, arrProjectContacts);
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
    }

    projectInfoFormatData(arrProjects, arrProjectContacts) {
        this.pubSupportProjectInfoData = [];
        // let projecInfo = [];
        if (arrProjects.length) {
            // projecInfo =  projectInfoArray.length === 3 ? (projectInfoArray[0].length ? projectInfoArray[0] : projectInfoArray[1]) : projectInfoArray[0];
            this.pubSupportProjectContactData = arrProjectContacts; // projectInfoArray.length === 3 ?  projectInfoArray[2] : projectInfoArray[1];
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < arrProjects.length; i++) {
                const element = arrProjects[i];
                this.pubSupportProjectInfoData.push({
                    ProjectCode: element.ProjectCode,
                    ClientLegalEntity: element.ClientLegalEntity,
                    DeliverableType: element.DeliverableType,
                    ID: element.ID,
                    Id: element.Id,
                    JournalSelectionDate: element.JournalSelectionDate,
                    JournalSelectionURL: element.JournalSelectionURL,
                    LastSubmissionDate: element.LastSubmissionDate, // (contactData) =>{if(contactData.ID == element.PrimaryPOC){}}
                    PrimaryPOC: this.getPoc(element.PrimaryPOC),
                    PubSupportStatus: element.PubSupportStatus,
                    Status: element.Status,
                    Milestones: element.Milestones,
                    ProjectFolder: element.ProjectFolder
                });
                this.pubSupportProjectInfoData = [...this.pubSupportProjectInfoData];
            }
        }
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
    }

    getPoc(pocId: number) {
        const found = this.pubSupportProjectContactData.find(contactData => {
            if (pocId === contactData.ID) {
                return contactData;
            }
        });
        if (found) {
            return found.FName + ' ' + found.LName;
        }
    }

    applyReadFlagStyle(rowData) {
        // console.log('rowData ',rowData);
        if (rowData.Status) {
            // tslint:disable-next-line: max-line-length
            return rowData.Status === 'In Progress' ? 'lightgreen' : rowData.Status === 'Unallocated' ? 'lightblue' : rowData.Status === 'In Discussion' ? 'lightcoral' : '';
        }
    }

    // Open popup
    async openPopup(data, popUpData) {
        this.submitBtn.isSubmit = false;
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
        this.items = [];
        this.selectedProject = data;
        let pubSupportSts = '';
        if (data.PubSupportStatus) {
            pubSupportSts = data.PubSupportStatus.toLowerCase();
        }

        switch (pubSupportSts) {
            case '':{
                this.items = [
                    { label: 'Add Journal / Conference', command: (e) => this.openMenuContent(e, data) },
                    { label: 'Add Authors', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Author forms & emails', command: e => this.openMenuContent(e, data) }
                ];
                break;
            }
            case 'rejected': {
                this.items = [
                    { label: 'Add Journal / Conference', command: (e) => this.openMenuContent(e, data) },
                    { label: 'Add Authors', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Author forms & emails', command: e => this.openMenuContent(e, data) },
                    { label: 'Revert Decision', command: e => this.openMenuContent(e, data) }
                ];
                break;
            }
            case 'selected': {
                this.items = [
                    { label: 'Edit Journal / Conference', command: e => this.openMenuContent(e, data) },
                    { label: 'Add Authors', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Author forms & emails', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Journal Requirement', command: e => this.openMenuContent(e, data) },
                    { label: 'Cancel Journal Conference', command: e => this.openMenuContent(e, data) },
                ];
                break;
            }
            case 'resubmit to same journal': {
                this.items = [
                    { label: 'Edit Journal / Conference', command: e => this.openMenuContent(e, data) },
                    { label: 'Add Authors', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Author forms & emails', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Journal Requirement', command: e => this.openMenuContent(e, data) },
                    { label: 'Revert Decision', command: e => this.openMenuContent(e, data) }
                ];
                break;
            }
            case 'submitted': {
                this.items = [
                    { label: 'Edit Journal / Conference', command: e => this.openMenuContent(e, data) },
                    { label: 'Add Authors', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Author forms & emails', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Decision details', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Journal Requirement', command: e => this.openMenuContent(e, data) },
                ];
                break;
            }
            case 'accepted': {
                // this.items = [];

                // tslint:disable-next-line: max-line-length
                if (this.selectedProject.DeliverableType !== 'Abstract' && this.selectedProject.DeliverableType !== 'Poster' && this.selectedProject.DeliverableType !== 'Oral Presentation') {
                    this.items = [
                        { label: 'Override Galley', command: e => this.openMenuContent(e, data) },
                        { label: 'Revert Decision', command: e => this.openMenuContent(e, data) }
                    ];
                } else {
                    this.items = [
                        { label: 'Revert Decision', command: e => this.openMenuContent(e, data) }
                    ];
                }
                break;
            }
            case 'galleyed': {
                this.items = [
                    { label: 'Update Publication details', command: e => this.openMenuContent(e, data) }
                ];
                break;
            }
            case 'presented':{
                this.items = [
                    { label: 'Your document is ' + this.titlecasePipe.transform(pubSupportSts) + '.' },
                    { label: 'Revert Decision', command: e => this.openMenuContent(e, data) }
                ];
                break;
            }
            case 'published': {
                this.items = [
                    { label: 'Your document is ' + this.titlecasePipe.transform(pubSupportSts) + '.' }
                ];
                break;
            }
            default: {
                console.log('Invalid choice');
                break;
            }
        }
        if (this.items.length === 0) {
            popUpData.popup = false;
            popUpData.visible = false;
            popUpData.style.width = '0em';
        } else if (this.selectedProject.PubSupportStatus !== 'Published') {

            // GET JC & JCSubmission top
            await this.getJC_JCSubID();
            await this.getJCSubDetailsForResubmit();
        }
    }

    setJCDetails(data) {
        const form = this.journal_Conference_Edit_Detail_form;
        // const journalConfItem = this.jcListArray.find(j => j.ID === data.element.JournalConferenceId);
        if (data.element) {
            form.get('Name').setValue(data.element.NameST);
            form.get('jcLineItemName').setValue(data.element.NameST);
            form.get('EntryType').setValue(data.element.EntryType);
            form.get('Milestone').setValue(data.element.Milestone);
            form.get('UserName').setValue(data.element.UserNameST);
            form.get('Password').setValue(data.element.Password);
            form.get('Comments').setValue(data.element.CommentsMT);
            if (data.element.EntryType.toLowerCase() === 'journal') {
                // Set New Values
                // form.get('jcLineItemName').setValue(journalConfItem.JournalName);
                form.get('ExpectedReviewPeriod').setValue(data.element.ExpectedReviewPeriod);
                form.get('IF').setValue(data.element.IF);
                form.get('RejectionRate').setValue(data.element.RejectionRate);
                form.get('JournalEditorInfo').setValue(data.element.JournalEditorInfo);
            } else {
                // form.get('jcLineItemName').setValue(journalConfItem.ConferenceName);
                form.get('CongressDate').setValue(this.datePipe.transform(new Date(data.element.CongressDate), 'MMM dd, yyyy'));
                form.get('AbstractSubmissionDeadline').setValue(this.datePipe.transform(new Date(data.element.AbstractSubmissionDeadline), 'MMM dd, yyyy'));
                form.get('Comments').setValue(data.element.CommentsMT);
            }
            this.journal_Conference_Edit_Detail_form.updateValueAndValidity();
        }
    }

    async openMenuContent(index, data) {
        if (data.Milestones) {
            this.milestonesList = data.Milestones.split(';#');
        } else {
            this.milestonesList = [];
        }

        this.test = true;
        this.submitted = false;
        this.selectedModal = '';
        this.selectedModal = index.item.label;

        if (this.selectedModal === 'Add Authors') {
            this.addAuthorcontainer.clear();
            const factory = this.componentFactoryResolver.resolveComponentFactory(AddAuthorComponent);
            const componentRef = this.addAuthorcontainer.createComponent(factory);
            componentRef.instance.events = this.selectedProject;
            componentRef.instance.formType = 'addAuthor';
            this.ref = componentRef;
            return;
        } else if (this.selectedModal === 'Add Journal / Conference') {
            // this.journalConfFormField();
            this.addJCDetailsModal = true;
            this.formatMilestone(this.milestonesList);
            if (this.selectedProject.DeliverableType === 'Abstract' || this.selectedProject.DeliverableType === 'Poster' || this.selectedProject.DeliverableType === 'Oral Presentation') {
                this.documentTypes = [
                    { label: 'Select type', value: '' },
                    { label: 'Conference', value: 'Conference' }
                ];
            } else {
                this.documentTypes = [
                    { label: 'Select type', value: '' },
                    { label: 'Journal', value: 'Journal' },
                ];
            }
            return;
        } else if (this.selectedModal === 'Edit Journal / Conference') {
            await this.getJCDetails(data);
            await this.getJCList(this.journal_Conf_data[0].element.EntryType);
            this.addJCControls(this.journal_Conference_Edit_Detail_form, this.journal_Conf_data[0].element.EntryType, 'Edit');
            this.setJCDetails(this.journal_Conf_data[0]);
            this.editJCDetailsModal = true;
            this.formatMilestone(this.milestonesList);
            return;
        } else if (this.selectedModal === 'Update Author forms & emails') {
            this.selectedType = '';
            // Get projectCode from ClientLegalEntity
            this.getProjectCode();
            this.updateAuthorFormField();
            this.updateAuthorModal_1 = true;
            return;
        } else if (this.selectedModal === 'Update Decision details') {
            this.updateDeceionFormField();
            this.updateDecisionModal = true;
            return;
        } else if (this.selectedModal === 'Update Publication details') {
            this.updatePublicationFormField();
            this.updatePublicatoinModal = true;
            return;
        } else if (this.selectedModal === 'Override Galley') {
            this.galleyFormField();
            this.overrideGalleyModal = true;
            return;
        } else if (this.selectedModal === 'Cancel Journal Conference') {
            this.cancelJCDetails();
            return;
        } else if (this.selectedModal === 'Update Journal Requirement') {
            this.updateJCRequirementModal = true;
            return;
        } else if(this.selectedModal === 'Revert Decision') {
            this.revertFromDecision(data);
            return;
        }
        // document.getElementById('openModalButton').click();
    }

    @HostListener('click', ['$event'])
    clickEvent(event) {
        if ((event.target.innerText === 'Cancel' || event.target.className === 'pi pi-times') && this.ref) {
            this.ref.destroy();
            this.ref = '';
        }
    }

    formatMilestone(milestones) {
        this.milestoneListArray = [];
        for (let m = 0; m < milestones.length; m++) {
            const element = milestones[m];
            this.milestoneListArray.push({
                label: element,
                value: element
            });
        }

        // for (const element of milestones) {
        //     console.log(element);
        //     this.milestoneListArray.push({
        //         label: element,
        //         value: element
        //     });
        // }
    }

    jcDetailsForm() {
        this.journal_Conference_Edit_Detail_form = this.formBuilder.group({
            EntryType: ['', Validators.required],
            jcLineItemName: [''],
            Milestone: ['', Validators.required],
            Name: { value: '', disabled: true },
            Comments: [''],
            UserName: ['', Validators.required],
            Password: ['', Validators.required]
        });
        this.journal_Conference_Detail_form = this.formBuilder.group({
            EntryType: ['', Validators.required],
            jcLineItem: ['', Validators.required],
            Milestone: ['', Validators.required],
            Name: { value: '', disabled: true },
            Comments: ['']
        });
    }

    updatejCRequirement() {
        this.update_Journal_Requirement_form = this.formBuilder.group({
            JournalRequirementResponse: ['', Validators.required]
        });
    }

    journalConfFormField() {
        this.journal_Conf_form = this.formBuilder.group({
            EntryType: ['', Validators.required],
            Name: ['', Validators.required],
            Milestone: ['', Validators.required],
            Comments: ['', [Validators.required]]
        });
    }

    keyPress(event: any) {
        const pattern = /[0-9\+\-()+\ ]/;
        const inputChar = String.fromCharCode(event.charCode);
        if (event.keyCode !== 8 && !pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    updateAuthorFormField() {
        this.update_author_form = this.formBuilder.group({
            file: ['', Validators.required],
            existingAuthorList: ['', Validators.required]
        });
    }

    updateDeceionFormField() {
        this.update_decision_details = this.formBuilder.group({
            file: ['', Validators.required],
            Decision: ['', Validators.required]
        });
    }

    updatePublicationFormField() {
        this.update_publication_form = this.formBuilder.group({
            PublicationTitle: ['', Validators.required],
            Citation: ['', Validators.required],
            PDFAvailable: ['', Validators.required],
            PublicationURL: ['', Validators.required],
            PublicationDate: ''
        });
    }

    galleyFormField() {
        this.galley_form = this.formBuilder.group({
            // Title: ['', Validators.required],
            GalleyURL: ['', Validators.required],
        });
    }

    createJCDetailsForm() {
        this.journalConference_form = this.formBuilder.group({
            EntryType: ['', Validators.required],
            Name: ['', Validators.required],
            Milestone: ['', Validators.required],
            Comments: ['', [Validators.required]]
        });
    }

    replaceDocumentForm() {
        this.replace_Document_Form = this.formBuilder.group({
            documentFile:['', Validators.required]
        })
    }

    async getGalleyDetails(jcSubId) {
        const obj = Object.assign({}, this.pubsupportService.pubsupportComponent.jcGalley);
        obj.filter = obj.filter.replace('{{ProjectCode}}', this.selectedProject.ProjectCode).replace('{{JCSubID}}', jcSubId);
        const jcGalleyEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.JCGalley.name + '', obj);
        const objData = [
            {
                url: jcGalleyEndpoint,
                type: 'GET',
                listName: this.constantService.listNames.JCGalley.name
            }
        ];

        this.jcGalleyDetails = [];
        const arrResults = await this.spOperationsService.executeBatch(objData);
        this.jcGalleyDetails = arrResults;
    }

    async getJC_JCSubID() {
        const obj = Object.assign({}, this.pubsupportService.pubsupportComponent.activeJC);
        obj.filter = obj.filter.replace('{{ProjectCode}}', this.selectedProject.ProjectCode).replace('{{Status}}',
            this.selectedProject.PubSupportStatus);
        const jcEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.JournalConf.name + '', obj);
        const jcsEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.JCSubmission.name + '', obj);
        const objData = [
            {
                url: jcEndpoint,
                type: 'GET',
                listName: this.constantService.listNames.JournalConf.name
            },
            {
                url: jcsEndpoint,
                type: 'GET',
                listName: this.constantService.listNames.JCSubmission.name
            },
        ];
        this.jc_jcSubId = [];
        this.common.SetNewrelic('PubSupport', 'pubsupport', 'GetJCbyProjectCodeAndStatus');
        const arrResults = await this.spOperationsService.executeBatch(objData); // .subscribe(res => {
        this.jc_jcSubId = arrResults;
    }

    async getJCSubDetailsForResubmit() {
        const obj = Object.assign({}, this.pubsupportService.pubsupportComponent.jcSubmissionforResubmit);
        obj.filter = obj.filter.replace('{{ProjectCode}}', this.selectedProject.ProjectCode);
        const jcsEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.JCSubmission.name + '', obj);
        const objData = [
            {
                url: jcsEndpoint,
                type: 'GET',
                listName: this.constantService.listNames.JCSubmission.name
            }
        ];
        this.jcSubDetails = [];
        this.common.SetNewrelic('PubSupport', 'pubsupport', 'GetJCbyProjectCodeAndStatus');
        const arrResults = await this.spOperationsService.executeBatch(objData); // .subscribe(res => {
        this.jcSubDetails = arrResults;
    }

    async getProjectCode() {
        this.projectCodeRes = [];
        const obj = Object.assign({}, this.pubsupportService.pubsupportComponent.projectInfoCode);
        obj.filter = obj.filter.replace('{{ClientLegalEntity}}', this.selectedProject.ClientLegalEntity);
        const pinfoendpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.ProjectInformation.name + '', obj);
        const obj1 = [{
            url: pinfoendpoint,
            type: 'GET',
            listName: this.constantService.listNames.ProjectInformation.name
        }];
        this.common.SetNewrelic('PubSupport', 'pubsupport', 'GetProjectCodebyCLE');
        const res = await this.spOperationsService.executeBatch(obj1);
        this.projectCodeRes = res[0].retItems;
        console.log(this.projectCodeRes);
    }

    async updateAuthorFormsFiles(data) {
        if (data === '' || data === undefined) {
            this.updateAuthorFormField();
            this.submitted = false;
        }
        this.fileSourcePath = [];
        this.fileDestinationPath = [];
        // this.batchContents = [];
        if (data) {
            const projectCodeData: any = data;
            const found = this.cleDataArray.find(item => item.Title === projectCodeData.ClientLegalEntity);
            const fileEndPoint = this.globalObject.sharePointPageObject.webRelativeUrl + '/' + found.ListName + '/' + projectCodeData.ProjectCode + '/Publication Support/Forms/';
            this.common.SetNewrelic('PubSupport', 'pubsupport-updateAuthorForms', 'readFiles');
            this.filesToCopy = await this.spOperationsService.readFiles(fileEndPoint);
            if (this.filesToCopy.length) {
                this.noFileMsg = '';
                this.update_author_form.removeControl('file');
                this.filesToCopy.forEach(element => {
                    this.fileSourcePath.push(element.ServerRelativeUrl);
                    this.fileDestinationPath.push(this.globalObject.sharePointPageObject.webRelativeUrl + '/' + found.ListName + '/' + this.selectedProject.ProjectCode + '/Publication Support/Forms/' + element.Name);
                });
            } else {
                this.noFileMsg = 'There is no file to copy from selected project.';
            }
        }
    }

    containsObject(obj, list) {
        let sts;
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if (element.label === obj.label) {
                sts = true;
                return sts;
            } else {
                sts = false;
            }
        }
        return sts;
    }

    // Cancel Journal Conference
    async cancelJCDetails() {
        // console.info('this.jc_jcSubId ', this.jc_jcSubId);
        let SelectedRowJCItemId;
        let SelectedRowJCSubItemId;
        if (this.jc_jcSubId.length) {
            if (this.jc_jcSubId[0].retItems.length) {
                SelectedRowJCItemId = this.jc_jcSubId[0].retItems[0].ID;
            } else {

                this.common.showToastrMessage(this.constantService.MessageType.error, 'There is no line item available in Journal Conference Listname.', false)
                return;
            }
            if (this.jc_jcSubId[1].retItems.length) {
                SelectedRowJCSubItemId = this.jc_jcSubId[1].retItems[0].ID;
            } else {

                this.common.showToastrMessage(this.constantService.MessageType.error, 'There is no line item available in JCSubmission Listname.', false)
                return;
            }
        } else {
            this.common.showToastrMessage(this.constantService.MessageType.error, 'There is no line item available in Journal Conference / JCSubmission  Listname.', false)
            return;
        }

        // confirm() {
        this.common.confirmMessageDialog('Confirmation', 'Are you sure that you want to Cancel Journal Conference Details?', null, ['Yes', 'No'], false).then(async Confirmation => {
            if (Confirmation === 'Yes') {
                const piObj = {
                    __metadata: { type: this.constantService.listNames.ProjectInformation.type },
                    PubSupportStatus: ''
                };
                const piEndpoint = this.spOperationsService.getItemURL(this.constantService.listNames.ProjectInformation.name, this.selectedProject.Id);

                // Update JC
                const jcObj = {
                    __metadata: { type: this.constantService.listNames.JournalConf.type },
                    Status: 'Cancelled'
                };
                const jcEndpoint = this.spOperationsService.getItemURL(this.constantService.listNames.JournalConf.name, SelectedRowJCItemId);

                // Update JCSubmission
                const jcSubObj = {
                    __metadata: { type: this.constantService.listNames.JCSubmission.type },
                    Status: 'Cancelled'
                };
                const jcSubEndpoint = this.spOperationsService.getItemURL(this.constantService.listNames.JCSubmission.name, SelectedRowJCSubItemId);

                const data = [
                    {
                        data: piObj,
                        url: piEndpoint,
                        type: 'PATCH',
                        listName: this.constantService.listNames.ProjectInformation.name
                    },
                    {
                        data: jcObj,
                        url: jcEndpoint,
                        type: 'PATCH',
                        listName: this.constantService.listNames.JournalConf.name
                    },
                    {
                        data: jcSubObj,
                        url: jcSubEndpoint,
                        type: 'PATCH',
                        listName: this.constantService.listNames.JCSubmission.name
                    }
                ];
                this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
                this.submit(data, 'cancelJC');
            }
        });

    }

    onChangeSelectedType(type: any) {
        console.log('type ', type);
        this.journal_Conference_Detail_form.get('jcLineItem').setValue('');
        this.getJCList(type);
    }

    async getJCList(type: string) {
        if (!type) {
            this.jcListArray = [];
            return false;
        }
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
        let endpoint;
        let jcObj = [];
        if (type.toLowerCase() === 'journal') {
            this.optionLabel.title = 'JournalName';
            endpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.Journal.name + '', this.pubsupportService.pubsupportComponent.journal);
            jcObj = [{
                url: endpoint,
                type: 'GET',
                listName: this.constantService.listNames.Journal.name
            }];
        } else if (type.toLowerCase() === 'conference') {
            this.optionLabel.title = 'ConferenceName';
            endpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.Conference.name + '', this.pubsupportService.pubsupportComponent.conference);
            jcObj = [{
                url: endpoint,
                type: 'GET',
                listName: this.constantService.listNames.Conference.name
            }];
        }
        const res = await this.spOperationsService.executeBatch(jcObj);
        if (res.length && res[0].retItems.hasError) {

            this.common.showToastrMessage(this.constantService.MessageType.error, res[0].retItems.message.value, false);
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
            return;
        } else if (res.length && res[0].retItems) {
            this.jcListArray = res[0].retItems;
            console.log('this.jcListArray ', this.jcListArray);
        }
        if (res.length && res[0].retItems) {
            if (type === 'Journal') {
                this.jcListArray = this.sortJournalData(res[0].retItems);
            } else if (type === 'Conference') {
                this.jcListArray = this.sortConferenceData(res[0].retItems);
            }
        }
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
    }

    sortJournalData(array: any) {
        return array.sort((a, b) => {
            if (a.JournalName && a.JournalName !== null && b.JournalName && b.JournalName !== null) {
                if (a.JournalName.toLowerCase() < b.JournalName.toLowerCase()) {
                    return -1;
                }
                if (a.JournalName.toLowerCase() > b.JournalName.toLowerCase()) {
                    return 1;
                }
            }
            return 0;
        });
    }

    sortConferenceData(array: any) {
        return array.sort((a, b) => {
            if (a.ConferenceName && a.ConferenceName !== null && b.ConferenceName && b.ConferenceName !== null) {
                if (a.ConferenceName.toLowerCase() < b.ConferenceName.toLowerCase()) {
                    return -1;
                }
                if (a.ConferenceName.toLowerCase() > b.ConferenceName.toLowerCase()) {
                    return 1;
                }
            }
            return 0;
        });
    }

    addJCControls(form: any, type: string, actionType: string) {
        actionType === 'Add' ? form.addControl('UserName', new FormControl('')) : form.addControl('UserName', new FormControl([''], Validators.required));
        actionType === 'Add' ? form.addControl('Password', new FormControl('')) : form.addControl('Password', new FormControl([''], Validators.required));
        if (type.toLowerCase() === 'journal') {
            // tslint:disable-next-line: max-line-length
            form.addControl('ExpectedReviewPeriod', new FormControl([''], Validators.required));
            form.addControl('IF', new FormControl([''], Validators.required));
            form.addControl('RejectionRate', new FormControl([''], Validators.required));
            form.addControl('Comments', new FormControl([''], Validators.required));
            form.addControl('JournalEditorInfo', new FormControl([''], Validators.required));
            // Remove Conference Form
            form.removeControl('CongressDate');
            form.removeControl('AbstractSubmissionDeadline');
        } else {
            // tslint:disable-next-line: max-line-length
            form.addControl('CongressDate', new FormControl(new Date(), [Validators.required]));
            form.addControl('AbstractSubmissionDeadline', new FormControl(new Date(), [Validators.required]));
            form.addControl('Comments', new FormControl([''], Validators.required));
            // Remove Journal Form
            form.removeControl('ExpectedReviewPeriod');
            form.removeControl('IF');
            form.removeControl('RejectionRate');
            form.removeControl('JournalEditorInfo');
        }
        form.updateValueAndValidity();
    }

    setJCValue(form: any, item: any, type: string) {
        if (item.value) {
            if (type === 'Journal') {
                // Set New Values
                form.get('Name').setValue(item.value.JournalName);
                form.get('ExpectedReviewPeriod').setValue(item.value.ExpectedReviewPeriod);
                form.get('IF').setValue(item.value.ImpactFactor);
                form.get('RejectionRate').setValue(item.value.RejectionRate);
                form.get('Comments').setValue(item.value.CommentsMT);
                form.get('JournalEditorInfo').setValue(item.value.JournalEditorInfo);
            } else {
                form.get('Name').setValue(item.value.ConferenceName);
                form.get('CongressDate').setValue(this.datePipe.transform(new Date(item.value.ConferenceDate), 'MMM dd, yyyy'));
                form.get('AbstractSubmissionDeadline').setValue(this.datePipe.transform(new Date(item.value.SubmissionDeadline), 'MMM dd, yyyy'));
                form.get('Comments').setValue(item.value.CommentsMT);
            }
            this.journal_Conference_Detail_form.updateValueAndValidity();
        }
    }

    onChangeSelectedJCItem(item: any, type: string) {
        this.addJCControls(this.journal_Conference_Detail_form, type, 'Add');
        this.setJCValue(this.journal_Conference_Detail_form, item, type);
    }

    createJC() {
        const type = this.journal_Conference_Detail_form.get('EntryType').value;
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
        if (type === 'Journal') {
            const ref = this.dialogService.open(CreateJournalComponent, {
                data: this.jcListArray,
                closable: false,
                header: 'Create Journal',
                width: '85%'
            });

            ref.onClose.subscribe((journal) => {
                if (journal) {
                    this.common.showToastrMessage(this.constantService.MessageType.success, 'Journal Created.', false)
                    this.getJCList('journal');
                }
            });
        } else if (type === 'Conference') {

            const ref = this.dialogService.open(CreateConferenceComponent, {
                data: this.jcListArray,
                closable: false,
                header: 'Create Conference',
                width: '85%'
            });

            ref.onClose.subscribe((conference) => {
                if (conference) {
                    this.common.showToastrMessage(this.constantService.MessageType.success, 'Conference Created.', false);
                    this.getJCList('conference');
                }
            });

        } else {
            this.common.showToastrMessage(this.constantService.MessageType.warn, 'Please select document type & try again.', false);
            return;
        }
    }

    cancelFormSub(formType) {
        if (formType === 'addJCDetailsModal') {
            this.addJCDetailsModal = false;
            this.journal_Conference_Detail_form.reset();
        } else if (formType === 'editJCDetailsModal') {
            this.editJCDetailsModal = false;
            this.journal_Conference_Edit_Detail_form.reset();
        } else if (formType === 'updateJCRequirementModal') {
            this.updateJCRequirementModal = false;
            this.update_Journal_Requirement_form.reset();
        } else if (formType === 'updateAuthorModal') {
            // if (this.update_author_form.controls.hasOwnProperty('file') ||
            // this.update_author_form.controls.hasOwnProperty('existingAuthorList')) {
            //     this.update_author_form.reset();
            // }
            this.updateAuthorFormField();
            this.filesToCopy = [];
            this.noFileMsg = '';
            this.updateAuthorModal_1 = false;
        } else if (formType === 'updateDecisionModal') {
            this.updateDecisionModal = false;
            this.update_decision_details.reset();
        } else if (formType === 'updatePublicatoinModal') {
            this.updatePublicatoinModal = false;
            this.update_publication_form.reset();
        } else if (formType === 'overrideGalleyModal') {
            this.overrideGalleyModal = false;
            this.galley_form.reset();
        } else if (formType == 'replaceDocument') {
            this.replaceDocument = false;
            this.replace_Document_Form.reset();
        }
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
    }

    // Modal Submit
   

    async submit(dataEndpointArray, type: string) {

        if (type === 'addJCDetailsModal' || type === 'addAuthor' || type === 'updateDecision' || type === 'galley' ||
            type === 'updatePublication' || type === 'cancelJC' || type === 'updateJCRequirementModal' || type === 'editJCDetailsModal' || type === 'replaceDocument' || type === 'revertDecision') {

            this.common.SetNewrelic('PubSupport', 'pubsupport', 'CancelJSR');
            const result = await this.spOperationsService.executeBatch(dataEndpointArray);
            let res: any = {};
            if (result.length) {
                res = result[0].retItems;
            }
            if (res.hasOwnProperty('hasError')) {
                this.common.showToastrMessage(this.constantService.MessageType.error, res.message.value, false);
            } else if (type === 'addJCDetailsModal') {
                console.log('res ', res);
                this.updateProjectSts_JCSubmissionDetails(res, type);
            } else if (type === 'editJCDetailsModal') {
                this.common.showToastrMessage(this.constantService.MessageType.success, 'Journal/Conference details updated.', false);
                this.editJCDetailsModal = false;
                this.reload();
            } else if (type === 'updateDecision') {
                this.update_decision_details.reset();
                this.common.showToastrMessage(this.constantService.MessageType.success, 'Updated Decision', false);
                this.updateDecisionModal = false;
                this.reload();
            } else if (type === 'galley') {
                this.galley_form.reset();
                this.common.showToastrMessage(this.constantService.MessageType.success, 'Galley Overrided.', false);
                this.overrideGalleyModal = false;
                this.reload();
            } else if (type === 'updatePublication') {
                this.update_publication_form.reset();
                this.common.showToastrMessage(this.constantService.MessageType.success, 'Publication details Updated.', false);
                this.updatePublicatoinModal = false;
                this.reload();
            } else if (type === 'cancelJC') {
                this.common.showToastrMessage(this.constantService.MessageType.success, 'Journal Conference Cancelled.', false);
                this.reload();
            } else if (type === 'updateJCRequirementModal') {
                this.common.showToastrMessage(this.constantService.MessageType.success, 'Journal requirement response document updated.', false);
                this.updateJCRequirementModal = false;
                this.reload();
            } else if (type === "replaceDocument") {
                let msgType = this.updatedMsg(this.type)  
                this.common.showToastrMessage(this.constantService.MessageType.success, msgType , false);
                this.replaceDocument = false;
                this.reload();
            } else if (type === 'revertDecision') {
                this.common.showToastrMessage(this.constantService.MessageType.success, 'Updated Decision', false);
                this.reload();
            }
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
            return;
        }
    }

    async updateProjectSts_JCSubmissionDetails(res: any, type: string) {
        const projEndpoint = this.spOperationsService.getItemURL(this.constantService.listNames.ProjectInformation.name, this.selectedProject.Id);
        const projObj: any = {
            __metadata: {
                type: this.constantService.listNames.ProjectInformation.type
            },
            PubSupportStatus: 'Selected'
        };
        projObj.__metadata = { type: this.constantService.listNames.ProjectInformation.type };
        const piObj = {
            data: projObj,
            url: projEndpoint,
            type: 'PATCH',
            listName: this.constantService.listNames.ProjectInformation.name
        };

        // Update JCSubmission
        const jcSubEndpoint = this.spOperationsService.getReadURL(this.constantService.listNames.JCSubmission.name);
        const jcSubObj: any = {
            JCID: res.ID,
            Title: res.Title,
            Status: res.Status
        };
        jcSubObj.__metadata = { type: this.constantService.listNames.JCSubmission.type };
        const jcsObj = {
            data: jcSubObj,
            url: jcSubEndpoint,
            type: 'POST',
            listName: this.constantService.listNames.JCSubmission.name
        };

        const arr = [];
        arr.push(piObj, jcsObj);
        this.common.SetNewrelic('PubSupport', 'pubsupport', 'updateProjectSts_JCSubmissionDetails');
        const result = await this.spOperationsService.executeBatch(arr);
        const result1 = result[0].retItems;
        if (result1.hasError) {
            this.common.showToastrMessage(this.constantService.MessageType.error, res.message.value, false);
        } else if (type === 'addJCDetailsModal') {
            let entryTypeJC = '';
            if (this.journal_Conference_Detail_form.value.EntryType.toLowerCase() === 'journal') {
                entryTypeJC = 'Journal Submitted.';
            } else if (this.journal_Conference_Detail_form.value.EntryType.toLowerCase() === 'conference') {
                entryTypeJC = 'Conference Submitted.';
            }
            this.common.showToastrMessage(this.constantService.MessageType.success, entryTypeJC, false);
            this.addJCDetailsModal = false;
            this.reload();
        }
    }

    updateProjectInfo(res: any, type: string) {
        // const endpoint = this.pubsupportService.pubsupportComponent.updateProjectInfo.updateProjInfo
        //     .replace('{{projectId}}', this.selectedProject.Id);
        // tslint:disable-next-line: max-line-length
        const endpoint = this.spOperationsService.getItemURL(this.constantService.listNames.ProjectInformation.name, this.selectedProject.Id);
        const obj: any = {};
        if (type === 'updateDecision') {
            obj.PubSupportStatus = this.update_decision_details.value.Decision;
        } else if (type === 'galley') {
            obj.PubSupportStatus = 'Galleyed';
        } else if (type === 'updatePublication') {
            obj.PubSupportStatus = 'Published';
        }
        obj.__metadata = { type: this.constantService.listNames.ProjectInformation.type };
        return {
            data: obj,
            url: endpoint,
            type: 'PATCH',
            listName: this.constantService.listNames.ProjectInformation.name
        };
    }

    updateJCSubmissionDetails(fileUrl: string, type: string) {
        let jcSubId;
        this.jc_jcSubId[1].retItems.forEach(element => {
            if (element) {
                jcSubId = element.ID;
            }
        });
        // const endpoint = this.pubsupportService.pubsupportComponent.addJCSubmission.updateJCSubmssion.replace('{{Id}}', jcSubId);
        const endpoint = this.spOperationsService.getItemURL(this.constantService.listNames.JCSubmission.name, jcSubId);
        const obj: any = {};
        if (type === 'updateDecision') {
            obj.DecisionURL = fileUrl;
            obj.DecisionDate = new Date();
            obj.Status = this.update_decision_details.value.Decision;
            obj.Decision = this.update_decision_details.value.Decision;
        } else if (type === 'galley') {
            obj.Status = 'Galleyed';
        } else if (type === 'updatePublication') {
            obj.Status = 'Published';
        }
        obj.__metadata = { type: this.constantService.listNames.JCSubmission.type };
        return {
            data: obj,
            url: endpoint,
            type: 'PATCH',
            listName: this.constantService.listNames.JCSubmission.name
        };
    }

    addJCSubmission() {
        const jcSubEndpoint = this.spOperationsService.getReadURL(this.constantService.listNames.JCSubmission.name);
        const jcSubObj: any = {
            JCID: this.jcId,
            Title: this.selectedProject.ProjectCode,
            Status: 'Selected'
        };
        jcSubObj.__metadata = { type: this.constantService.listNames.JCSubmission.type };
        return {
            data: jcSubObj,
            url: jcSubEndpoint,
            type: 'POST',
            listName: this.constantService.listNames.JCSubmission.name
        };
    }

    updateJCDetails(fileUrl: string, type: string) {
        this.jc_jcSubId[0].retItems.forEach(element => {
            if (element) {
                this.jcId = element.ID;
            }
        });
        // const endpoint = this.pubsupportService.pubsupportComponent.addJC.updateJCDetails.replace('{{Id}}', this.jcId);
        const endpoint = this.spOperationsService.getItemURL(this.constantService.listNames.JournalConf.name, this.jcId);
        const obj: any = {};
        if (type === 'updateDecision') {
            obj.Status = this.update_decision_details.value.Decision;
        } else if (type === 'galley') {
            obj.Status = 'Galleyed';
        } else if (type === 'updatePublication') {
            obj.Status = 'Published';
            obj.PublicationDate = new Date();
            obj.PublicationURL = fileUrl;
            obj.PublicationTitle = this.update_publication_form.value.PublicationTitle;
            obj.Citation = this.update_publication_form.value.Citation;
            obj.PDFAvailable = this.update_publication_form.value.PDFAvailable;
        }
        obj.__metadata = { type: this.constantService.listNames.JournalConf.type };
        return {
            data: obj,
            url: endpoint,
            type: 'PATCH',
            listName: this.constantService.listNames.JournalConf.name
        };
    }

    addJCGalley(fileUrl: string) {
        let jcSubId;
        this.jc_jcSubId[1].retItems.forEach(element => {
            if (element) {
                jcSubId = element.ID;
            }
        });
        const jcGalleyEndpoint = this.spOperationsService.getReadURL(this.constantService.listNames.JCGalley.name);
        const jcGalleyObj: any = {
            Title: this.selectedProject.ProjectCode,
            JCSubmissionID: jcSubId,
            GalleyDate: new Date(),
            GalleyURL: fileUrl
        };
        jcGalleyObj.__metadata = { type: this.constantService.listNames.JCGalley.type };
        return {
            data: jcGalleyObj,
            url: jcGalleyEndpoint,
            type: 'POST',
            listName: this.constantService.listNames.JCGalley.name
        };
    }


    // On Row Expand
    onRowExpand(psProject: any) {
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
        this.showHideJC = false;
        this.showHideJC = true;
        setTimeout(async ()=>{
            // this.journalConfDetails.selectedProject = project.data;
            await this.journalConfDetails.getJCDetails(psProject.data)
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
        },50)
        // this.state = false;
        // this.parentRowIndex = psProject.data.id - 1;
        // this.showSubDetails = false;

    }

    async getJCDetails(project: any) {
        // this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
        this.selectedProject = project;
        const obj = Object.assign({}, this.pubsupportService.pubsupportComponent.journalConf);
        obj.filter = obj.filter.replace('{{ProjectCode}}', this.selectedProject.ProjectCode);
        const jcEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.JournalConf.name + '', obj);
        const jcObj = [{
            url: jcEndpoint,
            type: 'GET',
            listName: this.constantService.listNames.JournalConf.name
        }];
        this.common.SetNewrelic('PubSupport', 'pubsupport', 'GetJCDetailsbyProjectCode');
        const res = await this.spOperationsService.executeBatch(jcObj);
        const jsData = res[0].retItems;
        this.journal_Conf_data = [];
        // tslint:disable-next-line:prefer-for-of
        for (let jc = 0; jc < jsData.length; jc++) {
            const element = jsData[jc];
            this.journal_Conf_data.push({
                element,
                project: this.selectedProject
            });
        }
        this.journal_Conf_data = [...this.journal_Conf_data];
        console.log('this.journal_Conf_data ', this.journal_Conf_data);
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
        this.showHideJC = true;
    }
    
    // On Click of Project code
    goToProjectDetails(data: any) {
        window.open(this.globalObject.sharePointPageObject.webRelativeUrl + '/dashboard#/projectMgmt/allProjects?ProjectCode=' +
            data.ProjectCode);
    }

    submissionDetails(index: number) {
        setTimeout(() => {
            this.isSubmisssionDetails = true;
        }, 2000);
    }

    //********************************************************************************************
    // new File uplad function updated by Maxwell
    // *******************************************************************************************

    onFileChange(event) {
        // this.fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.SelectedFile = [];
            this.selectedFile = event.target.files[0];

            let folderPath = '/Publication Support/Published Papers';
            if (event.target.placeholder === 'updateAuthorForms') {
                folderPath = '/Publication Support/Forms';
                this.update_author_form.removeControl('existingAuthorList');
            }
            this.FolderName = this.selectedProject.ProjectFolder.replace(this.globalObject.sharePointPageObject.webRelativeUrl + '/', '') + folderPath;
            this.SelectedFile.push(new Object({ name: this.selectedFile.name, file: this.selectedFile }));
            this.update_author_form.updateValueAndValidity();
        }
    }


    async uploadFileData(type: string) {
        this.common.SetNewrelic('PubSupport', 'pubsupport', 'UploadFile');
        this.common.UploadFilesProgress(this.SelectedFile, this.FolderName, true).then(async uploadedfile => {
            if (this.SelectedFile.length > 0 && this.SelectedFile.length === uploadedfile.length) {
                if (uploadedfile[0].hasOwnProperty('odata.error')) {
                    this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
                    this.submitBtn.isClicked = false;
                    this.common.showToastrMessage(this.constantService.MessageType.error, this.constantService.Messages.FileNotUploaded, false);
                    return;
                } else if (uploadedfile[0].ServerRelativeUrl && type !== 'updateAuthors') {

                    if (type === 'updateJCRequirementModal') {
                        const objData = {
                            JournalRequirementResponse: uploadedfile[0].ServerRelativeUrl
                        };
                        objData['__metadata'] = { type: this.constantService.listNames.JournalConf.type };

                        this.jc_jcSubId[0].retItems.forEach(element => {
                            if (element) {
                                this.jcId = element.ID;
                            }
                        });

                        const endpoint = this.spOperationsService.getItemURL(this.constantService.listNames.JournalConf.name, this.jcId);
                        let data = [];
                        if (uploadedfile[0].ServerRelativeUrl) {
                            data = [{
                                data: objData,
                                url: endpoint,
                                type: 'PATCH',
                                listName: this.constantService.listNames.JournalConf.name
                            }];
                        }
                        this.submit(data, type);
                    } else if(type === 'replaceDocument') {
                        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
                        console.log(uploadedfile);
                        let data = [];

                        switch(this.type){
                            case 'DecisionURL':
                            case 'SubmissionURL':
                            case 'SubmissionPkgURL':
                            let jcSubId;
                            this.jc_jcSubId[1].retItems.forEach(element => {
                                if (element) {
                                    jcSubId = element.ID;
                                }
                            });
                            data = this.setUploadFileUrl(this.constantService.listNames.JCSubmission,jcSubId,uploadedfile[0].ServerRelativeUrl,this.type)
                            break;
                            case 'JournalRequirementURL':
                            case 'JournalRequirementResponse':
                            case 'PublicationURL':
                            let jcId;

                            this.jc_jcSubId[0].retItems.forEach(element => {
                                if (element) {
                                    jcId = element.ID;
                                }
                            });
                            data = this.setUploadFileUrl(this.constantService.listNames.JournalConf,jcId,uploadedfile[0].ServerRelativeUrl,this.type);
                            break;
                            case 'JournalSelectionURL':
                            data = this.setUploadFileUrl(this.constantService.listNames.ProjectInformation,this.selectedProject.Id,uploadedfile[0].ServerRelativeUrl,this.type)
                            break;
                            case 'GalleyURL':
                            let subId;
                            let galleyId;
                            this.jc_jcSubId[1].retItems.forEach(element => {
                                if (element) {
                                    subId = element.ID;
                                }
                            });   
                            await this.getGalleyDetails(subId);
                            this.jcGalleyDetails[0].retItems.forEach(element => {
                                if (element) {
                                    galleyId = element.ID;
                                }
                            });
                            console.log(this.jcGalleyDetails);                    
                            data = await this.setUploadFileUrl(this.constantService.listNames.JCGalley,galleyId,uploadedfile[0].ServerRelativeUrl,this.type)
                            break;
                        }
                      
                        this.submit(data, type);

                    } else {
                        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
                        const arrayUpdateData = [];
                        const data1 = this.updateProjectInfo(uploadedfile[0].ServerRelativeUrl, type);
                        const data2 = this.updateJCSubmissionDetails(uploadedfile[0].ServerRelativeUrl, type);
                        const data3 = this.updateJCDetails(uploadedfile[0].ServerRelativeUrl, type);
                        let data4 = {};
                        if (this.update_decision_details.value.Decision === 'Resubmit to same journal') {
                            data4 = this.addJCSubmission();
                        }
                        if (type === 'galley') {
                            data4 = this.addJCGalley(uploadedfile[0].ServerRelativeUrl);
                        }
                        arrayUpdateData.push(data1, data2, data3, data4);
                        this.submit(arrayUpdateData, type);
                    }
                }

                if (type === 'updateAuthors') {
                    this.common.showToastrMessage(this.constantService.MessageType.success, 'Author details updated.', false);
                    this.updateAuthorModal_1 = false;
                    this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
                }
            }
        })
    }

    setUploadFileUrl(list,filterId, fileUrl,col_name) {
        const objData: any = {}
        const endpoint = this.spOperationsService.getItemURL(list.name,filterId);
        let data = [];
        if (fileUrl) {
            objData[col_name] = fileUrl;
            objData.__metadata = { type: list.type };
            data = [{
                data: objData,
                url: endpoint,
                type: 'PATCH',
                listName: list.name
            }];
            return data;
        }
    }

    async onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        this.submitBtn.isClicked = true;
        this.submitted = true;
        if (type === 'addJCDetailsModal') {
            if (this.journal_Conference_Detail_form.invalid) {
                this.submitBtn.isClicked = false;
                return;
            }
            this.submitBtn.isClicked = true;
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
            const obj = this.journal_Conference_Detail_form.getRawValue();
            /* tslint:disable:no-string-literal */
            obj['Status'] = 'Selected';
            obj['Title'] = this.selectedProject.ProjectCode;
            delete obj['jcLineItem'];
            // Added by Arvind
            obj['NameST'] = obj['Name'];
            delete obj['Name'];
            obj['CommentsMT'] = obj['Comments'];
            delete obj['Comments'];
            obj['UserNameST'] = obj['UserName'];
            delete obj['UserName'];
            // Arvind code end here
            obj['JournalConferenceId'] = this.journal_Conference_Detail_form.getRawValue().jcLineItem.ID;
            obj['__metadata'] = { type: this.constantService.listNames.JournalConf.type };
            /* tslint:enable:no-string-literal */
            const endpoint = this.spOperationsService.getReadURL(this.constantService.listNames.JournalConf.name);
            const data = [{
                data: obj,
                url: endpoint,
                type: 'POST',
                listName: this.constantService.listNames.JournalConf.name
            }];
            this.submit(data, type);
        } else if (type === 'editJCDetailsModal') {
            if (this.journal_Conference_Edit_Detail_form.invalid) {
                this.submitBtn.isClicked = false;
                return;
            }
            this.submitBtn.isClicked = true;
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
            const obj = this.journal_Conference_Edit_Detail_form.getRawValue();
            /* tslint:disable:no-string-literal */
            delete obj['jcLineItemName'];
            delete obj['EntryType'];
            //Added by Arvind
            obj['NameST'] = obj['Name'];
            delete obj['Name'];
            obj['CommentsMT'] = obj['Comments'];
            delete obj['Comments'];
            obj['UserNameST'] = obj['UserName'];
            delete obj['UserName'];
            //Arvind code end here
            obj['__metadata'] = { type: this.constantService.listNames.JournalConf.type };
    
            /* tslint:enable:no-string-literal */
            const endpoint = this.spOperationsService.getItemURL(this.constantService.listNames.JournalConf.name, this.journal_Conf_data[0].element.ID);
            const data = [{
                data: obj,
                url: endpoint,
                type: 'PATCH',
                listName: this.constantService.listNames.JournalConf.name
            }];
            this.submit(data, type);
        } else if (type === 'updateJCRequirementModal') {
            if (this.update_Journal_Requirement_form.invalid) {
                this.submitBtn.isClicked = false;
                return;
            } else if (this.selectedFile && this.selectedFile.size === 0) {
                this.errorMessage();
                return;
            }
            this.submitBtn.isClicked = true;
            this.uploadFileData('updateJCRequirementModal');
        } else if (type === 'updateAuthor') {
    
            // stop here if form is invalid
            if (this.update_author_form.invalid) {
                this.submitBtn.isClicked = false;
                return;
            }
            this.submitBtn.isSubmit = true;
            // this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
            if (this.filesToCopy.length) {
                this.common.showToastrMessage(this.constantService.MessageType.warn, 'Files are copying from ' + this.selectedType.ProjectCode + ' to ' + this.selectedProject.ProjectCode, false);  
                this.update_author_form.removeControl('file');
                this.common.SetNewrelic('Pubsupport', 'pubsupport-onsubmit', 'copyFiles');
                const fileCopyEndPoint = await this.spOperationsService.copyFiles(this.fileSourcePath, this.fileDestinationPath);
                this.common.clearToastrMessage();
                this.common.showToastrMessage(this.constantService.MessageType.success, 'Author details updated.', false);
    this.updateAuthorModal_1 = false;
                // this.reload();
            } else {
                if (this.selectedFile && this.selectedFile.size === 0) {
                    this.errorMessage();
                    this.submitBtn.isClicked = false;
                    return;
                }
                this.uploadFileData('updateAuthors');
            }
    
        } else if (type === 'updateDecision') {
    
            // stop here if form is invalid
            if (this.update_decision_details.invalid) {
                this.submitBtn.isClicked = false;
                return;
            } else if (this.selectedFile && this.selectedFile.size === 0) {
                this.errorMessage();
                return;
            }
            this.submitBtn.isClicked = true;
            this.uploadFileData('updateDecision');
    
        } else if (type === 'updatePublication') {
    
            // stop here if form is invalid
            if (this.update_publication_form.invalid) {
                this.submitBtn.isClicked = false;
                return;
            } else if (this.selectedFile && this.selectedFile.size === 0) {
                this.errorMessage();
                return;
            }
            this.submitBtn.isClicked = true;
            this.uploadFileData('updatePublication');
    
        } else if (type === 'galley') {
    
            // stop here if form is invalid
            if (this.galley_form.invalid) {
                this.submitBtn.isClicked = false;
                return;
            } else if (this.selectedFile && this.selectedFile.size === 0) {
                this.errorMessage();
                return;
            }
            this.submitBtn.isClicked = true;
            this.submitBtn.isSubmit = true;
            this.uploadFileData('galley');
        } else if (type == 'replaceDocument') {
            if (this.replace_Document_Form.invalid) {
                this.submitBtn.isClicked = false;
                return;
            } else if (this.selectedFile && this.selectedFile.size === 0) {
                this.errorMessage();
                return;
            }
            this.submitBtn.isClicked = true;
            this.submitBtn.isSubmit = true;
            this.uploadFileData('replaceDocument');
        }
    }

    errorMessage() {

        this.common.showToastrMessage(this.constantService.MessageType.error, this.constantService.Messages.ZeroKbFile.replace('{{fileName}}', this.selectedFile.name), false);
        this.submitBtn.isClicked = false;
    }

    // TO update data after submit just call method name in DoCheck mothod
    // tslint:disable-next-line:use-life-cycle-interface
    ngDoCheck() { }

    reload() {
        // setTimeout(() => {
        //     this.router.navigated = false;
        //     this.router.navigate([this.router.url]);
        // }, 5000);

        setTimeout(() => {
            this.callGetProjects(false);
            if(this.showHideJC) {
                this.dt.expandedRowKeys[this.selectedProject.Id] = false;
                this.expandedRows = this.dt.expandedRowKeys;
                // this.showHideJC = false;
            }
        }, 3000);
        // this.router.navigated = false;
        // this.router.navigate([this.router.url]);
    }

    async openAuthorModal(projectObj: any) {

        const ref = this.dialogService.open(AuthorDetailsComponent, {
            header: 'Authors & Authors Form - ' + projectObj.ProjectCode,
            width: '80%',
            data: {
              projectObj
            },
            contentStyle: { 'max-height': '450px', 'overflow-y': 'auto' },
            closable: true
          });
          ref.onClose.subscribe(element => {
        });

        // const factory = this.componentFactoryResolver.resolveComponentFactory(AuthorDetailsComponent);
        // const componentRef = this.authorDetailscontainer.createComponent(factory);
        // componentRef.instance.events = data;
        // this.ref = componentRef;
        // // componentRef.instance.formType = 'addAuthor';
        // return;
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngOnDestroy() {
        // avoid memory leaks here by cleaning up after ourselves. If we don't then we will
        // continue to run our initialiseInvites() method on every navigationEnd event.
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }

    onChangeSelect(event) {
        if (this.selectedOption.name === 'Open') {
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
            this.showProjectInput = false;
            this.callGetProjects(false);
        } else {
            this.closedProjectCode = '';
            this.showProjectInput = true;
            this.pubSupportProjectInfoData = [];
            this.providedProjectCode = '';
        }
    }
    searchClosedProject(event) {
        const checkPC = this.providedProjectCode;
        if (checkPC !== this.closedProjectCode) {
            this.getClosedProject();
        }
    }
    enterEvent(event) {
        this.closedProjectCode = this.providedProjectCode;
        this.getClosedProject();
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    }

    getClosedProject() {
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
        this.callGetProjects(true);
    }

    revertFromDecision(data) {
        let data1 = [];
        const options = {
          data: null,
          url: '',
          type: '',
          listName: ''
        };

        let jcId;

        this.jc_jcSubId[0].retItems.forEach(element => {
            if (element) {
                jcId = element.ID;
            }
        });
        
        const piObj = {
            __metadata: { type: this.constantService.listNames.ProjectInformation.type },
            PubSupportStatus: 'Submitted'
        };
        const piEndpoint = this.spOperationsService.getItemURL(this.constantService.listNames.ProjectInformation.name, this.selectedProject.Id);

        // Update JC
        const jcObj = {
            __metadata: { type: this.constantService.listNames.JournalConf.type },
            Status: 'Submitted'
        };
        const jcEndpoint = this.spOperationsService.getItemURL(this.constantService.listNames.JournalConf.name, jcId);

        data1 = [
            {
                data: piObj,
                url: piEndpoint,
                type: 'PATCH',
                listName: this.constantService.listNames.ProjectInformation.name
            },
            {
                data: jcObj,
                url: jcEndpoint,
                type: 'PATCH',
                listName: this.constantService.listNames.JournalConf.name
            }
        ];   

        if(data.PubSupportStatus === 'Resubmit to same journal') {
    
            const jcSubUpdate1 = {
                __metadata: { type: this.constantService.listNames.JCSubmission.type },
                Status: 'Submitted',
                DecisionURL : '',
                DecisionDate : null,
                Decision : ''
            }
            
            const jcSubUpdate2 = {
                __metadata: { type: this.constantService.listNames.JCSubmission.type },
                Status: 'Deleted',
            }

            this.jcSubDetails[0].retItems.forEach(element => {
                if(element.Status == 'Resubmit to same journal') {
                    const jcSubObj = Object.assign({},options);
                    jcSubObj.data = jcSubUpdate1
                    jcSubObj.listName = this.constantService.listNames.JCSubmission.name,
                    jcSubObj.type = 'PATCH',
                    jcSubObj.url = this.spOperationsService.getItemURL(this.constantService.listNames.JCSubmission.name, element.ID)
                    data1.push(jcSubObj);
                } else {
                    const jcSubObj = Object.assign({},options);
                    jcSubObj.data = jcSubUpdate2
                    jcSubObj.listName = this.constantService.listNames.JCSubmission.name,
                    jcSubObj.type = 'PATCH',
                    jcSubObj.url = this.spOperationsService.getItemURL(this.constantService.listNames.JCSubmission.name, element.ID)
                    data1.push(jcSubObj);
                }
            });

        } else {   

            const jcSubUpdate = {
                __metadata: { type: this.constantService.listNames.JCSubmission.type },
                Status: 'Submitted',
                DecisionURL : '',
                DecisionDate : null,
                Decision : ''
            }
        
            this.jc_jcSubId[1].retItems.forEach(element => {
                if (element) {
                    const jcSubObj = Object.assign({},options);
                    jcSubObj.data = jcSubUpdate;
                    jcSubObj.listName = this.constantService.listNames.JCSubmission.name;
                    jcSubObj.type = 'PATCH';
                    jcSubObj.url = this.spOperationsService.getItemURL(this.constantService.listNames.JCSubmission.name, element.ID)
                    data1.push(jcSubObj);
                }
            });
            
        }

        
        console.log(data1) 
        this.submit(data1 , 'revertDecision');
    }

    replaceFile(type, project,milestone) {
        // this.getJC_JCSubID();
        this.selectedProject = project;
        this.folderPath = '';
        this.type = type;
        switch(type) {
            case 'JournalRequirementResponse' :
            case 'Decision' :
            this.folderPath = this.selectedProject.ProjectFolder.replace(this.globalObject.sharePointPageObject.webRelativeUrl + '/', '') + '/Publication Support/Published Papers';
            break;
            default:
            this.folderPath = this.selectedProject.ProjectFolder.replace(this.globalObject.sharePointPageObject.webRelativeUrl + '/', '') + '/Drafts/Internal/' + milestone;
            break;
        }
        this.replaceDocument = true;
    }

    async onReplaceFile(event) {
        if (event.target.files && event.target.files.length > 0) {
            await this.getJC_JCSubID();

            this.SelectedFile = [];
            this.selectedFile = event.target.files[0];
            let fileName = event.target.files[0].name;

            this.FolderName = this.folderPath;
            fileName = fileName.split(/\.(?=[^\.]+$)/)[0] + '.' + this.datePipe.transform(new Date(),
              'ddMMyyyyhhmmss') + '.' + fileName.split(/\.(?=[^\.]+$)/)[1];
            this.SelectedFile.push(new Object({ name: fileName, file: this.selectedFile }));
            console.log(this.FolderName , this.SelectedFile);
        }
    }

    updatedMsg(type) {
        let msg = '';
        switch (type) {
            case 'JournalRequirementURL' :
             msg = 'Journal requirement document updated.'
            break;
            case 'JournalRequirementResponse' :
             msg = 'Journal requirement response document updated.'
            break;
            case 'JournalSelectionURL' :
             msg = 'Journal selection document updated.'
            break;
            case 'PublicationURL' :
             msg = 'Publication document updated.'
            break;
            case 'SubmissionPkgURL' :
             msg = 'Submission Pkg document updated.'
            break;
            case 'SubmissionURL' :
             msg = 'Submission document updated.'
            break;
            case 'DecisionURL' :
             msg = 'Decision document updated.'
            break;
            case 'GalleyURL' :
             msg = 'Galley document updated.'
            break;
        }
        return msg;
    }

    @HostListener('document:click', ['$event'])
    clickout(event) {
        if (event.target.className === 'pi pi-ellipsis-v') {
            if (this.tempClick) {
                this.tempClick.style.display = 'none';
                if (this.tempClick !== event.target.parentElement.children[0].children[0]) {
                    this.tempClick = event.target.parentElement.children[0].children[0];
                    this.tempClick.style.display = '';
                } else {
                    this.tempClick = undefined;
                }
            } else {
                this.tempClick = event.target.parentElement.children[0].children[0];
                this.tempClick.style.display = '';
            }

        } else {
            if (this.tempClick) {
                this.tempClick.style.display = 'none';
                this.tempClick = undefined;
            }
        }
    }

}
