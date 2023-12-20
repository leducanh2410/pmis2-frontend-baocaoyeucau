import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FunctionService } from "app/core/function/function.service";
import { UserService } from "app/core/user/user.service";
import { User } from "app/core/user/user.types";
import { Observable, Subject, takeUntil } from "rxjs";
import { MessageService } from "../message.services";

@Component({
    selector: 'app-base',
    template: '',
    styleUrls: ['./base.component.css']
})
export class BaseComponent implements OnInit {
    public authInsert: Boolean;
    public authEdit: Boolean;
    public authDelete: Boolean;
    public user: User;
    public _unsubscribeAll: Subject<any> = new Subject<any>();



    constructor(public _activatedRoute: ActivatedRoute,
        public _router: Router, public _functionService: FunctionService,
        public _userService: UserService,
        public _messageService: MessageService,
    ) {

    }
    ngOnInit(): void {
        this._functionService.isInsert$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((authInsert: any) => {
                this.authInsert = authInsert;
            });
        this._functionService.isEdit$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((authEdit: any) => {
                this.authEdit = authEdit;
            });

        this._functionService.isDelete$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((authDelete: any) => {
                this.authDelete = authDelete;
            });
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.user = user;
            });
    }
    get authInsertFromServer(): Observable<any> {
        return this._functionService.isInsert();
    }
    get authEditFromServer(): Observable<any> {
        return this._functionService.isEdit();
    }
    get authDeleteFromServer(): Observable<any> {
        return this._functionService.isDelete();
    }

}