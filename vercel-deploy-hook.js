#!/usr/bin/env node

/**
 * Vercel Deployment Hook
 * This script runs before and after deployments to handle data persistence
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const CONFIG = {
  backupDir: './backups',
  dataFile: './src/lib/mockData.ts',
  envFile: './.env.local'
}

// Ensure backup directory exists
function ensureBackupDir() {
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true })
  }
}

// Create backup of current data
function createDataBackup() {
  try {
    ensureBackupDir()
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(CONFIG.backupDir, `data-backup-${timestamp}.json`)
    
    // Read current mock data
    const mockDataContent = fs.readFileSync(CONFIG.dataFile, 'utf8')
    
    // Extract data from the file (this is a simplified approach)
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      mockData: mockDataContent,
      metadata: {
        source: 'vercel-deploy-hook',
        environment: process.env.NODE_ENV || 'production'
      }
    }
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))
    console.log(`✅ Data backup created: ${backupFile}`)
    
    return backupFile
  } catch (error) {
    console.error('❌ Failed to create data backup:', error)
    throw error
  }
}

// Restore data from backup
function restoreDataBackup(backupFile) {
  try {
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`)
    }
    
    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
    
    // Restore mock data
    if (backup.mockData) {
      fs.writeFileSync(CONFIG.dataFile, backup.mockData)
      console.log(`✅ Data restored from: ${backupFile}`)
    }
    
    return backup
  } catch (error) {
    console.error('❌ Failed to restore data backup:', error)
    throw error
  }
}

// Find latest backup
function findLatestBackup() {
  try {
    if (!fs.existsSync(CONFIG.backupDir)) {
      return null
    }
    
    const files = fs.readdirSync(CONFIG.backupDir)
      .filter(file => file.startsWith('data-backup-') && file.endsWith('.json'))
      .sort()
      .reverse()
    
    return files.length > 0 ? path.join(CONFIG.backupDir, files[0]) : null
  } catch (error) {
    console.error('❌ Failed to find latest backup:', error)
    return null
  }
}

// Main deployment hook function
function runDeploymentHook() {
  const command = process.argv[2]
  
  console.log(`🚀 Running Vercel deployment hook: ${command}`)
  
  switch (command) {
    case 'pre-build':
      console.log('📦 Pre-build: Creating data backup...')
      createDataBackup()
      break
      
    case 'post-build':
      console.log('🏗️ Post-build: Restoring data...')
      const latestBackup = findLatestBackup()
      if (latestBackup) {
        restoreDataBackup(latestBackup)
      } else {
        console.log('⚠️ No backup found, skipping restore')
      }
      break
      
    case 'pre-deploy':
      console.log('🚀 Pre-deploy: Final data backup...')
      createDataBackup()
      break
      
    case 'post-deploy':
      console.log('✅ Post-deploy: Data restoration complete')
      break
      
    default:
      console.log('❓ Unknown command. Available commands: pre-build, post-build, pre-deploy, post-deploy')
      process.exit(1)
  }
}

// Run the hook
if (import.meta.url === `file://${process.argv[1]}`) {
  runDeploymentHook()
}

export {
  createDataBackup,
  restoreDataBackup,
  findLatestBackup,
  runDeploymentHook
}
