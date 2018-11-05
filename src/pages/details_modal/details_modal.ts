import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'details-modal',
  templateUrl: 'details_modal.html'
})
export class DetailsModalPage {

  private file: any;
  private icons: string[];

  private width: number;
  private height: number;

  constructor(public viewController: ViewController, public navParams: NavParams) {
    this.file = navParams.get('file');
    this.icons = navParams.get('icons');

    if (this.file.textPreview)
      setTimeout(() => {
        document.getElementById("textPreviewArea").innerHTML = this.file.textPreview;
      });

    this.getVideoSize();
    window.addEventListener('resize', () => { this.getVideoSize(); });
  }

  getVideoSize() {
    let windowWidth = window.outerWidth;
    if (windowWidth < 580)
      this.width = windowWidth - 10;
    else
      this.width = 580;

    this.height = (this.width / 16) * 9;
  }

  dismiss() {
    this.viewController.dismiss();
  }
}
