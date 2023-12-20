import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MAT_DATE_LOCALE, MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule, DatePipe } from '@angular/common';
import { FuseAlertModule } from '@fuse/components/alert';
import { FuseNavigationModule } from '@fuse/components/navigation';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { KhaiThacDuLieuRoutes } from './khaithacdulieu.routing';
import { KhaiThacDuLieuListComponent } from './list/list.component';
import { KhaiThacDuLieuComponent } from './khaithacdulieu.component';
import { KhaiThacDuLieuDetailsComponent } from './detail/details.component';
import { KhaiThacDuLieuEmptyDetailsComponent } from './empty-details/empty-details.component';
import { KhaiThacDuLieuDetailsFilterDialogComponent } from './detail/detailsfilter.component';
import { MatTreeModule } from "@angular/material/tree";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from "@mat-datetimepicker/core";
import { FuseScrollbarModule } from '@fuse/directives/scrollbar';
import { FileSaverModule } from 'ngx-filesaver';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ShareDialogComponent } from './list/share-dialog/share-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ShareUserDialogComponent } from './detail/share-user-dialog/share-user-dialog.component';

@NgModule({
  imports: [
    RouterModule.forChild(KhaiThacDuLieuRoutes), MatButtonModule, MatTreeModule,
    DragDropModule, MatDialogModule, MatDatepickerModule, MatMomentDateModule, MatNativeDateModule, MatDatetimepickerModule, MatNativeDatetimeModule,
    MatButtonToggleModule, FuseScrollbarModule, FileSaverModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatRippleModule,
    MatSidenavModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule, MatToolbarModule, MatPaginatorModule, MatListModule,
    MatInputModule, ReactiveFormsModule, MatSelectModule, MatAutocompleteModule, MatSlideToggleModule,
    CommonModule, NgxMatSelectSearchModule, FuseAlertModule, FuseNavigationModule, HighlightPlusModule,
    MatTooltipModule, FormsModule, MatCheckboxModule
  ],
  declarations: [
    KhaiThacDuLieuListComponent,
    KhaiThacDuLieuComponent,
    KhaiThacDuLieuDetailsComponent,
    KhaiThacDuLieuEmptyDetailsComponent,
    KhaiThacDuLieuDetailsFilterDialogComponent,
    ShareDialogComponent,
    ShareUserDialogComponent
  ],
  providers: [
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class KhaiThacDuLieuModule { }
