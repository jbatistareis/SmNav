import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController, NavParams, Loading } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { Toast } from '@ionic-native/toast';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { NativeStorage } from '@ionic-native/native-storage';
import { FileChooser } from '@ionic-native/file-chooser';

import { Dropbox } from 'dropbox';

declare var window: any;

@Component({
  selector: 'page-dropbox',
  templateUrl: 'dropbox.html',
})
export class DropboxPage {

  private dropbox: Dropbox;
  private accessToken: string;

  private selectedFolder: string;
  private items: any[] = [];
  private loginButton: Boolean = false;

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
  private fileChooser: FileChooser = new FileChooser();
  private toast: Toast = new Toast();
  private nativeStorage: NativeStorage = new NativeStorage();

  constructor(
    public navCtrl: NavController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private modalController: ModalController,
    private androidPermissions: AndroidPermissions,
    private inAppBrowser: InAppBrowser,
    public navParams: NavParams) {
    this.getInitData(navParams.get('folder'));
  }

  getInitData(folder) {
    this.nativeStorage.getItem('dropboxAccessToken').then(
      (token) => {
        this.loginButton = false;
        this.accessToken = token;
        this.dropbox = new Dropbox({ accessToken: this.accessToken });

        this.showLoading();
        if (folder)
          this.selectedFolder = '/' + folder;
        else
          this.selectedFolder = '/';

        this.listFolder(this.selectedFolder.substring(1)).then(
          (list) => {
            this.items = list;
            this.dismissLoading();
          },
          (error) => { });
      },
      (error) => this.loginButton = true
    );
  }

  // dropbox methods
  listFolder(folder) {
    return new Promise<any[]>((success, error) => {
      this.dropbox.filesListFolder({ path: folder }).then(
        (response) => {
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

                let extension = file.name.substring(file.name.lastIndexOf('.'));
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
        (dropboxError) => {
          this.dismissLoading();

          if (dropboxError.status === 401) {
            this.nativeStorage.remove('dropboxAccessToken');
            this.loginButton = true;
          }

          this.toast.showShortBottom('Cannot list contents').subscribe((toast) => { });
          error(dropboxError);
        });
    });
  }

  select(file) {
    switch (file['.tag']) {
      case 'folder':
        this.navCtrl.push(DropboxPage, {
          folder: file.path_display
        });
        break;

      case 'file':
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
          () => this.downloadFile(file),
          () => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
            (success) => success.hasPermission
              ? this.downloadFile(file)
              : this.toast.showShortCenter('Cannot obtain permission').subscribe((toast) => { })));
        break;

      default:
        break;
    }
  }

  reload() {
    this.showLoading();
    this.listFolder(this.selectedFolder.substring(1)).then(
      (list) => {
        this.items = list;
        this.dismissLoading();
      });
  }

  confirmDelete(file) {
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
              });
          }
        },
        { text: 'No' }
      ]
    });
    confirm.present();
  }

  downloadFile(fileData) {
    let file = new File();

    // check dir
    file.checkDir('cdvfile://localhost/sdcard/', 'SmNav').then(
      (ok) => { },
      (error) => file.resolveDirectoryUrl('cdvfile://localhost/sdcard/').then((directoryEntry) => file.getDirectory(directoryEntry, 'SmNav', { create: true })));

    // download
    this.toast.showShortBottom('Downloading, please wait...').subscribe((toast) => { });

    let dropboxRequest = new XMLHttpRequest();
    dropboxRequest.responseType = 'blob';
    dropboxRequest.open('GET', 'https://content.dropboxapi.com/2/files/download?authorization=Bearer ' + this.accessToken
      + ';arg={"path": "' + fileData.path_display + '"}');

    dropboxRequest.onloadend = () => {
      file.writeFile('cdvfile://localhost/sdcard/SmNav', fileData.name, dropboxRequest.response, { replace: true })
        .then(() => this.toast.showShortBottom('File saved').subscribe((toast) => { }))
        .catch((error) => this.toast.showShortCenter(error.message).subscribe((toast) => { }));
    };

    dropboxRequest.onprogress = (info) => { fileData['downloadProgress'] = Math.round((info.loaded / info.total) * 100); };
    dropboxRequest.onerror = (error) => this.toast.showLongCenter(error.type).subscribe((toast) => { });
    dropboxRequest.send();
  }

  uploadFile() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
      () => this.pickAndSendFile(),
      () => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
        (success) => success.hasPermission
          ? this.pickAndSendFile()
          : this.toast.showShortCenter('Cannot obtain permission').subscribe((toast) => { })));
  }

  pickAndSendFile() {
    let dropboxRequest = new XMLHttpRequest();

    let alert = this.alertController.create({
      title: 'Upload status',
      subTitle: '',
      message: '',
      buttons: ['Hide'],
      enableBackdropDismiss: false
    });

    let currentPercentage = 0;
    let previousPercentage = 0;
    dropboxRequest.upload.onprogress = (info) => {
      currentPercentage = Math.round((info.loaded / info.total) * 100);

      if (currentPercentage > previousPercentage) {
        previousPercentage = currentPercentage;

        alert.setMessage(
          '<p>Sent: ' + this.parseSize(info.loaded) + '&nbsp;of&nbsp;' + this.parseSize(info.total) + '</p>'
          + '<p>Progress: ' + currentPercentage + '%</p>'
        );
      }
    };

    dropboxRequest.upload.onloadstart = () => alert.present();
    dropboxRequest.upload.onloadend = () => this.toast.showShortBottom('Upload finished').subscribe((toast) => { });
    dropboxRequest.upload.onerror = (error) => this.toast.showLongCenter(error.type).subscribe((toast) => { });

    this.fileChooser.open().then(
      (uri) => window.FilePath.resolveNativePath(
        uri,
        (url) => {
          let filename = url.substring(url.lastIndexOf('/') + 1);
          alert.setSubTitle(filename);

          dropboxRequest.open('POST', 'https://content.dropboxapi.com/2/files/upload?authorization=Bearer ' + this.accessToken
            + ';arg={"path": "' + (this.selectedFolder + '/' + filename).replace(/\/+/g, '/') + '", "mode": "overwrite"}');

          window.resolveLocalFileSystemURL(
            url,
            (fileEntry) => fileEntry.file(
              (file) => {
                let fileReader = new FileReader();
                fileReader.onloadend = () => dropboxRequest.send(new Blob([fileReader.result], { type: 'application/octet-stream' }));
                fileReader.readAsArrayBuffer(file);
              }),
            (error) => this.toast.showShortCenter(error.message).subscribe((toast) => { }));
        },
        (error) => this.toast.showShortCenter(error.message).subscribe((toast) => { })))
      .catch((error) => this.toast.showShortCenter(error).subscribe((toast) => { }));
  }

  login() {
    let clientIdRequest = new XMLHttpRequest();
    clientIdRequest.open('GET', 'assets/config.json');
    clientIdRequest.onloadend = () => {
      this.dropbox = new Dropbox({ clientId: JSON.parse(clientIdRequest.response).clientId });

      let redirectUrl = 'http://localhost/callback';
      let browser = this.inAppBrowser.create(this.dropbox.getAuthenticationUrl(redirectUrl), '_self', 'location=no');

      let listener = browser.on('loadstart').subscribe(
        (event: any) => {
          // Ignore the dropbox authorize screen
          if (event.url.indexOf('oauth2/authorize') > -1)
            return;

          // Check the redirect uri
          if (event.url.indexOf(redirectUrl) > -1) {
            browser.close();
            this.nativeStorage.setItem('dropboxAccessToken', event.url.split('=')[1].split('&')[0]).then(() => this.getInitData(undefined));
          }

          listener.unsubscribe();
        });
    };

    clientIdRequest.send();
  }

  showDetails(file) {

  }

  showPdf(name, url) {

  }

  // auxiliary
  showLoading() {
    this.loading = this.loadingController.create({ content: 'Please wait...' });
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
