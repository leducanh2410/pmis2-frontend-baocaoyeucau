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
import { ListUserDetailsComponent } from './detail/details.component';
import { ListUserGroupComponent } from './group/group.component';
import { ListUserEmptyDetailsComponent } from './empty-details/empty-details.component';
import { ListUserListComponent } from './list/list.component';
import { FuseNavigationModule } from '@fuse/components/navigation';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import 'codemirror/lib/codemirror';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/sql-hint';
import { ListUserComponent } from './listuser.component';
import { ListUserRoutes } from './listuser.routing';
import { MatTreeModule } from "@angular/material/tree";
import {DragDropModule} from '@angular/cdk/drag-drop';





@NgModule({
  imports: [
    RouterModule.forChild(ListUserRoutes), MatButtonModule, CodemirrorModule,MatTreeModule,DragDropModule,
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
    CommonModule, NgxMatSelectSearchModule, FuseAlertModule, FuseNavigationModule, HighlightPlusModule
  ],
  declarations: [
    ListUserListComponent,
    ListUserGroupComponent,
    ListUserComponent,
    ListUserDetailsComponent,
    ListUserEmptyDetailsComponent]
})
export class ListUserModule { }
