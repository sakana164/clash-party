import { exec } from 'child_process'
import { promisify } from 'util'
import { managerLogger } from '../utils/logger'

const execPromise = promisify(exec)

export async function checkAdminPrivileges(): Promise<boolean> {
  if (process.platform !== 'win32') {
    return true
  }

  try {
    await execPromise('chcp 65001 >nul 2>&1 && fltmc', { encoding: 'utf8' })
    managerLogger.info('Admin privileges confirmed via fltmc')
    return true
  } catch (fltmcError: unknown) {
    const errorCode = (fltmcError as { code?: number })?.code || 0
    managerLogger.debug(`fltmc failed with code ${errorCode}, trying net session as fallback`)

    try {
      await execPromise('chcp 65001 >nul 2>&1 && net session', { encoding: 'utf8' })
      managerLogger.info('Admin privileges confirmed via net session')
      return true
    } catch (netSessionError: unknown) {
      const netErrorCode = (netSessionError as { code?: number })?.code || 0
      managerLogger.debug(
        `Both fltmc and net session failed, no admin privileges. Error codes: fltmc=${errorCode}, net=${netErrorCode}`
      )
      return false
    }
  }
}
