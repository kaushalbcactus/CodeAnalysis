import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PrimengModule } from '../../primeng/primeng.module';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { TimelineHistoryComponent } from './timeline-history.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Versionhistory } from '../interfaces/versionhistory';
describe('TimelineHistoryComponent', () => {
  let component: TimelineHistoryComponent;
  let fixture: ComponentFixture<TimelineHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TimelineHistoryComponent],
      imports: [
        CommonModule,
        PrimengModule,
        FormsModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        NoopAnimationsModule
      ],
      providers: [DatePipe, MessageService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create version history object for project management -> all projects', () => {
    expect(component.createStructure('ProjectMgmt', 'ProjectMgmt_Project', '1')).toEqual(jasmine.objectContaining({
      ID: '1',
      versionUrl: {
        select: 'Id,ProjectType, DescriptionMT,ClientLegalEntity, PubSupportStatus, BusinessVertical, ProjectCode, SOWCode, CommentsMT, ProjectFolder, PrimaryPOC, TA, Indication, Molecule, PriorityST, Authors,' +
          'Status, IsPubSupport, SOWBoxLink, SOWLink, Title, WBJID, Milestone, ProposedStartDate, ProposedEndDate, ConferenceJournal, BD/LookupId, BD/LookupValue,' +
          'CMLevel1/LookupId, CMLevel1/LookupValue, CMLevel2/LookupId, CMLevel2/LookupValue, DeliveryLevel1/LookupId, DeliveryLevel1/LookupValue,' +
          'DeliveryLevel2/LookupId, DeliveryLevel2/LookupValue,' +
          'IsCurrentVersion,VersionLabel, VersionId, Modified, Editor/LookupId, Editor/LookupValue',
        Expand: 'CMLevel1, CMLevel2, DeliveryLevel1, DeliveryLevel2, Editor, BD',
        skip: '{{skipCount}}',
        top: '{{top}}',
      },
      propertiesRequired: ['Title', 'ProjectType', 'PubSupportStatus', 'DescriptionMT', 'ConferenceJournal', 'SOWCode', 'Authors', 'CommentsMT', 'BusinessVertical', 'PrimaryPOC', 'TA', 'Indication', 'Molecule', 'PriorityST',
        'Status', 'IsPubSupport', 'SOWBoxLink', 'SOWLink', 'BD', 'CMLevel1', 'CMLevel2', 'DeliveryLevel1', 'DeliveryLevel2', 'WBJID', 'Milestone',
        'ProposedStartDate', 'ProposedEndDate'],
      entityType: 'ProjectMgmt_ProjectInformationCT',
    }));
  });
  it('should create version history object for project management -> Dashboard', () => {
    expect(component.createStructure('ProjectMgmt', 'ProjectMgmt_ProjectFromDashboard', '1')).toEqual(jasmine.objectContaining({
      ID: '1',
      versionUrl: {
        select: 'Id,ProjectType, DescriptionMT,ClientLegalEntity, PubSupportStatus, BusinessVertical, ProjectCode, SOWCode, CommentsMT, ProjectFolder, PrimaryPOC, TA, Indication, Molecule, PriorityST, Authors,' +
          'Status, IsPubSupport, SOWBoxLink, SOWLink, Title, WBJID, Milestone, ProposedStartDate, ProposedEndDate, ConferenceJournal, BD/LookupId, BD/LookupValue,' +
          'CMLevel1/LookupId, CMLevel1/LookupValue, CMLevel2/LookupId, CMLevel2/LookupValue, DeliveryLevel1/LookupId, DeliveryLevel1/LookupValue,' +
          'DeliveryLevel2/LookupId, DeliveryLevel2/LookupValue,' +
          'IsCurrentVersion,VersionLabel, VersionId, Modified, Editor/LookupId, Editor/LookupValue',
        Expand: 'CMLevel1, CMLevel2, DeliveryLevel1, DeliveryLevel2, Editor, BD',
        skip: '{{skipCount}}',
        top: '{{top}}',
      },
      propertiesRequired: ['Title', 'ProjectType', 'PubSupportStatus', 'DescriptionMT', 'ConferenceJournal', 'SOWCode', 'Authors', 'CommentsMT', 'BusinessVertical', 'PrimaryPOC', 'TA', 'Indication', 'Molecule', 'PriorityST',
        'Status', 'IsPubSupport', 'SOWBoxLink', 'SOWLink', 'BD', 'CMLevel1', 'CMLevel2', 'DeliveryLevel1', 'DeliveryLevel2', 'WBJID', 'Milestone',
        'ProposedStartDate', 'ProposedEndDate'],
      entityType: 'ProjectMgmt_ProjectInformationCT',
    }));
  });

});
