import React, { createContext, useContext, useState, useEffect } from 'react'
import * as signalR from '@microsoft/signalr'
import PropTypes from 'prop-types'

const SignalRContext = createContext(null)

export const SignalRProvider = ({ children }) => {
  const [connection, setConnection] = useState(null)
  const [lastScheduleUpdate, setLastScheduleUpdate] = useState(Date.now())
  const [lastHolidayUpdate, setLastHolidayUpdate] = useState(Date.now())

  useEffect(() => {
    let newConnection
    try {
      newConnection = new signalR.HubConnectionBuilder()
        .withUrl('/appHub', {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .build()

      newConnection
        .start()
        .then(() => {
          console.log('SignalR Global Connected.')
          newConnection.on('ReceiveScheduleUpdate', () => {
            console.log('SignalR Global: Schedule updated.')
            setLastScheduleUpdate(Date.now())
          })
          newConnection.on('ReceiveHolidayUpdate', () => {
            console.log('SignalR Global: Holiday updated.')
            setLastHolidayUpdate(Date.now())
          })
        })
        .catch((e) => console.error('SignalR Global Connection Error: ', e))

      setConnection(newConnection)
    } catch (e) {
      console.error('SignalR Global Setup Error: ', e)
    }

    return () => {
      if (newConnection) {
        newConnection.stop()
      }
    }
  }, [])

  return (
    <SignalRContext.Provider value={{ connection, lastScheduleUpdate, lastHolidayUpdate }}>
      {children}
    </SignalRContext.Provider>
  )
}

SignalRProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useAppSignalR = () => useContext(SignalRContext)
