import { Injectable } from "@angular/core";
import { SnotifyService, SnotifyToastConfig, SnotifyPosition } from 'ng-alt-snotify';

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    /**
     * Constructor
     */
    constructor(private _notify: SnotifyService) { }
    getConfig(): SnotifyToastConfig {
        this._notify.setDefaults({
            global: {
                newOnTop: true,
                maxAtPosition: 6,
                maxOnScreen: 8,
                // @ts-ignore
                filterDuplicates: false
            }
        });
        return {
            backdrop: -1,
            position: SnotifyPosition.rightTop,
            timeout: 2000,
            showProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true
        };
    }
    showSuccessMessage(strTitle, strMess) {
        this._notify.clear();
        this._notify.success(strMess, strTitle, this.getConfig());
    }

    showErrorMessage(strTitle, strMess) {
        this._notify.clear();
        this._notify.error(strMess, strTitle, this.getConfig());
    }

    showWarningMessage(strTitle, strMess) {
        this._notify.clear();
        this._notify.warning(strMess, strTitle, this.getConfig());
    }

    showInfoMessage(strTitle, strMess) {
        this._notify.clear();
        this._notify.info(strMess, strTitle, this.getConfig());
    }
    
    showConfirm(strTitle, strMess, action) {
        this._notify.confirm(strMess, strTitle, {
            closeOnClick: false,
            pauseOnHover: true,
            position: SnotifyPosition.centerCenter,
            buttons: [
                { text: 'Đồng ý', action: action, },
                { text: 'Đóng', action: (toast) => { this._notify.remove(toast.id); }},
            ]
        });

    }
    notify(): SnotifyService {
        return this._notify;
    }

}
