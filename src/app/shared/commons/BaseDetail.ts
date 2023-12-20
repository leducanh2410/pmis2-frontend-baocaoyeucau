export declare interface BaseDetailInterface {

    get actionCreate(): Boolean;
    get actionDelete(): Boolean;
    get actionEdit(): Boolean;
    get actionSave(): Boolean;
    get actionCancel(): Boolean;
    onEditObject(): void;
    onSaveObject(): void;
    onDeleteObject(): void;
    onCreateObject(): void;
    onCancelObject(): void;
    get viewMode(): Boolean;
    get inputMode(): Boolean;
}