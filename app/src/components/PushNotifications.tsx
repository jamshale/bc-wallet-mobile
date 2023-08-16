import { useAgent } from '@aries-framework/react-hooks'
import messaging from '@react-native-firebase/messaging'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions'

import { setDeviceInfo } from '../helpers/PushNotificationsHelper'

const PushNotifications = () => {
  const { agent } = useAgent()

  const backgroundHandler = () => {
    return messaging().setBackgroundMessageHandler(async () => {
      // Do nothing with background messages. Defaults to login and home screen flow
    })
  }

  const messageHandler = () => {
    return messaging().onMessage(async () => {
      // Ignore foreground messages
    })
  }

  const requestNotificationPermission = async () => {
    if (!agent) return
    agent.config.logger.info('Requesting push notification permission...')
    const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
    agent.config.logger.info(`push notification permission is now [${result}]`)
    return result
  }

  const checkNotificationPermission = async () => {
    if (!agent) return
    agent.config.logger.info('Checking push notification permission...')
    const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
    agent.config.logger.info(`push notification permission is [${result}]`)
    return result
  }

  const requestPermission = async () => {
    if (!agent) return

    if (Platform.OS === 'ios') {
      await messaging().requestPermission()
      return
    }

    const checkPermission = await checkNotificationPermission()
    if (checkPermission !== RESULTS.GRANTED) {
      const request = await requestNotificationPermission()
      if (request !== RESULTS.GRANTED) {
        // permission not granted
        agent.config.logger.warn(`push notification permission was not granted by user`)
      }
    }
  }

  useEffect(() => {
    if (!agent) return
    setDeviceInfo({ agent })
    backgroundHandler()
    const unsubscribe = messageHandler()
    requestPermission()

    return () => {
      unsubscribe()
    }
  }, [agent]) // Reload if agent becomes defined

  return null
}

export default PushNotifications
