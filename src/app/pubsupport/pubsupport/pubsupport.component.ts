import { Component, OnInit, ViewEncapsulation, ComponentFactoryResolver, ViewContainerRef, ViewChild, HostListener, ApplicationRef, NgZone } from '@angular/core';
import { MessageService, DialogService, ConfirmationService } from 'primeng';
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

@Component({
    selector: 'app-pubsupport',
    templateUrl: './pubsupport.component.html',
    styleUrls: ['./pubsupport.component.css'],
    encapsulation: ViewEncapsulation.None
})
// tslint: disable
export class PubsupportComponent implements OnInit {

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

    constructor(
        private formBuilder: FormBuilder,
        public spOperationsService: SPOperationService,
        public constantService: ConstantsService,
        public globalObject: GlobalService,
        public pubsupportService: PubsuportConstantsService,
        private messageService: MessageService,
        private router: Router,
        private dialogService: DialogService,
        private datePipe: DatePipe,
        private confirmationService: ConfirmationService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private titlecasePipe: TitleCasePipe,
        private platformLocation: PlatformLocation,
        private locationStrategy: LocationStrategy,
        _applicationRef: ApplicationRef,
        private common: CommonService,
        zone: NgZone,
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
    // Show Hide Submission Details
    showHideSubDetailsData = false;
    showSubDetails = false;

    // ShowHide Galley
    showHideGalleyData = false;

    // show/hide Add Author Component
    @ViewChild('addAuthorcontainer', { read: ViewContainerRef, static: false }) addAuthorcontainer: ViewContainerRef;
    @ViewChild('authorDetailscontainer', { read: ViewContainerRef, static: false }) authorDetailscontainer: ViewContainerRef;

    journal_Conf_details: any = {};

    // Year Range
    yearsRange = new Date().getFullYear() + ':' + (new Date().getFullYear() + 10);

    submission_details_data: any = [];

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
    showJournalRowIndex = 0;
    state = false;
    parentRowIndex: number;
    journal_Conf_data: any = [];
    selectedProject: any = {};

    // Show Hide Submission Details
    showSubDetailsIndex = 0;
    subResponse: any = [];
    // View Galley Details
    showHideGalleyDetails = false;
    galleyDetailsData: any = [];

    galleyIndexChecked: number;
    galleyRowIndex = 0;

    galleyResponse: any = [];

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
    showDialog() {
        this.display = true;
    }
    async ngOnInit() {
        this.globalObject.currentTitle = "Publication Support";
        this.currentUserInfo();
        this.todayDate = new Date();
        this.isSubmisssionDetails = false;
        this.journalConfFormField();
        this.updatejCRequirement();

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
        arrEndPoints.push(projectContactEndPoint);

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
        } else if (arrResults.length) {
            arrProjects = arrResults[0].retItems;
            arrProjectContacts = arrResults[1].retItems;
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
    openPopup(data, popUpData) {
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
            case '':
            case 'rejected': {
                this.items = [
                    { label: 'Add Journal / Conference', command: (e) => this.openMenuContent(e, data) },
                    { label: 'Add Authors', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Author forms & emails', command: e => this.openMenuContent(e, data) },
                    // { label: 'Update Journal Requirement', command: e => this.openMenuContent(e, data) }
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
                    { label: 'Update Journal Requirement', command: e => this.openMenuContent(e, data) }
                ];
                break;
            }
            case 'submitted': {
                this.items = [
                    { label: 'Edit Journal / Conference', command: e => this.openMenuContent(e, data) },
                    { label: 'Add Authors', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Author forms & emails', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Decision details', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Journal Requirement', command: e => this.openMenuContent(e, data) }
                ];
                break;
            }
            case 'accepted': {
                // this.items = [];

                // tslint:disable-next-line: max-line-length
                if (this.selectedProject.DeliverableType !== 'Abstract' && this.selectedProject.DeliverableType !== 'Poster' && this.selectedProject.DeliverableType !== 'Oral Presentation') {
                    this.items = [
                        { label: 'Override Galley', command: e => this.openMenuContent(e, data) }
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
            case 'presented':
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
            this.getJC_JCSubID();
        }
    }

    setJCDetails(data) {
        const form = this.journal_Conference_Edit_Detail_form;
        // const journalConfItem = this.jcListArray.find(j => j.ID === data.element.JournalConferenceId);
        if (data.element) {
            form.get('Name').setValue(data.element.Name);
            form.get('jcLineItemName').setValue(data.element.Name);
            form.get('EntryType').setValue(data.element.EntryType);
            form.get('Milestone').setValue(data.element.Milestone);
            form.get('UserName').setValue(data.element.UserName);
            form.get('Password').setValue(data.element.Password);
            form.get('Comments').setValue(data.element.Comments);
            if (data.element.EntryType === 'journal') {
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
                form.get('Comments').setValue(data.element.Comments);
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
            this.addJCControls(this.journal_Conference_Edit_Detail_form, this.journal_Conf_data[0].element.EntryType, 'Edit')
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
        const arrResults = await this.spOperationsService.executeBatch(objData); //.subscribe(res => {
        this.jc_jcSubId = arrResults;
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
            const fileEndPoint = this.globalObject.sharePointPageObject.webRelativeUrl + '/' + projectCodeData.ClientLegalEntity + '/' + projectCodeData.ProjectCode + '/Publication Support/Forms/';
            this.filesToCopy = await this.spOperationsService.readFiles(fileEndPoint);
            if (this.filesToCopy.length) {
                this.noFileMsg = '';
                this.update_author_form.removeControl('file');
                this.filesToCopy.forEach(element => {
                    this.fileSourcePath.push(element.ServerRelativeUrl);
                    this.fileDestinationPath.push(this.globalObject.sharePointPageObject.webRelativeUrl + '/' + this.selectedProject.ClientLegalEntity + '/' + this.selectedProject.ProjectCode + '/Publication Support/Forms/' + element.Name);
                });
            } else {
                this.noFileMsg = 'There is no file to copy from selected project.';
                // this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'There is no file to copy from selected project.', detail: '', life: 4000 });
                // document.getElementById("closeModalButton").click();
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
                this.messageService.add({
                    key: 'myKey1', severity: 'error', summary: 'Error message',
                    detail: 'There is no line item available in Journal Conference Listname.', life: 4000
                });
                return;
            }
            if (this.jc_jcSubId[1].retItems.length) {
                SelectedRowJCSubItemId = this.jc_jcSubId[1].retItems[0].ID;
            } else {
                this.messageService.add({
                    key: 'myKey1', severity: 'error', summary: 'Error message',
                    detail: 'There is no line item available in JCSubmission Listname.', life: 4000
                });
                return;
            }
        } else {
            this.messageService.add({
                key: 'myKey1', severity: 'error', summary: 'Error message',
                detail: 'There is no line item available in Journal Conference / JCSubmission  Listname.', life: 4000
            });
            return;
        }

        // confirm() {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to Cancel Journal Conference Details?',
            accept: () => {
                //Project status empty, journalConference pubsuport status cancelled, jcSubmission Status Cancelled
                // Update ProjectInformation
                const piObj = {
                    PubSupportStatus: ''
                };
                piObj['__metadata'] = { type: this.constantService.listNames.ProjectInformation.type }
                const piEndpoint = this.spOperationsService.getItemURL(this.constantService.listNames.ProjectInformation.name, this.selectedProject.Id);

                // Update JC
                const jcObj = {
                    Status: 'Cancelled'
                };
                jcObj['__metadata'] = { type: this.constantService.listNames.JournalConf.type }
                const jcEndpoint = this.spOperationsService.getItemURL(this.constantService.listNames.JournalConf.name, SelectedRowJCItemId);

                // Update JCSubmission
                const jcSubObj = {
                    Status: 'Cancelled'
                };
                jcSubObj['__metadata'] = { type: this.constantService.listNames.JCSubmission.type }
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
            },
            reject: () => {
                console.log('User cancel current action.');
            },
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
        if (type === 'Journal') {
            this.optionLabel.title = 'JournalName';
            endpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.Journal.name + '', this.pubsupportService.pubsupportComponent.journal);
            jcObj = [{
                url: endpoint,
                type: 'GET',
                listName: this.constantService.listNames.Journal.name
            }];
        } else if (type === 'Conference') {
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
            this.messageService.add({ key: 'myKey1', severity: 'error', summary: 'Error message', detail: res[0].retItems.message.value, life: 4000 });
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
        })
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
        })
    }

    // onChangeSelectedJCItem(item: any, type: string) {
    //     console.log('item ', item);
    //     if (item.value) {
    //         this.journal_Conference_Detail_form.addControl('UserName', new FormControl('', [Validators.required]));
    //         this.journal_Conference_Detail_form.addControl('Password', new FormControl('', [Validators.required]));
    //         if (type === 'journal') {
    //             // tslint:disable-next-line: max-line-length
    //             // this.journal_Conference_Detail_form.addControl('Name', new FormControl({ value: '', disabled: true }, Validators.required));
    //             this.journal_Conference_Detail_form.addControl('ExpectedReviewPeriod', new FormControl([''], Validators.required));
    //             this.journal_Conference_Detail_form.addControl('IF', new FormControl([''], Validators.required));
    //             this.journal_Conference_Detail_form.addControl('RejectionRate', new FormControl([''], Validators.required));
    //             this.journal_Conference_Detail_form.addControl('Comments', new FormControl([''], Validators.required));
    //             this.journal_Conference_Detail_form.addControl('JournalEditorInfo', new FormControl([''], Validators.required));

    //             // Set New Values
    //             this.journal_Conference_Detail_form.get('Name').setValue(item.value.JournalName);
    //             this.journal_Conference_Detail_form.get('ExpectedReviewPeriod').setValue(item.value.ExpectedReviewPeriod);
    //             this.journal_Conference_Detail_form.get('IF').setValue(item.value.ImpactFactor);
    //             this.journal_Conference_Detail_form.get('RejectionRate').setValue(item.value.RejectionRate);
    //             this.journal_Conference_Detail_form.get('Comments').setValue(item.value.Comments);
    //             this.journal_Conference_Detail_form.get('JournalEditorInfo').setValue(item.value.JournalEditorInfo);

    //             // Remove Conference Form
    //             this.journal_Conference_Detail_form.removeControl('CongressDate');
    //             this.journal_Conference_Detail_form.removeControl('AbstractSubmissionDeadline');
    //             // this.journal_Conference_Detail_form.removeControl('Name');
    //         } else {
    //             // tslint:disable-next-line: max-line-length
    //             // this.journal_Conference_Detail_form.addControl('Name', new FormControl({ value: '', disabled: true }, Validators.required));
    //             this.journal_Conference_Detail_form.addControl('CongressDate', new FormControl(new Date(), [Validators.required]));
    //             this.journal_Conference_Detail_form.addControl('AbstractSubmissionDeadline', new FormControl(new Date(), [Validators.required]));
    //             this.journal_Conference_Detail_form.addControl('Comments', new FormControl([''], Validators.required));

    //             this.journal_Conference_Detail_form.get('Name').setValue(item.value.ConferenceName);
    //             this.journal_Conference_Detail_form.get('CongressDate').setValue(this.datePipe.transform(new Date(item.value.ConferenceDate), 'MMM dd, yyyy'));
    //             this.journal_Conference_Detail_form.get('AbstractSubmissionDeadline').setValue(this.datePipe.transform(new Date(item.value.SubmissionDeadline), 'MMM dd, yyyy'));
    //             this.journal_Conference_Detail_form.get('Comments').setValue(item.value.Comments);

    //             // // Remove Journal Form
    //             this.journal_Conference_Detail_form.removeControl('ExpectedReviewPeriod');
    //             this.journal_Conference_Detail_form.removeControl('IF');
    //             this.journal_Conference_Detail_form.removeControl('RejectionRate');
    //             this.journal_Conference_Detail_form.removeControl('JournalEditorInfo');
    //         }
    //         this.journal_Conference_Detail_form.updateValueAndValidity();
    //         console.log(this.journal_Conference_Detail_form.controls);
    //     }
    // }

    // onTypeSelected(type: string) {
    //     if (type === 'journal') {
    //         this.jcListArray = this.sortJournalData(res[0].retItems);
    //     } else if (type === 'conference') {
    //         this.jcListArray = this.sortConferenceData(res[0].retItems);
    //     }
    //     this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
    // }

    // sortJournalData(array: any) {
    //     return array.sort((a, b) => {
    //         if (a.JournalName && a.JournalName !== null && b.JournalName && b.JournalName !== null) {
    //             if (a.JournalName.toLowerCase() < b.JournalName.toLowerCase()) {
    //                 return -1;
    //             }
    //             if (a.JournalName.toLowerCase() > b.JournalName.toLowerCase()) {
    //                 return 1;
    //             }
    //         }
    //         return 0;
    //     })
    // }

    // sortConferenceData(array: any) {
    //     return array.sort((a, b) => {
    //         if (a.ConferenceName && a.ConferenceName !== null && b.ConferenceName && b.ConferenceName !== null) {
    //             if (a.ConferenceName.toLowerCase() < b.ConferenceName.toLowerCase()) {
    //                 return -1;
    //             }
    //             if (a.ConferenceName.toLowerCase() > b.ConferenceName.toLowerCase()) {
    //                 return 1;
    //             }
    //         }
    //         return 0;
    //     })
    // }

    addJCControls(form: any, type: string, actionType: string) {
        actionType === 'Add' ? form.addControl('UserName', new FormControl('')) : form.addControl('UserName', new FormControl([''], Validators.required));
        actionType === 'Add' ? form.addControl('Password', new FormControl('')) : form.addControl('Password', new FormControl([''], Validators.required));
        if (type === 'journal') {
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
                form.get('Comments').setValue(item.value.Comments);
                form.get('JournalEditorInfo').setValue(item.value.JournalEditorInfo);
            } else {
                form.get('Name').setValue(item.value.ConferenceName);
                form.get('CongressDate').setValue(this.datePipe.transform(new Date(item.value.ConferenceDate), 'MMM dd, yyyy'));
                form.get('AbstractSubmissionDeadline').setValue(this.datePipe.transform(new Date(item.value.SubmissionDeadline), 'MMM dd, yyyy'));
                form.get('Comments').setValue(item.value.Comments);
            }
            this.journal_Conference_Detail_form.updateValueAndValidity();
        }
    }

    onChangeSelectedJCItem(item: any, type: string) {
        this.addJCControls(this.journal_Conference_Detail_form, type, 'Add');
        this.setJCValue(this.journal_Conference_Detail_form, item, type);
    }

    // onTypeSelected(type: string) {
    //     if (type === 'journal') {
    //         this.journal_Conf_form.addControl('IF', new FormControl('', Validators.required));
    //         this.journal_Conf_form.addControl('RejectionRate', new FormControl('', Validators.required));
    //         this.journal_Conf_form.addControl('ExpectedReviewPeriod', new FormControl('', Validators.required));
    //         this.journal_Conf_form.addControl('JournalEditorInfo', new FormControl('', Validators.required));
    //         this.journal_Conf_form.removeControl('CongressDate');
    //         this.journal_Conf_form.removeControl('AbstractSubmissionDeadline');
    //     } else {
    //         this.journal_Conf_form.addControl('CongressDate', new FormControl('', Validators.required));
    //         this.journal_Conf_form.addControl('AbstractSubmissionDeadline', new FormControl('', Validators.required));
    //         this.journal_Conf_form.removeControl('IF');
    //         this.journal_Conf_form.removeControl('RejectionRate');
    //         this.journal_Conf_form.removeControl('ExpectedReviewPeriod');
    //         this.journal_Conf_form.removeControl('JournalEditorInfo');
    //     }
    // }
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

            ref.onClose.subscribe((conference) => {
                if (conference) {
                    this.messageService.add({
                        key: 'myKey1', severity: 'success', summary: 'Success message',
                        detail: 'Journal Created.', life: 4000
                    });
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
                    this.messageService.add({
                        key: 'myKey1', severity: 'success', summary: 'Success message',
                        detail: 'Conference Created.', life: 4000
                    });
                    this.getJCList('conference');
                }
            });

        } else {
            this.messageService.add({
                key: 'myKey1', severity: 'info', summary: 'Info message',
                detail: 'Please select document type & try again.', life: 4000
            });
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
        }
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
    }

    // Modal Submit
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
            }
            this.submitBtn.isClicked = true;
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
            const res = await this.spOperationsService.uploadFile(this.filePathUrl, this.fileReader.result);
            console.log('selectedFile uploaded .', res.ServerRelativeUrl);
            if (res.hasError) {
                this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
                this.messageService.add({
                    key: 'myKey1', severity: 'info', summary: 'File not uploaded.',
                    detail: 'Folder / ' + res.message.value + '', life: 3000
                });
                return;
            }
            const objData = {
                JournalRequirementResponse: res.ServerRelativeUrl
            };
            objData['__metadata'] = { type: this.constantService.listNames.JournalConf.type };

            // Get Selected Line item JournalConference Id
            this.jc_jcSubId[0].retItems.forEach(element => {
                if (element) {
                    this.jcId = element.ID;
                }
            });
            // const endpoint = this.pubsupportService.pubsupportComponent.addJC.updateJCDetails.replace('{{Id}}', this.jcId);
            const endpoint = this.spOperationsService.getItemURL(this.constantService.listNames.JournalConf.name, this.jcId);
            let data = [];
            if (res.ServerRelativeUrl) {
                data = [{
                    data: objData,
                    url: endpoint,
                    type: 'PATCH',
                    listName: this.constantService.listNames.JournalConf.name
                }];
            }
            this.submit(data, type);
        } else if (type === 'updateAuthor') {

            // stop here if form is invalid
            if (this.update_author_form.invalid) {
                this.submitBtn.isClicked = false;
                return;
            }
            this.submitBtn.isSubmit = true;
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
            if (this.filesToCopy.length) {
                this.update_author_form.removeControl('file');
                const fileCopyEndPoint = await this.spOperationsService.copyFiles(this.fileSourcePath, this.fileDestinationPath);
                this.messageService.add({
                    key: 'myKey1', severity: 'success', summary: 'Success message',
                    detail: 'Author details updated.', life: 4000
                });
                this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
                this.updateAuthorModal_1 = false;
                this.reload();
            } else {
                this.uploadFileData('updateAuthors');
            }

        } else if (type === 'updateDecision') {

            // stop here if form is invalid
            if (this.update_decision_details.invalid) {
                this.submitBtn.isClicked = false;
                return;
            }
            this.submitBtn.isClicked = true;
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
            this.uploadFileData('updateDecision');

        } else if (type === 'updatePublication') {

            // stop here if form is invalid
            if (this.update_publication_form.invalid) {
                this.submitBtn.isClicked = false;
                return;
            }
            this.submitBtn.isClicked = true;
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
            this.uploadFileData('updatePublication');

        } else if (type === 'galley') {

            // stop here if form is invalid
            if (this.galley_form.invalid) {
                this.submitBtn.isClicked = false;
                return;
            }
            this.submitBtn.isClicked = true;
            this.submitBtn.isSubmit = true;
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
            this.uploadFileData('galley');
        }
    }

    async submit(dataEndpointArray, type: string) {

        if (type === 'addJCDetailsModal' || type === 'addAuthor' || type === 'updateDecision' || type === 'galley' ||
            type === 'updatePublication' || type === 'cancelJC' || type === 'updateJCRequirementModal' || type === 'editJCDetailsModal') {

            this.common.SetNewrelic('PubSupport', 'pubsupport', 'CancelJSR');
            const result = await this.spOperationsService.executeBatch(dataEndpointArray);
            let res: any = {};
            if (result.length) {
                res = result[0].retItems;
            }
            if (res.hasOwnProperty('hasError')) {
                this.messageService.add({
                    key: 'myKey1', severity: 'error', summary: 'Error message',
                    detail: res.message.value, life: 4000
                });
            } else if (type === 'addJCDetailsModal') {
                console.log('res ', res);
                this.updateProjectSts_JCSubmissionDetails(res, type);

            } else if (type === 'editJCDetailsModal') {
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Success message', detail: 'Journal/Conference details updated.', life: 4000 });
                this.editJCDetailsModal = false;
                this.reload();
            } else if (type === 'updateDecision') {
                this.update_decision_details.reset();
                this.messageService.add({
                    key: 'myKey1', severity: 'success', summary: 'Success message',
                    detail: 'Updated Decision', life: 4000
                });
                this.updateDecisionModal = false;
                this.reload();
            } else if (type === 'galley') {
                this.galley_form.reset();
                this.messageService.add({
                    key: 'myKey1', severity: 'success', summary: 'Success message',
                    detail: 'Galley Overrided.', life: 4000
                });
                this.overrideGalleyModal = false;
                this.reload();
            } else if (type === 'updatePublication') {
                this.update_publication_form.reset();

                this.messageService.add({
                    key: 'myKey1', severity: 'success', summary: 'Success message',
                    detail: 'Publication details Updated.', life: 4000
                });
                this.updatePublicatoinModal = false;
                this.reload();
            } else if (type === 'cancelJC') {
                this.messageService.add({
                    key: 'myKey1', severity: 'success', summary: 'Success message',
                    detail: 'Journal Conference Cancelled', life: 4000
                });
                this.reload();
            } else if (type === 'updateJCRequirementModal') {
                this.messageService.add({
                    key: 'myKey1', severity: 'success', summary: 'Success message',
                    detail: 'Journal requirement response document updated.', life: 4000
                });
                this.updateJCRequirementModal = false;
                this.reload();
            }
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
            return;
        }
    }

    async updateProjectSts_JCSubmissionDetails(res: any, type: string) {
        // Update PI
        // tslint:disable-next-line: max-line-length
        // const projEndpoint = this.spOperationsService.getItemURL(this.pubsupportService.pubsupportComponent.updateProjectInfo.updateProjInfo)
        //     .replace('{{projectId}}', this.selectedProject.Id);
        // tslint:disable-next-line: max-line-length
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
            this.messageService.add({ key: 'myKey1', severity: 'error', summary: 'Error message', detail: res.message.value, life: 4000 });
        } else if (type === 'addJCDetailsModal') {
            let entryTypeJC = '';
            if (this.journal_Conference_Detail_form.value.EntryType.toLowerCase() === 'journal') {
                entryTypeJC = 'Journal Submitted.';
            } else if (this.journal_Conference_Detail_form.value.EntryType.toLowerCase() === 'conference') {
                entryTypeJC = 'Conference Submitted.';
            }
            this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Success message', detail: entryTypeJC, life: 4000 });
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
        const jcGalleyEndpoint = this.spOperationsService.getReadURL(this.constantService.listNames.jcGalley.name);
        const jcGalleyObj: any = {
            Title: this.selectedProject.ProjectCode,
            JCSubmissionID: jcSubId,
            GalleyDate: new Date(),
            GalleyURL: fileUrl
        };
        jcGalleyObj.__metadata = { type: this.constantService.listNames.jcGalley.type };
        return {
            data: jcGalleyObj,
            url: jcGalleyEndpoint,
            type: 'POST',
            listName: this.constantService.listNames.jcGalley.name
        };
    }

    async uploadFileData(type: string) {

        this.common.SetNewrelic('PubSupport', 'pubsupport', 'UploadFile');
        const res = await this.spOperationsService.uploadFile(this.filePathUrl, this.fileReader.result);
        console.log('selectedFile uploaded .', res.ServerRelativeUrl);
        if (res.hasError) {
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
            // document.getElementById('closeModalButton').click();
            this.messageService.add({
                key: 'myKey1', severity: 'info', summary: 'File not uploaded.',
                detail: 'Folder / ' + res.message.value + '', life: 4000
            });
            return;
        }
        if (res.ServerRelativeUrl && type !== 'updateAuthors') {
            const arrayUpdateData = [];
            const data1 = this.updateProjectInfo(res.ServerRelativeUrl, type);
            const data2 = this.updateJCSubmissionDetails(res.ServerRelativeUrl, type);
            const data3 = this.updateJCDetails(res.ServerRelativeUrl, type);
            let data4 = {};
            if (this.update_decision_details.value.Decision === 'Resubmit to same journal') {
                data4 = this.addJCSubmission();
            }
            if (type === 'galley') {
                data4 = this.addJCGalley(res.ServerRelativeUrl);
            }
            arrayUpdateData.push(data1, data2, data3, data4);
            this.submit(arrayUpdateData, type);
        }
        if (type === 'updateAuthors') {
            this.messageService.add({
                key: 'myKey1', severity: 'success', summary: 'Success message',
                detail: 'Author details updated.', life: 4000
            });
            this.reload();
            this.updateAuthorModal_1 = false;
            // document.getElementById('closeModalButton').click();
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
        }
    }

    jcViewDetails = (index: number) => {
        this.showJournalRowIndex = index;
        this.journal_Conf_details = this.journal_Conf_data[index].element;
        this.state = !this.state;
    }
    // On Row Expand
    onRowExpand(psProject: any) {
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
        this.showHideJC = false;
        this.getJCDetails(psProject.data);
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
        this.showHideJC = true;
        this.state = false;
        this.parentRowIndex = psProject.data.id - 1;
        this.showSubDetails = false;

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
    showHideSubDetails(index: number, SelectedProj: any) {
        this.showHideSubDetailsData = false;
        this.showSubDetailsIndex = index;
        this.showSubDetails = !this.showSubDetails;
        if (this.showSubDetails) {
            // Galley Index reset
            this.showHideGalleyData = false;
            // Show Loadder
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;

            // submission_details_data
            this.getSubmissionDetails(index, SelectedProj.element);
            this.showHideSubDetailsData = true;
            this.showHideGalleyDetails = false;
        }
    }
    async getSubmissionDetails(index: any, selectedJC: any) {
        const obj = Object.assign({}, this.pubsupportService.pubsupportComponent.jcSubmission);
        obj.filter = obj.filter.replace('{{ProjectCode}}', selectedJC.Title).replace('{{JCID}}', selectedJC.ID);
        const jsEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.JCSubmission.name + '', obj);
        const data = [{
            url: jsEndpoint,
            type: 'GET',
            listName: this.constantService.listNames.JCSubmission.name
        }];
        this.common.SetNewrelic('PubSupport', 'pubsupport', 'getSubDetailsByProjectCodeAndJCID');
        const res = await this.spOperationsService.executeBatch(data);
        this.submission_details_data = res[0].retItems;
        // Hide Loader
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
    }

    viewGalleyDetails(index: number, jcSubData: any) {
        this.galleyRowIndex = index;
        this.showHideGalleyDetails = !this.showHideGalleyDetails;
        this.galleyIndexChecked = index;
        this.showHideGalleyData = false;
        // this.galleyDetailsData
        if (this.showHideGalleyDetails) {
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
            this.getGalleyDetails(index, jcSubData);
            this.showHideGalleyData = true;
        }
    }
    async getGalleyDetails(index: any, selectedJC: any) {
        // this.selectedProject = selectedJC;
        this.galleyDetailsData = [];
        const obj = Object.assign({}, this.pubsupportService.pubsupportComponent.jcGalley);
        obj.filter = obj.filter.replace('{{ProjectCode}}', selectedJC.Title).replace('{{JCSubID}}', selectedJC.ID);
        const jsEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.jcGalley.name + '', obj);
        const data = [{
            url: jsEndpoint,
            type: 'GET',
            listName: this.constantService.listNames.jcGalley.name
        }];
        this.common.SetNewrelic('PubSupport', 'pubsupport', 'getGallyDetailsByProjectCodeAndJCSubID');
        const res = await this.spOperationsService.executeBatch(data);
        this.galleyDetailsData = res[0].retItems;
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
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

    downloadFile(file: string, fileName: string) {
        console.log('File ', fileName);
        // console.log('File ', JSON.stringify(fileName));
        if (file) {
            this.messageService.add({
                key: 'myKey1', severity: 'success', summary: 'Success message',
                detail: 'Files are downloading...', life: 2000
            });
            const fileArray = file.split(';#');
            this.spOperationsService.createZip(fileArray, fileName);
        } else {
            this.messageService.add({ key: 'myKey1', severity: 'warn', summary: 'Info message', detail: 'No file avaliable.', life: 4000 });
        }
    }

    onFileChange(event) {
        this.fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
            this.fileReader.readAsArrayBuffer(this.selectedFile);
            this.fileReader.onload = () => {
                let folderPath = '/Publication Support/Published Papers';
                if (event.target.placeholder === 'updateAuthorForms') {
                    folderPath = '/Publication Support/Forms';
                    // this.update_author_form.value.
                    this.update_author_form.removeControl('existingAuthorList');
                }
                this.filePathUrl = this.globalObject.sharePointPageObject.webRelativeUrl +
                    '/_api/web/GetFolderByServerRelativeUrl(' + '\'' + this.selectedProject.ProjectFolder + '' +
                    folderPath + '\'' + ')/Files/add(url=@TargetFileName,overwrite=\'true\')?' +
                    '&@TargetFileName=\'' + this.selectedFile.name + '\'';
            };
            this.update_author_form.updateValueAndValidity();
        }
    }

    // TO update data after submit just call method name in DoCheck mothod
    // tslint:disable-next-line:use-life-cycle-interface
    ngDoCheck() { }

    reload() {
        // setTimeout(() => {
        //     // window.location.reload();
        //     this.currentUserInfo();
        // }, 3000);
        //

        setTimeout(() => {
            this.router.navigated = false;
            this.router.navigate([this.router.url]);
        }, 5000);

        // this.router.navigated = false;
        // this.router.navigate([this.router.url]);
    }

    async openAuthorModal(data: any) {

        const factory = this.componentFactoryResolver.resolveComponentFactory(AuthorDetailsComponent);
        const componentRef = this.authorDetailscontainer.createComponent(factory);
        componentRef.instance.events = data;
        this.ref = componentRef;
        // componentRef.instance.formType = 'addAuthor';
        return;
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

    closedProjectCode: string;
    searchClosedProject(event) {
        let checkPC = this.providedProjectCode;
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
