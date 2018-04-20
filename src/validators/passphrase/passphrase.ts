import { FormGroup } from '@angular/forms';
import bip39 from 'bip39';

export class PassphraseValidator {

  static isValid(wordlistLanguage: string) {
    return (group: FormGroup): any => {
      const passphrase = group.controls.controlAddressOrPassphrase.value;
      const nonBIP39 = group.controls.controlNonBIP39.value;

      if (nonBIP39 || !passphrase) { return null; }
      const words = passphrase.split(' ');
      if (words.length !== 12) { return { 'not12Words': true }; }

      if (!(wordlistLanguage && bip39.validateMnemonic(passphrase, bip39.wordlists[wordlistLanguage])
         || bip39.validateMnemonic(passphrase))) { return { 'invalidMnemonic': true }; }

      return null;
    };
  }

}
