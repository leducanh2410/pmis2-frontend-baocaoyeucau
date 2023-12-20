import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { combineLatest, map, Observable, of, ReplaySubject, tap } from 'rxjs';
import { Navigation } from 'app/core/navigation/navigation.types';
import { environment } from 'environments/environment';
import { cloneDeep } from 'lodash';
import { UserService } from '../user/user.service';
import { User, UserFunctionGrant } from '../user/user.types';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { ServiceService } from 'app/shared/service/service.service';
import { MessageService } from 'app/shared/message.services';
import { ServiceDataResult } from 'app/shared/service/service.types';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        private _userService: UserService,
        private _messageService: MessageService,
        private _serviceService: ServiceService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    getChildNavigationByParent(parentId, lstNavigationItem): FuseNavigationItem[] {
        let items: FuseNavigationItem[] = [];
        let item: FuseNavigationItem;
        lstNavigationItem.forEach((obj) => {
            if (obj.FUNCTION_PARENT_ID != null && obj.FUNCTION_PARENT_ID == parentId) {
                items.push({
                    id: obj.FUNCTIONID,
                    title: obj.FUNCTIONNAME,
                    subtitle: obj.FUNCTIONNAME_SUB,
                    type: obj.FUNCTION_TYPE,
                    link: obj.LINK,
                    icon: obj.ICON,
                    externalLink: obj.FUNCTION_EXTERNAL,
                    target: obj.FUNCTION_EXTERNAL_TARGET,
                    children: this.getChildNavigationByParent(obj.FUNCTIONID, lstNavigationItem)
                })
            }
        });
        return items;
    }
    get(): Observable<Navigation> {
        return combineLatest({
            dataCompactNavigation: this._serviceService.execServiceLogin("API-3", [{ "name": "APPID", "value": environment.appType }]),
            dataDefaultNavigation: this._serviceService.execServiceLogin("API-4", [{ "name": "APPID", "value": environment.appType }]),
            dataUser: this._userService.get()
        })
            .pipe(
                map(response => {
                    const dataCompactNavigation = <ServiceDataResult>response.dataCompactNavigation;
                    const dataDefaultNavigation = <ServiceDataResult>response.dataDefaultNavigation;
                    const dataUser = <User>response.dataUser;
                    let navigation: Navigation = { compactNavigation: [], defaultNavigation: [] };
                    if (dataCompactNavigation.status == 1) {
                        if (dataCompactNavigation.status == 1) {

                            let item: FuseNavigationItem;
                            let listItemCompact: FuseNavigationItem[] = [];
                            let listItemDefault: FuseNavigationItem[] = [];
                            if (dataDefaultNavigation.status == 1) {
                                dataCompactNavigation.data.forEach((obj) => {
                                    listItemCompact.push({
                                        id: obj.FUNCTIONID,
                                        title: obj.FUNCTIONNAME,
                                        subtitle: obj.FUNCTIONNAME_SUB,
                                        type: obj.FUNCTION_TYPE.toString().replace('group', 'aside'),
                                        link: obj.LINK,
                                        icon: obj.ICON,
                                        externalLink: obj.FUNCTION_EXTERNAL,
                                        target: obj.FUNCTION_EXTERNAL_TARGET,
                                    });
                                });
                                dataDefaultNavigation.data.forEach((obj) => {
                                    if (obj.FUNCTION_PARENT_ID == null) {
                                        listItemDefault.push({
                                            id: obj.FUNCTIONID,
                                            title: obj.FUNCTIONNAME,
                                            subtitle: obj.FUNCTIONNAME_SUB,
                                            type: obj.FUNCTION_TYPE,
                                            link: obj.LINK,
                                            icon: obj.ICON,
                                            externalLink: obj.FUNCTION_EXTERNAL,
                                            target: obj.FUNCTION_EXTERNAL_TARGET,
                                            children: this.getChildNavigationByParent(obj.FUNCTIONID, dataDefaultNavigation.data)
                                        });

                                    }
                                });
                                navigation = { compactNavigation: listItemCompact, defaultNavigation: listItemDefault };

                                let copydefaultNavigation: FuseNavigationItem[] = cloneDeep(navigation.defaultNavigation);
                                copydefaultNavigation = this.updateNavigationByUser(copydefaultNavigation, dataUser);
                                copydefaultNavigation = this.countGroupNavigation(copydefaultNavigation);
                                copydefaultNavigation = this.removeNavigationByUser(copydefaultNavigation);
                                navigation.compactNavigation.forEach((compactNavItem) => {
                                    copydefaultNavigation.forEach((defaultNavItem) => {
                                        if (defaultNavItem.id === compactNavItem.id) {
                                            compactNavItem.children = cloneDeep(defaultNavItem.children);
                                        }
                                    });
                                });
                                navigation.compactNavigation = navigation.compactNavigation.filter(obj => {
                                    if (obj.type != 'basic') {
                                        if (obj.children == null || obj.children.length == 0) {
                                            return false;
                                        } else {
                                            return true;
                                        }
                                    } else { return true }
                                });

                            }


                        } else {
                            this._messageService.showErrorMessage("Thông báo", "Lỗi khi thực hiện lấy dữ liệu");
                        }
                    } else {
                        this._messageService.showErrorMessage("Thông báo", "Lỗi khi thực hiện lấy dữ liệu");
                    }
                    this._navigation.next(navigation);
                    return navigation;

                }));

    }

    private updateNavigationByUser(navi: FuseNavigationItem[], user: User): FuseNavigationItem[] {
        let bCheckExists;
        navi = navi!.filter(obj => {
            if (obj.type == 'basic') {
                bCheckExists = false;
                if (user) {
                    user.fgrant.forEach((objUser: UserFunctionGrant) => {
                        if (obj.id == objUser.functionId) {
                            bCheckExists = true;
                        }
                    })
                }
                return bCheckExists;
            } else {
                return true;
            }
        });

        navi.forEach((objNavi: FuseNavigationItem) => {
            if (objNavi.type != 'basic') {
                if (objNavi.children && objNavi.children.length > 0) {
                    objNavi.children = this.updateNavigationByUser(objNavi.children, user);
                }
            }
        })
        return navi;
    };
    private removeNavigationByUser(navi: FuseNavigationItem[]): FuseNavigationItem[] {
        navi = navi.filter(obj => {
            if (obj.type != 'basic') {
                if (obj.meta > 0) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        });
        navi.forEach((objNavi: FuseNavigationItem) => {
            if (objNavi.type != 'basic') {
                if (objNavi.children && objNavi.children.length > 0) {
                    objNavi.children = this.removeNavigationByUser(objNavi.children);
                }
            }
        })
        return navi;
    };
    private countGroupNavigation(navi: FuseNavigationItem[]): FuseNavigationItem[] {
        navi.forEach((objNavi: FuseNavigationItem) => {
            if (objNavi.type != 'basic') {
                objNavi.meta = this.countNavigation(objNavi, 0);
            }
            if (objNavi.children != null && objNavi.children.length > 0) {
                objNavi.children = this.countGroupNavigation(objNavi.children);
            }
        })
        return navi;
    };
    private countNavigation(navi: FuseNavigationItem, iCount: number): number {
        if (navi.type == 'basic') {
            iCount = iCount + 1;
        }
        if (navi.children != null && navi.children.length > 0) {
            navi.children.forEach((obj: FuseNavigationItem) => {
                iCount = this.countNavigation(obj, iCount);
            })
        }
        return iCount;
    };
}
