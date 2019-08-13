import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userProfileColumns = [];
  userProfileRows = [];
  auditHistoryColumns = [];
  auditHistoryRows = [];
  showModal = false;
  showeditUser = false;
  items = [
    { label: 'Edit', command: (e) => this.showEditUserModal() },
    { label: 'Delete' },
  ];
  options = [
    { label: 'option1', value: 'option1' },
    { label: 'option2', value: 'option2' },
    { label: 'option3', value: 'option3' }
  ];
  upObject = {
    isFormSubmit: false,
    isEditFormSubmit: false
  };
  addUser: FormGroup;
  editUser: FormGroup;

  userProfileColArray = {
    User: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };

  auditHistoryArray = {
    User: [],
    ActionBy: [],
    ActionDate: [],
    Details: []
  };
  constructor(
    private datepipe: DatePipe,
    private frmbuilder: FormBuilder
  ) {
    this.addUser = frmbuilder.group({
      username: ['', Validators.required],
      account: ['', Validators.required],
      bucket: ['', Validators.required],
      dateofexit: ['', Validators.required],
      dateofjoin: ['', Validators.required],
      deliverableExclusion: ['', Validators.required],
      deliverable: ['', Validators.required],
      designation: ['', Validators.required],
      liveDate: ['', Validators.required],
      inCapacity: ['', Validators.required],
      isActive: ['', Validators.required],
      manager: ['', Validators.required],
      maxHrs: ['', Validators.required],
      pooled: ['', Validators.required],
      primarySkill: ['', Validators.required],
      readyTo: ['', Validators.required],
      role: ['', Validators.required],
      skillLevel: ['', Validators.required],
      ta: ['', Validators.required],
      taExclusion: ['', Validators.required],
      task: ['', Validators.required],
      timeZone: ['', Validators.required],
      practiceArea: ['', Validators.required]
    });
    this.editUser = frmbuilder.group({
      username: ['', Validators.required],
      account: ['', Validators.required],
      bucket: ['', Validators.required],
      dateofexit: ['', Validators.required],
      dateofjoin: ['', Validators.required],
      deliverableExclusion: ['', Validators.required],
      deliverable: ['', Validators.required],
      designation: ['', Validators.required],
      liveDate: ['', Validators.required],
      inCapacity: ['', Validators.required],
      isActive: ['', Validators.required],
      manager: ['', Validators.required],
      maxHrs: ['', Validators.required],
      pooled: ['', Validators.required],
      primarySkill: ['', Validators.required],
      readyTo: ['', Validators.required],
      role: ['', Validators.required],
      skillLevel: ['', Validators.required],
      ta: ['', Validators.required],
      taExclusion: ['', Validators.required],
      task: ['', Validators.required],
      timeZone: ['', Validators.required],
      practiceArea: ['', Validators.required]
    });
  }
  ngOnInit() {
    this.userProfileColumns = [
      { field: 'User', header: 'User' },
      { field: 'LastUpdated', header: 'Last Updated' },
      { field: 'LastUpdatedBy', header: 'Last Updated By' },
    ];

    this.userProfileRows = [
      {
        User: 'Test',
        LastUpdated: 'Jul 3, 2019',
        LastUpdatedBy: 'Kaushal Bagrodia'
      },
      {
        User: 'Test1',
        LastUpdated: 'Aug 2, 2019',
        LastUpdatedBy: 'Kaushal Bagrodia'
      }
    ];

    this.auditHistoryColumns = [
      { field: 'User', header: 'User' },
      { field: 'ActionBy', header: 'Action By' },
      { field: 'ActionDate', header: 'Action Date' },
      { field: 'Details', header: 'Details' }
    ];

    this.auditHistoryRows = [
      {
        User: 'User Created',
        ActionBy: '',
        ActionDate: '',
        Details: ''
      }
    ];

    this.colFilters(this.userProfileRows);
    this.colFilters1(this.auditHistoryRows);
  }

  colFilters(colData) {
    this.userProfileColArray.User = this.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.User, value: a.User
      };
      return b;
    }));
    this.userProfileColArray.LastUpdated = this.uniqueArrayObj(colData.map(a => {
      const b = {
        label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'), value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy')
      };
      return b;
    }));
    this.userProfileColArray.LastUpdatedBy = this.uniqueArrayObj(colData.map(a => {
      const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b;
    }));
  }

  colFilters1(colData) {
    this.auditHistoryArray.User = this.uniqueArrayObj(colData.map(a => {
      const b = { label: a.User, value: a.User }; return b;
    }));
    this.auditHistoryArray.ActionBy = this.uniqueArrayObj(colData.map(a => {
      const b = { label: a.ActionBy, value: a.ActionBy }; return b;
    }));
    this.auditHistoryArray.ActionDate = this.uniqueArrayObj(colData.map(a => {
      const b = {
        label: this.datepipe.transform(a.ActionDate, 'MMM d, yyyy'),
        value: this.datepipe.transform(a.ActionDate, 'MMM d, yyyy')
      };
      return b;
    }));
    this.auditHistoryArray.Details = this.uniqueArrayObj(colData.map(a => {
      const b = { label: a.Details, value: a.Details }; return b;
    }));

  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      return {
        label: label1,
        value: array.find(s => s.label === label1).value
      };
    });
  }

  saveUser(addUserForm) {
    if (addUserForm.valid) {
      console.log(addUserForm.value);
    } else {
      this.upObject.isFormSubmit = true;
      this.upObject.isEditFormSubmit = true;
    }
  }

  showAddUserModal() {
    this.showModal = true;
    this.upObject.isFormSubmit = false;
  }

  showEditUserModal() {
    this.showeditUser = true;
    this.editUser.patchValue({
      username: 'Test',
      account: 'option1',
      bucket: ['option1'],
      dateofexit: new Date(),
      dateofjoin: new Date(),
      deliverableExclusion: ['option1'],
      deliverable: ['option1'],
      designation: 'Test',
      liveDate: new Date(),
      inCapacity: 'option1',
      isActive: 'option1',
      manager: 'Test',
      maxHrs: 'Test',
      pooled: 'option1',
      primarySkill: 'option1',
      readyTo: 'Test',
      role: 'option1',
      skillLevel: 'option1',
      ta: ['option1'],
      taExclusion: ['option1'],
      task: 'option1',
      timeZone: 'option1',
      practiceArea: 'option1'
    });
    this.upObject.isEditFormSubmit = false;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: false });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  downloadExcel(up) {
    up.exportCSV();
  }
}
