import { useEffect, useCallback } from 'react'
import { dataMigration } from '../services/dataMigration'

export interface AutoBackupConfig {
  enabled: boolean
  interval: number // minutes
  beforeUnload: boolean
  beforeDeploy: boolean
}

const DEFAULT_CONFIG: AutoBackupConfig = {
  enabled: true,
  interval: 30, // 30 minutes
  beforeUnload: true,
  beforeDeploy: true
}

export const useAutoBackup = (config: Partial<AutoBackupConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  // Create automatic backup
  const createBackup = useCallback(async () => {
    try {
      if (!finalConfig.enabled) return

      console.log('🔄 Creating automatic backup...')
      const backupName = await dataMigration.createAutomaticBackup()
      console.log('✅ Automatic backup created:', backupName)
      
      // Show user notification
      if (typeof window !== 'undefined' && window.navigator?.serviceWorker) {
        // Could send notification here if service worker is available
      }
    } catch (error) {
      console.error('❌ Failed to create automatic backup:', error)
    }
  }, [finalConfig.enabled])

  // Restore from automatic backup
  const restoreBackup = useCallback(async () => {
    try {
      console.log('🔄 Restoring from automatic backup...')
      await dataMigration.restoreFromAutomaticBackup()
      console.log('✅ Automatic backup restored successfully')
      
      // Reload the page to apply restored data
      window.location.reload()
    } catch (error) {
      console.error('❌ Failed to restore automatic backup:', error)
    }
  }, [])

  // Sync to Supabase
  const syncToSupabase = useCallback(async () => {
    try {
      console.log('🔄 Syncing data to Supabase...')
      await dataMigration.syncToSupabase()
      console.log('✅ Data synced to Supabase successfully')
    } catch (error) {
      console.error('❌ Failed to sync to Supabase:', error)
    }
  }, [])

  // Sync from Supabase
  const syncFromSupabase = useCallback(async () => {
    try {
      console.log('🔄 Syncing data from Supabase...')
      await dataMigration.syncFromSupabase()
      console.log('✅ Data synced from Supabase successfully')
      
      // Reload the page to apply synced data
      window.location.reload()
    } catch (error) {
      console.error('❌ Failed to sync from Supabase:', error)
    }
  }, [])

  // Periodic backup
  useEffect(() => {
    if (!finalConfig.enabled || finalConfig.interval <= 0) return

    const intervalMs = finalConfig.interval * 60 * 1000
    const intervalId = setInterval(createBackup, intervalMs)

    return () => clearInterval(intervalId)
  }, [createBackup, finalConfig.enabled, finalConfig.interval])

  // Backup before page unload
  useEffect(() => {
    if (!finalConfig.enabled || !finalConfig.beforeUnload) return

    const handleBeforeUnload = () => {
      // Create backup synchronously (limited time)
      try {
        const snapshot = dataMigration.exportAllData()
        localStorage.setItem('last_auto_backup', JSON.stringify({
          name: `unload_backup_${Date.now()}`,
          data: snapshot,
          timestamp: new Date().toISOString()
        }))
      } catch (error) {
        console.warn('⚠️ Could not create backup before unload:', error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [finalConfig.enabled, finalConfig.beforeUnload])

  // Backup before deployment (detect deployment)
  useEffect(() => {
    if (!finalConfig.enabled || !finalConfig.beforeDeploy) return

    // Check if this is a new deployment by comparing version/build info
    const checkForNewDeployment = async () => {
      try {
        const currentVersion = localStorage.getItem('app_version')
        const buildTimestamp = localStorage.getItem('build_timestamp')
        
        // If no version stored, this might be a new deployment
        if (!currentVersion || !buildTimestamp) {
          console.log('🔄 New deployment detected, creating backup...')
          await createBackup()
          
          // Store current version info
          localStorage.setItem('app_version', '1.0')
          localStorage.setItem('build_timestamp', new Date().toISOString())
        }
      } catch (error) {
        console.warn('⚠️ Could not check for new deployment:', error)
      }
    }

    // Check on app start
    checkForNewDeployment()

    // Also check periodically
    const checkInterval = setInterval(checkForNewDeployment, 5 * 60 * 1000) // Every 5 minutes
    return () => clearInterval(checkInterval)
  }, [createBackup, finalConfig.enabled, finalConfig.beforeDeploy])

  // Auto-restore on app start if needed
  useEffect(() => {
    const autoRestore = async () => {
      try {
        // Check if we need to restore data
        const hasData = localStorage.getItem('ipma_topics')
        const hasBackup = localStorage.getItem('last_auto_backup')
        
        // If no data but we have a backup, restore it
        if (!hasData && hasBackup) {
          console.log('🔄 No data found but backup exists, restoring...')
          await restoreBackup()
        }
        
        // Try to sync from Supabase if localStorage is empty
        if (!hasData) {
          console.log('🔄 No local data, attempting to sync from Supabase...')
          await syncFromSupabase()
        }
      } catch (error) {
        console.warn('⚠️ Auto-restore failed:', error)
      }
    }

    autoRestore()
  }, [restoreBackup, syncFromSupabase])

  return {
    createBackup,
    restoreBackup,
    syncToSupabase,
    syncFromSupabase,
    config: finalConfig
  }
}

// Hook for deployment detection
export const useDeploymentDetection = () => {
  useEffect(() => {
    // Set deployment marker
    const deploymentMarker = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    localStorage.setItem('deployment_marker', JSON.stringify(deploymentMarker))
    
    // Check for previous deployment
    const previousMarker = localStorage.getItem('previous_deployment_marker')
    if (previousMarker) {
      const previous = JSON.parse(previousMarker)
      const timeDiff = Date.now() - new Date(previous.timestamp).getTime()
      
      // If more than 1 hour difference, likely a new deployment
      if (timeDiff > 60 * 60 * 1000) {
        console.log('🚀 New deployment detected')
        // Trigger backup creation
        dataMigration.createAutomaticBackup().catch(console.error)
      }
    }
    
    // Store current as previous for next time
    localStorage.setItem('previous_deployment_marker', JSON.stringify(deploymentMarker))
  }, [])
}
