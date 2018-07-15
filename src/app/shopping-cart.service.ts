import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Product } from './models/product';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/map';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  constructor(private db: AngularFireDatabase) { }


  private create() {
    return this.db.list('/shopping-carts').push({
      dateCreated: new Date().getTime()
    });
  }
  getCart(cartId: string) {
    return this.db.object('/shopping-carts/' + cartId);
  }
  private async getOrCreateCartId() {
    let cartId = localStorage.getItem('cartId');
    if (cartId) return cartId;

    let result = await this.create();
    localStorage.setItem('cartId', result.key);
    return result.key;
  }
  async addToCart(product: Product) {
    let cartId = await this.getOrCreateCartId();
    let item$ = this.db.object('/shopping-carts/' + cartId + '/items/' + product.key);

    let subscription = item$.valueChanges().subscribe((item: any) => {
      if (item) {
        item$.update({ quantity: item.quantity + 1 });
        subscription.unsubscribe();
      } else {
        item$.set({ product: product, quantity: 1 });
        subscription.unsubscribe();
      }
    });
  }

  // unsubscribe(subscription: Subscription) : Subscription {
  //   if(!subscription) { return subscription; }
  //   if(!subscription.closed) { subscription.unsubscribe(); } 
  //   return null;
  // }
}


