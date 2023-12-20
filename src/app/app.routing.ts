import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver, SignInAutoResolver } from 'app/app.resolvers';

export const appRoutes: Route[] = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboards/dashboard' },
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'dashboards/dashboard' },
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            // { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule) },
            // { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule) },
            // { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule) },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule) },            
        ]
    },
    {
        path: 'sign-in-auto',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {
                path: ':token',
                resolve: {
                    initialData: SignInAutoResolver,
                },
            },

        ]
    },
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule) },
        ]
    },
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            // Dashboards
            {
                path: 'dashboards', children: [


                    { path: 'project', loadChildren: () => import('app/modules/admin/dashboards/project/project.module').then(m => m.ProjectModule) },
                ]
            },
        ]
    },
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            // Dashboards
            {
                path: 'dashboards', children: [
                    { path: 'dashboard', loadChildren: () => import('app/modules/admin/dashboards/dashboard/dashboard.module').then(m => m.DashboardModule) },
                ]
            },
        ]
    },
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            {
                path: 'admin', children: [
                    { path: 'listuser', loadChildren: () => import('app/modules/admin/listuser/listuser.module').then(m => m.ListUserModule) },
                    { path: 'listusergrant', loadChildren: () => import('app/modules/admin/listusergrant/listusergrant.module').then(m => m.ListUserGrantModule) },
                    { path: 'listfunction', loadChildren: () => import('app/modules/admin/listfunction/listfunction.module').then(m => m.ListFunctionModule) },
                    { path: 'listrole', loadChildren: () => import('app/modules/admin/listrole/listrole.module').then(m => m.ListRoleModule) },
                    { path: 'listorganization', loadChildren: () => import('app/modules/admin/listorganization/listorganization.module').then(m => m.OrganizationModule) },
                    {
                        path: 'api', children: [
                            { path: 'listapi', loadChildren: () => import('app/modules/admin/api/listapi/api.module').then(m => m.ApiModule) },
                            { path: 'listapiinput', loadChildren: () => import('app/modules/admin/api/listapiinput/listapiinput.module').then(m => m.ApiInputModule) },
                            { path: 'listapigroup', loadChildren: () => import('app/modules/admin/api/listapigroup/listapigroup.module').then(m => m.ApiGroupModule) },
                        ]
                    },
                ]
            },
        ]
    },
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            {
                path: 'nghiepvu', children: [
                    {
                        path: 'danhmuc', children: [
                            { path: 'nguondulieu', loadChildren: () => import('app/modules/nghiepvu/danhmuc/nguondulieu/nguondulieu.module').then(m => m.NguonDuLieuModule) },
                            { path: 'nhomdulieu', loadChildren: () => import('app/modules/nghiepvu/danhmuc/nhomdulieu/nhomdulieu.module').then(m => m.NhomDuLieuModule) },
                            { path: 'cautrucdulieu', loadChildren: () => import('app/modules/nghiepvu/danhmuc/cautrucdulieu/cautrucdulieu.module').then(m => m.CauTrucDuLieuModule) },
                        ],
                    },
                    {
                        path: 'khaithac', children: [
                            { path: 'khaithacdulieu', loadChildren: () => import('app/modules/nghiepvu/khaithac/khaithacdulieu/khaithacdulieu.module').then(m => m.KhaiThacDuLieuModule) },
                            { path: 'vebieudo', loadChildren: () => import('app/modules/nghiepvu/khaithac/vebieudo/vebieudo.module').then(m => m.VeBieuDoModule) },
                        ],
                    },
                ]
            },
        ]
    },
    {
        path: 'errors',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        children: [
            // 404 & Catch all
            { path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.module').then(m => m.Error404Module) },
            { path: '500-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/pages/error/error-500/error-500.module').then(m => m.Error500Module) },
            { path: '**', redirectTo: '404-not-found' }
        ]
    },
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: '401-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/pages/error/error-401/error-401.module').then(m => m.Error401Module) },
            { path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.module').then(m => m.Error404Module) },
            { path: '500-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/pages/error/error-500/error-500.module').then(m => m.Error500Module) },
            { path: '**', redirectTo: '404-not-found' }
        ]
    }
];
