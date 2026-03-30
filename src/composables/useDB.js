// composables/useDB.js
// IndexedDB wrapper — mesma estrutura do sistema original

const DB_NAME    = 'caderno-vendedora'
const DB_VERSION = 1
let db = null

function abrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = e => {
      const d = e.target.result
      if (!d.objectStoreNames.contains('lojas')) {
        const s = d.createObjectStore('lojas', { keyPath: 'id', autoIncrement: true })
        s.createIndex('nome', 'nome', { unique: false })
      }
      if (!d.objectStoreNames.contains('clientes')) {
        const s = d.createObjectStore('clientes', { keyPath: 'id', autoIncrement: true })
        s.createIndex('lojaId', 'lojaId', { unique: false })
      }
      if (!d.objectStoreNames.contains('fiados')) {
        const s = d.createObjectStore('fiados', { keyPath: 'id', autoIncrement: true })
        s.createIndex('clienteId', 'clienteId', { unique: false })
        s.createIndex('lojaId',    'lojaId',    { unique: false })
        s.createIndex('status',    'status',    { unique: false })
      }
    }
    req.onsuccess = e => { db = e.target.result; resolve(db) }
    req.onerror   = e => reject(e.target.error)
  })
}

function tx(store, mode = 'readonly') {
  return db.transaction(store, mode).objectStore(store)
}

function getAll(store, indexName, keyRange) {
  return new Promise((resolve, reject) => {
    const s   = tx(store)
    const req = indexName ? s.index(indexName).getAll(keyRange) : s.getAll()
    req.onsuccess = e => resolve(e.target.result || [])
    req.onerror   = e => reject(e.target.error)
  })
}

function getOne(store, id) {
  return new Promise((resolve, reject) => {
    const req = tx(store).get(id)
    req.onsuccess = e => resolve(e.target.result)
    req.onerror   = e => reject(e.target.error)
  })
}

function put(store, obj) {
  return new Promise((resolve, reject) => {
    const req = tx(store, 'readwrite').put(obj)
    req.onsuccess = e => resolve(e.target.result)
    req.onerror   = e => reject(e.target.error)
  })
}

function del(store, id) {
  return new Promise((resolve, reject) => {
    const req = tx(store, 'readwrite').delete(id)
    req.onsuccess = () => resolve()
    req.onerror   = e => reject(e.target.error)
  })
}

function update(store, id, changes) {
  return new Promise((resolve, reject) => {
    const s      = tx(store, 'readwrite')
    const getReq = s.get(id)
    getReq.onsuccess = e => {
      const obj    = { ...e.target.result, ...changes }
      const putReq = s.put(obj)
      putReq.onsuccess = () => resolve()
      putReq.onerror   = er => reject(er.target.error)
    }
    getReq.onerror = e => reject(e.target.error)
  })
}

export function useDB() {
  return { abrirDB, getAll, getOne, put, del, update }
}
