import { Component, OnInit } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {ApiService} from "../../../services/api.service";
import {ConfirmationDialogComponent} from "../../helpers/confirmation-dialog/confirmation-dialog.component";
import {ErrorDialogComponent} from "../../helpers/error-dialog/error-dialog.component";

@Component({
  selector: 'lib-tcpdump-history',
  templateUrl: './tcpdump-history.component.html',
  styleUrls: ['./tcpdump-history.component.css']
})
export class TcpdumpHistoryComponent implements OnInit {

    constructor(private API: ApiService,
                private dialog: MatDialog) {
    }

    public isBusy: boolean = false;
    public scanHistory: any = <any><unknown>{"size": Array, "file": Array};

    private handleError(msg: string): void {
        this.dialog.closeAll();
        this.dialog.open(ErrorDialogComponent, {
            hasBackdrop: true,
            width: '900px',
            data: {
                message: msg
            }
        });
    }

    loadHistory(): void {
        this.isBusy = true;
        this.API.request({
            module: 'tcpdump',
            action: 'list_capture_history'
        }, (response) => {
            console.log(JSON.parse(response))
            this.isBusy = false;
            if (response.error) {
                this.handleError(response.error);
                return;
            }

            this.scanHistory = JSON.parse(response);
            console.log(this.scanHistory)
        });
    }

    private deleteItem(item: string): void {
        this.isBusy = true;
        this.API.request({
            module: 'tcpdump',
            action: 'delete_capture',
            output_file: item
        }, (response) => {
            this.isBusy = false;
            if (response.error) {
                this.handleError(response.error);
                return;
            }

            this.loadHistory();
        });
    }

    private deleteAll(): void {
        this.isBusy = true;
        this.API.request({
            module: 'tcpdump',
            action: 'delete_all'
        }, (response) => {
            this.isBusy = false;
            if (response.error) {
                this.handleError(response.error);
                return;
            }

            this.loadHistory();
        });
    }

    downloadItem(item: string): void {
        this.API.APIDownload('/root/.tcpdump/' + item, item);
    }

    showDeleteDialog(item: string): void {
        this.dialog.open(ConfirmationDialogComponent, {
            hasBackdrop: true,
            width: '900px',
            data: {
                title: 'Delete?',
                message: 'You are about to delete ' + item + '? This action can not be undone. Are you sure you want to continue?',
                handleResponse: (affirmative: boolean) => {
                    if (affirmative) {
                        this.deleteItem(item);
                    }
                }
            }
        });
    }

    showClearHistoryDialog(): void {
        this.dialog.open(ConfirmationDialogComponent, {
            hasBackdrop: true,
            width: '900px',
            data: {
                title: 'Delete All?',
                message: 'You are about to delete all scan history. This action can not be undone. Are you sure you want to continue?',
                handleResponse: (affirmative: boolean) => {
                    if (affirmative) {
                        this.deleteAll();
                    }
                }
            }
        });
    }

    ngOnInit(): void {
        this.loadHistory();
    }
}
