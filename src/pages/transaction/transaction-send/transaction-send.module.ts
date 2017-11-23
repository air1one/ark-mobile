import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransactionSendPage } from './transaction-send';

import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@pipes/pipes.module';
import { SwipeContactsComponentModule } from '@components/swipe-contacts/swipe-contacts.module';
import { PinCodeComponentModule } from '@components/pin-code/pin-code.module';

@NgModule({
  declarations: [
    TransactionSendPage,
  ],
  imports: [
    IonicPageModule.forChild(TransactionSendPage),
    TranslateModule,
    PipesModule,
    SwipeContactsComponentModule,
    PinCodeComponentModule,
  ],
})
export class TransactionSendPageModule {}