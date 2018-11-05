//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Part of the code was modfied from the official PDF.js example page at https://mozilla.github.io/pdf.js/examples/ //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import { Component } from '@angular/core';
import { NavController, LoadingController, PopoverController, NavParams } from 'ionic-angular';
import { PdfPopoverPage } from './pdf_popover';

import * as PDFJS from 'pdfjs-dist';

@Component({
  selector: 'pdf-view',
  templateUrl: 'pdf_view.html'
})
export class PdfViewPage {
  private name: string;
  private url: string;
  private data: string;

  private pdfDoc: any = undefined;
  private pageCurr: number = 1;
  private pageTotal: number;
  private pageNumPending: number = undefined;
  private pageRendering: boolean = false;
  private pdfArea: any;
  private ctx: any;
  private zoomValue: number = 100;

  private loading: any;

  constructor(public navCtrl: NavController, private loadingController: LoadingController, public popoverController: PopoverController, public navParams: NavParams) {
    this.showLoading();

    this.name = navParams.get('name');
    this.url = navParams.get('url');
    this.data = navParams.get('data');

    setTimeout(() => {
      let pdfContainer = document.getElementById('pdfContainer');
      this.pdfArea = document.getElementById('pdfArea');
      this.ctx = this.pdfArea.getContext('2d');

      pdfContainer.addEventListener('click', (event) => {
        let sideRegion = window.innerWidth / 2;

        if (event.pageX < sideRegion)
          this.onPrevPage(undefined);
        else if (event.pageX > sideRegion)
          this.onNextPage(undefined);
      });

      if (this.url) {
        PDFJS.getDocument(this.url).then((pdfDoc) => {
          this.setPdfDoc(pdfDoc);

          window.addEventListener('resize', () => { this.queueRenderPage(this.pageCurr); });
        });
      }
    });
  }

  showLoading() {
    this.loading = this.loadingController.create({
      content: "Loading file...",
    });
    this.loading.present();
  }

  dismissLoading() {
    if (this.loading)
      this.loading.dismiss();
  }

  presentPopover(event) {
    this.popoverController.create(PdfPopoverPage, { pdfViewPage: this }).present({ ev: event });
  }

  zoom(zoom) {
    this.zoomValue = zoom;
    this.queueRenderPage(this.pageCurr);
  }

  setPdfDoc(pdfDoc) {
    this.pdfDoc = pdfDoc;
    this.pageTotal = this.pdfDoc.numPages;

    this.renderPage(this.pageCurr);
    this.dismissLoading();
  }

  renderPage(num) {
    this.pageRendering = true;

    this.pdfDoc.getPage(num).then((page) => {
      let viewport = page.getViewport(((window.outerWidth * this.zoomValue) / 100) / page.getViewport(1).width);
      this.ctx.canvas.height = viewport.height;
      this.ctx.canvas.width = viewport.width;

      let renderContext = {
        canvasContext: this.ctx,
        viewport: viewport
      };
      let renderTask = page.render(renderContext);

      renderTask.promise.then(() => {
        this.pageRendering = false;
        if (this.pageNumPending) {
          this.renderPage(this.pageNumPending);
          this.pageNumPending = undefined;
        }
      });
    });
  }

  queueRenderPage(num) {
    if (this.pageRendering)
      this.pageNumPending = num;
    else if (this.pdfDoc)
      this.renderPage(num);
  }

  onPrevPage(event) {
    if (this.pageCurr <= 1) {
      return;
    }
    this.pageCurr--;
    this.queueRenderPage(this.pageCurr);
  }

  onNextPage(event) {
    if (this.pageCurr >= this.pageTotal) {
      return;
    }
    this.pageCurr++;
    this.queueRenderPage(this.pageCurr);
  }

}