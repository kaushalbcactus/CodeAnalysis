import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PubsuportConstantsService {

    constructor() { }

    pubsupportComponent = {
        isPSInnerLoaderHidden: true,
        projectInfo: {
            select: "ID,ProjectCode,ClientLegalEntity,DeliverableType,Status,PubSupportStatus,PrimaryPOC,JournalSelectionURL,JournalSelectionDate,LastSubmissionDate,Milestones,ProjectFolder",
            filter: "Status ne 'Closed' and Status ne 'Cancelled' and Status ne 'In Discussion' and Status ne 'Pending Closure' and IsPubSupport eq 'Yes' and substringof('Writing', ProjectType) and ProjectType ne 'FTE-Writing'",
            top: 4500
        },
        projectInfoClosed: {
            select: "ID,ProjectCode,ClientLegalEntity,DeliverableType,Status,PubSupportStatus,PrimaryPOC,JournalSelectionURL,JournalSelectionDate,LastSubmissionDate,Milestones,ProjectFolder",
            filter: "ProjectCode eq '{{ProjectCode}}' and (Status eq 'Closed' or Status eq 'Pending Closure') and IsPubSupport eq 'Yes' and substringof('Writing', ProjectType) and ProjectType ne 'FTE-Writing'",
            top: 1
        },
        projectInfoUser: {
            select: "ID,ProjectCode,ClientLegalEntity,DeliverableType,Status,PubSupportStatus,PrimaryPOC,JournalSelectionURL,JournalSelectionDate,LastSubmissionDate,Milestones,ProjectFolder",
            filter: "((Status ne 'Closed' and Status ne 'Cancelled' and Status ne 'In Discussion' and Status ne 'Pending Closure' and IsPubSupport eq 'Yes' and substringof('Writing', ProjectType) and ProjectType ne 'FTE-Writing') and (AllOperationresourcesId eq {{ID}} or AllDeliveryResourcesId eq {{ID}}))",
            top: 4500
        },
        projectInfoCode: {
            select: "ID,ProjectCode,ClientLegalEntity,Status,PubSupportStatus",
            filter: "ClientLegalEntity eq '{{ClientLegalEntity}}' and IsPubSupport eq 'Yes' and Status ne 'Cancelled' ",
            top: 4500,
            orderby: "ProjectCode asc"
        },
        projectContact: {
            select: "ID, ClientLegalEntity, FName, LName, EmailAddress, Status",
            filter: "Status ne 'InActive'",
            top: 4500
        },
        clientLegalEntity: {
            select: "ID,Title,ListName",
            filter: "IsActiveCH eq 'Yes'",
            orderby: "Title",
            top: 4500
        },
        journalConf: {
            select: "ID, Title, NameST, IF, RejectionRate, ExpectedReviewPeriod, JournalEditorInfo, IsSelected, Status, UserNameST, Password, PublicationDate, PublicationURL, PublicationTitle, Citation, PDFAvailable, JournalRequirementURL, EntryType, AbstractSubmissionDeadline, CongressDate, Milestone, JournalRequirementDate, Created, CommentsMT, JournalRequirementResponse, JournalConferenceId",
            filter: "Title eq '{{ProjectCode}}' and Status ne 'Cancelled' ",
            top: 4500,
            orderby: "Created desc"
        },
        activeJC: {
            select: "ID",
            filter: "Title eq '{{ProjectCode}}' and Status eq '{{Status}}'",
            top: 1,
            orderby: "Created desc"
        },
        jcSubmission: {
            select: "ID, Title, JCID, SubmissionDate, SubmissionURL, SubmissionPkgURL, DecisionURL, DecisionDate, Decision, Status, Created ",
            filter: "Title eq '{{ProjectCode}}' and JCID eq '{{JCID}}' and Status ne 'Deleted' ",
            top: 4500,
            orderby: "Created desc"
        },
        activeJCSubmission: {
            select: "ID",
            filter: "Title eq '{{ProjectCode}}' and Status eq '{{Status}}'",
            top: 1,
            orderby: "Created desc"
        },
        jcSubmissionforResubmit: {
            select: "ID, Status" ,
            filter: "Title eq '{{ProjectCode}}' and Status ne 'Deleted'",
            top: 2,
            orderby: "Created desc"
        },
        jcGalley: {
            select: "ID, Title, JCSubmissionID, GalleyDate, GalleyURL, Created",
            filter: "Title eq '{{ProjectCode}}' and JCSubmissionID eq '{{JCSubID}}' ",
            top: 4500,
            orderby: "Created desc"
        },
        authors: {
            select: "ID, FirstNameST,LastName,CommentsMT,HighestDegree,EmailAddress,AddressMT,Affiliation,Phone_x0020_No,Fax,AuthorType",
            filter: "Title eq '{{ProjectCode}}' ",
            top: 4500
        },
        journal: {
            select: "ID,JournalName,CommentsMT,ImpactFactor,RejectionRate,ExpectedReviewPeriod,JournalEditorInfo,IsActiveCH",
            top: 4500,
            filter: "IsActiveCH eq 'Yes'",
            orderby: "Created desc"
        },
        conference: {
            select: "ID,ConferenceName,ConferenceDate,SubmissionDeadline,CommentsMT,IsActiveCH",
            top: 4500,
            filter: "IsActiveCH eq 'Yes'",
            orderby: "Created desc"
        }
    }
}
