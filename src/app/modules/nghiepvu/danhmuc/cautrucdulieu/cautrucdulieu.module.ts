import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
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
import { CauTrucDuLieuDetailsComponent } from './detail/details.component';
import { CauTrucDuLieuGroupComponent } from './group/group.component';
import { CauTrucDuLieuEmptyDetailsComponent } from './empty-details/empty-details.component';
import { CauTrucDuLieuListComponent } from './list/list.component';
import { FuseNavigationModule } from '@fuse/components/navigation';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import 'codemirror/lib/codemirror';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/sql-hint';
import { CauTrucDuLieuComponent } from './cautrucdulieu.component';
import { CauTrucDuLieuRoutes } from './cautrucdulieu.routing';
import { MatTreeModule } from "@angular/material/tree";
import {DragDropModule} from '@angular/cdk/drag-drop';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatCheckboxModule} from '@angular/material/checkbox';




@NgModule({
  imports: [
    RouterModule.forChild(CauTrucDuLieuRoutes), MatButtonModule, CodemirrorModule,MatTreeModule,DragDropModule,
    MatButtonToggleModule,
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
    MatTooltipModule, MatCheckboxModule
  ],
  declarations: [
    CauTrucDuLieuListComponent,
    CauTrucDuLieuGroupComponent,
    CauTrucDuLieuComponent,
    CauTrucDuLieuDetailsComponent,
    CauTrucDuLieuEmptyDetailsComponent]
})
export class CauTrucDuLieuModule { }
