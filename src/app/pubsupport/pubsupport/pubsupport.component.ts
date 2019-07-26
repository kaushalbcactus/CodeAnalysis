import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MessageService, DialogService, ConfirmationService } from 'primeng/api';
import { NodeService } from '../../node.service';
import { MenuItem } from 'primeng/components/common/menuitem';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { SharepointoperationService } from '../../Services/sharepoint-operation.service';
import { ConstantsService } from '../../Services/constants.service';
import { PubsuportConstantsService } from '../Services/pubsuport-constants.service';
import { GlobalService } from '../../Services/global.service';

// FIle upload
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { SpOperationsService } from 'src/app/Services/sp-operations.service';
import { CreateConferenceComponent } from './create-conference/create-conference.component';
import { CreateJournalComponent } from './create-journal/create-journal.component';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-pubsupport',
    templateUrl: './pubsupport.component.html',
    styleUrls: ['./pubsupport.component.css'],
    encapsulation: ViewEncapsulation.None
})
// tslint: disable
export class PubsupportComponent implements OnInit {

    constructor(private nodeService: NodeService,
        private http: HttpClient,
        private formBuilder: FormBuilder,
        public spServices: SharepointoperationService,
        private spOperationsService: SpOperationsService,
        public constantService: ConstantsService,
        public globalObject: GlobalService,
        public pubsupportService: PubsuportConstantsService,
        private messageService: MessageService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private dialogService: DialogService,
        private datePipe: DatePipe,
        private confirmationService: ConfirmationService,
    ) {

        // subscribe to the router events - storing the subscription so
        // we can unsubscribe later.
        this.navigationSubscription = this.router.events.subscribe((e: any) => {

            // If it is a NavigationEnd event re-initalise the component
            if (e instanceof NavigationEnd) {
                this.initialiseInvites();
            }
        });

        this.overAllValues = [
            { name: 'Open', value: 'Open' },
            { name: 'Closed', code: 'Closed' }
        ];
        this.selectedOption = this.overAllValues[0];
    }

    // convenience getter for easy access to form fields
    get isValidConferenceForm() {
        return this.journal_Conf_form.controls;
    }
    get isValidAddAuthorForm() {
        return this.add_author_form.controls;
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
    journal_Conf_form: FormGroup;
    add_author_form: FormGroup;
    update_author_form: FormGroup;
    update_decision_details: FormGroup;
    update_publication_form: FormGroup;
    galley_form: FormGroup;
    journal_Conference_Detail_form: FormGroup;

    submitted = false;
    showProjectInput = false;
    // Progress Bar status
    value = 0;
    backgroundColor: any;

    // Loadder
    isPSInnerLoaderHidden = false;

    // SHow Hide JCDetails
    showHideJC = false;
    // Show Hide Submission Details
    showHideSubDetailsData = false;
    showSubDetails = false;

    // ShowHide Galley
    showHideGalleyData = false;


    journal_Conf_details: any = {
        Submission_deadline: new Date(), // 'November 10, 2015',
        Conference_date: new Date(), // 'January 31, 2016 ',
        Satus: 'Submitted',
        Journal_selection_document: 'Download',
        Publication_Date: 'January 31, 2016',
        Published_pdf: 'Download',
        User_Name: 'Laura Walsh',
        Password: '*******',

        Publication_title: 'Eribulin monotherapy improved survivals in patients with ER-positive HER2-negative metastatic breast cancer in the real world; a single institutional review',

        Citation: 'Watanabe J. Eribulin monotherapy improved survivals in patients with ER- positive HER2-negative metastatic breast cancer in the real world: a single institutional review. Springerplus. 2015 Oct 19;4:625.',

        Comments: 'Eribulin monotherapy improved survivals in patients with ER-positive HER2-negative metastatic breast cancer in the real world; a single institutional review.',
        Journal_editor_info: 'Laura Walsh Philip Drive 101 Norwell, MA 02061 United States of America Phone: 1 (781) 244-7919'
    };

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
    }

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
    showDialog() {
        this.display = true;
    }

    todayDate: any = {};
    async ngOnInit() {
        this.todayDate = new Date();
        this.isSubmisssionDetails = false;
        this.journalConfFormField();

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
        this.addAuthorFormField();
        this.updateAuthorFormField();
        this.updateDeceionFormField();
        this.updatePublicationFormField();
        this.galleyFormField();
        this.jcDetailsForm();
    }

    documentTypes: any = [];
    getDocuTypes() {
        this.documentTypes = [
            { label: 'Select type', value: '' },
            { label: 'Journal', value: 'journal' },
            { label: 'Conference', value: 'conference' }
        ];
    }

    initialiseInvites() {
        // Set default values and re-fetch any data you need.
        this.currentUserInfo();
    }
    callGetProjects(isClosed) {
        if (this.loggedInUserGroup.findIndex(c => (c === 'Managers' || c === 'Project-FullAccess')) !== -1) {
            this.getProjectInfoData(true, isClosed);
        } else {
            this.getProjectInfoData(false, isClosed);
        }
    }

    async currentUserInfo() {
        this.loggedInUserInfo = [];
        this.loggedInUserGroup = [];
        const curruentUsrInfo = await this.spServices.getCurrentUser();
        this.loggedInUserInfo = curruentUsrInfo.d.Groups.results;
        this.loggedInUserInfo.forEach(element => {
            if (element) {
                this.loggedInUserGroup.push(element.LoginName);
            }
        });
        this.callGetProjects(false);
    }
    async getProjectInfoData(isManager, isClosed) {

        const arrEndPoints = [];
        const arrEndPointsArchive = [];
        this.projInfoResponse = [];
        let arrResults = [];
        let arrResultsArchive = [];
        let projectInfoEndpoint = '';
        if (isClosed) {
            const setProjectCode = this.providedProjectCode.trim();

            this.pubsupportService.pubsupportComponent.projectInfoClosed.filter = this.pubsupportService.pubsupportComponent.projectInfoClosed.filter.replace('{{ProjectCode}}', setProjectCode);

            projectInfoEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.ProjectInformation.name + '', this.pubsupportService.pubsupportComponent.projectInfoClosed);
            arrEndPoints.push(projectInfoEndpoint);
            // this.spServices.getBatchBodyGet(batchContents, batchGuid, projectInfoEndpoint);
            projectInfoEndpoint = this.spServices.getReadURLArchive('' + this.constantService.listNames.ProjectInformation.name + '', this.pubsupportService.pubsupportComponent.projectInfoClosed);
            // arrEndPointsArchive.push(projectInfoEndpoint);
            // this.spServices.getBatchBodyGet(batchContents, batchGuid, projectInfoEndpoint);
        } else {
            if (isManager) {
                projectInfoEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.ProjectInformation.name + '', this.pubsupportService.pubsupportComponent.projectInfo);
            } else {
                this.pubsupportService.pubsupportComponent.projectInfoUser.filter = this.pubsupportService.pubsupportComponent.projectInfoUser.filter.replace(/{{ID}}/gi, this.globalObject.sharePointPageObject.userId.toString());
                projectInfoEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.ProjectInformation.name + '', this.pubsupportService.pubsupportComponent.projectInfoUser);
            }
            arrEndPoints.push(projectInfoEndpoint);
            // this.spServices.getBatchBodyGet(batchContents, batchGuid, projectInfoEndpoint);
        }

        const projectContactEndPoint = this.spServices.getReadURL('' + this.constantService.listNames.ProjectContacts.name + '', this.pubsupportService.pubsupportComponent.projectContact);
        arrEndPoints.push(projectContactEndPoint);

        let arrProjects = [], arrProjectContacts = [];
        let pipcObj = [
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

        let piObj = [{
            url: projectInfoEndpoint,
            type: 'GET',
            listName: this.constantService.listNames.ProjectInformation.name
        }]

        arrResults = await this.spOperationsService.executeBatch(pipcObj);
        if (arrEndPointsArchive.length) {
            // arrResultsArchive = await this.spServices.getDataByApi(this.globalObject.sharePointPageObject.webAbsoluteArchiveUrl, arrEndPointsArchive);
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
        this.isPSInnerLoaderHidden = true;
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

    // Open popup
    openPopup(data, popUpData) {

        this.submitBtn.isSubmit = false;
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
                    { label: 'Add Journal conference', command: (e) => this.openMenuContent(e, data) },
                    { label: 'Add Authors', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Author forms & emails', command: e => this.openMenuContent(e, data) }
                ];
                break;
            }
            case 'selected': {
                this.items = [
                    { label: 'Add Authors', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Author forms & emails', command: e => this.openMenuContent(e, data) },
                    { label: 'Cancel Journal Conference', command: e => this.openMenuContent(e, data) },
                ];
                break;
            }
            case 'resubmit to same journal': {
                this.items = [
                    { label: 'Add Authors', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Author forms & emails', command: e => this.openMenuContent(e, data) }
                ];
                break;
            }
            case 'submitted': {
                this.items = [
                    { label: 'Add Authors', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Author forms & emails', command: e => this.openMenuContent(e, data) },
                    { label: 'Update Decision details', command: e => this.openMenuContent(e, data) }
                ];
                break;
            }
            case 'accepted': {
                // this.items = [];

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
            case 'published': {
                this.items = [
                    { label: 'Your document is Published.' }
                ];
                break;
            }
            default: {
                console.log('Invalid choice');
                break;
            }
        }
        if (this.items.length === 0) {

            popUpData.visible = false;
        } else if (this.selectedProject.PubSupportStatus !== 'Published') {

            // GET JC & JCSubmission top
            this.getJC_JCSubID();
        }
    }
    async getJC_JCSubID() {
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        const obj = {
            filter: this.pubsupportService.pubsupportComponent.activeJC.filter.replace('{{ProjectCode}}', this.selectedProject.ProjectCode).replace('{{Status}}', this.selectedProject.PubSupportStatus),
            select: this.pubsupportService.pubsupportComponent.activeJC.select,
            top: this.pubsupportService.pubsupportComponent.activeJC.top,
            orderby: this.pubsupportService.pubsupportComponent.activeJC.orderby
        };
        // const objArray = [
        //     {
        //         name: this.constantService.listNames.JournalConf.name
        //     },
        //     {
        //         name: this.constantService.listNames.JCSubmission.name
        //     }
        // ];
        // let jsEndpoint;
        // objArray.forEach(element => {
        //     jsEndpoint = this.spServices.getReadURL('' + element.name + '', obj);
        //     this.spServices.getBatchBodyGet(batchContents, batchGuid, jsEndpoint);
        // });

        // batchContents.push('--batch_' + batchGuid + '--');
        // const userBatchBody = batchContents.join('\r\n');

        const jcEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.JournalConf.name + '', obj);
        const jcsEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.JCSubmission.name + '', obj);

        let objData = [
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
        ]


        this.jc_jcSubId = [];
        const arrResults = await this.spOperationsService.executeBatch(objData); //.subscribe(res => {
        this.jc_jcSubId = arrResults;
        // const responseInLines = this.projInfoResponse._body.split('\n');
        // tslint:disable-next-line:prefer-for-of
        // for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
        //     try {
        //         const tryParseJson = JSON.parse(responseInLines[currentLine]);
        //         this.jc_jcSubId.push(tryParseJson.d.results);
        //     } catch (e) {
        //     }
        // }
        // });
    }
    async getProjectCode() {
        this.projectCodeRes = [];
        const obj = {

            filter: this.pubsupportService.pubsupportComponent.projectInfoCode.filter.replace('{{ClientLegalEntity}}', this.selectedProject.ClientLegalEntity),
            select: this.pubsupportService.pubsupportComponent.projectInfoCode.select,
            top: this.pubsupportService.pubsupportComponent.projectInfoCode.top,
            orderby: this.pubsupportService.pubsupportComponent.projectInfoCode.orderby
        };
        let pinfoendpoint = this.spServices.getReadURL('' + this.constantService.listNames.ProjectInformation.name + '', obj);
        let obj1 = [{
            url: pinfoendpoint,
            type: 'GET',
            listName: this.constantService.listNames.ProjectInformation.name
        }]
        const res = await this.spOperationsService.executeBatch(obj1);
        console.log(res);
        this.projectCodeRes = res[0].retItems;
    }
    async updateAuthorFormsFiles(data) {

        if (data === '' || data === undefined) {
            this.updateAuthorFormField();
            this.submitted = false;
        }
        this.fileSourcePath = [];
        this.fileDestinationPath = [];
        this.batchContents = [];
        if (data) {
            const projectCodeData: any = data;

            const fileEndPoint = this.globalObject.sharePointPageObject.webAbsoluteUrl + '/' + projectCodeData.ClientLegalEntity + '/' + projectCodeData.ProjectCode + '/Publication Support/Forms/';
            this.filesToCopy = await this.spServices.readFiles(fileEndPoint);

            if (this.filesToCopy.length) {
                this.noFileMsg = '';
                this.update_author_form.removeControl('file');
                this.filesToCopy.forEach(element => {
                    this.fileSourcePath.push(element.ServerRelativeUrl);

                    this.fileDestinationPath.push(this.globalObject.sharePointPageObject.webAbsoluteUrl + '/' + this.selectedProject.ClientLegalEntity + '/' + this.selectedProject.ProjectCode + '/Publication Support/Forms/' + element.Name);
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
        // tslint:disable-next-line:prefer-for-of
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
    openMenuContent(index, data) {
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
            this.addAuthorFormField();
        } else if (this.selectedModal === 'Add Journal conference') {
            // this.journalConfFormField();
            this.addJCDetailsModal = true;
            this.formatMilestone(this.milestonesList);
            console.log('this.pubSupportProjectInfoData ', this.pubSupportProjectInfoData);
            return;
        } else if (this.selectedModal === 'Update Author forms & emails') {
            this.selectedType = '';
            // Get projectCode from ClientLegalEntity
            this.getProjectCode();
            this.updateAuthorFormField();
        } else if (this.selectedModal === 'Update Decision detailse') {
            this.updateDeceionFormField();
        } else if (this.selectedModal === 'Update Publication details') {
            this.updatePublicationFormField();
        } else if (this.selectedModal === 'Override Galley') {
            this.galleyFormField();
        } else if (this.selectedModal === 'Cancel Journal Conference') {
            this.cancelJCDetails();
        }
        document.getElementById('openModalButton').click();
    }
    addJCDetailsModal: boolean = false;

    milestoneListArray: any = [];
    formatMilestone(milestones) {
        this.milestoneListArray = [];
        for (let m = 0; m < milestones.length; m++) {
            const element = milestones[m];
            this.milestoneListArray.push({
                label: element,
                value: element
            })
        }
    }

    jcDetailsForm() {
        this.journal_Conference_Detail_form = this.formBuilder.group({
            EntryType: ['', Validators.required],
            jcLineItem: ['', Validators.required],
            Milestone: ['', Validators.required],
            Name: { value: '', disabled: true },
            Comments: ['', [Validators.required]]
        })
    }

    journalConfFormField() {
        this.journal_Conf_form = this.formBuilder.group({
            EntryType: ['', Validators.required],
            Name: ['', Validators.required],
            Milestone: ['', Validators.required],
            Comments: ['', [Validators.required]]
        });
    }

    addAuthorFormField() {
        this.add_author_form = this.formBuilder.group({
            FirstName: ['', Validators.required],
            LastName: ['', Validators.required],
            Comments: ['', Validators.required],
            HighestDegree: ['', Validators.required],
            EmailAddress: ['', [Validators.required, Validators.email]],
            Address: ['', Validators.required],
            Affiliation: ['', Validators.required],
            Phone_x0020_No: ['', Validators.required],
            Fax: ['', Validators.required],
            AuthorType: ['', Validators.required],
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

    journalConference_form: FormGroup;
    createJCDetailsForm() {
        this.journalConference_form = this.formBuilder.group({
            EntryType: ['', Validators.required],
            Name: ['', Validators.required],
            Milestone: ['', Validators.required],
            Comments: ['', [Validators.required]]
        })
    }

    // Cancel Journal Conference
    async cancelJCDetails() {
        const obj = {
            filter: this.pubsupportService.pubsupportComponent.activeJC.filter.replace('{{ProjectCode}}', this.selectedProject.ProjectCode).replace('{{Status}}', 'Selected'),
            select: this.pubsupportService.pubsupportComponent.activeJC.select,
            top: this.pubsupportService.pubsupportComponent.activeJC.top,
            orderby: this.pubsupportService.pubsupportComponent.activeJC.orderby
        };
        const jcEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.JournalConf.name + '', obj);

        let objData = [
            {
                url: jcEndpoint,
                type: 'GET',
                listName: this.constantService.listNames.JournalConf.name
            }
        ]
        const arrResults = await this.spOperationsService.executeBatch(objData);
        let jcLineItem = arrResults[0].retItems[0].Id;
        console.log('jcLineItem ', jcLineItem);

        // confirm() {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to Cancel Journal Conference Details?',
            accept: () => {
                //Project status empty, journalConference pubsuport status cancel
                // Update ProjectInformation
                let piObj = {
                    PubSupportStatus: ''
                }
                piObj['__metadata'] = { type: this.constantService.listNames.ProjectInformation.type }
                // let end = this.pubsupportService.pubsupportComponent.updateProjectInfo.updateProjInfo.replace('{{projectId}}', this.selectedProject.Id);
                const piEndpoint = this.spOperationsService.getItemURL(this.constantService.listNames.ProjectInformation.name, this.selectedProject.Id);

                // Update JC
                let jcObj = {
                    Status: 'Cancelled'
                }
                jcObj['__metadata'] = { type: this.constantService.listNames.JournalConf.type }
                const jcEndpoint = this.spOperationsService.getItemURL(this.constantService.listNames.JournalConf.name, jcLineItem);
                let data = [
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
            },
            reject: () => {

            },
        });
        // }
    }

    onChangeSelectedType(type: any) {
        console.log('type ', type);
        this.journal_Conference_Detail_form.get('jcLineItem').setValue('');
        this.getJCList(type);
    }

    jcListArray: any = [];
    optionLabel: any = {
        title: ''
    };
    async getJCList(type: string) {
        if (!type) {
            return false;
        }
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
        let endpoint;
        let jcObj = [];
        if (type === 'journal') {
            this.optionLabel.title = 'JournalName';
            endpoint = this.spServices.getReadURL('' + this.constantService.listNames.Journal.name + '', this.pubsupportService.pubsupportComponent.journal);
            jcObj = [{
                url: endpoint,
                type: 'GET',
                listName: this.constantService.listNames.Journal.name
            }];
        } else if (type === 'conference') {
            this.optionLabel.title = 'ConferenceName';
            endpoint = this.spServices.getReadURL('' + this.constantService.listNames.Conference.name + '', this.pubsupportService.pubsupportComponent.conference);
            jcObj = [{
                url: endpoint,
                type: 'GET',
                listName: this.constantService.listNames.Conference.name
            }];
        }
        const res = await this.spOperationsService.executeBatch(jcObj);
        if (res[0].retItems.hasError) {
            this.messageService.add({ key: 'myKey1', severity: 'error', summary: 'Error', detail: res[0].retItems.message.value, life: 4000 });
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
            return;
        } else if (res[0].retItems) {
            console.log('Res ', res);
            this.jcListArray = res[0].retItems;
            console.log('this.jcListArray ', this.jcListArray);
        }
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
    }

    onChangeSelectedJCItem(item: any, type: string) {
        console.log('item ', item);
        if (item.value) {


            if (type === 'journal') {
                // this.journal_Conference_Detail_form.addControl('Name', new FormControl({ value: '', disabled: true }, Validators.required));
                this.journal_Conference_Detail_form.addControl('ExpectedReviewPeriod', new FormControl([''], Validators.required));
                this.journal_Conference_Detail_form.addControl('IF', new FormControl([''], Validators.required));
                this.journal_Conference_Detail_form.addControl('RejectionRate', new FormControl([''], Validators.required));
                this.journal_Conference_Detail_form.addControl('Comments', new FormControl([''], Validators.required));
                this.journal_Conference_Detail_form.addControl('JournalEditorInfo', new FormControl([''], Validators.required));
                this.journal_Conference_Detail_form.addControl('UserName', new FormControl('', [Validators.required]));
                this.journal_Conference_Detail_form.addControl('Password', new FormControl('', [Validators.required]));

                // Set New Values
                this.journal_Conference_Detail_form.get('Name').setValue(item.value.JournalName);
                this.journal_Conference_Detail_form.get('ExpectedReviewPeriod').setValue(item.value.ExpectedReviewPeriod);
                this.journal_Conference_Detail_form.get('IF').setValue(item.value.ImpactFactor);
                this.journal_Conference_Detail_form.get('RejectionRate').setValue(item.value.RejectionRate);
                this.journal_Conference_Detail_form.get('Comments').setValue(item.value.Comments);
                this.journal_Conference_Detail_form.get('JournalEditorInfo').setValue(item.value.JournalEditorInfo);

                // Remove Conference Form
                this.journal_Conference_Detail_form.removeControl('CongressDate');
                this.journal_Conference_Detail_form.removeControl('AbstractSubmissionDeadline');
                // this.journal_Conference_Detail_form.removeControl('Name');
            } else {
                // this.journal_Conference_Detail_form.addControl('Name', new FormControl({ value: '', disabled: true }, Validators.required));
                this.journal_Conference_Detail_form.addControl('CongressDate', new FormControl(new Date(), [Validators.required]));
                this.journal_Conference_Detail_form.addControl('AbstractSubmissionDeadline', new FormControl(new Date(), [Validators.required]));
                this.journal_Conference_Detail_form.addControl('Comments', new FormControl([''], Validators.required));

                this.journal_Conference_Detail_form.get('Name').setValue(item.value.ConferenceName);
                this.journal_Conference_Detail_form.get('CongressDate').setValue(this.datePipe.transform(new Date(item.value.ConferenceDate), 'MMM dd, yyyy'));
                this.journal_Conference_Detail_form.get('AbstractSubmissionDeadline').setValue(this.datePipe.transform(new Date(item.value.SubmissionDeadline), 'MMM dd, yyyy'));
                this.journal_Conference_Detail_form.get('Comments').setValue(item.value.Comments);

                // Remove Journal Form
                this.journal_Conference_Detail_form.removeControl('UserName');
                this.journal_Conference_Detail_form.removeControl('Password');
                // this.journal_Conference_Detail_form.removeControl('Name');
                this.journal_Conference_Detail_form.removeControl('ExpectedReviewPeriod');
                this.journal_Conference_Detail_form.removeControl('IF');
                this.journal_Conference_Detail_form.removeControl('RejectionRate');
                this.journal_Conference_Detail_form.removeControl('JournalEditorInfo');
            }
            this.journal_Conference_Detail_form.updateValueAndValidity();
            console.log(this.journal_Conference_Detail_form.controls);
        }
    }

    onTypeSelected(type: string) {

        if (type === 'journal') {
            this.journal_Conf_form.addControl('IF', new FormControl('', Validators.required));
            this.journal_Conf_form.addControl('RejectionRate', new FormControl('', Validators.required));
            this.journal_Conf_form.addControl('ExpectedReviewPeriod', new FormControl('', Validators.required));
            this.journal_Conf_form.addControl('JournalEditorInfo', new FormControl('', Validators.required));
            this.journal_Conf_form.removeControl('CongressDate');
            this.journal_Conf_form.removeControl('AbstractSubmissionDeadline');
        } else {
            this.journal_Conf_form.addControl('CongressDate', new FormControl('', Validators.required));
            this.journal_Conf_form.addControl('AbstractSubmissionDeadline', new FormControl('', Validators.required));
            this.journal_Conf_form.removeControl('IF');
            this.journal_Conf_form.removeControl('RejectionRate');
            this.journal_Conf_form.removeControl('ExpectedReviewPeriod');
            this.journal_Conf_form.removeControl('JournalEditorInfo');
        }
    }

    get isValidAddUpdateJCDetailsForm() {
        return this.journal_Conference_Detail_form.controls;
        // this.journal_Conf_form
    }

    createJournalModal: boolean = false;
    createConferenceModal: boolean = false;
    createJC() {
        let type = this.journal_Conference_Detail_form.get('EntryType').value;
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
        if (type === 'journal') {
            const ref = this.dialogService.open(CreateJournalComponent, {
                data: this.jcListArray,
                closable: false,
                header: 'Create Journal',
                width: '85%'
            });

            ref.onClose.subscribe((conference) => {
                if (conference) {
                    this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Success', detail: 'Journal Created.', life: 4000 });
                    this.getJCList('journal');
                }
            });
        } else if (type === 'conference') {

            const ref = this.dialogService.open(CreateConferenceComponent, {
                data: this.jcListArray,
                closable: false,
                header: 'Create Conference',
                width: '85%'
            });

            ref.onClose.subscribe((conference) => {
                if (conference) {
                    this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Success', detail: 'Conference Created.', life: 4000 });
                    this.getJCList('conference');
                }
            });

        } else {
            this.messageService.add({ key: 'myKey1', severity: 'info', summary: 'Please select document type & try again.', detail: '', life: 4000 });
            return;
        }
    }

    cancelFormSub(formType) {
        if (formType === 'addJCDetailsModal') {
            this.addJCDetailsModal = false;
            this.journal_Conference_Detail_form.reset();
        }
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
    }

    // Modal Submit
    onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        this.submitBtn.isClicked = true;
        this.submitted = true;
        if (type === 'addJournal') {

            // stop here if form is invalid
            if (this.journal_Conf_form.invalid) {
                return;
            }
            this.submitBtn.isSubmit = true;
            this.journal_Conf_form.value.Status = 'Selected';
            this.journal_Conf_form.value.Title = this.selectedProject.ProjectCode;
            this.journal_Conf_form.value.__metadata = { type: 'SP.Data.JournalConferenceListItem' };
            const endpoint = this.pubsupportService.pubsupportComponent.addJC.addJCDetails;

            const data = [
                {
                    objData: this.journal_Conf_form.value,
                    endpoint,
                    requestPost: true
                }
            ];
            this.submit(data, type);

        } else if (type === 'addAuthor') {

            // stop here if form is invalid
            if (this.add_author_form.invalid) {
                return;
            }
            this.submitBtn.isSubmit = true;
            this.add_author_form.value.Title = this.selectedProject.ProjectCode;
            this.add_author_form.value.__metadata = { type: 'SP.Data.AuthorsListItem' };
            const endpoint = this.pubsupportService.pubsupportComponent.addAuthor.addAuthorDetails;
            const data = [
                {
                    objData: this.add_author_form.value,
                    endpoint,
                    requestPost: true
                }
            ];
            this.submit(data, type);

        } else if (type === 'updateAuthor') {

            // stop here if form is invalid
            if (this.update_author_form.invalid) {
                return;
            }
            this.submitBtn.isSubmit = true;
            if (this.filesToCopy.length) {
                this.update_author_form.removeControl('file');
                const fileCopyEndPoint = this.spServices.copyFiless(this.fileSourcePath, this.fileDestinationPath);

                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Author details updated.', detail: '', life: 4000 });
                document.getElementById('closeModalButton').click();
                this.reload();
            } else {
                this.uploadFileData('updateAuthors');
            }

        } else if (type === 'updateDecision') {

            // stop here if form is invalid
            if (this.update_decision_details.invalid) {
                return;
            }
            this.submitBtn.isSubmit = true;
            this.uploadFileData('updateDecision');

        } else if (type === 'updatePublication') {

            // stop here if form is invalid
            if (this.update_publication_form.invalid) {
                return;
            }
            this.submitBtn.isSubmit = true;
            this.uploadFileData('updatePublication');

        } else if (type === 'galley') {

            // stop here if form is invalid
            if (this.galley_form.invalid) {
                return;
            }
            this.submitBtn.isSubmit = true;
            this.uploadFileData('galley');
        } else if (type === 'addJCDetailsModal') {
            if (this.journal_Conference_Detail_form.invalid) {
                this.submitBtn.isClicked = false;
                return;
            }
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
            let obj = this.journal_Conference_Detail_form.getRawValue();
            obj['Status'] = 'Selected';
            obj['Title'] = this.selectedProject.ProjectCode;
            delete obj['jcLineItem']
            obj['JournalConferenceId'] = this.journal_Conference_Detail_form.getRawValue().jcLineItem.ID;
            obj['__metadata'] = { type: this.constantService.listNames.JournalConf.type }
            console.log('this.journal_Conference_Detail_form ', obj);

            const endpoint = this.pubsupportService.pubsupportComponent.addJC.addJCDetails;
            // const data = [
            //     {
            //         objData: obj,
            //         endpoint,
            //         requestPost: true
            //     }
            // ];
            let data = [{
                data: obj,
                url: endpoint,
                type: 'POST',
                listName: this.constantService.listNames.ProjectInformation.name
            }]
            this.submit(data, type);
        }
    }
    async submit(dataEndpointArray, type: string) {

        if (type === 'addJCDetailsModal') {
            const result = await this.spOperationsService.executeBatch(dataEndpointArray);
            const res = result[0].retItems;
            if (res.hasError) {
                this.messageService.add({ key: 'myKey1', severity: 'error', summary: 'Error', detail: res.message.value, life: 4000 });
            } else {
                console.log('res ', res);
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Success', detail: 'Journal Conference details submitted Successfully.', life: 4000 });
            }
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
            this.addJCDetailsModal = false;
        }

        this.batchContents = [];

        const batchGuid = this.spServices.generateUUID();
        const changeSetId = this.spServices.generateUUID();
        dataEndpointArray.forEach(element => {
            if (element) {

                this.batchContents = [...this.batchContents, ...this.spServices.getChangeSetBody1(changeSetId, element.endpoint, JSON.stringify(element.objData), element.requestPost)];
            }
        });
        this.batchContents.push('--changeset_' + changeSetId + '--');
        const batchBody = this.batchContents.join('\r\n');
        const batchBodyContent = this.spServices.getBatchBodyPost(batchBody, batchGuid, changeSetId);
        batchBodyContent.push('--batch_' + batchGuid + '--');
        const sBatchData = batchBodyContent.join('\r\n');

        this.spServices.getData(batchGuid, sBatchData).subscribe(res => {
            this.projInfoResponse = res;
            const arrResults = [];
            const responseInLines = this.projInfoResponse._body.split('\n');
            // tslint:disable-next-line:prefer-for-of
            for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
                try {
                    const tryParseJson = JSON.parse(responseInLines[currentLine]);
                    arrResults.push(tryParseJson.d);
                } catch (e) {
                }
            }
            if (arrResults.length > 0 && type === 'addJournal') {
                this.updateProjectSts_JCSubmissionDetails(arrResults);
                // this.journal_Conf_form.reset();
                let entryTypeJC = '';
                if (this.journal_Conf_form.value.EntryType.toLowerCase() === 'journal') {
                    entryTypeJC = 'Journal Submitted.';
                } else if (this.journal_Conf_form.value.EntryType.toLowerCase() === 'conference') {
                    entryTypeJC = 'Conference Submitted.';
                }
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: entryTypeJC, detail: '', life: 4000 });
                document.getElementById('closeModalButton').click();
                this.reload();

            } else if (arrResults.length > 0 && type === 'addAuthor') {
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Author added.', detail: '', life: 4000 });
                document.getElementById('closeModalButton').click();
                this.add_author_form.reset();
                this.reload();
                // this.addAuthorFormField();
            } else if (type === 'updateDecision') {
                this.update_decision_details.reset();
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Updated Decision.', detail: '', life: 4000 });
                document.getElementById('closeModalButton').click();
                this.reload();
            } else if (type === 'galley') {
                this.galley_form.reset();
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Galley Overrided.', detail: '', life: 4000 });
                document.getElementById('closeModalButton').click();
                this.reload();
            } else if (type === 'updatePublication') {
                this.update_publication_form.reset();

                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Publication details Updated.', detail: '', life: 4000 });
                document.getElementById('closeModalButton').click();
                this.reload();
            }
        });
    }

    updateProjectSts_JCSubmissionDetails(res: any) {

        const projEndpoint = this.pubsupportService.pubsupportComponent.updateProjectInfo.updateProjInfo.replace('{{projectId}}', this.selectedProject.Id);
        const projObj: any = {
            PubSupportStatus: 'Selected'
        };
        projObj.__metadata = { type: 'SP.Data.ProjectInformationListItem' };
        const obj1 = {
            endpoint: projEndpoint,
            objData: projObj,
            requestPost: false
        };

        const jcSubEndpoint = this.pubsupportService.pubsupportComponent.addJCSubmission.addJCDetails;
        const jcSubObj: any = {
            JCID: res[0].ID,
            Title: res[0].Title,
            Status: res[0].Status
        };
        jcSubObj.__metadata = { type: 'SP.Data.JCSubmissionListItem' };
        const obj2 = {
            endpoint: jcSubEndpoint,
            objData: jcSubObj,
            requestPost: true
        };
        const arr = [];
        arr.push(obj1, obj2);
        this.submit(arr, '');
    }

    updateProjectInfo(res: any, type: string) {

        const endpoint = this.pubsupportService.pubsupportComponent.updateProjectInfo.updateProjInfo.replace('{{projectId}}', this.selectedProject.Id);
        const obj: any = {};
        if (type === 'updateDecision') {
            obj.PubSupportStatus = this.update_decision_details.value.Decision;
        } else if (type === 'galley') {
            obj.PubSupportStatus = 'Galleyed';
        } else if (type === 'updatePublication') {
            obj.PubSupportStatus = 'Published';
        }
        obj.__metadata = { type: 'SP.Data.ProjectInformationListItem' };
        return {
            endpoint,
            objData: obj,
            requestPost: false
        };
    }
    updateJCSubmissionDetails(res: any, type: string) {
        let jcSubId;
        this.jc_jcSubId[1].forEach(element => {
            if (element) {
                jcSubId = element.ID;
            }
        });
        const endpoint = this.pubsupportService.pubsupportComponent.addJCSubmission.updateJCSubmssion.replace('{{Id}}', jcSubId);
        const obj: any = {};
        if (type === 'updateDecision') {
            obj.DecisionURL = res.ServerRelativeUrl;
            obj.DecisionDate = new Date();
            obj.Status = this.update_decision_details.value.Decision;
            obj.Decision = this.update_decision_details.value.Decision;
        } else if (type === 'galley') {
            obj.Status = 'Galleyed';
        } else if (type === 'updatePublication') {
            obj.Status = 'Published';
        }
        obj.__metadata = { type: 'SP.Data.JCSubmissionListItem' };
        return {
            endpoint,
            objData: obj,
            requestPost: false
        };
    }

    addJC() {
        const jcSubEndpoint = this.pubsupportService.pubsupportComponent.addJCSubmission.addJCDetails;
        const jcSubObj: any = {
            JCID: this.jcId,
            Title: this.selectedProject.ProjectCode,
            Status: 'Selected'
        };
        jcSubObj.__metadata = { type: 'SP.Data.JCSubmissionListItem' };
        return {
            endpoint: jcSubEndpoint,
            objData: jcSubObj,
            requestPost: true
        };
    }
    updateJCDetails(res: any, type: string) {
        this.jc_jcSubId[0].retItems.forEach(element => {
            if (element) {
                this.jcId = element.ID;
            }
        });
        const endpoint = this.pubsupportService.pubsupportComponent.addJC.updateJCDetails.replace('{{Id}}', this.jcId);
        const obj: any = {};
        if (type === 'updateDecision') {
            obj.Status = this.update_decision_details.value.Decision;
        } else if (type === 'galley') {
            obj.Status = 'Galleyed';
        } else if (type === 'updatePublication') {
            obj.Status = 'Published';
            obj.PublicationDate = new Date();
            obj.PublicationURL = res.ServerRelativeUrl;
            obj.PublicationTitle = this.update_publication_form.value.PublicationTitle;
            obj.Citation = this.update_publication_form.value.Citation;
            obj.PDFAvailable = this.update_publication_form.value.PDFAvailable;
        }
        obj.__metadata = { type: 'SP.Data.JournalConferenceListItem' };
        return {
            endpoint,
            objData: obj,
            requestPost: false
        };
    }

    addJCGalley(res: any) {
        let jcSubId;
        this.jc_jcSubId[1].retItems.forEach(element => {
            if (element) {
                jcSubId = element.ID;
            }
        });
        const jcGalleyEndpoint = this.pubsupportService.pubsupportComponent.addJCGalley.addNewJCGalley;
        const jcGalleyObj: any = {
            Title: this.selectedProject.ProjectCode,
            JCSubmissionID: jcSubId,
            GalleyDate: new Date(),
            GalleyURL: res.ServerRelativeUrl
        };
        jcGalleyObj.__metadata = { type: 'SP.Data.JCGalleyListItem' };
        return {
            endpoint: jcGalleyEndpoint,
            objData: jcGalleyObj,
            requestPost: true
        };
    }

    uploadFileData(type: string) {
        this.nodeService.uploadFIle(this.filePathUrl, this.fileReader.result).subscribe(res => {

            if (res.d && type !== 'updateAuthors') {
                const arrayUpdateData = [];
                const data1 = this.updateProjectInfo(res.d, type);
                const data2 = this.updateJCSubmissionDetails(res.d, type);
                const data3 = this.updateJCDetails(res.d, type);
                let data4;
                if (this.update_decision_details.value.Decision === 'Resubmit to same journal') {
                    data4 = this.addJC();
                }
                if (type === 'galley') {
                    data4 = this.addJCGalley(res.d);
                }
                arrayUpdateData.push(data1, data2, data3, data4);
                this.submit(arrayUpdateData, type);
            }
            if (type === 'updateAuthors') {
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Author details updated.', detail: '', life: 4000 });
                document.getElementById('closeModalButton').click();
                this.reload();
            }
        });
    }

    async getJC_SubID() {
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        const obj = {

            filter: this.pubsupportService.pubsupportComponent.activeJCSubmission.filter.replace('{{ProjectCode}}', this.selectedProject.ProjectCode).replace('{{Status}}', this.selectedProject.PubSupportStatus),
            select: this.pubsupportService.pubsupportComponent.activeJC.select,
            top: this.pubsupportService.pubsupportComponent.activeJC.top,
            orderby: this.pubsupportService.pubsupportComponent.activeJC.orderby
        };
        const jsEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.JCSubmission.name + '', obj);
        this.spServices.getBatchBodyGet(batchContents, batchGuid, jsEndpoint);
        batchContents.push('--batch_' + batchGuid + '--');
        const userBatchBody = batchContents.join('\r\n');

        await this.spServices.getData(batchGuid, userBatchBody).subscribe(res => {
            this.projInfoResponse = res;
            const arrResults = [];
            const responseInLines = this.projInfoResponse._body.split('\n');
            // tslint:disable-next-line:prefer-for-of
            for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
                try {
                    const tryParseJson = JSON.parse(responseInLines[currentLine]);
                    arrResults.push(tryParseJson.d.results);
                } catch (e) {
                }
            }

        });
    }
    jcViewDetails = (index: number) => {
        this.showJournalRowIndex = index;
        this.journal_Conf_details = this.journal_Conf_data[0].element[index];
        this.state = !this.state;
    }
    // On Row Expand
    onRowExpand(psProject: any) {
        this.isPSInnerLoaderHidden = false;
        this.showHideJC = false;
        this.getJCDetails(psProject.data);
        this.state = false;
        this.parentRowIndex = psProject.data.id - 1;
        this.showSubDetails = false;
    }
    async getJCDetails(project: any) {
        this.selectedProject = project;
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        const obj = {
            filter: this.pubsupportService.pubsupportComponent.journalConf.filter.replace('{{ProjectCode}}', project.ProjectCode),
            select: this.pubsupportService.pubsupportComponent.journalConf.select,
            top: this.pubsupportService.pubsupportComponent.journalConf.top,
            orderby: this.pubsupportService.pubsupportComponent.journalConf.orderby
        };
        const jsEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.JournalConf.name + '', obj);
        this.spServices.getBatchBodyGet(batchContents, batchGuid, jsEndpoint);
        batchContents.push('--batch_' + batchGuid + '--');
        const userBatchBody = batchContents.join('\r\n');
        const jsData = await this.spServices.executeGetBatchRequest(batchGuid, userBatchBody);
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
        this.isPSInnerLoaderHidden = true;
        this.showHideJC = true;
    }
    showHideSubDetails(index: number, SelectedProj) {
        this.showHideSubDetailsData = false;
        this.showSubDetailsIndex = index;
        this.showSubDetails = !this.showSubDetails;
        if (this.showSubDetails) {
            // Galley Index reset
            this.showHideGalleyData = false;
            // Show Loadder
            this.isPSInnerLoaderHidden = false;

            // submission_details_data
            this.getSubmissionDetails(index, SelectedProj);
            this.showHideSubDetailsData = true;
        }
    }
    async getSubmissionDetails(index: any, selectedJC: any) {

        this.submission_details_data = [];
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        const obj = {

            filter: this.pubsupportService.pubsupportComponent.jcSubmission.filter.replace('{{ProjectCode}}', selectedJC.Title).replace('{{JCID}}', selectedJC.ID),
            select: this.pubsupportService.pubsupportComponent.jcSubmission.select,
            top: this.pubsupportService.pubsupportComponent.jcSubmission.top,
            orderby: this.pubsupportService.pubsupportComponent.jcSubmission.orderby
        };
        const jsEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.JCSubmission.name + '', obj);
        this.spServices.getBatchBodyGet(batchContents, batchGuid, jsEndpoint);
        batchContents.push('--batch_' + batchGuid + '--');
        const userBatchBody = batchContents.join('\r\n');
        await this.spServices.getData(batchGuid, userBatchBody).subscribe(res => {
            this.subResponse = res;
            // const arrResults = [];
            const responseInLines = this.subResponse._body.split('\n');
            // tslint:disable-next-line:prefer-for-of
            for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
                try {
                    const tryParseJson = JSON.parse(responseInLines[currentLine]);
                    if (tryParseJson.d.results.length >= 1) {
                        this.submission_details_data.push(tryParseJson.d.results);
                    }
                } catch (e) {
                }
            }
            // Hide Loader
            this.isPSInnerLoaderHidden = true;
        });
    }
    viewGalleyDetails(index: number, jcSubData: any) {
        this.galleyRowIndex = index;
        this.showHideGalleyDetails = !this.showHideGalleyDetails;
        this.galleyIndexChecked = index;
        this.showHideGalleyData = false;
        // Show Loadder
        // this.isPSInnerLoaderHidden = false;
        // setTimeout(() => {

        // this.galleyDetailsData
        if (this.showHideGalleyDetails) {
            this.isPSInnerLoaderHidden = false;
            this.getGalleyDetails(index, jcSubData);
            this.showHideGalleyData = true;
        }
        // }, 2000)
    }
    async getGalleyDetails(index: any, selectedJC: any) {
        // this.selectedProject = selectedJC;
        this.galleyDetailsData = [];
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        const obj = {

            filter: this.pubsupportService.pubsupportComponent.jcGalley.filter.replace('{{ProjectCode}}', selectedJC.Title).replace('{{JCSubID}}', selectedJC.ID),
            select: this.pubsupportService.pubsupportComponent.jcGalley.select,
            top: this.pubsupportService.pubsupportComponent.jcGalley.top,
            orderby: this.pubsupportService.pubsupportComponent.jcGalley.orderby
        };
        const jsEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.jcGalley.name + '', obj);
        this.spServices.getBatchBodyGet(batchContents, batchGuid, jsEndpoint);
        batchContents.push('--batch_' + batchGuid + '--');
        const userBatchBody = batchContents.join('\r\n');
        await this.spServices.getData(batchGuid, userBatchBody).subscribe(res => {
            this.subResponse = res;
            // const arrResults = [];
            const responseInLines = this.subResponse._body.split('\n');
            // tslint:disable-next-line:prefer-for-of
            for (let currentLine = 0; currentLine < responseInLines.length; currentLine++) {
                try {
                    const tryParseJson = JSON.parse(responseInLines[currentLine]);
                    if (tryParseJson.d.results.length >= 1) {
                        this.galleyDetailsData.push(tryParseJson.d.results);
                    }
                } catch (e) {
                }
            }
            // Hide Loader
            this.isPSInnerLoaderHidden = true;
        });

    }

    // On Click of Project code
    goToProjectDetails(data: any, index: number) {
        window.open(this.globalObject.sharePointPageObject.webAbsoluteUrl + '/project-mgmt?ProjectCode=' + data.ProjectCode);
        // this.router.navigate([this.globalObject.sharePointPageObject.webAbsoluteUrl + '//project-mgmt?ProjectCode=' + data.ProjectCode]);
    }

    submissionDetails(index: number) {
        setTimeout(() => {
            this.isSubmisssionDetails = true;
        }, 2000);
    }
    downloadFile(file: string, fileName: string) {
        if (file) {
            this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Files are downloading...', detail: '', life: 2000 });
            const fileArray = file.split(';#');
            this.nodeService.createZip(fileArray, fileName);
        } else {
            this.messageService.add({ key: 'myKey1', severity: 'warn', summary: 'No file avaliable.', detail: '', life: 4000 });
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

                this.filePathUrl = this.globalObject.sharePointPageObject.webAbsoluteUrl + '/_api/web/GetFolderByServerRelativeUrl(' + '\'' + this.selectedProject.ProjectFolder + '' + folderPath + '\'' + ')/Files/add(url=@TargetFileName,overwrite=\'true\')?' +
                    '&@TargetFileName=\'' + this.selectedFile.name + '\'';
            };

        }
    }

    // TO update data after submit just call method name in DoCheck mothod
    // tslint:disable-next-line:use-life-cycle-interface
    ngDoCheck() { }

    reload() {
        setTimeout(() => {
            // window.location.reload();
            this.currentUserInfo();
        }, 3000);
    }
    async openAuthorModal(data: any) {
        this.selectedProject = [];
        this.selectedProject = data;
        const obj = {
            filter: this.pubsupportService.pubsupportComponent.authors.filter.replace('{{ProjectCode}}', data.ProjectCode),
            select: this.pubsupportService.pubsupportComponent.authors.select,
            top: this.pubsupportService.pubsupportComponent.authors.top
        };
        this.authorsData = await this.spServices.read('Authors', obj);
        this.onTabChange();
    }
    async onTabChange() {
        this.authorsFiles = [];
        const fileEndPoint = this.selectedProject.ProjectFolder + '/Publication Support/Forms/';

        const authorFilesGet = await this.spServices.readFiles(fileEndPoint);

        // tslint:disable-next-line:only-arrow-functions
        authorFilesGet.sort(function (a, b) {
            a = new Date(a.TimeLastModified);
            b = new Date(b.TimeLastModified);
            return a < b ? -1 : a > b ? 1 : 0;
        });
        this.authorsFiles = authorFilesGet;

    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngOnDestroy() {

        // avoid memory leaks here by cleaning up after ourselves. If we don't then we will continue to run our initialiseInvites() method on every navigationEnd event.
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }

    onChangeSelect(event) {
        if (this.selectedOption.name === 'Open') {
            this.isPSInnerLoaderHidden = false;
            this.showProjectInput = false;
            this.callGetProjects(false);
        } else {
            this.showProjectInput = true;
            this.pubSupportProjectInfoData = [];
            this.providedProjectCode = '';
        }
    }

    searchClosedProject(event) {
        // const projectCode = this.providedProjectCode;
        // alert(projectCode);
        this.isPSInnerLoaderHidden = false;
        this.callGetProjects(true);
    }

}
