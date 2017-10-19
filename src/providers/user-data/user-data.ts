import { Injectable } from '@angular/core';
import { StorageProvider } from '@providers/storage/storage';
import { AuthProvider } from '@providers/auth/auth';

import { Observable, BehaviorSubject, Subject } from 'rxjs';
import 'rxjs/add/operator/map';

import { Contact, Profile, Wallet } from '@models/model';

import lodash from 'lodash';
import { v4 as uuid } from 'uuid';
import { Network } from 'ark-ts/model';

import * as constants from '@app/app.constants';

@Injectable()
export class UserDataProvider {

  public profiles = {};
  public networks = {};

  public profileActive: Profile;
  public profileActiveObserver: BehaviorSubject<Profile> = new BehaviorSubject(undefined);

  public networkActive: Network;
  public networkActiveObserver: BehaviorSubject<Network> = new BehaviorSubject(undefined);

  public onCreateWallet$: Subject<Wallet> = new Subject();
  public onUpdateWallet$: Subject<Wallet> = new Subject();

  constructor(private _storageProvider: StorageProvider, private _authProvider: AuthProvider) {
    this.profilesLoad().subscribe((profiles) => this.profiles = profiles);
    this.networksLoad().subscribe((networks) => {
      this.networks = networks;
    });

    this._authProvider.onSigninSubject$.subscribe((id) => {
      if (lodash.isEmpty(id)) {
        this.profileActiveObserver.next(null);
        this.networkActiveObserver.next(null);
      } else {
        this._setProfileActive(id);
        this._setNetworkActive();
      }
    });
  }

  contactAdd(profileId: string, contact: Contact) {
    this.profiles[profileId].contacts[this._generateUniqueId()] = contact;

    return this.profilesSave();
  }

  contactGet(profileId: string, contactId: string) {
    return this.profiles[profileId].contacts[contactId];
  }

  contactRemove(profileId: string, contactId: string) {
    delete this.profiles[profileId].contacts[contactId];

    return this.profilesSave();
  }

  private _setNetworkActive(): void {
    if (!this.profileActive) return;

    let network = new Network();

    Object.assign(network, this.networks[this.profileActive.networkId]);
    this.networkActiveObserver.next(network);

    this.networkActive = network;
  }

  networkAdd(network: Network) {
    this.networks[this._generateUniqueId()] = network;

    return this._storageProvider.set(constants.STORAGE_NETWORKS, this.networks);
  }

  networkUpdate(networkId: string, network: Network) {
    this.networks[networkId] = network;

    return this._storageProvider.set(constants.STORAGE_NETWORKS, this.networks);
  }

  networkGet(networkId: string) {
    return this.networks[networkId];
  }

  networkRemove(networkId: string) {
    delete this.networks[networkId];

    this._storageProvider.set(constants.STORAGE_NETWORKS, this.networks);
    return this.networks;
  }

  networksLoad() {
    const defaults = Network.getAll();

    return Observable.create((observer) => {
      this._storageProvider.getObject(constants.STORAGE_NETWORKS).subscribe((networks) => {
        if (!networks || lodash.isEmpty(networks)) {
          const uniqueDefaults = {};

          for (var i = 0; i < defaults.length; i++) {
            uniqueDefaults[this._generateUniqueId()] = defaults[i];
          }

          this._storageProvider.set(constants.STORAGE_NETWORKS, uniqueDefaults);
          observer.next(uniqueDefaults);
        } else {
          observer.next(networks);
        }

        observer.complete();
      });
    });
  }

  private _setProfileActive(profileId: string): void {
    if (profileId && this.profiles[profileId]) {
      let profile = new Profile().deserialize(this.profiles[profileId]);
      this.profileActive = profile;
      this.profileActiveObserver.next(profile);
    }
  }

  profileAdd(profile: Profile) {
    this.profiles[this._generateUniqueId()] = profile;

    return this.profilesSave();
  }

  profileGet(profileId: string) {
    return new Profile().deserialize(this.profiles[profileId]);
  }

  profileRemove(profileId: string) {
    delete this.profiles[profileId];

    return this.profilesSave();
  }

  profilesLoad() {
    return this._storageProvider.getObject(constants.STORAGE_PROFILES);
  }

  profilesSave(profiles = this.profiles) {
    return this._storageProvider.set(constants.STORAGE_PROFILES, profiles);
  }

  walletAdd(wallet: Wallet, profileId: string = this._authProvider.loggedProfileId) {
    if (lodash.isUndefined(profileId)) return;

    let profile = this.profileGet(profileId);

    if (!profile.wallets[wallet.address]) {
      this.onCreateWallet$.next(wallet);
      return this.walletSave(wallet, profileId);
    }


    return this.profilesSave();
  }

  walletGet(address: string, profileId: string = this._authProvider.loggedProfileId): Wallet {
    if (lodash.isUndefined(profileId)) return;

    let profile = this.profileGet(profileId);
    let wallet = new Wallet();

    if (profile.wallets[address]) {
      wallet = wallet.deserialize(profile.wallets[address]);
      return wallet;
    }

    return null;
  }

  walletSave(wallet: Wallet, profileId: string = this._authProvider.loggedProfileId, notificate: boolean = false) {
    if (lodash.isUndefined(profileId)) return;

    let profile = this.profileGet(profileId);
    profile.wallets[wallet.address] = wallet;

    this.profiles[profileId] = profile;

    if (notificate) this.onUpdateWallet$.next(wallet);

    return this.profilesSave();
  }

  private _generateUniqueId(): string {
    return uuid();
  }

}
