export class IsoMap<K, V> {
  private _fmap: Map<K, V>;
  private _bmap: Map<V, K>;

  constructor(pair?: { a: K; b: V }) {
    this._fmap = new Map<K, V>();
    this._bmap = new Map<V, K>();
    if (!pair) return;
    this._fmap.set(pair.a, pair.b);
    this._bmap.set(pair.b, pair.a);
  }

  has(key: K | V): boolean {
    if (this._fmap.has(key as K) || this._bmap.has(key as V)) {
      return true;
    }
    return false;
  }

  get(key: K | V): K | V {
    if (this._fmap.has(key as K)) {
      return this._fmap.get(key as K);
    } else if (this._bmap.has(key as V)) {
      return this._bmap.get(key as V);
    }
    return undefined;
  }

  set(key: K, value: V) {
    const oldKey = this.get(value);
    const oldValue = this.get(key);

    if (key == oldKey && value == oldValue) {
      return;
    }
    if (oldKey) {
      this._fmap.delete(oldKey as K);
    }
    if (oldValue) {
      this._bmap.delete(oldValue as V);
    }
    this._fmap.set(key, value);
    this._bmap.set(value, key);
  }

  pop(key: K | V): { key: K; value: V } {
    if (this._fmap.has(key as K)) {
      const k = key as K;
      const v = this.get(k) as V;
      this._fmap.delete(k);
      this._bmap.delete(v);
      return { key: k, value: v };
    } else if (this._bmap.has(key as V)) {
      const v = key as V;
      const k = this.get(v) as K;
      this._fmap.delete(k);
      this._bmap.delete(v);
      return { key: k, value: v };
    }
    return undefined;
  }

  clear() {
    this._fmap.clear();
    this._bmap.clear();
  }
}
