import { Observable, Observer } from 'rxjs';
import { Client } from '../client';
import { Logger } from '../logger';

export class Record {
  constructor(private _client: Client, private _name: string) {}

  get(): Observable<any> {
    let record = this._client.client.record.getRecord(this._name);

    let observable = new Observable<any>((obs: Observer<any>) => {
      record.subscribe(data => {
        obs.next(data);
      }, true);

      return () => record.unsubscribe();
    });

    return observable;
  }

  set(value: any): Observable<void>;
  set(field: string, value: any): Observable<void>;
  set(fieldOrValue: any, value?: any): Observable<void> {
    return new Observable<void>((obs: Observer<void>) => {
      let callback = err => {
        if (err) {
          throw err;
        }

        obs.next(null);
        obs.complete();
      };

      if (typeof value === 'undefined') {
        this._client.client.record.setData(this._name, fieldOrValue, callback);
      } else {
        this._client.client.record.setData(this._name, fieldOrValue, value, callback);
      }
    });
  }

  public snapshot() {
    return new Observable<any>((obs: Observer<any>) => {
      this._client.client.record.snapshot(this._name, (err, result) => {
        if (err) {
          throw err;
        }

        obs.next(result);
        obs.complete();
      });
    });
  }
}
