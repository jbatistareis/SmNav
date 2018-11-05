import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';

@Component({
  selector: 'page-logout',
  templateUrl: 'logout.html'
})
export class LogoutPage {

  private nativeStorage: NativeStorage = new NativeStorage();
  public hasToken: boolean;

  constructor(public navCtrl: NavController, private alertController: AlertController) {
    this.check();
  }

  confirmLogout() {
    let confirm = this.alertController.create({
      title: 'Confirmation',
      message: 'Do you really want to logout?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.nativeStorage.remove('dropboxAccessToken');
            this.check();
          }
        },
        {
          text: 'No',
          handler: () => this.check()
        }
      ]
    });
    confirm.present();
  }

  check() {
    this.nativeStorage.getItem('dropboxAccessToken').then(
      (token) => this.hasToken = true,
      (error) => this.hasToken = false
    );
  }

}
