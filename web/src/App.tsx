import React, { useEffect, useState } from 'react'
import logo from './logo.svg'
import './App.css'
import './style.css'

import { initElectricSqlJs, ElectrifiedDatabase} from "electric-sql/browser"
import { ElectricProvider, useElectric, useElectricQuery, useConnectivityState } from 'electric-sql/react'

const dbName = 'example.db'
const worker = new Worker("./worker.js", { type: "module" });

export const ElectrifiedExample = () => {
  const [ db, setDb ] = useState<ElectrifiedDatabase>()
  
  useEffect(() => {
    const init = async () => {
      const SQL = await initElectricSqlJs(worker, {locateFile: (file: string) => `/${file}`})
      const electrified = await SQL.openDatabase(dbName)

      setDb(electrified)
    }

    init();
  }, [])

  return (
    <ElectricProvider db={db}>
      <ExampleComponent />
    </ElectricProvider>
  )
}

const ExampleComponent = () => {  
  const { results, error } = useElectricQuery('SELECT value FROM items', [])
  const db = useElectric() as ElectrifiedDatabase

  const [connectivityState, setConnectivityState] = useConnectivityState()

  if (error !== undefined) {
    return (
      <div>
        <p className='text'>
          Error: { `${error}` }
        </p>
      </div>
    )
  }

  if (db === undefined || results === undefined) {
    return null
  }

  const addItem = () => {
    const randomValue = Math.random().toString(16).substr(2)

    db.exec('INSERT INTO items VALUES(?)', [randomValue])
  }

  const clearItems = () => {
    db.exec('DELETE FROM items where true')
  } 
  
  const toggleConnectivity = () => {
    const value = (connectivityState == 'available' || connectivityState == 'connected') ? 'disconnected' : 'available' 
    db.electric.changeConnectivityState(value, dbName)
    setConnectivityState(value)
  }  

  return (
    <div>
      {results.map((item: any, index: any) => (
        <p key={ index } className='item'>
          Item: { item.value }
        </p>
      ))}

      <button className='button' onClick={addItem}>
        <p className='text'>Add</p>
      </button>
      <button className='button' onClick={clearItems}>
      <p className='text'>Clear</p>
      </button>
      <button className='button' onClick={toggleConnectivity}>
      <p className='text'>{connectivityState}</p>
      </button>
    </div>
  )
}

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <ElectrifiedExample />
      </header>
    </div>
  );
}
