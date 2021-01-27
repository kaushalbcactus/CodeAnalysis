import { Component, OnInit } from "@angular/core";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng";
import { CommonService } from "src/app/Services/common.service";
import { ConstantsService } from "src/app/Services/constants.service";
import { TaskAllocationCommonService } from '../services/task-allocation-common.service';

@Component({
  selector: "app-writer-review-transition",
  templateUrl: "./writer-review-transition.component.html",
  styleUrls: ["./writer-review-transition.component.css"]
})
export class WriterReviewTransitionComponent implements OnInit {
  writerReasons: any = [];
  reviewerReasons: any = [];
  milestoneData: any = [];
  newAddedWriteTasks: any = [];
  newAddedReviewTasks: any = [];
  // prevReviewTasks: any = [];
  // prevWriteTasks: any = [];
  writerReason: any;
  reviewerReason: any;
  writeTransition: boolean
  reviewTransition: boolean;
  writerArr = [];
  reviewerArr = [];
  transitionMil: any;
  cols = [{ field: "Transition", header: "Transition" }];

  constructor(
    private config: DynamicDialogConfig,
    public dialogRef: DynamicDialogRef,
    public commonService: CommonService,
    public constants: ConstantsService,
    public taskAllocateCommonService: TaskAllocationCommonService
  ) {}

  ngOnInit() {
    this.writerReasons = [
      { label: "Primary writer on leave", value: "Primary writer on leave" },
      {
        label: "Primary writer working on another project",
        value: "Primary writer working on another project"
      },
      {
        label: "Primary writer not with CACTUS anymore",
        value: "Primary writer not with CACTUS anymore"
      },
      {
        label: "Primary writer moved to another team",
        value: "Primary writer moved to another team"
      },
      {
        label: "Project transitioned to original writer",
        value: "Project transitioned to original writer"
      }
    ];

    this.reviewerReasons = [
      { label: "Primary reviewer on leave", value: "Primary reviewer on leave" },
      {
        label: "Primary reviewer working on another project",
        value: "Primary reviewer working on another project"
      },
      {
        label: "Primary reviewer not with CACTUS anymore",
        value: "Primary reviewer not with CACTUS anymore"
      },
      {
        label: "Primary reviewer moved to another team",
        value: "Primary reviewer moved to another team"
      },
      {
        label: "Project transitioned to original reviewer",
        value: "Project transitioned to original reviewer"
      }
    ];

    this.milestoneData = this.config.data.milestoneData;
    // this.prevWriteTasks = this.config.data.prevWriteTasks;
    // this.prevReviewTasks = this.config.data.prevReviewTasks;
    this.newAddedWriteTasks = this.config.data.newAddedWriteTasks;
    this.newAddedReviewTasks = this.config.data.newAddedReviewTasks;
    this.writeTransition = this.config.data.writeTransition;
    this.reviewTransition = this.config.data.reviewTransition;
    this.transitionMil = this.config.data.transitionMilestone;

   
    let allMilestone = this.milestoneData.filter(e=> e.data.type=='milestone').map(e=> e.data);
    let mil = allMilestone.map(e=> e.title)
    let startIndex = mil.indexOf(this.transitionMil.milestone) - 2 >= 0 ? mil.indexOf(this.transitionMil.milestone) - 2 : 0
    let endIndex = mil.indexOf(this.transitionMil.milestone) + 1
    allMilestone = mil.slice(startIndex,endIndex).map(title => {
      return allMilestone.find(t => t.title === title)
    });

    if(this.writeTransition) {
      allMilestone.forEach(element => {
        let task = this.taskAllocateCommonService.getTasksFromMilestones(element, false, this.milestoneData, false)
        let writeTasks = task.filter(e=> e.itemType=='Write');
        let writersArray = Array.from(new Set(writeTasks.map(e=> e.AssignedTo).map(t => t.Title)))
        this.writerArr.push({milestone: element.title , resource: writersArray.join(", ")});
      });
    }

    if(this.reviewTransition) {
      allMilestone.forEach(element => {
        let task = this.taskAllocateCommonService.getTasksFromMilestones(element, false, this.milestoneData, false)
        let reviewTasks = task.filter(e=> e.itemType=='Review-Write');
        let reviewersArray = Array.from(new Set(reviewTasks.map(e=> e.AssignedTo).map(t => t.Title)))
        this.reviewerArr.push({milestone: element.title , resource: reviewersArray.join(", ")});
      });
    }
  }

  saveTransition() {

    let addedMilestone = this.newAddedWriteTasks.length ? Array.from(new Set(this.newAddedWriteTasks.map(e=> e.milestone))) : Array.from(new Set(this.newAddedReviewTasks.map(e=> e.milestone)))
    this.milestoneData.forEach((mil, index) => {

      if(mil.data.type == 'milestone' && mil.data.title == addedMilestone[0] && mil.children) {
        mil.children.forEach(submilestone => {
          if (submilestone.children) {
            submilestone.children.forEach(sub => { 
              sub.data.Reason =  sub.data.itemType == 'Write' ? this.newAddedWriteTasks.some(n=> n.id == sub.data.id) ? this.writerReason : '' : sub.data.itemType == 'Review-Write' ? this.newAddedReviewTasks.some(n=> n.id == sub.data.id) ? this.reviewerReason : '' : '';
            })
          }else {
            submilestone.data.Reason = submilestone.data.itemType == 'Write' ? this.newAddedWriteTasks.some(n=> n.id == submilestone.data.id) ? this.writerReason : '' : submilestone.data.itemType == 'Review-Write' ? this.newAddedReviewTasks.some(n=> n.id == submilestone.data.id) ? this.reviewerReason : '' : '';
          }
        });
      }
    });
    
    let obj: any = {
      milestoneData: this.milestoneData
    };

    this.writerArr.length && this.writerReason == undefined
      ? this.commonService.showToastrMessage(
          this.constants.MessageType.error,
          "Please Select Writer Transition Reason",
          false
        )
      : this.reviewerArr.length && this.reviewerReason == undefined
      ? this.commonService.showToastrMessage(
          this.constants.MessageType.error,
          "Please Select Reviewer Transition Reason",
          false
        )
      : this.dialogRef.close(obj);
  }

  close() {
    this.dialogRef.close();
  }
}
