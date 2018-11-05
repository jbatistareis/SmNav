import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { DropboxPage } from '../pages/dropbox/dropbox';

import { PdfViewPage } from '../pages/pdf_view/pdf_view';
import { DetailsModalPage } from '../pages/details_modal/details_modal';
import { PdfPopoverPage } from '../pages/pdf_view/pdf_popover';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { PhotoLibrary } from '@ionic-native/photo-library';
import { Toast } from '@ionic-native/toast';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AndroidPermissions } from '@ionic-native/android-permissions';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    DropboxPage,
    PdfViewPage,
    PdfPopoverPage,
    DetailsModalPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    DropboxPage,
    PdfViewPage,
    PdfPopoverPage,
    DetailsModalPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
	PhotoLibrary,
	Toast,
	InAppBrowser,
	AndroidPermissions
  ]
})
export class AppModule {}
