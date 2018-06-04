import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController, NavParams, Loading } from 'ionic-angular';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { Toast } from '@ionic-native/toast';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AndroidPermissions } from '@ionic-native/android-permissions';

import { Dropbox } from 'dropbox';

@Component({
  selector: 'page-dropbox',
  templateUrl: 'dropbox.html',
})
export class DropboxPage {

  private dropbox: Dropbox;
  private accessToken: string;

  private selectedFolder: string;
  private items: any[] = [];

  private icons: string[] = ['fa fa-file-o fa-2x', 'fa fa-file-text-o fa-2x', 'fa fa-file-archive-o fa-2x', 'fa fa-film fa-2x',
    'fa fa-terminal fa-2x', 'fa fa-window-maximize fa-2x', 'fa fa-file-image-o fa-2x', 'fa fa-file-pdf-o fa-2x',
    'fa fa-file-audio-o fa-2x', 'fa fa-table fa-2x'];

  // file formats
  private document: string[] = ['.ai', '.doc', '.docm', '.docx', '.eps', '.odp', '.odt', '.pps',
    '.ppsm', '.ppsx', '.ppt', '.pptm', '.pptx', '.rtf'];
  private table: string[] = ['.csv', '.ods', '.xls', '.xlsm', '.xlsx'];
  private images: string[] = ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.gif', '.bmp'];
  private compressed: string[] = ['.zip', '.rar', '.7z'];
  // media types have the same index
  private video: string[] = ['.mp4', '.webm', '.avi', '.mkv'];
  private videoMediaTypes: string[] = ['video/mp4', 'video/webm'];
  // media types have the same index
  private audio: string[] = ['.mp3', '.ogg', '.wav', '.aac', '.flac', '.opus'];
  private audioMediaTypes: string[] = ['audio/mpeg', 'audio/ogg', 'audio/wav'];
  private script: string[] = ['.sh', '.bat', '.com'];
  private executable: string[] = ['.exe'];
  private text: string[] = ['.txt'];
  private pdf: string[] = ['.pdf'];

  private loading: Loading;
  private toast: Toast = new Toast();

  constructor(
    public navCtrl: NavController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private androidPermissions: AndroidPermissions,
    private inAppBrowser: InAppBrowser,
    private photoLibrary: PhotoLibrary,
    public navParams: NavParams) {

    // for test, remove later
    this.accessToken = 'guAwJCHUOC0AAAAAAAACNhvVvHjtV2ko60f_2e0TdoaREDuu2S3Fr_UFE3XHxgR-';

    if (this.accessToken) {
      this.showLoading();

      if (navParams.get('folder'))
        this.selectedFolder = '/' + navParams.get('folder');
      else
        this.selectedFolder = '/';

      this.dropbox = new Dropbox({ accessToken: this.accessToken });
      this.listFolder(this.selectedFolder.substring(1))
        .then((list) => {
          this.items = list;
          this.dismissLoading();
        });
    } else {
      // TODO
    }
  }

  // dropbox methods
  listFolder(folder) {
    return new Promise<any[]>((success, error) => {
      this.dropbox.filesListFolder({ path: folder })
        .then((response) => {
          let folders = [];
          let files = [];

          response.entries.forEach((file) => {
            switch (file['.tag']) {
              case 'folder':
                file['icon'] = this.icons[1];
                folders.push(file);
                break;

              case 'file':
                if (file['size'])
                  file['sizeHu'] = this.parseSize(file['size']);

                let extension = file.name.substring(file.name.indexOf('.'));
                if (this.text.indexOf(extension) >= 0) {
                  file['icon'] = this.icons[1];

                } else if (this.document.indexOf(extension) >= 0) {
                  file['icon'] = this.icons[1];

                } else if (this.compressed.indexOf(extension) >= 0) {
                  file['icon'] = this.icons[2];

                } else if (this.video.indexOf(extension) >= 0) {
                  file['icon'] = this.icons[3];

                  if (this.video.indexOf(extension) <= (this.videoMediaTypes.length - 1)) {
                    file['mediaType'] = this.videoMediaTypes[this.video.indexOf(extension)];
                    file['mediaUrl'] = 'https://content.dropboxapi.com/2/files/download?authorization=Bearer ' + this.accessToken
                      + ';arg={"path": "' + file.path_display + '"}';
                  }

                } else if (this.script.indexOf(extension) >= 0) {
                  file['icon'] = this.icons[4];

                } else if (this.executable.indexOf(extension) >= 0) {
                  file['icon'] = this.icons[5];

                } else if (this.images.indexOf(extension) >= 0) {
                  file['icon'] = this.icons[6];

                  file['smallThumb'] = 'https://content.dropboxapi.com/2/files/get_thumbnail?authorization=Bearer ' + this.accessToken
                    + ';arg={"path": "' + file.path_display + '"}';
                  file['bigThumb'] = 'https://content.dropboxapi.com/2/files/get_thumbnail?authorization=Bearer ' + this.accessToken
                    + ';arg={"path": "' + file.path_display + '", "size": "w640h480"}';

                } else if (this.pdf.indexOf(extension) >= 0) {
                  file['icon'] = this.icons[7];

                } else if (this.audio.indexOf(extension) >= 0) {
                  file['icon'] = this.icons[8];

                  if (this.audio.indexOf(extension) <= (this.audioMediaTypes.length - 1)) {
                    file['mediaType'] = this.audioMediaTypes[this.audio.indexOf(extension)];
                    file['mediaUrl'] = 'https://content.dropboxapi.com/2/files/download?authorization=Bearer ' + this.accessToken
                      + ';arg={"path": "' + file.path_display + '"}';
                  }

                } else if (this.table.indexOf(extension) >= 0) {
                  file['icon'] = this.icons[9];

                } else {
                  file['icon'] = this.icons[0];
                }

                files.push(file);
                break;

              default:
                file['icon'] = this.icons[0];
                break;
            }
          });

          folders.sort(this.alphabeticalFilenameSort);
          files.sort(this.alphabeticalFilenameSort);

          success(folders.concat(files));
        },
          (error) => {
            this.toast.showLongBottom('Cannot list contents')
              .subscribe((toast) => { });
          });
    });
  }

  select(event, file) {
    switch (file['.tag']) {
      case 'folder':
        this.navCtrl.push(DropboxPage, {
          folder: file.path_display
        });
        break;

      case 'file':
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
          .then(
            () => this.downloadFile(file),
            () => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
              .then(
                (success) => success.hasPermission
                  ? this.downloadFile(file)
                  : this.toast.showLongBottom('Cannot obtain permission').subscribe((toast) => { })));
        break;

      default:
        break;
    }
  }

  reload(refresher) {
    this.showLoading();
    this.listFolder(this.selectedFolder.substring(1))
      .then((list) => {
        this.items = list;
        this.dismissLoading();
        refresher.complete();
      });
  }

  confirmDelete(event, file) {
    let confirm = this.alertController.create({
      title: 'Confirmation',
      message: 'Do you want to remove the file ' + file.name + '?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.showLoading();
            this.dropbox.filesDelete({ path: file.path_display }).then(
              (success) => {
                this.listFolder(this.selectedFolder.substring(1))
                  .then((list) => {
                    this.items = list;
                    this.dismissLoading();
                    this.toast.showLongBottom('File ' + file.name + ' removed').subscribe((toast) => { });
                  });
              },
              (error) => {
                this.dismissLoading();
                this.toast.showLongBottom('Cannot remove the file ' + file.name + '.').subscribe((toast) => { });
              }
            );
          }
        },
        {
          text: 'No',
          handler: () => { }
        }
      ]
    });
    confirm.present();
  }

  downloadFile(file) {
    this.toast.showShortBottom('Downloading file')
      .subscribe((toast) => { });

    // save to galery
    this.photoLibrary.saveImage('https://content.dropboxapi.com/2/files/download?authorization=Bearer '
      + this.accessToken + ';arg={"path": "' + file.path_display + '"}',
      'SmNav')
      .then(() => this.toast.showShortBottom('File saved').subscribe((toast) => { }));
  }

  //TODO find the magic behind it
  uploadFile(event) {

  }

  // auxiliary
  showLoading() {
    this.loading = this.loadingController.create({
      content: 'Please wait...'
    });

    this.loading.present();
  }

  dismissLoading() {
    this.loading.dismiss();
  }

  alphabeticalFilenameSort(file1, file2) {
    if (file1.name < file2.name)
      return -1;
    if (file1.name > file2.name)
      return 1;
    return 0;
  }

  parseSize(size) {
    let result = '';

    if (size < 1024) {
      result = size.toFixed(2) + 'B';
    } else {
      size /= 1024;

      if (size < 1024) {
        result = size.toFixed(2) + 'KB';
      } else {
        size /= 1024;

        if (size < 1024)
          result = size.toFixed(2) + 'MB';
        else
          result = size.toFixed(2) + 'GB';
      }
    }

    return result.replace('.00', '');
  }

}