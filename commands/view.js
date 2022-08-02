import { exec } from 'child_process'

export const view = async () => {
  console.log('Press "ctrl + c" to close dashboard\n')
  exec("npm run viewDashboard")
}
