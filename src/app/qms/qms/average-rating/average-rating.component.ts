import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IAverageRatings } from '../../interfaces/qms';
import { ConstantsService } from 'src/app/Services/constants.service';

@Component({
  selector: 'app-average-rating',
  templateUrl: './average-rating.component.html',
  styleUrls: ['./average-rating.component.css']
})
export class AverageRatingComponent implements OnInit, OnChanges {
  @Input() tasks: any;
  @Input() headerLength: any;
  @Output() filter = new EventEmitter();
  // @Output() avgRatings: EventEmitter<IAverageRatings> = new EventEmitter();
  public ratingTypes = {
    Write: 'Write', Edit: 'Edit', Quality: 'QC', Graphics: 'Graphics', Reviewer: ''
  };
  cols: any[];
  public averageRatings = [];
  constructor(private constant: ConstantsService) { }

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "data" changed
    if (changes.tasks.currentValue) {
      this.calculateAverageRating(this.tasks);
    }
  }

  ngOnInit() {
    this.cols = this.headerLength === 'Long' ? [
      { header: 'Reviewer Avg Rating' },
      { header: 'Writer Avg Rating' },
      { header: 'Editor Avg Rating' },
      { header: 'QCer Avg Rating' },
      { header: 'Graphics Avg Rating' }
    ] : [
        { header: 'Reviewer' },
        { header: 'Writer' },
        { header: 'Editor' },
        { header: 'QCer' },
        { header: 'Graphics' }
      ];

    // this.cols = this.getColumns(headers);
  }

  // getColumns(arrHeader) {
  //   const cols = [];
  //   arrHeader.forEach(header => {
  //     const obj = {
  //       field: {
  //         name: 'name', rating: 'rating', value: 'value', count: 'count'
  //       },
  //       header: header.header
  //     };
  //     cols.push(obj);
  //   });
  //   return cols;
  // }

  calculateAverageRating(tasks) {
    const obj = {} as any;
    obj.writer = this.getAverageRating(tasks, this.ratingTypes.Write);
    obj.editor = this.getAverageRating(tasks, this.ratingTypes.Edit);
    obj.quality = this.getAverageRating(tasks, this.ratingTypes.Quality);
    obj.graphics = this.getAverageRating(tasks, this.ratingTypes.Graphics);
    obj.reviewer = this.getAverageRating(tasks, this.ratingTypes.Reviewer);
    this.averageRatings.splice(0, 1, obj);
  }

  getAverageRating(itemsArray, type) {
    //   Object.keys(this.ratingTypes).forEach((type) => {
    const arrTaskFeedback = itemsArray.filter((t) => {
      const evaluatorSkill = t.EvaluatorSkill ? t.EvaluatorSkill !== 'Review' ? t.EvaluatorSkill : '' : '';
      if (t.FeedbackType && t.FeedbackType === this.constant.FeedbackType.taskRating && evaluatorSkill === type) {
        return t;
      }
    });
    const totalRating = arrTaskFeedback.reduce((a, b) => a + +b.AverageRatingNM, 0);
    const averageRating = +(totalRating / arrTaskFeedback.length).toFixed(2);
    const obj = {
      name: type,
      value: type,
      rating: isNaN(averageRating) ? 0 : averageRating,
      count: arrTaskFeedback.length
    } as IAverageRatings;
    // });
    return obj;
  }

  filterResult(item) {
    this.filter.emit(item);
  }
}
