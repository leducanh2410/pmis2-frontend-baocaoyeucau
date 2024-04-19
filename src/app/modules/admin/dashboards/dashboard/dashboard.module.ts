import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { RouterModule } from '@angular/router';
import { routes } from './dashboard.routing';
import { EmptyDashboardComponent } from './empty-dashboard/empty-dashboard.component';
import { DashboardDetailComponent } from './dashboard-detail/dashboard-detail.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTreeModule } from '@angular/material/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { LayoutDialogComponent } from './dashboard-detail/layout-dialog/layout-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogModule } from '@angular/cdk/dialog';
import {MatCardModule} from '@angular/material/card';
import { FuseSplashScreenService } from '@fuse/services/splash-screen';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgChartsModule } from 'ng2-charts';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {ReactiveFormsModule} from '@angular/forms';
import { DashboardListComponent } from './dashboard-list/dashboard-list.component';
import { ListUserDialogComponent } from './list-user-dialog/list-user-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ShareDashboardUserDialogComponent } from './share-dashboard-user-dialog/share-dashboard-user-dialog.component';

@NgModule({
  declarations: [
    DashboardComponent,
    EmptyDashboardComponent,
    DashboardDetailComponent,
    LayoutDialogComponent,
     DashboardListComponent,
     ListUserDialogComponent,
     ShareDashboardUserDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatIconModule, MatButtonModule, MatTreeModule, MatCardModule,
    DragDropModule, MatFormFieldModule, MatInputModule,
    FormsModule, MatDialogModule, DialogModule,
    MatProgressSpinnerModule, NgChartsModule, MatTooltipModule, MatTabsModule, MatCheckboxModule,
    ReactiveFormsModule, MatTableModule, MatPaginatorModule
  ],
  providers: [
    FuseSplashScreenService
  ]
})
export class DashboardModule { }
