import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {PassphraseWord} from '@models/passphrase-word';
import { UserDataProvider } from '@providers/user-data/user-data';
import bip39 from 'bip39';

@IonicPage()
@Component({
  selector: 'modal-passphrase-word-tester',
  templateUrl: 'passphrase-word-tester.html',
})
export class PassphraseWordTesterModal {

  public words: PassphraseWord[] = [];
  public isDevNet: boolean;
  public wordSuggestions = [];

  private wordlistLanguage: string;

  public constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private viewCtrl: ViewController,
              private userDataProvider: UserDataProvider) {
    this.words = this.navParams.get('words') as PassphraseWord[];

    if (!this.words) {
      this.dismiss();
    }

    this.isDevNet = this.userDataProvider.isDevNet;

    this.wordlistLanguage = this.navParams.get('wordlistLanguage') || 'english';
  }

  public areAllWordsCorrect(): boolean {
    return this.words.every(w => w.isCorrect);
  }

  public next(): void {
    this.dismiss(this.areAllWordsCorrect());
  }

  public dismiss(validationSuccess?: boolean): void {
    this.viewCtrl.dismiss(validationSuccess);
  }

  wordChange(value, wordIndex) {
    this.words[wordIndex].userValue = value;
    this.suggestWord(value);
  }

  suggestWord(wordInput) {
    this.wordSuggestions = [];
    if (wordInput.length < 2) { return; }

    const wordlist = bip39.wordlists[this.wordlistLanguage || 'english'];
    this.wordSuggestions = wordlist.filter( word => word.indexOf(wordInput) === 0 );
  }

  wordBlur(event, wordIndex) {
    if (!event.relatedTarget) { return; }
    const relatedName = event.relatedTarget.name;
    if (!relatedName || relatedName.indexOf('wordSuggestion') === -1) { return; }

    const index = parseInt(relatedName[relatedName.length - 1]); // 0,1 or 2 from wordSuggestion0,1,2
    if (isNaN(index)) { return; }

    this.words[wordIndex].userValue = this.wordSuggestions[index];

    this.wordSuggestions = [];
  }
}
