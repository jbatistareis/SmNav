import { Component } from '@angular/core';
import { PopoverController, NavParams } from 'ionic-angular';
import { PdfViewPage } from './pdf_view';

@Component({
    selector: 'pdf-popover',
    templateUrl: 'pdf_popover.html'
})
export class PdfPopoverPage {
    private pdfViewPage: PdfViewPage;

    constructor(public popoverController: PopoverController, public navParams: NavParams) {
        this.pdfViewPage = navParams.get('pdfViewPage');
    }

}
