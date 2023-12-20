import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LayoutType } from '../../dashboard-constants';

@Component({
  selector: 'app-layout-dialog',
  templateUrl: './layout-dialog.component.html',
  styleUrls: ['./layout-dialog.component.scss']
})
export class LayoutDialogComponent implements OnInit {

  layoutType: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { layoutType: string },
    public dialogRef: MatDialogRef<LayoutDialogComponent>
  ) { 
    this.layoutType = data?.layoutType;
  }

  ngOnInit(): void {
  }

  onSelectLayout(value: string) {
    this.layoutType = value;
    this.closeDialog();
  }

  closeDialog() {
    this.dialogRef.close(this.layoutType);
  }
}
