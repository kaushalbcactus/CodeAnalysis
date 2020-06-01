import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { MyDashboardConstantsService } from '../services/my-dashboard-constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { CommonService } from 'src/app/Services/common.service';
@Component({
  selector: 'app-add-edit-comment-dialog',
  templateUrl: './add-edit-comment-dialog.component.html',
  styleUrls: ['./add-edit-comment-dialog.component.css']
})

export class AddEditCommentComponent implements OnInit {

  editor: any;
  modalloaderenable: boolean;
  public modalInnerLoader;
  data: any;
  // batchContents: any;
  response: any;
  currentTask: any;
  commentsdb: any = [];
  previousComment: string = null;
  MarkComplete: any;
  disableComment = false;
  @Input() taskData: any;
  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private constants: ConstantsService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private spServices: SPOperationService,
    private common: CommonService) { }

  ngOnInit() {
    this.data = this.config.data === undefined ? this.taskData : this.config.data;
    if (this.data !== undefined) {
      this.MarkComplete = this.data.MarkComplete;
      this.modalloaderenable = true;
      if (this.MarkComplete) {

        this.modalloaderenable = false;
        this.onload();
      } else {
        if (this.config.data === undefined) {
          this.getComments(this.data, true);
        } else {
          this.getComments(this.data.task, true);
        }

      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    this.modalloaderenable = true;
    this.data = this.config.data === undefined ? this.taskData : this.config.data;
    this.getComments(this.data, false);

  }
  onload() {
    DecoupledEditor
      .create(document.querySelector('#editor'))
      .then(editor => {
        this.editor = editor;
        const toolbarContainer = document.querySelector('#toolbar-container');
        toolbarContainer.appendChild(editor.ui.view.toolbar.element);
        editor.model.document.on('change', () => {
          this.disableComment = this.editor.getData() === '' ? false : true;
        });
      })
      .catch(error => {
        console.error(error);
      });

    this.modalloaderenable = false;
  }



  // *********************************************************************************************************
  //  Get Comment on load
  // *********************************************************************************************************


  async getComments(task, firstLoad) {

    const objComment = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.Comments);
    // Comment.filter = Comment.filter.replace(/{{taskID}}/gi, task.ID);

    this.common.SetNewrelic('MyDashboard', 'AddEditCommentDialog', 'getComments');
    this.response = await this.spServices.readItem(this.constants.listNames.Schedules.name, task.ID, objComment);

    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();
    // const CommentUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', Comment);
    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, CommentUrl);
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

    this.currentTask = this.response;

    await this.fetchCommentsForMilestone(this.currentTask);

    if (firstLoad) {
      DecoupledEditor
        .create(document.querySelector('#editor'))
        .then(editor => {
          this.editor = editor;
          const toolbarContainer = document.querySelector('#toolbar-container');
          toolbarContainer.appendChild(editor.ui.view.toolbar.element);
        })
        .catch(error => {
          console.error(error);
        });
    }


    this.modalloaderenable = false;
  }


  // *********************************************************************************************************
  //  Cancel task comment
  // *********************************************************************************************************
  cancelComment() {
    this.editor.setData('');
    if (this.config.data !== undefined) {
      this.ref.close();
      this.commentsdb = [];
    }
  }

  // *********************************************************************************************************
  //  save / Update task comment
  // ********************************************************************************************************

  async saveComment(IsMarkComplete) {
    const commentObj = {
      comment: this.previousComment !== null ? this.previousComment + this.editor.getData() : this.editor.getData(),
      IsMarkComplete: IsMarkComplete
    };
    if (IsMarkComplete) {
      this.ref.close(commentObj);
    } else {
      if (this.editor.getData() !== '') {
        this.modalloaderenable = true;
        this.commentsdb = [];
        if (this.config.data) {
          this.ref.close(commentObj);
        } else {
          const data = {
            TaskComments: commentObj.comment
          };
          this.editor.setData('');
          this.common.SetNewrelic('MyDashboard', 'AddEditCommentDialog', 'SaveComment');
          await this.spServices.updateItem(this.constants.listNames.Schedules.name, this.data.ID, data, this.constants.listNames.Schedules.type);
          this.common.showToastrMessage(this.constants.MessageType.success, 'Comment saved successfully',false);
          this.getComments(this.data, false);
        }

      } else {
        this.common.showToastrMessage(this.constants.MessageType.warn, 'Please enter the comment',false);
      }
    }
  }

  // **********************************************************************************************
  //  Get all comments of milestones
  // **********************************************************************************************
  async fetchCommentsForMilestone(oCurrentTask) {

    const milestone = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.Milestone);
    milestone.filter = milestone.filter.replace(/{{ProjectCode}}/gi, oCurrentTask.ProjectCode).replace(/{{Milestone}}/gi, oCurrentTask.Milestone);
    this.common.SetNewrelic('MyDashboard', 'AddEditCommentDialog', 'fetchMilestoneComments');
    this.response = await this.spServices.readItems(this.constants.listNames.Schedules.name, milestone);

    this.commentsdb = this.response.length ? this.response : [];
    if (this.commentsdb.filter(c => c.TaskComments !== null) !== undefined) {
      this.commentsdb = this.commentsdb.filter(c => c.TaskComments !== null);
      this.commentsdb.map(c => c.TaskName = c.Title).sort(c => c.Created);

      if (this.commentsdb.find(c => c.ID === this.currentTask.ID) !== undefined) {
        this.previousComment = this.commentsdb.find(c => c.ID === this.currentTask.ID).TaskComments;
      }
    } else {
      this.commentsdb = [];
    }

  }

}
