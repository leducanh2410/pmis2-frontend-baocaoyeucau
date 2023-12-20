import { Route } from '@angular/router';
import { DashboardDetailComponent } from './dashboard-detail/dashboard-detail.component';
import { DashboardComponent } from './dashboard.component';
import { EmptyDashboardComponent } from './empty-dashboard/empty-dashboard.component';
import { DashboardResolver } from './dashboard.resolver';

export const routes: Route[] = [
    {
        path     : '',
        component: DashboardComponent,
        children: [
            {
                path: 'empty',
                component: EmptyDashboardComponent
            },
            {
                path: 'create',
                component: DashboardDetailComponent
            },
            {
                path: 'edit/:id',
                component: DashboardDetailComponent
            }
        ],
        resolve: {
            data: DashboardResolver
        }
    }
];
