import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { FuseAlertModule } from '@fuse/components/alert';
import { FuseNavigationModule } from '@fuse/components/navigation';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { VeBieuDoRoutes } from './vebieudo.routing';
import { VeBieuDoListComponent } from './list/list.component';
import { VeBieuDoComponent } from './vebieudo.component';
import { VeBieuDoDetailsComponent } from './detail/details.component';
import { VeBieuDoEmptyDetailsComponent } from './empty-details/empty-details.component';
import { MatTreeModule } from "@angular/material/tree";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from "@mat-datetimepicker/core";
import { FuseScrollbarModule } from '@fuse/directives/scrollbar';
import { FileSaverModule } from 'ngx-filesaver';
import { VeBieuDoGroupComponent } from './group/group.component';
import { VeBieuDoDetailsBieuDoComponent } from './detail/bieudo/detailsbieudo.component';
import {MatRadioModule} from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    RouterModule.forChild(VeBieuDoRoutes), MatButtonModule, MatTreeModule,
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
    MatRadioModule, MatCheckboxModule, FormsModule, ColorPickerModule, MatTooltipModule, MatProgressSpinnerModule,
    NgChartsModule
  ],
  declarations: [
    VeBieuDoGroupComponent,
    VeBieuDoListComponent,
    VeBieuDoComponent,
    VeBieuDoDetailsComponent,
    VeBieuDoEmptyDetailsComponent,
    VeBieuDoDetailsBieuDoComponent
  ]
})
export class VeBieuDoModule { }
